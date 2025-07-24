import io
import base64
from typing import Optional, List
from openai import OpenAI
from fastapi import HTTPException, APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from database.config import get_db
from models.tables import Character, Conversation, Message, User
import os
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

chat_router = APIRouter()

# Initialize OpenAI client with error handling
try:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    if not os.getenv("OPENAI_API_KEY"):
        logger.warning("OPENAI_API_KEY not found in environment variables")
except Exception as e:
    logger.error(f"Failed to initialize OpenAI client: {e}")
    client = None

# Constants
INA_NA_CHARACTER_ID = "CR001"
VALID_VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"]
MAX_CONVERSATION_HISTORY = 20
MAX_TOKENS = 200

# Pydantic Models
class ChatMessage(BaseModel):
    user_message: str = Field(..., min_length=1, max_length=2000, description="User message")
    user_id: str = Field(..., min_length=1, max_length=8, description="User ID")

    def model_post_init(self, __context):
        # Clean up user message
        if hasattr(self, 'user_message') and self.user_message:
            self.user_message = self.user_message.strip()
            if not self.user_message:
                raise ValueError('Message cannot be empty')

class ChatResponse(BaseModel):
    bot_response: str
    conversation_id: int
    character_name: str

class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=4096)
    voice: str = Field(default="alloy")
    language: str = Field(default="id")

    def model_post_init(self, __context):
        # Validate voice
        valid_voices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"]
        if self.voice not in valid_voices:
            raise ValueError(f"Invalid voice. Must be one of: {', '.join(valid_voices)}")
        
        # Validate language
        valid_languages = ["en", "id"]
        if self.language not in valid_languages:
            raise ValueError(f"Invalid language. Must be one of: {', '.join(valid_languages)}")

class ChatWithTTSResponse(BaseModel):
    bot_response: str
    conversation_id: int
    character_name: str
    audio_base64: str
    voice_used: str

class ConversationHistory(BaseModel):
    conversation_id: int
    user_id: str
    character_name: str
    messages: List[dict]

class UserConversations(BaseModel):
    conversations: List[dict]

# Localized error messages
MESSAGES = {
    "en": {
        "user_not_found": "User not found",
        "character_not_found": "Ina Na character not found",
        "conversation_not_found": "Conversation not found",
        "invalid_voice": "Invalid voice option. Valid voices are: {valid_voices}",
        "text_too_long": "Text is too long. Maximum allowed is 4096 characters.",
        "tts_error": "TTS Error: {error_detail}",
        "chat_error": "Chat Error: {error_detail}",
        "openai_not_configured": "OpenAI client is not properly configured"
    },
    "id": {
        "user_not_found": "Pengguna tidak ditemukan",
        "character_not_found": "Karakter Ina Na tidak ditemukan",
        "conversation_not_found": "Percakapan tidak ditemukan",
        "invalid_voice": "Pilihan suara tidak valid. Pilihan suara yang tersedia: {valid_voices}",
        "text_too_long": "Teks terlalu panjang. Maksimal 4096 karakter.",
        "tts_error": "Kesalahan TTS: {error_detail}",
        "chat_error": "Kesalahan Chat: {error_detail}",
        "openai_not_configured": "Klien OpenAI tidak dikonfigurasi dengan benar"
    }
}

def get_messages(language: str = "id") -> dict:
    """Get localized messages"""
    return MESSAGES.get(language.lower(), MESSAGES["id"])

def validate_openai_client():
    """Validate OpenAI client is available"""
    if client is None:
        raise HTTPException(status_code=500, detail="OpenAI client is not properly configured")

def get_ina_na_character(db: Session) -> Character:
    """Get Ina Na character from database"""
    character = db.query(Character).filter(Character.character_id == INA_NA_CHARACTER_ID).first()
    if not character:
        raise HTTPException(status_code=404, detail=get_messages()["character_not_found"])
    return character

def get_or_create_conversation(db: Session, user_id: str) -> Conversation:
    """Get existing conversation with Ina Na or create new one"""
    conversation = db.query(Conversation).filter(
        Conversation.user_id == user_id,
        Conversation.character_id == INA_NA_CHARACTER_ID
    ).first()
    
    if not conversation:
        conversation = Conversation(
            user_id=user_id,
            character_id=INA_NA_CHARACTER_ID
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        logger.info(f"Created new conversation {conversation.conversation_id} for user {user_id} with Ina Na")
    
    return conversation

def build_conversation_context(db: Session, conversation: Conversation) -> str:
    """Build conversation context from history"""
    previous_messages = db.query(Message).filter(
        Message.conversation_id == conversation.conversation_id
    ).order_by(Message.timestamp.desc()).limit(MAX_CONVERSATION_HISTORY).all()
    
    previous_messages.reverse()
    
    conversation_history = ""
    for msg in previous_messages:
        if msg.sender == "user":
            conversation_history += f"User: {msg.message}\n"
        else:
            conversation_history += f"Ina Na: {msg.message}\n"
    
    return conversation_history

def save_messages(db: Session, conversation_id: int, user_message: str, bot_response: str):
    """Save user and bot messages to database"""
    try:
        # Save user message
        user_msg = Message(
            conversation_id=conversation_id,
            sender="user",
            message=user_message
        )
        db.add(user_msg)
        
        # Save bot response
        bot_msg = Message(
            conversation_id=conversation_id,
            sender="bot",
            message=bot_response
        )
        db.add(bot_msg)
        db.commit()
        logger.info(f"Saved messages for conversation {conversation_id}")
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to save messages: {e}")
        raise

@chat_router.post("/chat", response_model=ChatResponse)
async def chat_with_ina_na(message: ChatMessage, db: Session = Depends(get_db)):
    """Main chat endpoint to chat with Ina Na"""
    validate_openai_client()
    
    try:
        # Validate user exists
        user = db.query(User).filter(User.user_id == message.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail=get_messages()["user_not_found"])

        # Get Ina Na character
        character = get_ina_na_character(db)

        # Get or create conversation with Ina Na
        conversation = get_or_create_conversation(db, message.user_id)

        # Build conversation context
        conversation_history = build_conversation_context(db, conversation)

        # Create system prompt for Ina Na
        system_prompt = f"""Kamu adalah {character.name}.

{character.bio}

Daerah asal: {character.region}

Kamu adalah seorang penenun ikat tradisional dari Sumba yang sangat berpengalaman. Jawab sesuai dengan bahasa pesan. Berbicaralah dengan gaya yang:
- Maternal dan keibuan
- Ramah dan hangat
- Sabar dalam menjelaskan
- Bangga dengan budaya Sumba
- Terkadang suka menyilapkan istilah istilah Sumba
- Senang berbagi pengetahuan tentang tenun ikat
- Menggunakan bahasa Indonesia yang mudah dipahami
- Sesekali menyebutkan tentang motif-motif tenun, makna budaya, atau proses pembuatan kain ikat

Jawab pertanyaan dengan penuh semangat dan berbagi pengalaman serta pengetahuanmu tentang budaya Sumba, terutama seni tenun ikat."""

        user_prompt = f"""Riwayat percakapan sebelumnya:
{conversation_history}

User: {message.user_message}
Ina Na:"""

        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=MAX_TOKENS,
            temperature=0.7,
        )

        bot_response = response.choices[0].message.content.strip()
        
        # Save messages to database
        save_messages(db, conversation.conversation_id, message.user_message, bot_response)
        
        return ChatResponse(
            bot_response=bot_response,
            conversation_id=conversation.conversation_id,
            character_name=character.name
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=get_messages()["chat_error"].format(error_detail=str(e)))

@chat_router.post("/tts")
async def text_to_speech(request: TTSRequest):
    """Convert text to speech using OpenAI TTS API"""
    validate_openai_client()
    
    messages = get_messages(request.language)
    logger.info(f"Processing TTS request in language: {request.language}")

    try:
        # Generate speech using OpenAI TTS
        response = client.audio.speech.create(
            model="tts-1",
            voice=request.voice,
            input=request.text
        )
        
        # Convert response to bytes
        audio_bytes = io.BytesIO()
        for chunk in response.iter_bytes():
            audio_bytes.write(chunk)
        audio_bytes.seek(0)
        
        return StreamingResponse(
            io.BytesIO(audio_bytes.read()),
            media_type="audio/mpeg",
            headers={"Content-Disposition": "attachment; filename=speech.mp3"}
        )
        
    except Exception as e:
        logger.error(f"TTS error: {e}")
        raise HTTPException(status_code=500, detail=messages["tts_error"].format(error_detail=str(e)))

@chat_router.post("/chat-with-tts", response_model=ChatWithTTSResponse)
async def chat_with_tts(
    message: ChatMessage, 
    voice: str = Query(default="nova"),  # Changed default to female voice for Ina Na
    db: Session = Depends(get_db)
):
    """Chat with Ina Na and get both text and audio response"""
    validate_openai_client()
    
    # Validate voice parameter
    if voice not in VALID_VOICES:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid voice. Must be one of: {', '.join(VALID_VOICES)}"
        )
    
    try:
        # First get the chat response
        chat_response = await chat_with_ina_na(message, db)
        
        # Then convert the response to speech
        audio_response = client.audio.speech.create(
            model="tts-1",
            voice=voice,
            input=chat_response.bot_response
        )
        
        # Convert to base64
        audio_bytes = b""
        for chunk in audio_response.iter_bytes():
            audio_bytes += chunk
        
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        return ChatWithTTSResponse(
            bot_response=chat_response.bot_response,
            conversation_id=chat_response.conversation_id,
            character_name=chat_response.character_name,
            audio_base64=audio_base64,
            voice_used=voice
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat with TTS error: {e}")
        raise HTTPException(status_code=500, detail=f"Chat with TTS Error: {str(e)}")

@chat_router.get("/conversation/{conversation_id}", response_model=ConversationHistory)
async def get_conversation_history(conversation_id: int, db: Session = Depends(get_db)):
    """Get conversation history with Ina Na"""
    conversation = db.query(Conversation).filter(
        Conversation.conversation_id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail=get_messages()["conversation_not_found"])
    
    character = get_ina_na_character(db)
    
    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.timestamp).all()
    
    return ConversationHistory(
        conversation_id=conversation_id,
        user_id=conversation.user_id,
        character_name=character.name,
        messages=[
            {
                "message_id": msg.message_id,
                "sender": msg.sender,
                "message": msg.message,
                "timestamp": msg.timestamp.isoformat() if msg.timestamp else None
            }
            for msg in messages
        ]
    )

@chat_router.get("/user/{user_id}/conversations", response_model=UserConversations)
async def get_user_conversations(user_id: str, db: Session = Depends(get_db)):
    """Get user's conversation with Ina Na"""
    # Validate user exists
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=get_messages()["user_not_found"])
    
    conversations = db.query(Conversation).filter(
        Conversation.user_id == user_id,
        Conversation.character_id == INA_NA_CHARACTER_ID
    ).all()
    
    result = []
    for conv in conversations:
        character = get_ina_na_character(db)
        
        # Get last message
        last_message = db.query(Message).filter(
            Message.conversation_id == conv.conversation_id
        ).order_by(Message.timestamp.desc()).first()
        
        result.append({
            "conversation_id": conv.conversation_id,
            "character_id": conv.character_id,
            "character_name": character.name,
            "last_message": last_message.message if last_message else None,
            "last_timestamp": last_message.timestamp.isoformat() if last_message and last_message.timestamp else None
        })
    
    return UserConversations(conversations=result)

@chat_router.get("/character")
async def get_ina_na_info(db: Session = Depends(get_db)):
    """Get Ina Na character information"""
    character = get_ina_na_character(db)
    
    return {
        "character_id": character.character_id,
        "name": character.name,
        "bio": character.bio,
        "region": character.region
    }

@chat_router.get("/tts/voices")
async def get_available_voices():
    """Get list of available TTS voices"""
    return {
        "voices": [
            {"name": "alloy", "description": "Neutral, balanced voice"},
            {"name": "echo", "description": "Male voice"},
            {"name": "fable", "description": "British accent"},
            {"name": "onyx", "description": "Deep male voice"},
            {"name": "nova", "description": "Female voice (recommended for Ina Na)"},
            {"name": "shimmer", "description": "Soft female voice (recommended for Ina Na)"}
        ]
    }

@chat_router.delete("/conversation/{conversation_id}")
async def delete_conversation(conversation_id: int, db: Session = Depends(get_db)):
    """Delete a conversation and all its messages"""
    conversation = db.query(Conversation).filter(
        Conversation.conversation_id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail=get_messages()["conversation_not_found"])
    
    try:
        # Delete all messages first
        db.query(Message).filter(Message.conversation_id == conversation_id).delete()
        # Delete conversation
        db.delete(conversation)
        db.commit()
        
        return {"message": "Conversation deleted successfully"}
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete conversation: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete conversation: {str(e)}")

@chat_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "openai_configured": client is not None,
        "character": "Ina Na - Sumba Weaver",
        "timestamp": datetime.now().isoformat()
    }

@chat_router.get("/")
def read_root():
    """Root endpoint"""
    return {
        "message": "Ina Na Chatbot API is running",
        "character": "Ina Na - Traditional Ikat Weaver from Sumba",
        "version": "2.1",
        "endpoints": [
            "/chat",
            "/tts", 
            "/chat-with-tts",
            "/conversation/{id}",
            "/user/{id}/conversations",
            "/character",
            "/tts/voices",
            "/health"
        ]
    }