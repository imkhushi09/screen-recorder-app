from sqlalchemy import Column, Integer, String, Float
from database import Base

class Recording(Base):
    __tablename__ = "recordings"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    duration = Column(Float)
    size = Column(Float)
    video_url = Column(String)
    uploaded_at = Column(String)