from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.dependencies import get_db, verify_internal_api_key
from app.schemas.common import APIResponse
from app.schemas.qr import QrCreate, QrOut, QrResolveOut
from app.schemas.unit import UnitOut
from app.schemas.batch import BatchOut
from app.schemas.product import ProductOut
from app.repositories.qr import QrRepository
from app.repositories.unit import UnitRepository
from app.repositories.batch import BatchRepository
from app.repositories.product import ProductRepository
from app.redis.client import redis_cache
from app.redis.keys import CacheKeys

logger = logging.getLogger("sih.api.qr")
router = APIRouter(prefix="/internal/qr", tags=["qr"], dependencies=[Depends(verify_internal_api_key)])

@router.post("", response_model=APIResponse[QrOut], status_code=status.HTTP_201_CREATED)
async def create_qr(payload: QrCreate, db: AsyncSession = Depends(get_db)):
    """
    Registers a new QR credential/reference metadata in the database.
    """
    existing = await QrRepository.get_by_public_ref(db, payload.public_reference)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"QR credential with public reference '{payload.public_reference}' already exists."
        )

    qr = await QrRepository.create(
        db=db,
        public_reference=payload.public_reference,
        credential_hash=payload.credential_hash,
        unit_id=payload.unit_id,
        credential_status=payload.credential_status,
        binding_metadata=payload.binding_metadata
    )
    
    # Invalidate cache key
    await redis_cache.delete(CacheKeys.qr(payload.public_reference))

    qr_out = QrOut.model_validate(qr)
    return APIResponse(
        success=True,
        data=qr_out,
        message="QR credential reference registered successfully."
    )

@router.get("/{public_ref:path}", response_model=APIResponse[QrResolveOut])
async def resolve_qr(public_ref: str, db: AsyncSession = Depends(get_db)):
    """
    Resolves public QR reference to its bound unit, batch, and product metadata.
    Uses Cache-Aside pattern, caching the resolved output.
    """
    # 1. Check Redis Cache
    cache_key = CacheKeys.qr(public_ref)
    cached = await redis_cache.get_json(cache_key)
    if cached:
        logger.info(f"QR Cache hit: {public_ref}")
        return APIResponse(
            success=True,
            data=QrResolveOut(**cached),
            message="QR resolved from cache."
        )

    # 2. Check Database
    logger.info(f"QR Cache miss: {public_ref}. Querying database.")
    qr = await QrRepository.get_by_public_ref(db, public_ref)
    if not qr:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"QR credential reference '{public_ref}' not found."
        )

    # Resolve bounds if present
    unit_out = None
    batch_out = None
    product_out = None

    if qr.unit_id:
        unit = await UnitRepository.get_by_id(db, qr.unit_id)
        if unit:
            unit_out = UnitOut.model_validate(unit)
            batch = await BatchRepository.get_by_id(db, unit.batch_id)
            if batch:
                batch_out = BatchOut.model_validate(batch)
                product = await ProductRepository.get_by_id(db, batch.product_id)
                if product:
                    product_out = ProductOut.model_validate(product)

    resolved = QrResolveOut(
        credential=QrOut.model_validate(qr),
        unit=unit_out,
        batch=batch_out,
        product=product_out
    )

    # 3. Write to Redis Cache
    await redis_cache.set_json(cache_key, resolved.model_dump(mode="json"), expire=3600)

    return APIResponse(
        success=True,
        data=resolved,
        message="QR resolved from database."
    )
