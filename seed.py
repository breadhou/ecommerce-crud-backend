from database import engine, init_db
from models import Product
from sqlmodel import Session

init_db()

products = [
    Product(name="机械键盘", description="Cherry MX 青轴，RGB 背光", price=299.0, stock=50, category="电子产品", image_url="https://via.placeholder.com/200?text=keyboard"),
    Product(name="无线鼠标", description="人体工学设计，静音按键", price=89.0, stock=100, category="电子产品", image_url="https://via.placeholder.com/200?text=mouse"),
    Product(name="Python编程入门", description="零基础学Python", price=59.0, stock=30, category="图书", image_url="https://via.placeholder.com/200?text=python"),
    Product(name="算法导论", description="计算机科学经典教材", price=128.0, stock=20, category="图书", image_url="https://via.placeholder.com/200?text=algo"),
    Product(name="运动跑鞋", description="轻便透气，适合长跑", price=399.0, stock=25, category="运动户外", image_url="https://via.placeholder.com/200?text=shoes"),
]

with Session(engine) as session:
    session.add_all(products)
    session.commit()

print(f"Seeded {len(products)} products.")
