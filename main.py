# from fastapi import FastAPI, UploadFile, File, Form, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles
# import os, shutil
# from datetime import datetime

# from database import engine, SessionLocal
# from models import Recording

# app = FastAPI()

# BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000")
# FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173", FRONTEND_URL],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# UPLOAD_DIR = "uploads"
# os.makedirs(UPLOAD_DIR, exist_ok=True)
# app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Recording.metadata.create_all(bind=engine)

# @app.post("/upload")
# def upload_video(
#     file: UploadFile = File(...),
#     duration: float = Form(0),
#     size: float = Form(0)
# ):
#     db = SessionLocal()
#     file_path = os.path.join(UPLOAD_DIR, file.filename)

#     with open(file_path, "wb") as buffer:
#         shutil.copyfileobj(file.file, buffer)

#     video_url = f"{BASE_URL}/uploads/{file.filename}"

#     try:
#         new_record = Recording(
#             filename=file.filename,
#             duration=duration,
#             size=size,
#             video_url=video_url,
#             uploaded_at=datetime.now().isoformat()
#         )
#         db.add(new_record)
#         db.commit()
#         db.refresh(new_record)
#     except Exception as e:
#         db.rollback()
#         if os.path.exists(file_path):
#             os.remove(file_path)
#         raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
#     finally:
#         db.close()

#     return {
#         "id": new_record.id,
#         "filename": new_record.filename,
#         "duration": new_record.duration,
#         "size": new_record.size,
#         "video_url": new_record.video_url,
#         "uploaded_at": new_record.uploaded_at
#     }

# @app.get("/recordings")
# def get_recordings():
#     db = SessionLocal()
#     data = db.query(Recording).all()
#     db.close()
#     return data

# @app.delete("/delete/{filename}")
# def delete_recording(filename: str):
#     db = SessionLocal()
#     record = db.query(Recording).filter(Recording.filename == filename).first()

#     if not record:
#         db.close()
#         raise HTTPException(status_code=404, detail="Not found")

#     file_path = os.path.join(UPLOAD_DIR, filename)
#     if os.path.exists(file_path):
#         os.remove(file_path)

#     db.delete(record)
#     db.commit()
#     db.close()
#     return {"message": "Deleted"}


from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import cloudinary
import cloudinary.uploader
import os
from datetime import datetime

from database import engine, SessionLocal
from models import Recording

app = FastAPI()

# Cloudinary config
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Recording.metadata.create_all(bind=engine)


@app.post("/upload")
def upload_video(
    file: UploadFile = File(...),
    duration: float = Form(0),
    size: float = Form(0)
):
    db = SessionLocal()

    try:
        # Upload directly to Cloudinary
        result = cloudinary.uploader.upload(
            file.file,
            resource_type="video",
            folder="screen-recordings",
            public_id=file.filename.replace(".webm", ""),
        )

        video_url = result["secure_url"]

        new_record = Recording(
            filename=file.filename,
            duration=duration,
            size=size,
            video_url=video_url,  # Cloudinary URL ✅
            uploaded_at=datetime.now().isoformat()
        )

        db.add(new_record)
        db.commit()
        db.refresh(new_record)

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Upload error: {str(e)}")

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

    try:
        # Delete from Cloudinary too
        public_id = f"screen-recordings/{filename.replace('.webm', '')}"
        cloudinary.uploader.destroy(public_id, resource_type="video")
    except Exception:
        pass  # if cloudinary delete fails, still delete from DB

    db.delete(record)
    db.commit()
    db.close()
    return {"message": "Deleted"}