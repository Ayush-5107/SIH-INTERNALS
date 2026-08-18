from fastapi import APIRouter, Depends, status
from app.auth import get_current_actor, require_roles, ActorContext
from app.schemas.products import ProductCreate, ProductResponse
from app.modules.products.service import ProductService

router = APIRouter(prefix="/products", tags=["Products"])
product_service = ProductService()


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    payload: ProductCreate,
    actor: ActorContext = Depends(require_roles(["producer", "processor", "manufacturer", "admin"]))
):
    """Create and register a new food product definition."""
    return await product_service.create_product(payload, actor)


@router.get("", response_model=list[ProductResponse])
async def list_products(
    actor: ActorContext = Depends(get_current_actor)
):
    """Retrieve list of all registered food products."""
    return await product_service.list_products()


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: str,
    actor: ActorContext = Depends(get_current_actor)
):
    """Retrieve product definition by product ID."""
    return await product_service.get_product(product_id)

