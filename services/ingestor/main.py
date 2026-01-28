# © 2026 Forsati. All rights reserved.
"""
Forsati Ingestor Service - Resume Parser & Document Processor
FastAPI-based service for parsing resumes and processing documents
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import os
import uuid
import httpx
import logging
from enum import Enum

# Configure logging
logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO").upper())
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Forsati Ingestor Service",
    description="Resume parsing and document processing service for Forsati Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer(auto_error=False)

# Environment variables
STRAPI_URL = os.getenv("STRAPI_URL", "http://localhost:1337")
STRAPI_API_TOKEN = os.getenv("STRAPI_API_TOKEN", "")
MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "localhost")
MINIO_PORT = os.getenv("MINIO_PORT", "9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "")
MINIO_BUCKET = os.getenv("MINIO_BUCKET", "forsati-resumes")

# Allowed file types
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt", ".rtf"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


class FileType(str, Enum):
    PDF = "pdf"
    DOCX = "docx"
    DOC = "doc"
    TXT = "txt"
    RTF = "rtf"


class ParsedResume(BaseModel):
    """Parsed resume data structure"""
    id: str = Field(..., description="Unique identifier")
    filename: str = Field(..., description="Original filename")
    file_url: Optional[str] = Field(None, description="URL to stored file")
    
    # Extracted data
    name: Optional[str] = Field(None, description="Candidate name")
    email: Optional[str] = Field(None, description="Email address")
    phone: Optional[str] = Field(None, description="Phone number")
    
    skills: List[str] = Field(default_factory=list, description="Extracted skills")
    experience: List[Dict[str, Any]] = Field(default_factory=list, description="Work experience")
    education: List[Dict[str, Any]] = Field(default_factory=list, description="Education history")
    
    total_experience_years: Optional[float] = Field(None, description="Total years of experience")
    
    raw_text: Optional[str] = Field(None, description="Raw extracted text")
    language: Optional[str] = Field(None, description="Detected language (ar/en)")
    
    parsed_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="pending", description="Processing status")
    errors: List[str] = Field(default_factory=list, description="Processing errors")


class IngestResponse(BaseModel):
    """Response model for ingest endpoint"""
    success: bool
    message: str
    data: Optional[ParsedResume] = None
    job_id: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    version: str
    timestamp: datetime
    services: Dict[str, str]


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "service": "Forsati Ingestor",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint
    صحة الخدمة - التحقق من حالة الخدمة والاتصالات
    """
    services = {}
    
    # Check Strapi connection
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{STRAPI_URL}/_health")
            services["strapi"] = "healthy" if response.status_code == 200 else "unhealthy"
    except Exception as e:
        services["strapi"] = f"unhealthy: {str(e)}"
        logger.warning(f"Strapi health check failed: {e}")
    
    # Check MinIO connection
    try:
        # Basic connectivity check
        services["minio"] = "configured" if MINIO_ACCESS_KEY else "not_configured"
    except Exception as e:
        services["minio"] = f"error: {str(e)}"
    
    overall_status = "healthy" if all(
        "healthy" in v or "configured" in v for v in services.values()
    ) else "degraded"
    
    return HealthResponse(
        status=overall_status,
        version="1.0.0",
        timestamp=datetime.utcnow(),
        services=services
    )


def validate_file(file: UploadFile) -> None:
    """Validate uploaded file"""
    # Check file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "invalid_file_type",
                "message_en": f"File type {ext} not allowed. Allowed: {ALLOWED_EXTENSIONS}",
                "message_ar": f"نوع الملف {ext} غير مسموح. المسموح: {ALLOWED_EXTENSIONS}"
            }
        )
    
    # Check content type
    allowed_content_types = {
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "application/rtf"
    }
    if file.content_type and file.content_type not in allowed_content_types:
        logger.warning(f"Unexpected content type: {file.content_type}")


async def extract_text_from_file(file_content: bytes, filename: str) -> str:
    """
    Extract text from file using appropriate method
    استخراج النص من الملف
    
    TODO: Integrate with Apache Tika for production
    """
    ext = os.path.splitext(filename)[1].lower()
    
    if ext == ".txt":
        # Try multiple encodings
        for encoding in ["utf-8", "utf-16", "windows-1256", "iso-8859-1"]:
            try:
                return file_content.decode(encoding)
            except UnicodeDecodeError:
                continue
        raise HTTPException(
            status_code=400,
            detail="Could not decode text file"
        )
    
    # For PDF, DOCX - placeholder for Tika integration
    # In production, send to Apache Tika server
    logger.info(f"Text extraction requested for {ext} file")
    return f"[Placeholder: Text extraction for {ext} files requires Tika integration]"


async def parse_resume_content(text: str) -> Dict[str, Any]:
    """
    Parse resume content and extract structured data
    تحليل محتوى السيرة الذاتية
    
    TODO: Integrate with pyresparser and spaCy for production
    """
    # Placeholder parsing logic
    # In production, use pyresparser + custom NER models
    
    parsed = {
        "name": None,
        "email": None,
        "phone": None,
        "skills": [],
        "experience": [],
        "education": [],
        "total_experience_years": None,
        "language": "ar" if any(ord(c) > 1536 and ord(c) < 1791 for c in text) else "en"
    }
    
    # Basic email extraction
    import re
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    emails = re.findall(email_pattern, text)
    if emails:
        parsed["email"] = emails[0]
    
    # Basic phone extraction (supports Jordan format)
    phone_patterns = [
        r'\+962\s*\d{1,2}\s*\d{3}\s*\d{4}',  # Jordan +962
        r'07[789]\d{7}',  # Jordan mobile
        r'\+\d{1,3}\s*\d{3,4}\s*\d{3,4}\s*\d{3,4}',  # International
    ]
    for pattern in phone_patterns:
        phones = re.findall(pattern, text)
        if phones:
            parsed["phone"] = phones[0]
            break
    
    return parsed


async def upload_to_minio(file_content: bytes, filename: str, job_id: str) -> str:
    """
    Upload file to MinIO storage
    رفع الملف إلى التخزين
    
    TODO: Implement actual MinIO upload
    """
    # Placeholder - return expected URL format
    ext = os.path.splitext(filename)[1]
    stored_filename = f"{job_id}{ext}"
    return f"s3://{MINIO_BUCKET}/{stored_filename}"


async def send_to_strapi(parsed_data: ParsedResume) -> bool:
    """
    Send parsed resume data to Strapi
    إرسال البيانات المحللة إلى Strapi
    """
    if not STRAPI_API_TOKEN:
        logger.warning("STRAPI_API_TOKEN not configured, skipping Strapi sync")
        return False
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{STRAPI_URL}/api/resume-records",
                headers={
                    "Authorization": f"Bearer {STRAPI_API_TOKEN}",
                    "Content-Type": "application/json"
                },
                json={
                    "data": {
                        "external_id": parsed_data.id,
                        "filename": parsed_data.filename,
                        "file_url": parsed_data.file_url,
                        "name": parsed_data.name,
                        "email": parsed_data.email,
                        "phone": parsed_data.phone,
                        "skills": parsed_data.skills,
                        "experience": parsed_data.experience,
                        "education": parsed_data.education,
                        "total_experience_years": parsed_data.total_experience_years,
                        "language": parsed_data.language,
                        "parsed_at": parsed_data.parsed_at.isoformat(),
                        "status": parsed_data.status
                    }
                }
            )
            
            if response.status_code in [200, 201]:
                logger.info(f"Successfully sent resume {parsed_data.id} to Strapi")
                return True
            else:
                logger.error(f"Strapi responded with {response.status_code}: {response.text}")
                return False
                
    except Exception as e:
        logger.error(f"Failed to send to Strapi: {e}")
        return False


@app.post("/ingest", response_model=IngestResponse, tags=["Ingest"])
async def ingest_resume(
    file: UploadFile = File(..., description="Resume file (PDF, DOCX, DOC, TXT)"),
    background_tasks: BackgroundTasks = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Ingest and parse a resume file
    
    استيعاب وتحليل ملف السيرة الذاتية
    
    - **file**: Resume file to process
    - Returns parsed resume data and storage URL
    
    ---
    
    يقوم بـ:
    1. التحقق من صحة الملف
    2. استخراج النص (Tika)
    3. تحليل البيانات (pyresparser/spaCy)
    4. رفع الملف إلى MinIO
    5. إرسال البيانات إلى Strapi
    """
    job_id = str(uuid.uuid4())
    logger.info(f"Starting ingest job {job_id} for file: {file.filename}")
    
    try:
        # Validate file
        validate_file(file)
        
        # Read file content
        file_content = await file.read()
        
        # Check file size
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "file_too_large",
                    "message_en": f"File size exceeds {MAX_FILE_SIZE // (1024*1024)}MB limit",
                    "message_ar": f"حجم الملف يتجاوز الحد المسموح {MAX_FILE_SIZE // (1024*1024)} ميجابايت"
                }
            )
        
        # Extract text
        raw_text = await extract_text_from_file(file_content, file.filename)
        
        # Parse resume
        parsed_content = await parse_resume_content(raw_text)
        
        # Upload to MinIO
        file_url = await upload_to_minio(file_content, file.filename, job_id)
        
        # Build response
        parsed_resume = ParsedResume(
            id=job_id,
            filename=file.filename,
            file_url=file_url,
            name=parsed_content.get("name"),
            email=parsed_content.get("email"),
            phone=parsed_content.get("phone"),
            skills=parsed_content.get("skills", []),
            experience=parsed_content.get("experience", []),
            education=parsed_content.get("education", []),
            total_experience_years=parsed_content.get("total_experience_years"),
            raw_text=raw_text[:1000] if raw_text else None,  # Truncate for response
            language=parsed_content.get("language"),
            status="completed"
        )
        
        # Send to Strapi in background
        if background_tasks:
            background_tasks.add_task(send_to_strapi, parsed_resume)
        
        logger.info(f"Ingest job {job_id} completed successfully")
        
        return IngestResponse(
            success=True,
            message="Resume parsed successfully | تم تحليل السيرة الذاتية بنجاح",
            data=parsed_resume,
            job_id=job_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ingest job {job_id} failed: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "processing_error",
                "message_en": f"Failed to process resume: {str(e)}",
                "message_ar": f"فشل في معالجة السيرة الذاتية: {str(e)}",
                "job_id": job_id
            }
        )


@app.post("/ingest-audio", tags=["Ingest"])
async def ingest_audio(
    file: UploadFile = File(..., description="Audio file for transcription"),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Ingest and transcribe audio file (interview recording)
    
    استيعاب ونسخ ملف صوتي (تسجيل مقابلة)
    
    TODO: Implement Whisper integration
    """
    job_id = str(uuid.uuid4())
    
    # Placeholder response
    return {
        "success": True,
        "message": "Audio transcription endpoint - Coming soon | نقطة نسخ الصوت - قريباً",
        "job_id": job_id,
        "note": "Whisper integration pending"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
