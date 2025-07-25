from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime
import os
from fastapi.middleware.cors import CORSMiddleware
from routes.authentication import authentication_router
from routes.chat import chat_router
from routes.ecommerce import ecommerce_router
from database.config import Base, engine, SessionLocal
from models.tables import User, Conversation, Message, Character
from sqlalchemy.orm import Session
from fastapi import Depends
from routes.translator import translator_router
from routes.classifier import classifier_router
from routes.profile import profile_router

app = FastAPI()
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",  
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,             
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




app.include_router(authentication_router)
app.include_router(chat_router)
app.include_router(ecommerce_router)
app.include_router(translator_router)
app.include_router(classifier_router)
app.include_router(profile_router)


def add_characters_to_db(db: Session):
    # List of characters
    characters = [
        Character(character_id="CR001", name="Ina Na", 
                  bio="Ina Na, 40 tahun, adalah seorang penenun terampil dan berpengetahuan luas dari Sumba. Dikenal dengan kepribadiannya yang keibuan, ramah, dan sabar, Ina selalu siap berbagi cerita dan pengetahuannya tentang kekayaan budaya Sumba, terutama seni tenun ikat tradisional. Ia bangga melestarikan warisan leluhur dan sangat senang membimbing siapa pun yang ingin belajar lebih banyak tentang makna di balik setiap motif dan proses di balik setiap helai kain.", region="Sumba, Nusa Tenggara Timur"),
    ]
    
    for character in characters:
        existing_character = db.query(Character).filter(Character.character_id == character.character_id).first()
        if not existing_character:
            db.add(character)
    
    db.commit() 


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
    

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    add_characters_to_db(db)
@chat_router.delete("/conversation/{conversation_id}")
async def delete_conversation(conversation_id: int, db: Session = Depends(get_db)):
    """Endpoint untuk menghapus conversation dan semua messagenya"""
    try:
        messages = db.query(Message).filter(Message.conversation_id == conversation_id).all()
        for message in messages:
            db.delete(message)
        
        
        conversation = db.query(Conversation).filter(Conversation.conversation_id == conversation_id).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        db.delete(conversation)
        db.commit()
        
        return {"message": "Conversation deleted successfully"}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting conversation: {str(e)}")

@chat_router.get("/user/{user_id}/conversations/{character_id}")
async def get_user_character_conversation(user_id: str, character_id: str, db: Session = Depends(get_db)):
    """Endpoint untuk mengambil conversation spesifik antara user dan character"""
    conversation = db.query(Conversation).filter(
        Conversation.user_id == user_id,
        Conversation.character_id == character_id
    ).first()
    
    if not conversation:
        return {"conversation": None, "messages": []}
    
    messages = db.query(Message).filter(
        Message.conversation_id == conversation.conversation_id
    ).order_by(Message.timestamp).all()
    
    return {
        "conversation": {
            "conversation_id": conversation.conversation_id,
            "user_id": conversation.user_id,
            "character_id": conversation.character_id
        },
        "messages": [
            {
                "message_id": msg.message_id,
                "sender": msg.sender,
                "message": msg.message,
                "timestamp": msg.timestamp
            }
            for msg in messages
        ]
    }


@app.get("/")
async def read_root():
    return {"message": "Welcome to the FastAPI application!"}
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
