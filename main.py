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



from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import cloudinary
import cloudinary.uploader
import os
from datetime import datetime

from database import engine, SessionLocal
from models import User, Recording
from auth import hash_password, verify_password, create_token, get_current_user, get_db

app = FastAPI()

# Cloudinary config
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create all tables
User.metadata.create_all(bind=engine)
Recording.metadata.create_all(bind=engine)


# ── AUTH ──────────────────────────────────────────

class SignupRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


@app.post("/auth/signup")
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=data.email,
        password=hash_password(data.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_token({"sub": new_user.email})
    return {"access_token": token, "token_type": "bearer", "email": new_user.email}


@app.post("/auth/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "email": user.email}


# ── RECORDINGS ────────────────────────────────────

@app.post("/upload")
def upload_video(
    file: UploadFile = File(...),
    duration: float = Form(0),
    size: float = Form(0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
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
            video_url=video_url,
            uploaded_at=datetime.now().isoformat(),
            user_id=current_user.id
        )
        db.add(new_record)
        db.commit()
        db.refresh(new_record)

    except Exception as e:
        db.rollback()
        print(f"UPLOAD ERROR: {str(e)}")  # ← this will show in Render logs
        raise HTTPException(status_code=500, detail=f"Upload error: {str(e)}")

    return {
        "id": new_record.id,
        "filename": new_record.filename,
        "duration": new_record.duration,
        "size": new_record.size,
        "video_url": new_record.video_url,
        "uploaded_at": new_record.uploaded_at
    }


@app.get("/recordings")
def get_recordings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    data = db.query(Recording).filter(Recording.user_id == current_user.id).all()
    return data


@app.delete("/delete/{filename}")
def delete_recording(
    filename: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(Recording).filter(
        Recording.filename == filename,
        Recording.user_id == current_user.id
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="Not found")

    try:
        public_id = f"screen-recordings/{filename.replace('.webm', '')}"
        cloudinary.uploader.destroy(public_id, resource_type="video")
    except Exception:
        pass

    db.delete(record)
    db.commit()
    return {"message": "Deleted"}