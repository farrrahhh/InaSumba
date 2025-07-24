import io
import base64
from typing import Optional, List
from openai import OpenAI
from fastapi import HTTPException, APIRouter, Depends, File, UploadFile, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from database.config import get_db
from models.tables import User
import os
import logging
from datetime import datetime
from PIL import Image
import pytesseract

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

translator_router = APIRouter()

# Initialize OpenAI client with error handling
try:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    if not os.getenv("OPENAI_API_KEY"):
        logger.warning("OPENAI_API_KEY not found in environment variables")
except Exception as e:
    logger.error(f"Failed to initialize OpenAI client: {e}")
    client = None

# Constants
SUPPORTED_IMAGE_FORMATS = ["jpg", "jpeg", "png", "bmp", "tiff", "webp"]
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
SUPPORTED_LANGUAGES = ["id", "en"]
MAX_TEXT_LENGTH = 5000
MAX_TOKENS = 1000

# Pydantic Models
class OCRRequest(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded image")
    user_id: str = Field(..., min_length=1, max_length=8, description="User ID")

class OCRResponse(BaseModel):
    extracted_text: str
    confidence_score: Optional[float] = None
    processing_time: float
    image_dimensions: dict

class TranslateRequest(BaseModel):
    sumba_text: str = Field(..., min_length=1, max_length=MAX_TEXT_LENGTH, description="Sumba text to translate")
    target_language: str = Field(..., description="Target language (id/en)")
    user_id: str = Field(..., min_length=1, max_length=8, description="User ID")
    context: Optional[str] = Field(None, max_length=500, description="Additional context for translation")

    def model_post_init(self, __context):
        # Validate target language
        if self.target_language not in SUPPORTED_LANGUAGES:
            raise ValueError(f"Invalid target language. Must be one of: {', '.join(SUPPORTED_LANGUAGES)}")
        
        # Clean up text
        if hasattr(self, 'sumba_text') and self.sumba_text:
            self.sumba_text = self.sumba_text.strip()
            if not self.sumba_text:
                raise ValueError('Text cannot be empty')

class TranslateResponse(BaseModel):
    original_text: str
    translated_text: str
    source_language: str = "sumba"
    target_language: str
    confidence_score: Optional[float] = None
    cultural_notes: Optional[str] = None
    processing_time: float

class OCRAndTranslateRequest(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded image")
    target_language: str = Field(..., description="Target language (id/en)")
    user_id: str = Field(..., min_length=1, max_length=8, description="User ID")
    context: Optional[str] = Field(None, max_length=500, description="Additional context for translation")

class OCRAndTranslateResponse(BaseModel):
    extracted_text: str
    translated_text: str
    source_language: str = "sumba"
    target_language: str
    ocr_confidence: Optional[float] = None
    translation_confidence: Optional[float] = None
    cultural_notes: Optional[str] = None
    processing_time: dict
    image_dimensions: dict

# Localized error messages
MESSAGES = {
    "en": {
        "user_not_found": "User not found",
        "invalid_image_format": "Invalid image format. Supported formats: {formats}",
        "file_too_large": "File too large. Maximum size is 10MB",
        "image_processing_error": "Image processing error: {error_detail}",
        "ocr_error": "OCR Error: {error_detail}",
        "translation_error": "Translation Error: {error_detail}",
        "openai_not_configured": "OpenAI client is not properly configured",
        "invalid_base64": "Invalid base64 image data",
        "text_too_long": "Text is too long. Maximum allowed is {max_length} characters",
        "empty_ocr_result": "No text detected in the image"
    },
    "id": {
        "user_not_found": "Pengguna tidak ditemukan",
        "invalid_image_format": "Format gambar tidak valid. Format yang didukung: {formats}",
        "file_too_large": "File terlalu besar. Ukuran maksimal 10MB",
        "image_processing_error": "Kesalahan pemrosesan gambar: {error_detail}",
        "ocr_error": "Kesalahan OCR: {error_detail}",
        "translation_error": "Kesalahan Terjemahan: {error_detail}",
        "openai_not_configured": "Klien OpenAI tidak dikonfigurasi dengan benar",
        "invalid_base64": "Data gambar base64 tidak valid",
        "text_too_long": "Teks terlalu panjang. Maksimal {max_length} karakter",
        "empty_ocr_result": "Tidak ada teks yang terdeteksi dalam gambar"
    }
}

def get_messages(language: str = "id") -> dict:
    """Get localized messages"""
    return MESSAGES.get(language.lower(), MESSAGES["id"])

def validate_openai_client():
    """Validate OpenAI client is available"""
    if client is None:
        raise HTTPException(status_code=500, detail="OpenAI client is not properly configured")

def validate_user(db: Session, user_id: str) -> User:
    """Validate user exists"""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=get_messages()["user_not_found"])
    return user

def decode_base64_image(base64_data: str) -> Image.Image:
    """Decode base64 image data"""
    try:
        # Remove data URL prefix if present
        if "," in base64_data:
            base64_data = base64_data.split(",")[1]
        
        # Decode base64
        image_bytes = base64.b64decode(base64_data)
        
        # Validate file size
        if len(image_bytes) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail=get_messages()["file_too_large"])
        
        # Open image
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        return image
        
    except base64.binascii.Error:
        raise HTTPException(status_code=400, detail=get_messages()["invalid_base64"])
    except Exception as e:
        raise HTTPException(status_code=400, detail=get_messages()["image_processing_error"].format(error_detail=str(e)))

def extract_text_from_image(image: Image.Image) -> tuple[str, dict]:
    """Extract text from image using OCR"""
    try:
        start_time = datetime.now()
        
        # Configure Tesseract for better Sumba text recognition
        # Using Indonesian language model as base for better character recognition
        custom_config = r'--oem 3 --psm 6 -l ind'
        
        # Extract text
        extracted_text = pytesseract.image_to_string(image, config=custom_config)
        extracted_text = extracted_text.strip()
        
        # Get image dimensions
        image_dimensions = {
            "width": image.width,
            "height": image.height
        }
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        if not extracted_text:
            raise HTTPException(status_code=422, detail=get_messages()["empty_ocr_result"])
        
        logger.info(f"OCR completed in {processing_time:.2f}s, extracted {len(extracted_text)} characters")
        
        return extracted_text, {
            "processing_time": processing_time,
            "image_dimensions": image_dimensions
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OCR error: {e}")
        raise HTTPException(status_code=500, detail=get_messages()["ocr_error"].format(error_detail=str(e)))

def translate_sumba_text(sumba_text: str, target_language: str, context: Optional[str] = None) -> dict:
    """Translate Sumba text to target language using OpenAI"""
    validate_openai_client()
    
    try:
        start_time = datetime.now()
        
        # Language mapping
        language_names = {
            "id": "Bahasa Indonesia",
            "en": "English"
        }
        
        target_lang_name = language_names.get(target_language, "Bahasa Indonesia")
        
        # Create system prompt for translation
        system_prompt = f"""Kamu adalah seorang ahli bahasa dan budaya Sumba yang sangat berpengalaman dalam menerjemahkan teks bahasa Sumba ke {target_lang_name}.

TUGAS:
1. Terjemahkan teks bahasa Sumba yang diberikan ke {target_lang_name}
2. Berikan terjemahan yang akurat dan mempertahankan makna budaya
3. Jika ada istilah budaya khusus yang sulit diterjemahkan, berikan penjelasan singkat
4. Pertahankan nuansa dan konteks asli dari teks Sumba

ATURAN TERJEMAHAN:
- Prioritaskan akurasi makna daripada terjemahan literal
- Jaga nuansa budaya dan spiritual jika ada
- Untuk nama tempat, nama orang, dan istilah budaya khusus, pertahankan dalam bahasa asli dengan penjelasan
- Berikan terjemahan yang natural dan mudah dipahami

Format respons dalam JSON:
{{
    "translated_text": "terjemahan lengkap di sini",
    "cultural_notes": "catatan budaya jika diperlukan",
    "confidence_score": 0.95
}}"""

        user_prompt = f"""Teks bahasa Sumba yang perlu diterjemahkan:
"{sumba_text}"

{f'Konteks tambahan: {context}' if context else ''}

Terjemahkan ke {target_lang_name} dengan mempertahankan makna budaya dan spiritual."""

        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=MAX_TOKENS,
            temperature=0.3,  # Lower temperature for more consistent translations
        )

        result_text = response.choices[0].message.content.strip()
        
        # Try to parse JSON response
        try:
            import json
            result = json.loads(result_text)
            translated_text = result.get("translated_text", result_text)
            cultural_notes = result.get("cultural_notes")
            confidence_score = result.get("confidence_score")
        except json.JSONDecodeError:
            # If not JSON, use the whole response as translated text
            translated_text = result_text
            cultural_notes = None
            confidence_score = None
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        logger.info(f"Translation completed in {processing_time:.2f}s")
        
        return {
            "translated_text": translated_text,
            "cultural_notes": cultural_notes,
            "confidence_score": confidence_score,
            "processing_time": processing_time
        }
        
    except Exception as e:
        logger.error(f"Translation error: {e}")
        raise HTTPException(status_code=500, detail=get_messages()["translation_error"].format(error_detail=str(e)))

@translator_router.post("/ocr", response_model=OCRResponse)
async def extract_text_ocr(request: OCRRequest, db: Session = Depends(get_db)):
    """Extract text from image using OCR"""
    try:
        # Validate user
        validate_user(db, request.user_id)
        
        # Decode image
        image = decode_base64_image(request.image_base64)
        
        # Extract text
        extracted_text, metadata = extract_text_from_image(image)
        
        return OCRResponse(
            extracted_text=extracted_text,
            processing_time=metadata["processing_time"],
            image_dimensions=metadata["image_dimensions"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OCR endpoint error: {e}")
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")

@translator_router.post("/translate", response_model=TranslateResponse)
async def translate_text(request: TranslateRequest, db: Session = Depends(get_db)):
    """Translate Sumba text to target language"""
    try:
        # Validate user
        validate_user(db, request.user_id)
        
        # Perform translation
        translation_result = translate_sumba_text(
            request.sumba_text, 
            request.target_language, 
            request.context
        )
        
        return TranslateResponse(
            original_text=request.sumba_text,
            translated_text=translation_result["translated_text"],
            target_language=request.target_language,
            confidence_score=translation_result["confidence_score"],
            cultural_notes=translation_result["cultural_notes"],
            processing_time=translation_result["processing_time"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Translation endpoint error: {e}")
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")

@translator_router.post("/ocr-translate", response_model=OCRAndTranslateResponse)
async def ocr_and_translate(request: OCRAndTranslateRequest, db: Session = Depends(get_db)):
    """Complete pipeline: OCR image to extract Sumba text, then translate to target language"""
    try:
        # Validate user
        validate_user(db, request.user_id)
        
        overall_start_time = datetime.now()
        
        # Step 1: OCR
        ocr_start_time = datetime.now()
        image = decode_base64_image(request.image_base64)
        extracted_text, ocr_metadata = extract_text_from_image(image)
        ocr_time = (datetime.now() - ocr_start_time).total_seconds()
        
        # Step 2: Translation
        translate_start_time = datetime.now()
        translation_result = translate_sumba_text(
            extracted_text, 
            request.target_language, 
            request.context
        )
        translate_time = (datetime.now() - translate_start_time).total_seconds()
        
        total_time = (datetime.now() - overall_start_time).total_seconds()
        
        return OCRAndTranslateResponse(
            extracted_text=extracted_text,
            translated_text=translation_result["translated_text"],
            target_language=request.target_language,
            translation_confidence=translation_result["confidence_score"],
            cultural_notes=translation_result["cultural_notes"],
            processing_time={
                "ocr_time": ocr_time,
                "translation_time": translate_time,
                "total_time": total_time
            },
            image_dimensions=ocr_metadata["image_dimensions"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OCR and translate endpoint error: {e}")
        raise HTTPException(status_code=500, detail=f"OCR and translation failed: {str(e)}")

@translator_router.post("/ocr-translate-upload")
async def ocr_and_translate_upload(
    file: UploadFile = File(...),
    target_language: str = Form(...),
    user_id: str = Form(...),
    context: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Upload image file for OCR and translation"""
    try:
        # Validate user
        validate_user(db, user_id)
        
        # Validate target language
        if target_language not in SUPPORTED_LANGUAGES:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid target language. Must be one of: {', '.join(SUPPORTED_LANGUAGES)}"
            )
        
        # Validate file type
        file_extension = file.filename.split('.')[-1].lower() if file.filename else ""
        if file_extension not in SUPPORTED_IMAGE_FORMATS:
            raise HTTPException(
                status_code=400,
                detail=get_messages()["invalid_image_format"].format(formats=", ".join(SUPPORTED_IMAGE_FORMATS))
            )
        
        # Read file content
        file_content = await file.read()
        
        # Validate file size
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail=get_messages()["file_too_large"])
        
        # Convert to base64
        image_base64 = base64.b64encode(file_content).decode('utf-8')
        
        # Process through OCR and translation pipeline
        request = OCRAndTranslateRequest(
            image_base64=image_base64,
            target_language=target_language,
            user_id=user_id,
            context=context
        )
        
        return await ocr_and_translate(request, db)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"File upload and process error: {e}")
        raise HTTPException(status_code=500, detail=f"File processing failed: {str(e)}")

@translator_router.get("/supported-languages")
async def get_supported_languages():
    """Get list of supported translation languages"""
    return {
        "supported_languages": [
            {
                "code": "id",
                "name": "Bahasa Indonesia",
                "native_name": "Bahasa Indonesia"
            },
            {
                "code": "en",
                "name": "English",
                "native_name": "English"
            }
        ],
        "source_language": {
            "code": "sumba",
            "name": "Sumba Language",
            "native_name": "Bahasa Sumba"
        }
    }

@translator_router.get("/supported-formats")
async def get_supported_formats():
    """Get list of supported image formats"""
    return {
        "supported_formats": [
            {
                "extension": ext,
                "mime_type": f"image/{ext.replace('jpg', 'jpeg')}"
            }
            for ext in SUPPORTED_IMAGE_FORMATS
        ],
        "max_file_size": f"{MAX_FILE_SIZE // (1024*1024)}MB",
        "max_text_length": MAX_TEXT_LENGTH
    }

@translator_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Sumba Text Translator",
        "openai_configured": client is not None,
        "tesseract_available": True,  # Assume tesseract is installed
        "supported_languages": SUPPORTED_LANGUAGES,
        "supported_formats": SUPPORTED_IMAGE_FORMATS,
        "timestamp": datetime.now().isoformat()
    }

@translator_router.get("/")
def read_root():
    """Root endpoint"""
    return {
        "message": "Sumba Text Translator API is running",
        "description": "OCR and translation service for Sumba language texts",
        "version": "1.0",
        "features": [
            "OCR text extraction from images",
            "Sumba to Indonesian translation",
            "Sumba to English translation",
            "Combined OCR + Translation pipeline",
            "Cultural context preservation"
        ],
        "endpoints": [
            "/ocr",
            "/translate", 
            "/ocr-translate",
            "/ocr-translate-upload",
            "/supported-languages",
            "/supported-formats",
            "/health"
        ]
    }