from typing import Dict, Any, Optional
from fastapi import HTTPException, status
import uuid
from app.auth.dependencies import ActorContext
from app.clients import get_data_client, get_blockchain_client
from app.schemas.products import ProductCreate, ProductResponse


class ProductService:
    def __init__(self):
        self.data_client = get_data_client()
        self.bc_client = get_blockchain_client()

    async def create_product(self, payload: ProductCreate, actor: ActorContext) -> ProductResponse:
        # Step 1: Generate Product ID
        product_id = str(uuid.uuid4())
        
        # Step 2: Submit to Blockchain Service (TraceabilityContract.registerProduct)
        tx_result = await self.bc_client.register_product(
            product_id=product_id,
            name=payload.name,
            sku=payload.sku,
            actor_context=actor.dict()
        )
        
        # Step 3: D1 persistence
        # We must save to D1 synchronously because the webhook payload from Fabric
        # does not contain all product fields (e.g., sku, category).
        product_data = {
            "product_id": product_id,
            "name": payload.name,
            "product_type": payload.category,
            "category": payload.category
        }
        await self.data_client.save_product(product_data)
        
        from datetime import datetime
        
        return ProductResponse(
            product_id=product_id,
            name=payload.name,
            sku=payload.sku,
            category=payload.category,
            producer_org_id=actor.org_id,
            created_at=datetime.utcnow().isoformat(),
            blockchain_tx_id=tx_result.get("transaction_id")
        )

    async def get_product(self, product_id: str) -> ProductResponse:
        product = await self.data_client.get_product(product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product '{product_id}' not found")
        
        return ProductResponse(
            product_id=product["product_id"],
            name=product["name"],
            sku=product["sku"],
            category=product["category"],
            producer_org_id=product["producer_org_id"],
            created_at=product["created_at"],
            blockchain_tx_id=product.get("blockchain_tx_id")
        )

    async def list_products(self) -> list[ProductResponse]:
        products_dict = getattr(self.data_client, "products", {})
        results = []
        for p in products_dict.values():
            results.append(ProductResponse(
                product_id=p["product_id"],
                name=p["name"],
                sku=p["sku"],
                category=p.get("category", "BEVERAGE"),
                producer_org_id=p["producer_org_id"],
                created_at=p.get("created_at", "2026-08-16T00:00:00Z"),
                blockchain_tx_id=p.get("blockchain_tx_id")
            ))
        return results

