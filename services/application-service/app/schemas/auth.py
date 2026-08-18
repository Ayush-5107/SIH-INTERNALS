from pydantic import BaseModel, Field
from typing import Optional


class LoginRequest(BaseModel):
    username: str = Field(..., json_schema_extra={"example": "producer_user"})
    password: str = Field(..., json_schema_extra={"example": "secret123"})
    role: Optional[str] = Field("producer", json_schema_extra={"example": "producer"})
    org_id: Optional[str] = Field("org-citrus-farms", json_schema_extra={"example": "org-citrus-farms"})


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_minutes: int
    user_id: str
    role: str
    org_id: str


class UserMeResponse(BaseModel):
    user_id: str
    role: str
    org_id: str
    status: str = "ACTIVE"


class CreateOrganizationRequest(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "Punjab Organic Grains Ltd."})
    type: str = Field("MANUFACTURER", json_schema_extra={"example": "MANUFACTURER"})


class OrganizationResponse(BaseModel):
    id: str
    name: str
    type: str
    status: str = "ACTIVE"


class AssignRoleRequest(BaseModel):
    user_id: str = Field(..., json_schema_extra={"example": "usr-inspector"})
    role: str = Field(..., json_schema_extra={"example": "REGULATOR"})


class AssignRoleResponse(BaseModel):
    user_id: str
    role: str
    status: str = "UPDATED"
