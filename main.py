from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os, shutil
from datetime import datetime

from database import engine, SessionLocal
from models import Recording

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Upload folder
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Serve uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Create DB tables
Recording.metadata.create_all(bind=engine)


# ✅ UPLOAD API
# @app.post("/upload")
# def upload_video(
#     file: UploadFile = File(...),
#     duration: float = Form(...),
#     size: float = Form(...)
# ):
#     db = SessionLocal()

#     file_path = os.path.join(UPLOAD_DIR, file.filename)

#     with open(file_path, "wb") as buffer:
#         shutil.copyfileobj(file.file, buffer)

#     video_url = f"http://127.0.0.1:8000/uploads/{file.filename}"

#     new_record = Recording(
#         filename=file.filename,
#         duration=duration,
#         size=size,
#         video_url=video_url,
#         uploaded_at=datetime.now().isoformat()
#     )

#     db.add(new_record)
#     db.commit()
#     db.refresh(new_record)
#     db.close()

#     return {"video_url": video_url}

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

    video_url = f"http://127.0.0.1:8000/uploads/{file.filename}"

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
        # If DB fails, remove the uploaded file to maintain consistency
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


# GET ALL RECORDINGS
@app.get("/recordings")
def get_recordings():
    db = SessionLocal()
    data = db.query(Recording).all()
    db.close()
    return data


# ✅ DELETE
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