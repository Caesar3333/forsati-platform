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


# In-memory job storage (use Redis in production)
jobs_storage: Dict[str, Dict[str, Any]] = {}
resume_records: Dict[str, ParsedResume] = {}


class JobStatus(BaseModel):
    """Job status response"""
    job_id: str
    status: str  # pending, processing, completed, failed
    progress: int = 0
    result: Optional[ParsedResume] = None
    error: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class AIAnalysisResponse(BaseModel):
    """AI Analysis response"""
    parsed_id: str
    analysis: Dict[str, Any]
    recommendations: List[str]
    score: Optional[float] = None
    analyzed_at: datetime


@app.post("/api/ingest/upload", response_model=IngestResponse, tags=["Ingest API"])
async def api_upload_resume(
    file: UploadFile = File(..., description="Resume file (PDF, DOCX, DOC, TXT)"),
    background_tasks: BackgroundTasks = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Upload and parse a resume file
    
    رفع وتحليل ملف السيرة الذاتية
    
    - **file**: Resume file to process
    - Returns job_id for status tracking
    """
    job_id = str(uuid.uuid4())
    logger.info(f"API Upload: Starting job {job_id} for file: {file.filename}")
    
    # Initialize job status
    jobs_storage[job_id] = {
        "job_id": job_id,
        "status": "processing",
        "progress": 0,
        "filename": file.filename,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    try:
        # Validate file
        validate_file(file)
        jobs_storage[job_id]["progress"] = 10
        
        # Read file content
        file_content = await file.read()
        
        # Check file size
        if len(file_content) > MAX_FILE_SIZE:
            jobs_storage[job_id]["status"] = "failed"
            jobs_storage[job_id]["error"] = "File too large"
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "file_too_large",
                    "message_en": f"File size exceeds {MAX_FILE_SIZE // (1024*1024)}MB limit",
                    "message_ar": f"حجم الملف يتجاوز الحد المسموح {MAX_FILE_SIZE // (1024*1024)} ميجابايت"
                }
            )
        
        jobs_storage[job_id]["progress"] = 30
        
        # Extract text
        raw_text = await extract_text_from_file(file_content, file.filename)
        jobs_storage[job_id]["progress"] = 50
        
        # Parse resume
        parsed_content = await parse_resume_content(raw_text)
        jobs_storage[job_id]["progress"] = 70
        
        # Upload to MinIO
        file_url = await upload_to_minio(file_content, file.filename, job_id)
        jobs_storage[job_id]["progress"] = 90
        
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
            raw_text=raw_text[:1000] if raw_text else None,
            language=parsed_content.get("language"),
            status="completed"
        )
        
        # Store in memory
        resume_records[job_id] = parsed_resume
        jobs_storage[job_id]["status"] = "completed"
        jobs_storage[job_id]["progress"] = 100
        jobs_storage[job_id]["result"] = parsed_resume
        jobs_storage[job_id]["updated_at"] = datetime.utcnow()
        
        # Send to Strapi in background
        if background_tasks:
            background_tasks.add_task(send_to_strapi, parsed_resume)
        
        logger.info(f"API Upload: Job {job_id} completed successfully")
        
        return IngestResponse(
            success=True,
            message="Resume uploaded and parsed successfully | تم رفع وتحليل السيرة الذاتية بنجاح",
            data=parsed_resume,
            job_id=job_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        jobs_storage[job_id]["status"] = "failed"
        jobs_storage[job_id]["error"] = str(e)
        jobs_storage[job_id]["updated_at"] = datetime.utcnow()
        logger.error(f"API Upload: Job {job_id} failed: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "processing_error",
                "message_en": f"Failed to process resume: {str(e)}",
                "message_ar": f"فشل في معالجة السيرة الذاتية: {str(e)}",
                "job_id": job_id
            }
        )


@app.get("/api/ingest/status/{job_id}", response_model=JobStatus, tags=["Ingest API"])
async def get_job_status(job_id: str):
    """
    Get the status of a resume processing job
    
    الحصول على حالة معالجة السيرة الذاتية
    
    - **job_id**: The job ID returned from upload
    """
    if job_id not in jobs_storage:
        raise HTTPException(
            status_code=404,
            detail={
                "error": "job_not_found",
                "message_en": f"Job {job_id} not found",
                "message_ar": f"المهمة {job_id} غير موجودة"
            }
        )
    
    job = jobs_storage[job_id]
    return JobStatus(
        job_id=job["job_id"],
        status=job["status"],
        progress=job["progress"],
        result=job.get("result"),
        error=job.get("error"),
        created_at=job["created_at"],
        updated_at=job["updated_at"]
    )


@app.get("/api/resume-records/{record_id}", response_model=ParsedResume, tags=["Resume Records"])
async def get_resume_record(
    record_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get a parsed resume record by ID
    
    الحصول على سجل السيرة الذاتية المحللة
    
    - **record_id**: The resume record ID
    """
    # Check local storage first
    if record_id in resume_records:
        return resume_records[record_id]
    
    # Try to fetch from Strapi
    if STRAPI_API_TOKEN:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{STRAPI_URL}/api/resume-records",
                    headers={"Authorization": f"Bearer {STRAPI_API_TOKEN}"},
                    params={"filters[external_id][$eq]": record_id}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("data") and len(data["data"]) > 0:
                        record = data["data"][0]["attributes"]
                        return ParsedResume(
                            id=record.get("external_id", record_id),
                            filename=record.get("filename", ""),
                            file_url=record.get("file_url"),
                            name=record.get("name"),
                            email=record.get("email"),
                            phone=record.get("phone"),
                            skills=record.get("skills", []),
                            experience=record.get("experience", []),
                            education=record.get("education", []),
                            total_experience_years=record.get("total_experience_years"),
                            language=record.get("language"),
                            status=record.get("status", "completed")
                        )
        except Exception as e:
            logger.error(f"Failed to fetch from Strapi: {e}")
    
    raise HTTPException(
        status_code=404,
        detail={
            "error": "record_not_found",
            "message_en": f"Resume record {record_id} not found",
            "message_ar": f"سجل السيرة الذاتية {record_id} غير موجود"
        }
    )


@app.post("/api/ingest/analyze/{parsed_id}", response_model=AIAnalysisResponse, tags=["AI Analysis"])
async def analyze_resume_with_ai(
    parsed_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Analyze a parsed resume using AI
    
    تحليل السيرة الذاتية باستخدام الذكاء الاصطناعي
    
    - **parsed_id**: The parsed resume ID to analyze
    
    Returns AI-powered analysis including:
    - Skills gap analysis
    - Job matching recommendations
    - Profile improvement suggestions
    """
    # Get the resume record
    if parsed_id not in resume_records:
        raise HTTPException(
            status_code=404,
            detail={
                "error": "record_not_found",
                "message_en": f"Resume record {parsed_id} not found",
                "message_ar": f"سجل السيرة الذاتية {parsed_id} غير موجود"
            }
        )
    
    resume = resume_records[parsed_id]
    
    # AI Analysis placeholder (integrate with OpenAI/Anthropic in production)
    analysis = {
        "profile_completeness": 75 if resume.email and resume.phone else 50,
        "skills_count": len(resume.skills),
        "experience_count": len(resume.experience),
        "education_count": len(resume.education),
        "language_detected": resume.language,
        "estimated_level": "mid" if resume.total_experience_years and resume.total_experience_years >= 3 else "junior"
    }
    
    recommendations = []
    
    if not resume.skills:
        recommendations.append("أضف مهاراتك التقنية والشخصية | Add your technical and soft skills")
    
    if not resume.experience:
        recommendations.append("أضف خبراتك العملية السابقة | Add your previous work experience")
    
    if not resume.education:
        recommendations.append("أضف معلومات تعليمك | Add your education information")
    
    if len(resume.skills) < 5:
        recommendations.append("حاول إضافة المزيد من المهارات ذات الصلة | Try adding more relevant skills")
    
    if not recommendations:
        recommendations.append("سيرتك الذاتية جيدة! | Your resume looks good!")
    
    # Calculate score
    score = analysis["profile_completeness"]
    if resume.skills:
        score += min(len(resume.skills) * 2, 15)
    if resume.experience:
        score += min(len(resume.experience) * 5, 15)
    if resume.education:
        score += min(len(resume.education) * 5, 10)
    
    score = min(score, 100)
    
    return AIAnalysisResponse(
        parsed_id=parsed_id,
        analysis=analysis,
        recommendations=recommendations,
        score=score,
        analyzed_at=datetime.utcnow()
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
