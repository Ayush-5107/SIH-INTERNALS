import uuid
import pytest
from app.models.identity import Organization

@pytest.mark.asyncio
async def test_incident_reporting(client, db_session):
    headers = {"X-Internal-API-Key": "sih_super_secret_internal_key_2026"}

    # Seed org
    org_id = uuid.uuid4()
    org = Organization(org_id=org_id, name="Incident Test Org", type="MANUFACTURER", fabric_msp_id="Org1MSP")
    db_session.add(org)
    
    from app.models.product import Product
    from app.models.batch import Batch

    product_id = uuid.uuid4()
    product = Product(product_id=product_id, name="Milk", product_type="DAIRY")
    db_session.add(product)
    await db_session.flush()

    batch = Batch(batch_id="BATCH-INC-001", product_id=product_id, quantity=100.0, state="AVAILABLE", owner_org_id=org_id)
    db_session.add(batch)
    await db_session.flush()

    # Create raw consumer feedback (incident_id is null initially to check nullability)
    feedback_payload = {
        "batch_id": "BATCH-INC-001",
        "category": "expiry",
        "description": "Product is expired by 2 days",
        "evidence_ref": "QmEvidenceHashMock",
        "location_granularity": "City-A"
    }
    res = await client.post("/internal/incidents/feedback", json=feedback_payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
    assert data["data"]["verification_status"] == "UNVERIFIED"

    # Create Incident
    incident_payload = {
        "batch_id": "BATCH-INC-001",
        "category": "contamination",
        "severity": "Critical",
        "source": "CONSUMER"
    }
    res = await client.post("/internal/incidents", json=incident_payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
    assert data["data"]["status"] == "SUBMITTED"
    incident_id = data["data"]["incident_id"]

    # Attribute accountability
    accountability_payload = {
        "stakeholder_org_id": str(org_id),
        "level": 1,
        "signal_value": 0.75,
        "reason": "Manufacturer of the contaminated batch"
    }
    res = await client.post(f"/internal/incidents/{incident_id}/accountability", json=accountability_payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
