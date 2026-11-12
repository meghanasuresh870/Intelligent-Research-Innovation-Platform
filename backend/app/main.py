from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.db.init_db import init_db
from app.routers import (
    auth,
    profile,
    records,
    users,
    research_papers,
    module7_member5,
    funding,
    technologies,
    module7_member4,
    innovation_router,
    commercialization_engine,
    dashboard,
    innovation_score_engine,
    notifications,
    copilot,
)

settings = get_settings()

app = FastAPI(
    title="Research Funding & Innovation Intelligence Platform",
    version="0.2.0",
    description="Authentication and research profile management API.",
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content=jsonable_encoder({
            "success": False,
            "message": "Input validation failed.",
            "errors": exc.errors(),
        }),
    )


# CORS Configuration
allowed_origins = [
    origin.strip().rstrip("/")
    for origin in settings.CORS_ORIGINS.split(",")
    if origin.strip()
]

# Explicitly allow deployed Vercel frontend
vercel_origin = "https://intelligent-research-innovation-pla.vercel.app"

if vercel_origin not in allowed_origins:
    allowed_origins.append(vercel_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    init_db()


@app.get("/")
def read_root():
    return {
        "message": "Research Funding & Innovation Intelligence Platform API",
        "status": "online",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "backend",
    }


# Register routers
app.include_router(auth.router)
app.include_router(auth.router, prefix="/api")

app.include_router(users.router)
app.include_router(users.router, prefix="/api")

app.include_router(profile.router)
app.include_router(profile.router, prefix="/api")

app.include_router(records.publications)
app.include_router(records.publications, prefix="/api")

app.include_router(records.patents)
app.include_router(records.patents, prefix="/api")

# Module 3 - Research Papers
app.include_router(research_papers.router)

# Module 7 - Member 5 - Innovation Scoring
app.include_router(module7_member5.router)

# Additional module routers
app.include_router(funding.router, prefix="/api/funding")
app.include_router(technologies.router)
app.include_router(module7_member4.router, prefix="/api")
app.include_router(innovation_router.router)

# Module 8 - Commercialization
app.include_router(commercialization_engine.router)

# Module 9 - Dashboard
app.include_router(dashboard.router)

# Innovation Score Engine
app.include_router(innovation_score_engine.router)

# Notifications
app.include_router(notifications.router)

# Research Discovery & Innovation Copilot
app.include_router(copilot.router)