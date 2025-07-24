from typing import Optional
from openai import OpenAI
from fastapi import HTTPException, APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from database.config import get_db
from models.tables import User
import os
import logging
from datetime import datetime

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
SUPPORTED_LANGUAGES = ["id", "en"]
MAX_TEXT_LENGTH = 5000
MAX_TOKENS = 1000

# Pydantic Models
class TranslateRequest(BaseModel):
    sumba_text: str = Field(..., min_length=1, max_length=MAX_TEXT_LENGTH, description="Teks bahasa Sumba yang akan diterjemahkan")
    target_language: str = Field(..., description="Bahasa tujuan (id untuk Bahasa Indonesia, en untuk English)")
    user_id: str = Field(..., min_length=1, max_length=8, description="User ID")
    context: Optional[str] = Field(None, max_length=500, description="Konteks tambahan untuk membantu terjemahan")

    def model_post_init(self, __context):
        # Validate target language
        if self.target_language not in SUPPORTED_LANGUAGES:
            raise ValueError(f"Bahasa tujuan tidak valid. Harus salah satu dari: {', '.join(SUPPORTED_LANGUAGES)}")
        
        # Clean up text
        if hasattr(self, 'sumba_text') and self.sumba_text:
            self.sumba_text = self.sumba_text.strip()
            if not self.sumba_text:
                raise ValueError('Teks tidak boleh kosong')

class TranslateResponse(BaseModel):
    original_text: str
    translated_text: str
    source_language: str = "sumba"
    target_language: str
    confidence_score: Optional[float] = None
    cultural_notes: Optional[str] = None
    processing_time: float

# Localized error messages
MESSAGES = {
    "en": {
        "user_not_found": "User not found",
        "translation_error": "Translation Error: {error_detail}",
        "openai_not_configured": "OpenAI client is not properly configured",
        "text_too_long": "Text is too long. Maximum allowed is {max_length} characters",
        "invalid_language": "Invalid target language. Must be one of: {languages}"
    },
    "id": {
        "user_not_found": "Pengguna tidak ditemukan",
        "translation_error": "Kesalahan Terjemahan: {error_detail}",
        "openai_not_configured": "Klien OpenAI tidak dikonfigurasi dengan benar",
        "text_too_long": "Teks terlalu panjang. Maksimal {max_length} karakter",
        "invalid_language": "Bahasa tujuan tidak valid. Harus salah satu dari: {languages}"
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

TUGAS UTAMA:
1. Terjemahkan teks bahasa Sumba yang diberikan ke {target_lang_name} dengan akurat
2. Pertahankan makna budaya dan spiritual yang terkandung dalam teks
3. Berikan penjelasan budaya jika ada istilah khusus yang perlu dipahami
4. Pastikan terjemahan natural dan mudah dipahami

PANDUAN TERJEMAHAN:
- Prioritaskan akurasi makna daripada terjemahan kata per kata
- Jaga nuansa budaya, spiritual, dan tradisional Sumba
- Untuk nama tempat, nama orang, dan istilah budaya khusus, pertahankan dalam bahasa asli dengan penjelasan singkat
- Berikan terjemahan yang terdengar natural dalam bahasa target
- Jika ada ungkapan atau peribahasa, cari padanan yang sesuai atau jelaskan maknanya

FORMAT RESPONS (wajib dalam JSON):
{{
    "translated_text": "terjemahan lengkap yang natural dan akurat",
    "cultural_notes": "penjelasan budaya jika diperlukan, atau null jika tidak ada",
    "confidence_score": angka_kepercayaan_0_sampai_1
}}"""

        user_prompt = f"""Teks bahasa Sumba yang perlu diterjemahkan:
"{sumba_text}"

{f'Konteks tambahan: {context}' if context else ''}

Mohon terjemahkan ke {target_lang_name} dengan mempertahankan makna budaya dan spiritual yang ada."""

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
        
        logger.info(f"Translation completed in {processing_time:.2f}s for {len(sumba_text)} characters")
        
        return {
            "translated_text": translated_text,
            "cultural_notes": cultural_notes,
            "confidence_score": confidence_score,
            "processing_time": processing_time
        }
        
    except Exception as e:
        logger.error(f"Translation error: {e}")
        raise HTTPException(status_code=500, detail=get_messages()["translation_error"].format(error_detail=str(e)))

@translator_router.post("/translate", response_model=TranslateResponse)
async def translate_text(request: TranslateRequest, db: Session = Depends(get_db)):
    """Terjemahkan teks bahasa Sumba ke Bahasa Indonesia atau English"""
    try:
        # Validate user
        validate_user(db, request.user_id)
        
        # Validate text length
        if len(request.sumba_text) > MAX_TEXT_LENGTH:
            raise HTTPException(
                status_code=400, 
                detail=get_messages()["text_too_long"].format(max_length=MAX_TEXT_LENGTH)
            )
        
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

@translator_router.get("/supported-languages")
async def get_supported_languages():
    """Dapatkan daftar bahasa yang didukung untuk terjemahan"""
    return {
        "supported_languages": [
            {
                "code": "id",
                "name": "Bahasa Indonesia",
                "native_name": "Bahasa Indonesia",
                "description": "Terjemahkan dari bahasa Sumba ke Bahasa Indonesia"
            },
            {
                "code": "en",
                "name": "English",
                "native_name": "English",
                "description": "Translate from Sumba language to English"
            }
        ],
        "source_language": {
            "code": "sumba",
            "name": "Sumba Language",
            "native_name": "Bahasa Sumba",
            "description": "Bahasa asal yang akan diterjemahkan"
        },
        "max_text_length": MAX_TEXT_LENGTH
    }

@translator_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Sumba Text Translator",
        "openai_configured": client is not None,
        "supported_languages": SUPPORTED_LANGUAGES,
        "max_text_length": MAX_TEXT_LENGTH,
        "timestamp": datetime.now().isoformat()
    }

@translator_router.get("/")
def read_root():
    """Root endpoint - informasi API"""
    return {
        "message": "Sumba Text Translator API",
        "description": "API untuk menerjemahkan teks bahasa Sumba ke Bahasa Indonesia atau English",
        "version": "2.0",
        "features": [
            "Terjemahan Sumba ke Bahasa Indonesia",
            "Terjemahan Sumba ke English", 
            "Preservasi konteks budaya",
            "Catatan budaya untuk istilah khusus",
            "Validasi pengguna"
        ],
        "usage": {
            "input": "Teks dalam bahasa Sumba",
            "output": "Terjemahan + catatan budaya (jika ada)",
            "supported_targets": ["id", "en"],
            "max_length": f"{MAX_TEXT_LENGTH} karakter"
        },
        "endpoints": [
            {
                "path": "/translate",
                "method": "POST",
                "description": "Terjemahkan teks Sumba"
            },
            {
                "path": "/supported-languages", 
                "method": "GET",
                "description": "Daftar bahasa yang didukung"
            },
            {
                "path": "/health",
                "method": "GET", 
                "description": "Status kesehatan API"
            }
        ]
    }