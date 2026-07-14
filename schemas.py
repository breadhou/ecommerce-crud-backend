from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


# ── Product Schemas ──

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int
    category: str
    image_url: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category: Optional[str] = None
    image_url: Optional[str] = None


class ProductRead(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    stock: int
    category: str
    image_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Order Schemas ──

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class OrderCreate(BaseModel):
    items: List[OrderItemCreate]


class OrderItemRead(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float

    class Config:
        from_attributes = True


class OrderRead(BaseModel):
    id: int
    status: str
    total_price: float
    created_at: datetime
    items: List[OrderItemRead]

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: str
