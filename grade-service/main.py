from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
from pydantic import BaseModel
from bson import ObjectId
from typing import List, Optional
import os
import traceback  # <--- Essential for seeing WHY it fails

app = FastAPI()

# Database Connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongo-db:27017/university_db")
client = MongoClient(MONGO_URI)
db = client.university_db
grades_collection = db.grades

# --- MODELS ---
class GradeCreate(BaseModel):
    student_id: str
    course_id: str
    grade: float
    type: str
    teacher_id: Optional[str] = "Unknown"

class GradeResponse(BaseModel):
    id: str
    student_id: str
    course_id: str
    grade: float
    type: str
    # FIX: This must be Optional too!
    teacher_id: Optional[str] = "Unknown"

# Helper to fix ObjectId
def fix_id(doc):
    doc["id"] = str(doc.pop("_id"))
    return doc

# --- ROUTES ---

@app.post("/grades/", response_model=GradeResponse)
def submit_grade(grade_data: GradeCreate):
    try:
        print(f"DEBUG: Receiving Grade Data: {grade_data.dict()}") # Log to console
        
        grade_dict = grade_data.dict()
        result = grades_collection.insert_one(grade_dict)
        
        created_grade = grades_collection.find_one({"_id": result.inserted_id})
        return fix_id(created_grade)
    
    except Exception as e:
        # This prints the REAL error to your Docker logs
        print("CRITICAL ERROR IN SUBMIT_GRADE:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/grades/", response_model=List[GradeResponse])
def get_grades():
    try:
        grades = grades_collection.find()
        return [fix_id(g) for g in grades]
    except Exception:
        return []

@app.delete("/grades/{grade_id}")
def delete_grade(grade_id: str):
    try:
        result = grades_collection.delete_one({"_id": ObjectId(grade_id)})
        if result.deleted_count == 1:
            return {"message": "Grade deleted"}
        raise HTTPException(status_code=404, detail="Grade not found")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")

@app.get("/grades/student/{student_id}/average")
def get_student_average(student_id: str):
    grades = list(grades_collection.find({"student_id": student_id}))
    if not grades:
        return {"student_id": student_id, "average": 0.0, "count": 0}
    total = sum(g["grade"] for g in grades)
    count = len(grades)
    return {"student_id": student_id, "average": total / count, "count": count}

# Health Check
@app.get("/")
def read_root():
    return {"message": "Grade Service is running"}

if __name__ == "__main__":
    import uvicorn
    # IMPORTANT: Port 5000 to match Gateway
    uvicorn.run(app, host="0.0.0.0", port=5000)