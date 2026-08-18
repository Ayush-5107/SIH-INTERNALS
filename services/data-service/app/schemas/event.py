from pydantic import BaseModel, model_validator
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID

class EventCreate(BaseModel):
    type: str
    actor_org_id: UUID
    actor_user_id: UUID
    target_id: str
    state_before: Optional[str] = None
    state_after: Optional[str] = None
    fabric_tx_id: str
    timestamp: Optional[datetime] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None
    block_number: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None

class CustodyEventCreate(BaseModel):
    batch_id: Optional[str] = None
    unit_id: Optional[str] = None
    from_org_id: Optional[UUID] = None
    to_org_id: Optional[UUID] = None
    event_type: str  # TRANSFER, RECEIVE
    timestamp: datetime
    fabric_tx_id: str
    metadata: Optional[Dict[str, Any]] = None

class ScanEventCreate(BaseModel):
    entity_id: str
    actor_org_id: Optional[UUID] = None
    location: Optional[str] = None
    result: Optional[str] = None

class EventOut(BaseModel):
    event_id: UUID
    type: str
    actor_org_id: UUID
    actor_user_id: UUID
    target_id: str
    state_before: Optional[str] = None
    state_after: Optional[str] = None
    fabric_tx_id: str
    timestamp: datetime
    created_at: datetime
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None
    block_number: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None

    @model_validator(mode="before")
    @classmethod
    def map_event_metadata(cls, data: Any) -> Any:
        if not isinstance(data, dict):
            # It's an ORM object! We can extract attributes
            d = {k: getattr(data, k) for k in data.__dict__ if not k.startswith("_")}
            d["metadata"] = getattr(data, "event_metadata", None)
            d["created_at"] = getattr(data, "created_at", data.timestamp)
            return d
        return data

    class Config:
        from_attributes = True
