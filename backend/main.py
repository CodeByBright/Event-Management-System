from fastapi import FastAPI, HTTPException, File, UploadFile, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from database import engine, SessionLocal
import models
from sqlalchemy.orm import Session
import os
import shutil
import uuid
from pathlib import Path

app = FastAPI()
models.Base.metadata.create_all(bind=engine)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class User(BaseModel):
    username: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class EventCreate(BaseModel):
    title: str
    time: str
    date: str
    location: str
    description: str
    image_url: Optional[str] = None

class Event(BaseModel):
    id: int
    title: str
    time: str
    date: str
    location: str
    description: str
    image_url: Optional[str] = None


# In-memory user storage
users_db = []

# In-memory event storage
events_db = [
    {"id": 1, "title": "React Native Workshop", "date": "2024-07-01", "time": "10:00", "location": "Tech Hub", "description": "Learn React Native basics", "image_url": None},
    {"id": 2, "title": "FastAPI Webinar", "date": "2024-07-10", "time": "14:00", "location": "Online", "description": "FastAPI best practices", "image_url": None},
]

@app.post("/register")
def register(user: User):
    # Check if user already exists
    if any(u["email"] == user.email for u in users_db):
        raise HTTPException(status_code=400, detail="User already exists")
    users_db.append(user.dict())
    user_dict = {"username": user.username}
    user_dict = {"email": user.email}
    user_dict = {"password": user.password}
    return {"success": True, "message": "User registered successfully"}

@app.post("/login")
def login(login_req: LoginRequest):
    # Check if user exists and password matches
    user = next((u for u in users_db if u["email"] == login_req.email and u["password"] == login_req.password), None)
    if user:
        return {"success": True, "message": "Login successful"}
    else:
        return {"success": False, "message": "Invalid email or password"}

@app.get("/events/", response_model=List[Event])
def get_events():
    return events_db

@app.post("/events/", response_model=Event)
async def create_event(
    title: str = Form(...),
    time: str = Form(...),
    date: str = Form(...),
    location: str = Form(...),
    description: str = Form(...),
    image: Optional[UploadFile] = File(None)
):
    # Handle image upload if present
    image_url = None
    if image:
        # Validate file type
        if not image.content_type or not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Generate unique filename
        file_extension = image.filename.split('.')[-1] if image.filename and '.' in image.filename else 'jpg'
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        # Save the file
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            image_url = f"/uploads/{unique_filename}"
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Could not save image: {str(e)}")
    
    # Create event
    new_id = max([e["id"] for e in events_db], default=0) + 1
    event_dict = {
        "id": new_id,
        "title": title,
        "time": time,
        "date": date,
        "location": location,
        "description": description,
        "image_url": image_url
    }
    events_db.append(event_dict)
    return event_dict

# Add a JSON-only endpoint for backward compatibility
@app.post("/events/json/", response_model=Event)
def create_event_json(event: EventCreate):
    new_id = max([e["id"] for e in events_db], default=0) + 1
    event_dict = event.dict()
    event_dict["id"] = new_id
    events_db.append(event_dict)
    return event_dict

# Add endpoint to serve uploaded files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
