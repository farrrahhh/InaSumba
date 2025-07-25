from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from database.config import get_db
from models.tables import Product, Transaction, User, Weaver
from pydantic import BaseModel
from typing import Optional, List
from datetime import date
import uuid
import random
import string
import logging

ecommerce_router = APIRouter()

class WeaverResponse(BaseModel):
    weaver_id: str
    name: str
    bio: Optional[str]
    address: Optional[str]
    phone_number: Optional[str]
    specialization: Optional[List[str]]

    class Config:
        from_attributes = True

class ProductResponse(BaseModel):
    product_id: str
    name: str
    quantity: int
    price: int
    category: str
    description: Optional[str]
    meaning_motif: Optional[str]
    long_description: Optional[str]
    long_meaning_motif: Optional[str]
    video_url: Optional[str]
    photo_url: Optional[str]

    class Config:
        from_attributes = True

class ProductWithWeaverResponse(BaseModel):
    product_id: str
    name: str
    quantity: int
    price: int
    category: str
    description: Optional[str]
    meaning_motif: Optional[str]
    long_description: Optional[str]
    long_meaning_motif: Optional[str]
    video_url: Optional[str]
    photo_url: Optional[str]
    weaver_id: str
    weaver: Optional[WeaverResponse]

    class Config:
        from_attributes = True

class BuyRequest(BaseModel):
    user_id: str
    product_id: str
    address: str
    phone_number: str

class TransactionResponse(BaseModel):
    transaction_id: str
    user_id: str
    product_id: str
    product_name: str
    quantity: int
    address: str
    phone_number: str
    resi: Optional[str]
    total_price: int
    status: str
    transaction_date: date

    class Config:
        from_attributes = True

class PaymentResponse(BaseModel):
    transaction_id: str
    qris_code: str
    total_amount: int
    product_name: str

class TrackingResponse(BaseModel):
    transaction_id: str
    product_name: str
    resi: Optional[str]
    status: str
    address: str
    phone_number: str
    total_price: int
    transaction_date: date

def generate_random_string(length: int = 10) -> str:
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

@ecommerce_router.get("/products", response_model=List[ProductResponse])
async def get_all_products(db: Session = Depends(get_db)):
    try:
        products = db.query(Product).filter(Product.quantity > 0).all()
        return products
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching products: {str(e)}"
        )

@ecommerce_router.get("/products/{product_id}", response_model=ProductWithWeaverResponse)
async def get_product_by_id(product_id: str, db: Session = Depends(get_db)):
    try:
        print(f"Fetching product with ID: {product_id}")
        
        product = db.query(Product).filter(Product.product_id == product_id).first()
        if not product:
            print(f"Product not found: {product_id}")
            raise HTTPException(status_code=404, detail="Product not found")
        
        print(f"Product found: {product.name}, weaver_id: {product.weaver_id}")
        
        weaver = db.query(Weaver).filter(Weaver.weaver_id == product.weaver_id).first()
        print(f"Weaver found: {weaver.name if weaver else 'None'}")
        
        response_data = {
            "product_id": product.product_id,
            "name": product.name,
            "quantity": product.quantity,
            "price": product.price,
            "category": product.category,
            "description": product.description,
            "meaning_motif": product.meaning_motif,
            "long_description": getattr(product, 'long_description', None),
            "long_meaning_motif": getattr(product, 'long_meaning_motif', None),
            "video_url": product.video_url,
            "photo_url": product.photo_url,
            "weaver_id": product.weaver_id,
            "weaver": {
                "weaver_id": weaver.weaver_id,
                "name": weaver.name,
                "bio": weaver.bio,
                "address": weaver.address,
                "phone_number": weaver.phone_number,
                "specialization": weaver.specialization
            } if weaver else None
        }
        
        return response_data

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_product_by_id: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching product: {str(e)}"
        )

@ecommerce_router.post("/buy", response_model=TransactionResponse)
async def buy_product(request: BuyRequest, db: Session = Depends(get_db)):
    try:
        # Get user and product
        user = db.query(User).filter(User.user_id == request.user_id).first()
        product = db.query(Product).filter(Product.product_id == request.product_id).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        if product.quantity < 1:
            raise HTTPException(status_code=400, detail="Product out of stock")

        # Calculate total price
        shipping_cost = 10000
        total_price = product.price + shipping_cost

        # Create transaction (DON'T reduce stock yet - only after payment confirmation)
        transaction_id = str(uuid.uuid4())
        transaction = Transaction(
            transaction_id=transaction_id,
            user_id=request.user_id,
            product_id=request.product_id,
            quantity=1,  # Fixed: was missing quantity field
            address=request.address,
            phone_number=request.phone_number,
            resi=None,
            total_price=total_price,
            status="pending_payment",
            transaction_date=date.today()
        )
        db.add(transaction)
        db.commit()
        db.refresh(transaction)

        return TransactionResponse(
            transaction_id=transaction.transaction_id,
            user_id=transaction.user_id,
            product_id=transaction.product_id,
            product_name=product.name,
            quantity=transaction.quantity,
            address=transaction.address,
            phone_number=transaction.phone_number,
            resi=transaction.resi,
            total_price=transaction.total_price,
            status=transaction.status,
            transaction_date=transaction.transaction_date
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing purchase: {str(e)}"
        )

@ecommerce_router.get("/payment/{transaction_id}")
async def get_payment_details(transaction_id: str, db: Session = Depends(get_db)):
    try:
        transaction = db.query(Transaction).join(Product).filter(
            Transaction.transaction_id == transaction_id
        ).first()
        
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found"
            )
        
        product_price = transaction.product.price
        shipping_cost = 10000
        total_price = transaction.total_price
        
        return {
            "transaction_id": transaction_id,
            "product_name": transaction.product.name,
            "product_price": product_price,
            "shipping_cost": shipping_cost,
            "total_price": total_price,
            "address": transaction.address,
            "phone_number": transaction.phone_number,
            "status": transaction.status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching payment details: {str(e)}"
        )

@ecommerce_router.post("/payment/{transaction_id}/qris", response_model=PaymentResponse)
async def generate_qris_payment(transaction_id: str, db: Session = Depends(get_db)):
    try:
        transaction = db.query(Transaction).join(Product).filter(
            Transaction.transaction_id == transaction_id
        ).first()
        
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found"
            )
        
        if transaction.status != "pending_payment":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Transaction is not in pending payment status"
            )
        
        qris_code = f"QRIS-{transaction_id}-{generate_random_string(12)}"
        
        return PaymentResponse(
            transaction_id=transaction_id,
            qris_code=qris_code,
            total_amount=transaction.total_price,
            product_name=transaction.product.name
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating QRIS: {str(e)}"
        )

@ecommerce_router.post("/payment/{transaction_id}/confirm")
async def confirm_payment(transaction_id: str, db: Session = Depends(get_db)):
    try:
        transaction = db.query(Transaction).filter(
            Transaction.transaction_id == transaction_id
        ).first()
        
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found"
            )
        
        if transaction.status != "pending_payment":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Transaction is not in pending payment status"
            )
        
        # Check if product is still available
        product = db.query(Product).filter(Product.product_id == transaction.product_id).first()
        if not product or product.quantity < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product is no longer available"
            )
        
        # Update transaction status and generate resi
        transaction.status = "paid"
        transaction.resi = f"RESI-{generate_random_string(10)}"
        
        # NOW reduce the product quantity after payment confirmation
        product.quantity -= 1
        
        db.commit()
        
        return {
            "message": "Payment confirmed successfully",
            "transaction_id": transaction_id,
            "resi": transaction.resi,
            "status": transaction.status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error confirming payment: {str(e)}"
        )

@ecommerce_router.get("/transactions/user/{user_id}", response_model=List[TransactionResponse])
async def get_all_transactions_by_user_id(user_id: str, db: Session = Depends(get_db)):
    try:
        transactions = db.query(Transaction).join(Product).filter(
            Transaction.user_id == user_id
        ).all()
        
        result = []
        for transaction in transactions:
            result.append(TransactionResponse(
                transaction_id=transaction.transaction_id,
                user_id=transaction.user_id,
                product_id=transaction.product_id,
                product_name=transaction.product.name,
                quantity=transaction.quantity,
                address=transaction.address,
                phone_number=transaction.phone_number,
                resi=transaction.resi,
                total_price=transaction.total_price,
                status=transaction.status,
                transaction_date=transaction.transaction_date
            ))
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user transactions: {str(e)}"
        )

@ecommerce_router.get("/track/{transaction_id}", response_model=TrackingResponse)
async def track_order(transaction_id: str, db: Session = Depends(get_db)):
    try:
        transaction = db.query(Transaction).join(Product).filter(
            Transaction.transaction_id == transaction_id
        ).first()
        
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found"
            )
        
        return TrackingResponse(
            transaction_id=transaction.transaction_id,
            product_name=transaction.product.name,
            resi=transaction.resi,
            status=transaction.status,
            address=transaction.address,
            phone_number=transaction.phone_number,
            total_price=transaction.total_price,
            transaction_date=transaction.transaction_date
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error tracking order: {str(e)}"
        )

@ecommerce_router.put("/orders/{transaction_id}/status")
async def update_order_status(
    transaction_id: str, 
    new_status: str, 
    resi: Optional[str] = None,
    db: Session = Depends(get_db)
):
    try:
        transaction = db.query(Transaction).filter(
            Transaction.transaction_id == transaction_id
        ).first()
        
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found"
            )
        
        transaction.status = new_status
        
        if resi:
            transaction.resi = resi
        
        db.commit()
        
        return {
            "message": f"Order status updated to {new_status}",
            "transaction_id": transaction_id,
            "status": new_status,
            "resi": transaction.resi
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating order status: {str(e)}"
        )