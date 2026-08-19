from typing import Dict, Any, Optional
from fastapi import HTTPException, status
import uuid
import datetime
from app.auth.dependencies import ActorContext
from app.clients import get_data_client, get_blockchain_client
from app.schemas.feedback import FeedbackSubmitRequest, IncidentResponse


class FeedbackService:
    def __init__(self):
        self.data_client = get_data_client()
        self.bc_client = get_blockchain_client()

    async def submit_feedback(self, payload: FeedbackSubmitRequest, actor: ActorContext) -> IncidentResponse:
        # Step 1: Verify linked batch exists
        batch = await self.data_client.get_batch(payload.batch_or_unit_id)
        nearest_org_id = (batch.get("current_custodian_org_id") or batch.get("owner_org_id")) if batch else actor.org_id
        
        # Step 2: If evidence file is present, upload to IPFS off-chain store
        evidence_cid = None
        if payload.evidence_filename and payload.evidence_base64:
            ipfs_res = await self.data_client.upload_evidence_to_ipfs(
                file_name=payload.evidence_filename,
                content=payload.evidence_base64.encode("utf-8")
            )
            evidence_cid = ipfs_res.get("cid")
        
        # Step 3: Create Incident Record
        incident_id = f"inc-{uuid.uuid4().hex[:8]}"
        created_at_str = datetime.datetime.utcnow().isoformat()
        incident_data = {
            "incident_id": incident_id,
            "batch_or_unit_id": payload.batch_or_unit_id,
            "category": payload.category,
            "description": payload.description,
            "nearest_accountable_org_id": nearest_org_id,
            "evidence_cid": evidence_cid,
            "reporter_user_id": actor.user_id,
            "status": "OPEN",
            "escalation_level": "STANDARD",
            "created_at": created_at_str
        }
        
        saved_incident = await self.data_client.save_incident(incident_data)
        
        return IncidentResponse(
            incident_id=saved_incident.get("incident_id", incident_id),
            batch_or_unit_id=saved_incident.get("batch_or_unit_id", payload.batch_or_unit_id),
            category=saved_incident.get("category", payload.category),
            description=saved_incident.get("description", payload.description),
            nearest_accountable_org_id=saved_incident.get("nearest_accountable_org_id", nearest_org_id),
            evidence_cid=saved_incident.get("evidence_cid"),
            status=saved_incident.get("status", "SUBMITTED"),
            escalation_level=saved_incident.get("escalation_level", escalation_level),
            created_at=saved_incident.get("created_at", created_at_str)
        )

    async def get_incident(self, incident_id: str) -> IncidentResponse:
        # Fetch from mock/real data store
        incidents = getattr(self.data_client, "incidents", {})
        incident = incidents.get(incident_id)
        if not incident:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Incident '{incident_id}' not found")
        
        return IncidentResponse(
            incident_id=incident["incident_id"],
            batch_or_unit_id=incident["batch_or_unit_id"],
            category=incident["category"],
            description=incident["description"],
            nearest_accountable_org_id=incident["nearest_accountable_org_id"],
            evidence_cid=incident.get("evidence_cid"),
            status=incident["status"],
            escalation_level=incident["escalation_level"],
            created_at=incident["created_at"]
        )
