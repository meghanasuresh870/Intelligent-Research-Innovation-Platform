from pydantic import AliasChoices, BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=150, validation_alias=AliasChoices("full_name", "name"))
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    role: str = Field(default="Researcher")
    phone_number: str | None = Field(default=None, max_length=50)
    organization: str | None = Field(default=None, max_length=255)
    designation: str | None = Field(default=None, max_length=150)
    country: str | None = Field(default=None, max_length=120)
    research_domain: str | None = Field(default=None, max_length=255)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int


class GoogleAuthRequest(BaseModel):
    credential: str | None = None
    id_token: str | None = None
    token: str | None = None
    access_token: str | None = None
