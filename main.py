from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, Query
from sqlmodel import Session, select

from database import init_db, get_session
from models import Product
from schemas import ProductCreate, ProductUpdate, ProductRead

app = FastAPI(title="Mini E-Commerce API")


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
