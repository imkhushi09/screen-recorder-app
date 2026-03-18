from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os, shutil
from datetime import datetime

from database import engine, SessionLocal
from models import Recording

app = FastAPI()

BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

Recording.metadata.create_all(bind=engine)

@app.post("/upload")
def upload_video(
    file: UploadFile = File(...),
    duration: float = Form(0),
    size: float = Form(0)
):
    db = SessionLocal()
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    video_url = f"{BASE_URL}/uploads/{file.filename}"

    try:
        new_record = Recording(
            filename=file.filename,
            duration=duration,
            size=size,
            video_url=video_url,
            uploaded_at=datetime.now().isoformat()
        )
        db.add(new_record)
        db.commit()
        db.refresh(new_record)
    except Exception as e:
        db.rollback()
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        db.close()

    return {
        "id": new_record.id,
        "filename": new_record.filename,
        "duration": new_record.duration,
        "size": new_record.size,
        "video_url": new_record.video_url,
        "uploaded_at": new_record.uploaded_at
    }

@app.get("/recordings")
def get_recordings():
    db = SessionLocal()
    data = db.query(Recording).all()
    db.close()
    return data

@app.delete("/delete/{filename}")
def delete_recording(filename: str):
    db = SessionLocal()
    record = db.query(Recording).filter(Recording.filename == filename).first()

    if not record:
        db.close()
        raise HTTPException(status_code=404, detail="Not found")

    file_path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(file_path):
        os.remove(file_path)

    db.delete(record)
    db.commit()
    db.close()
    return {"message": "Deleted"}