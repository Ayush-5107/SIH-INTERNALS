from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.dialects.postgresql import insert
from datetime import datetime

from app.models.event import Event, CustodyEvent, LedgerSync

class EventRepository:
    @staticmethod
    async def create_event(db: AsyncSession, event_type: str, actor_org_id, actor_user_id, target_id: str, state_before: str, state_after: str, fabric_tx_id: str, timestamp: datetime = None, latitude: float = None, longitude: float = None, location_name: str = None, block_number: int = None, metadata: dict = None) -> Event:
        # Idempotency check: check if this fabric_tx_id already exists in Event table
        stmt = select(Event).where(Event.fabric_tx_id == fabric_tx_id)
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()
        if existing:
            return existing

        if timestamp and timestamp.tzinfo:
            timestamp = timestamp.replace(tzinfo=None)

        event = Event(
            type=event_type,
            actor_org_id=actor_org_id,
            actor_user_id=actor_user_id,
            target_id=target_id,
            state_before=state_before,
            state_after=state_after,
            fabric_tx_id=fabric_tx_id,
            timestamp=timestamp or datetime.utcnow(),
            latitude=latitude,
            longitude=longitude,
            location_name=location_name,
            block_number=block_number,
            event_metadata=metadata
        )
        db.add(event)
        await db.flush()
        return event

    @staticmethod
    async def create_custody_event(db: AsyncSession, batch_id: str, unit_id: str, from_org_id, to_org_id, event_type: str, timestamp: datetime, fabric_tx_id: str, metadata: dict = None) -> CustodyEvent:
        # Idempotency check
        stmt = select(CustodyEvent).where(CustodyEvent.fabric_tx_id == fabric_tx_id)
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()
        if existing:
            return existing

        if timestamp and timestamp.tzinfo:
            timestamp = timestamp.replace(tzinfo=None)

        custody_event = CustodyEvent(
            batch_id=batch_id,
            unit_id=unit_id,
            from_org_id=from_org_id,
            to_org_id=to_org_id,
            event_type=event_type,
            timestamp=timestamp,
            fabric_tx_id=fabric_tx_id,
            event_metadata=metadata
        )
        db.add(custody_event)
        await db.flush()
        return custody_event

    @staticmethod
    async def get_by_tx_id(db: AsyncSession, fabric_tx_id: str) -> Event | None:
        stmt = select(Event).where(Event.fabric_tx_id == fabric_tx_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def upsert_ledger_sync(db: AsyncSession, fabric_tx_id: str, event_type: str, entity_id: str, sync_status: str = "PENDING", attempt_count: int = 0, synced_at: datetime = None) -> LedgerSync:
        # Query first to update or insert
        stmt = select(LedgerSync).where(LedgerSync.fabric_tx_id == fabric_tx_id)
        result = await db.execute(stmt)
        sync_record = result.scalar_one_or_none()

        if sync_record:
            sync_record.sync_status = sync_status
            sync_record.attempt_count = attempt_count
            if synced_at:
                sync_record.synced_at = synced_at
        else:
            sync_record = LedgerSync(
                fabric_tx_id=fabric_tx_id,
                event_type=event_type,
                entity_id=entity_id,
                sync_status=sync_status,
                attempt_count=attempt_count,
                synced_at=synced_at
            )
            db.add(sync_record)

        await db.flush()
        return sync_record

    @staticmethod
    async def get_pending_ledger_syncs(db: AsyncSession) -> list[LedgerSync]:
        stmt = select(LedgerSync).where(LedgerSync.sync_status == "PENDING").order_by(LedgerSync.last_attempt_at)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_events(db: AsyncSession, target_id: str = None, event_type: str = None, limit: int = 100, offset: int = 0) -> list[Event]:
        stmt = select(Event)
        if target_id:
            stmt = stmt.where(Event.target_id == target_id)
        if event_type:
            stmt = stmt.where(Event.type == event_type)
        stmt = stmt.order_by(Event.timestamp.desc()).limit(limit).offset(offset)
        result = await db.execute(stmt)
        return list(result.scalars().all())
