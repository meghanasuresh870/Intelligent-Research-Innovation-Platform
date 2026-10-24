from app.db.base import Base
from app.db.session import engine

# Import models so SQLAlchemy registers their tables

from app.models import profile, user, research_paper, innovation_score
from app.models import commercialization, notification, copilot

def init_db() -> None:
    Base.metadata.create_all(bind=engine)
