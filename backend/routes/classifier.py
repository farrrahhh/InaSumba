from typing import Optional
import os
import json
import logging
from datetime import datetime
import numpy as np
from PIL import Image
import io
import base64

from fastapi import HTTPException, APIRouter, Depends, UploadFile, File, Form
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from database.config import get_db
from models.tables import User

# TensorFlow imports with error handling
try:
    import tensorflow as tf
    from tensorflow.keras.preprocessing import image
    from tensorflow.keras.models import load_model
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    tf = None

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

classifier_router = APIRouter()

# Constants
MODEL_PATH = "saved_models/tenun_classifier.keras"
METADATA_PATH = "saved_models/model_metadata.json"
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/bmp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
IMG_SIZE = (224, 224)
CONFIDENCE_THRESHOLD = 75.0

# Global variables
model = None
model_metadata = None

# Motif analysis data
MOTIF_ANALYSIS = {
    "ayam": {
        "title": "Chicken Motif in Sumba Weaving",
        "description": "The chicken motif in Sumba woven cloth symbolizes fertility, new life, and spiritual connection between humans and ancestors. In Sumba tradition, chickens are often used in traditional ceremonies as offerings or spiritual communication media, making them an important symbol in religious and social life. The crowing of the rooster marking the arrival of morning is also interpreted as a symbol of hope, vigilance, and protection from darkness. Additionally, this motif represents certain social status within Sumba's customary structure, where its use often indicates clan identity or hereditary legacy.",
        "symbolism": [
            "Fertility and new life",
            "Spiritual connection with ancestors",
            "Communication medium in traditional ceremonies",
            "Symbol of hope and protection",
            "Vigilance against darkness",
            "Social status and clan identity",
            "Hereditary legacy"
        ],
        "cultural_context": "Chickens in Sumba culture play an important role in religious rituals and traditional ceremonies, often used as offerings to Marapu (ancestors).",
        "usage_occasions": [
            "Traditional wedding ceremonies",
            "Marapu religious rituals",
            "Harvest celebrations",
            "Initiation ceremonies",
            "Important family events"
        ]
    },
    "manusia": {
        "title": "Human Motif in Sumba Weaving",
        "description": "The human motif in Sumba woven cloth symbolizes ancestors, power, and the relationship between the physical world and the spirit world. Human figures usually depict important characters such as kings, warriors, or revered ancestors, and serve as symbols of respect for origins and the continuity of life. This motif also reflects values of strength, courage, and honor in Sumba society, and is used in ritual contexts or important events related to identity, social status, or respect for tradition. The presence of the human motif indicates that the cloth is not just attire, but a cultural heritage carrying spiritual meaning and family or tribal history.",
        "symbolism": [
            "Respect for ancestors",
            "Power and leadership",
            "Connection between physical and spirit worlds",
            "Strength and courage",
            "Honor in society",
            "Identity and social status",
            "Family/tribal cultural heritage"
        ],
        "cultural_context": "Human figures in Sumba weaving represent important characters such as kings, warriors, or ancestors who are part of the tribe's history and identity.",
        "usage_occasions": [
            "Royal coronation ceremonies",
            "Heroic and valor celebrations",
            "Ancestor veneration rituals",
            "High-level traditional events",
            "Important religious ceremonies"
        ]
    }
}

# Pydantic Models
class ClassificationRequest(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=8, description="User ID")
    image_quality_notes: Optional[str] = Field(None, max_length=200, description="Catatan kualitas gambar")

class ClassificationResponse(BaseModel):
    prediction: str
    confidence: float
    is_uncertain: bool
    processing_time: float
    motif_analysis: Optional[dict] = None
    probabilities: dict
    recommendation: Optional[str] = None
    image_info: dict
    timestamp: str

class HealthCheckResponse(BaseModel):
    status: str
    model_loaded: bool
    model_info: Optional[dict] = None
    tensorflow_available: bool
    timestamp: str

# Utility Functions
def load_tenun_model():
    """Load the trained tenun classification model"""
    global model, model_metadata
    
    if not TF_AVAILABLE:
        logger.error("TensorFlow is not available")
        return False
    
    try:
        if os.path.exists(MODEL_PATH):
            model = load_model(MODEL_PATH)
            logger.info(f"Model loaded successfully from {MODEL_PATH}")
        else:
            logger.error(f"Model file not found: {MODEL_PATH}")
            return False
        
        # Load metadata
        if os.path.exists(METADATA_PATH):
            with open(METADATA_PATH, 'r') as f:
                model_metadata = json.load(f)
            logger.info("Model metadata loaded successfully")
        else:
            logger.warning("Model metadata not found")
            model_metadata = {
                "classes": {"ayam": 0, "manusia": 1},
                "class_names": ["ayam", "manusia"]
            }
        
        return True
        
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        return False

def validate_image(file: UploadFile) -> bool:
    """Validate uploaded image"""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400, 
            detail=f"Format file tidak didukung. Gunakan: {', '.join(ALLOWED_IMAGE_TYPES)}"
        )
    
    if file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File terlalu besar. Maksimal {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    return True

def preprocess_image(image_data: bytes) -> np.ndarray:
    """Preprocess image for model prediction"""
    try:
        # Load image from bytes
        img = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize to model input size
        img = img.resize(IMG_SIZE, Image.Resampling.LANCZOS)
        
        # Convert to array and normalize
        img_array = np.array(img)
        img_array = img_array.astype(np.float32) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
        
    except Exception as e:
        logger.error(f"Error preprocessing image: {e}")
        raise HTTPException(status_code=400, detail="Gagal memproses gambar")

def get_image_info(image_data: bytes) -> dict:
    """Get basic image information"""
    try:
        img = Image.open(io.BytesIO(image_data))
        return {
            "format": img.format,
            "mode": img.mode,
            "size": img.size,
            "width": img.width,
            "height": img.height,
            "file_size_bytes": len(image_data),
            "file_size_mb": round(len(image_data) / (1024*1024), 2)
        }
    except Exception as e:
        logger.error(f"Error getting image info: {e}")
        return {"error": "Could not analyze image"}

def classify_tenun_image(image_data: bytes, user_id: str) -> dict:
    """Classify tenun image and return detailed results"""
    if model is None:
        raise HTTPException(status_code=500, detail="Model belum dimuat")
    
    start_time = datetime.now()
    
    try:
        # Preprocess image
        img_array = preprocess_image(image_data)
        
        # Make prediction
        predictions = model.predict(img_array, verbose=0)
        
        # Get class mapping
        if model_metadata and "classes" in model_metadata:
            class_mapping = model_metadata["classes"]
            inv_mapping = {v: k for k, v in class_mapping.items()}
        else:
            # Fallback mapping
            inv_mapping = {0: "ayam", 1: "manusia"}
        
        # Process predictions
        predicted_class_idx = np.argmax(predictions[0])
        confidence = float(np.max(predictions[0]) * 100)
        predicted_class = inv_mapping[predicted_class_idx]
        
        # Create probability dictionary
        probabilities = {}
        for idx, prob in enumerate(predictions[0]):
            class_name = inv_mapping.get(idx, f"class_{idx}")
            probabilities[class_name] = float(prob * 100)
        
        # Determine final result and get analysis
        is_uncertain = confidence < CONFIDENCE_THRESHOLD
        final_prediction = "uncertain" if is_uncertain else predicted_class
        
        # Get motif analysis if confident
        motif_analysis = None
        recommendation = None
        
        if not is_uncertain and predicted_class in MOTIF_ANALYSIS:
            motif_analysis = MOTIF_ANALYSIS[predicted_class]
            recommendation = f"Gambar menunjukkan motif {predicted_class} dengan tingkat kepercayaan {confidence:.1f}%. Motif ini memiliki makna budaya yang mendalam dalam tradisi tenun Sumba."
        elif is_uncertain:
            recommendation = f"Model tidak yakin dengan prediksi ini (kepercayaan: {confidence:.1f}%). Coba gunakan gambar dengan kualitas lebih baik, pencahayaan yang cukup, dan fokus yang jelas pada motif tenun."
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "prediction": final_prediction,
            "confidence": confidence,
            "is_uncertain": is_uncertain,
            "processing_time": processing_time,
            "motif_analysis": motif_analysis,
            "probabilities": probabilities,
            "recommendation": recommendation,
            "raw_prediction": predicted_class,
            "threshold_used": CONFIDENCE_THRESHOLD
        }
        
    except Exception as e:
        logger.error(f"Classification error: {e}")
        raise HTTPException(status_code=500, detail=f"Gagal melakukan klasifikasi: {str(e)}")

def validate_user(db: Session, user_id: str) -> User:
    """Validate user exists"""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Pengguna tidak ditemukan")
    return user

# Initialize model on startup
@classifier_router.on_event("startup")
async def load_model_on_startup():
    """Load model when the router starts"""
    success = load_tenun_model()
    if success:
        logger.info("Tenun classifier model loaded successfully on startup")
    else:
        logger.error("Failed to load tenun classifier model on startup")

# API Endpoints
@classifier_router.post("/classify-tenun", response_model=ClassificationResponse)
async def classify_tenun(
    user_id: str = Form(...),
    image_quality_notes: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Klasifikasi motif tenun Sumba dari gambar yang diupload"""
    try:
        # Validate user
        validate_user(db, user_id)
        
        # Validate image
        validate_image(file)
        
        # Read image data
        image_data = await file.read()
        
        # Get image info
        image_info = get_image_info(image_data)
        
        # Classify image
        classification_result = classify_tenun_image(image_data, user_id)
        
        # Prepare response
        response = ClassificationResponse(
            prediction=classification_result["prediction"],
            confidence=classification_result["confidence"],
            is_uncertain=classification_result["is_uncertain"],
            processing_time=classification_result["processing_time"],
            motif_analysis=classification_result["motif_analysis"],
            probabilities=classification_result["probabilities"],
            recommendation=classification_result["recommendation"],
            image_info=image_info,
            timestamp=datetime.now().isoformat()
        )
        
        logger.info(f"Classification completed for user {user_id}: {classification_result['prediction']} ({classification_result['confidence']:.1f}%)")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Classification endpoint error: {e}")
        raise HTTPException(status_code=500, detail=f"Gagal melakukan klasifikasi: {str(e)}")

@classifier_router.get("/model-info")
async def get_model_info():
    """Dapatkan informasi tentang model klasifikasi"""
    return {
        "model_name": "Tenun Sumba Motif Classifier",
        "version": "1.0",
        "description": "Model untuk mengklasifikasi motif ayam dan manusia pada kain tenun Sumba",
        "supported_classes": ["ayam", "manusia"],
        "confidence_threshold": CONFIDENCE_THRESHOLD,
        "input_requirements": {
            "image_size": f"{IMG_SIZE[0]}x{IMG_SIZE[1]} pixels",
            "supported_formats": list(ALLOWED_IMAGE_TYPES),
            "max_file_size": f"{MAX_FILE_SIZE // (1024*1024)}MB"
        },
        "model_metadata": model_metadata,
        "cultural_significance": {
            "ayam": "Simbol kesuburan, kehidupan baru, dan hubungan spiritual",
            "manusia": "Simbol leluhur, kekuasaan, dan warisan budaya"
        }
    }

@classifier_router.get("/motif-encyclopedia")
async def get_motif_encyclopedia():
    """Dapatkan ensiklopedia lengkap motif tenun Sumba"""
    return {
        "title": "Ensiklopedia Motif Tenun Sumba",
        "description": "Koleksi lengkap makna dan simbolisme motif dalam kain tenun tradisional Sumba",
        "motifs": MOTIF_ANALYSIS,
        "cultural_background": "Tenun Sumba merupakan warisan budaya yang kaya akan makna spiritual dan sosial, di mana setiap motif memiliki cerita dan fungsi khusus dalam kehidupan masyarakat Sumba.",
        "total_motifs": len(MOTIF_ANALYSIS)
    }

@classifier_router.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Health check untuk classifier service"""
    model_info = None
    if model_metadata:
        model_info = {
            "classes": model_metadata.get("class_names", []),
            "input_shape": model_metadata.get("input_shape"),
            "confidence_threshold": CONFIDENCE_THRESHOLD
        }
    
    return HealthCheckResponse(
        status="healthy" if model is not None else "unhealthy",
        model_loaded=model is not None,
        model_info=model_info,
        tensorflow_available=TF_AVAILABLE,
        timestamp=datetime.now().isoformat()
    )

@classifier_router.get("/")
def read_root():
    """Root endpoint - informasi API Classifier"""
    return {
        "message": "Tenun Sumba Motif Classifier API",
        "description": "API untuk mengklasifikasi motif ayam dan manusia pada kain tenun Sumba menggunakan deep learning",
        "version": "1.0",
        "features": [
            "Klasifikasi motif ayam dan manusia",
            "Analisis makna budaya motif",
            "Confidence scoring dengan threshold",
            "Rekomendasi berdasarkan hasil klasifikasi",
            "Informasi detail tentang simbolisme motif",
            "Validasi pengguna dan gambar"
        ],
        "model_details": {
            "architecture": "MobileNetV2 + Custom Classification Head",
            "input_size": f"{IMG_SIZE[0]}x{IMG_SIZE[1]}",
            "classes": ["ayam", "manusia"],
            "confidence_threshold": f"{CONFIDENCE_THRESHOLD}%"
        },
        "endpoints": [
            {
                "path": "/classify-tenun",
                "method": "POST",
                "description": "Klasifikasi motif dari gambar tenun"
            },
            {
                "path": "/model-info",
                "method": "GET",
                "description": "Informasi detail model"
            },
            {
                "path": "/motif-encyclopedia",
                "method": "GET",
                "description": "Ensiklopedia motif tenun Sumba"
            },
            {
                "path": "/health",
                "method": "GET",
                "description": "Status kesehatan service"
            }
        ],
        "cultural_note": "Setiap motif dalam tenun Sumba memiliki makna spiritual dan budaya yang mendalam, merepresentasikan hubungan antara manusia, alam, dan leluhur dalam tradisi Marapu."
    }