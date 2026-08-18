import uuid
from sqlalchemy import Column, String, ForeignKey, UUID, DateTime, Integer, Float, JSON, func
from sqlalchemy.orm import relationship

from app.database import Base

class Event(Base):
    __tablename__ = "events"

    event_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(String, nullable=False, index=True)  # e.g., REGISTRATION, VALIDATION, TRANSFORMATION, BLOCK, RECALL
    actor_org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.org_id", ondelete="RESTRICT"), nullable=False)
    actor_user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False)
    target_id = Column(String, nullable=False, index=True)  # target batch_id or unit_id
    state_before = Column(String, nullable=True)
    state_after = Column(String, nullable=True)
    fabric_tx_id = Column(String, unique=True, nullable=False, index=True)  # UNIQUE constraint for idempotency
    timestamp = Column(DateTime, default=func.now(), server_default=func.now(), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_name = Column(String, nullable=True)
    block_number = Column(Integer, nullable=True)
    event_metadata = Column("metadata", JSON, nullable=True)  # Store conditions, expected custodians, testing reports

class CustodyEvent(Base):
    __tablename__ = "custody_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    batch_id = Column(String, ForeignKey("batches.batch_id", ondelete="CASCADE"), nullable=True)
    unit_id = Column(String, ForeignKey("units.unit_id", ondelete="CASCADE"), nullable=True)
    from_org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.org_id", ondelete="RESTRICT"), nullable=True)
    to_org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.org_id", ondelete="RESTRICT"), nullable=True)
    event_type = Column(String, nullable=False)  # TRANSFER, RECEIVE
    timestamp = Column(DateTime, nullable=False)
    fabric_tx_id = Column(String, unique=True, nullable=False, index=True)
    event_metadata = Column("metadata", JSON, nullable=True)  # Store conditions, location, etc.

class LedgerSync(Base):
    __tablename__ = "ledger_sync"

    fabric_tx_id = Column(String, primary_key=True)
    event_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=False)
    sync_status = Column(String, default="PENDING", nullable=False)  # PENDING, SYNCED, FAILED
    attempt_count = Column(Integer, default=0, nullable=False)
    last_attempt_at = Column(DateTime, default=func.now(), server_default=func.now(), onupdate=func.now(), nullable=False)
    synced_at = Column(DateTime, nullable=True)
