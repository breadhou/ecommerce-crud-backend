from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from database import init_db, get_session
from models import Product, Order, OrderItem, OrderStatus
from schemas import ProductCreate, ProductUpdate, ProductRead, OrderCreate, OrderRead, OrderStatusUpdate

app = FastAPI(title="Mini E-Commerce API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


# ── Product Routes ──

@app.get("/api/products", response_model=list[ProductRead])
def list_products(
    category: Optional[str] = Query(None),
    session: Session = Depends(get_session),
):
    if category:
        return session.exec(select(Product).where(Product.category == category)).all()
    return session.exec(select(Product)).all()


@app.get("/api/products/{product_id}", response_model=ProductRead)
def get_product(product_id: int, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@app.post("/api/products", response_model=ProductRead, status_code=201)
def create_product(product: ProductCreate, session: Session = Depends(get_session)):
    db_product = Product.model_validate(product)
    session.add(db_product)
    session.commit()
    session.refresh(db_product)
    return db_product


@app.put("/api/products/{product_id}", response_model=ProductRead)
def update_product(
    product_id: int,
    product: ProductUpdate,
    session: Session = Depends(get_session),
):
    db_product = session.get(Product, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in product.model_dump(exclude_unset=True).items():
        setattr(db_product, key, value)
    session.add(db_product)
    session.commit()
    session.refresh(db_product)
    return db_product


@app.delete("/api/products/{product_id}", status_code=204)
def delete_product(product_id: int, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    session.delete(product)
    session.commit()


# ── Order Routes ──

ORDER_STATUS_FLOW = {
    OrderStatus.PENDING: OrderStatus.CONFIRMED,
    OrderStatus.CONFIRMED: OrderStatus.SHIPPED,
    OrderStatus.SHIPPED: OrderStatus.DELIVERED,
}


@app.get("/api/orders", response_model=list[OrderRead])
def list_orders(
    status: Optional[str] = Query(None),
    session: Session = Depends(get_session),
):
    if status:
        return session.exec(select(Order).where(Order.status == status)).all()
    return session.exec(select(Order)).all()


@app.get("/api/orders/{order_id}", response_model=OrderRead)
def get_order(order_id: int, session: Session = Depends(get_session)):
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@app.post("/api/orders", response_model=OrderRead, status_code=201)
def create_order(order: OrderCreate, session: Session = Depends(get_session)):
    db_order = Order()
    session.add(db_order)
    total = 0.0
    for item in order.items:
        product = session.get(Product, item.product_id)
        if not product:
            session.rollback()
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock < item.quantity:
            session.rollback()
            raise HTTPException(status_code=400, detail=f"Insufficient stock for product {item.product_id}")
        product.stock -= item.quantity
        session.add(product)
        db_item = OrderItem(
            order_id=db_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=product.price,
        )
        total += product.price * item.quantity
        session.add(db_item)
    db_order.total_price = total
    session.add(db_order)
    session.commit()
    session.refresh(db_order)
    return db_order


@app.put("/api/orders/{order_id}/status", response_model=OrderRead)
def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    session: Session = Depends(get_session),
):
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    new_status = status_update.status
    allowed_next = ORDER_STATUS_FLOW.get(order.status)
    if not allowed_next or new_status != allowed_next:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot transition from {order.status} to {new_status}",
        )
    order.status = new_status
    session.add(order)
    session.commit()
    session.refresh(order)
    return order


@app.delete("/api/orders/{order_id}", status_code=204)
def delete_order(order_id: int, session: Session = Depends(get_session)):
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status in (OrderStatus.SHIPPED, OrderStatus.DELIVERED):
        raise HTTPException(status_code=400, detail="Cannot delete a shipped or delivered order")
    for item in order.items:
        product = session.get(Product, item.product_id)
        if product:
            product.stock += item.quantity
            session.add(product)
        session.delete(item)
    session.delete(order)
    session.commit()
