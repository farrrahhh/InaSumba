from sqlalchemy import (
    Column, String, Integer, Date, ForeignKey, Text, TIMESTAMP, func
)
from sqlalchemy.orm import relationship
from database.config import Base

# User Table
class User(Base):
    __tablename__ = "users"

    user_id = Column(String(8), primary_key=True)
    name = Column(String(100), nullable=False)
    password = Column(Text, nullable=False)
    email = Column(String(100), nullable=False, unique=True)

    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")


# Character Table
class Character(Base):
    __tablename__ = "characters"

    character_id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    bio = Column(Text, nullable=True)
    region = Column(String(50), nullable=True)

    conversations = relationship("Conversation", back_populates="character", cascade="all, delete-orphan")


# Conversation Table
class Conversation(Base):
    __tablename__ = "conversations"

    conversation_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(8), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    character_id = Column(String(50), ForeignKey("characters.character_id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", back_populates="conversations")
    character = relationship("Character", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


# Message Table
class Message(Base):
    __tablename__ = "messages"

    message_id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.conversation_id", ondelete="CASCADE"), nullable=False)
    sender = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    timestamp = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    conversation = relationship("Conversation", back_populates="messages")

# Product Table
class Product(Base):
    __tablename__ = "products"

    product_id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Integer, nullable=False)
    description = Column(Text, nullable=True)
    video_url = Column(String(255), nullable=True)
    photo_url = Column(String(255), nullable=True)

    transactions = relationship("Transaction", back_populates="product", cascade="all, delete-orphan")


# Transaction Table
class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(8), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String(50), ForeignKey("products.product_id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), nullable=False)

    user = relationship("User")
    product = relationship("Product", back_populates="transactions")
