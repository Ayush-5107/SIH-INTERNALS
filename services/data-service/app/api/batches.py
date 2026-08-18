from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.dependencies import get_db, verify_internal_api_key
from app.schemas.common import APIResponse
from app.schemas.batch import BatchCreate, BatchOut
from app.repositories.batch import BatchRepository
from app.redis.client import redis_cache
from app.redis.keys import CacheKeys

logger = logging.getLogger("sih.api.batches")
router = APIRouter(prefix="/internal/batches", tags=["batches"], dependencies=[Depends(verify_internal_api_key)])

@router.post("", response_model=APIResponse[BatchOut], status_code=status.HTTP_201_CREATED)
async def create_batch(payload: BatchCreate, db: AsyncSession = Depends(get_db)):
    """
    Registers or updates a batch read model in the database.
    """
    existing = await BatchRepository.get_by_id(db, payload.batch_id)
    if existing:
        # If it already exists, let's treat it as an update/idempotent write
        existing.state = payload.state
        existing.quantity = payload.quantity
        if payload.parent_metadata:
            existing.parent_metadata = payload.parent_metadata
        await db.flush()
        # Invalidate the cache
        cache_key = CacheKeys.batch(payload.batch_id)
        await redis_cache.delete(cache_key)
        
        batch_out = BatchOut.model_validate(existing)
        return APIResponse(
            success=True,
            data=batch_out,
            message="Batch read model updated successfully."
        )

    batch = await BatchRepository.create(
        db=db,
        batch_id=payload.batch_id,
        product_id=payload.product_id,
        quantity=payload.quantity,
        state=payload.state,
        owner_org_id=payload.owner_org_id,
        parent_metadata=payload.parent_metadata
    )
    
    # Invalidate cache keys (lineages or traces associated with it)
    cache_key = CacheKeys.batch(payload.batch_id)
    await redis_cache.delete(cache_key)
    
    batch_out = BatchOut.model_validate(batch)
    return APIResponse(
        success=True,
        data=batch_out,
        message="Batch read model created successfully."
    )

@router.get("/{batch_id}", response_model=APIResponse[BatchOut])
async def get_batch(batch_id: str, db: AsyncSession = Depends(get_db)):
    """
    Retrieves batch read model details by ID (incorporates Cache-Aside pattern).
    """
    cache_key = CacheKeys.batch(batch_id)
    try:
        cached = await redis_cache.get_json(cache_key)
    except Exception as e:
        logger.warning(f"Redis cache GET failed: {e}. Bypassing to DB.")
        cached = None

    if cached:
        logger.info(f"Batch cache hit: {batch_id}")
        return APIResponse(
            success=True,
            data=BatchOut(**cached),
            message="Batch retrieved from cache."
        )

    # 2. Check Database
    logger.info(f"Batch cache miss: {batch_id}. Querying database.")
    batch = await BatchRepository.get_by_id(db, batch_id)
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch with ID {batch_id} not found."
        )

    batch_out = BatchOut.model_validate(batch)
    
    # 3. Store in Redis Cache
    try:
        await redis_cache.set_json(cache_key, batch_out.model_dump(mode="json"), expire=3600)
    except Exception as e:
        logger.warning(f"Redis cache SET failed: {e}.")
    
    return APIResponse(
        success=True,
        data=batch_out,
        message="Batch retrieved from database."
    )
