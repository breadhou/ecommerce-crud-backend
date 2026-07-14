from fastapi.testclient import TestClient
from main import app
from database import engine, init_db
from sqlmodel import SQLModel, Session

client = TestClient(app)


def setup():
    SQLModel.metadata.drop_all(engine)
    init_db()


def seed_product(name="Test Product", price=99.0, stock=10, category="electronics"):
    return client.post("/api/products", json={
        "name": name,
        "price": price,
        "stock": stock,
        "category": category,
    })


# ── Product Tests ──

def test_create_product():
    setup()
    res = seed_product()
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Test Product"
    assert data["price"] == 99.0
    assert data["id"] is not None


def test_list_products():
    setup()
    seed_product("A", price=10, category="books")
    seed_product("B", price=20, category="books")
    seed_product("C", price=30, category="electronics")

    res = client.get("/api/products")
    assert res.status_code == 200
    assert len(res.json()) == 3

    res = client.get("/api/products?category=books")
    assert res.status_code == 200
    assert len(res.json()) == 2


def test_get_product():
    setup()
    created = seed_product()
    pid = created.json()["id"]

    res = client.get(f"/api/products/{pid}")
    assert res.status_code == 200
    assert res.json()["name"] == "Test Product"

    res = client.get("/api/products/99999")
    assert res.status_code == 404


def test_update_product():
    setup()
    created = seed_product()
    pid = created.json()["id"]

    res = client.put(f"/api/products/{pid}", json={"price": 49.0, "name": "Updated"})
    assert res.status_code == 200
    data = res.json()
    assert data["price"] == 49.0
    assert data["name"] == "Updated"
    assert data["stock"] == 10  # unchanged

    res = client.put("/api/products/99999", json={"name": "X"})
    assert res.status_code == 404


def test_delete_product():
    setup()
    created = seed_product()
    pid = created.json()["id"]

    res = client.delete(f"/api/products/{pid}")
    assert res.status_code == 204

    res = client.get(f"/api/products/{pid}")
    assert res.status_code == 404


# ── Order Tests ──

def test_create_order_success():
    setup()
    p1 = seed_product("Item1", price=50.0, stock=5).json()
    p2 = seed_product("Item2", price=30.0, stock=3).json()

    res = client.post("/api/orders", json={
        "items": [
            {"product_id": p1["id"], "quantity": 2},
            {"product_id": p2["id"], "quantity": 1},
        ]
    })
    assert res.status_code == 201
    data = res.json()
    assert data["total_price"] == 130.0
    assert data["status"] == "pending"
    assert len(data["items"]) == 2

    # verify stock deducted
    assert client.get(f"/api/products/{p1['id']}").json()["stock"] == 3
    assert client.get(f"/api/products/{p2['id']}").json()["stock"] == 2


def test_create_order_insufficient_stock():
    setup()
    p1 = seed_product("Item1", price=50.0, stock=1).json()

    res = client.post("/api/orders", json={
        "items": [{"product_id": p1["id"], "quantity": 5}]
    })
    assert res.status_code == 400


def test_create_order_product_not_found():
    setup()
    res = client.post("/api/orders", json={
        "items": [{"product_id": 99999, "quantity": 1}]
    })
    assert res.status_code == 404


def test_list_orders():
    setup()
    p1 = seed_product("Item1", price=10.0, stock=10).json()
    client.post("/api/orders", json={
        "items": [{"product_id": p1["id"], "quantity": 1}]
    })
    client.post("/api/orders", json={
        "items": [{"product_id": p1["id"], "quantity": 2}]
    })

    res = client.get("/api/orders")
    assert res.status_code == 200
    assert len(res.json()) == 2


def test_get_order():
    setup()
    p1 = seed_product("Item1", price=10.0, stock=10).json()
    created = client.post("/api/orders", json={
        "items": [{"product_id": p1["id"], "quantity": 1}]
    })
    oid = created.json()["id"]

    res = client.get(f"/api/orders/{oid}")
    assert res.status_code == 200
    assert len(res.json()["items"]) == 1

    res = client.get("/api/orders/99999")
    assert res.status_code == 404


def test_update_order_status():
    setup()
    p1 = seed_product("Item1", price=10.0, stock=10).json()
    created = client.post("/api/orders", json={
        "items": [{"product_id": p1["id"], "quantity": 1}]
    })
    oid = created.json()["id"]

    # valid transition: pending -> confirmed
    res = client.put(f"/api/orders/{oid}/status", json={"status": "confirmed"})
    assert res.status_code == 200
    assert res.json()["status"] == "confirmed"

    # invalid transition: skip shipped
    res = client.put(f"/api/orders/{oid}/status", json={"status": "delivered"})
    assert res.status_code == 400

    # valid: confirmed -> shipped
    res = client.put(f"/api/orders/{oid}/status", json={"status": "shipped"})
    assert res.status_code == 200


def test_delete_order_restores_stock():
    setup()
    p1 = seed_product("Item1", price=10.0, stock=10).json()
    created = client.post("/api/orders", json={
        "items": [{"product_id": p1["id"], "quantity": 3}]
    })
    oid = created.json()["id"]

    res = client.delete(f"/api/orders/{oid}")
    assert res.status_code == 204

    # stock should be restored
    assert client.get(f"/api/products/{p1['id']}").json()["stock"] == 10


def test_delete_shipped_order_fails():
    setup()
    p1 = seed_product("Item1", price=10.0, stock=10).json()
    created = client.post("/api/orders", json={
        "items": [{"product_id": p1["id"], "quantity": 1}]
    })
    oid = created.json()["id"]

    client.put(f"/api/orders/{oid}/status", json={"status": "confirmed"})
    client.put(f"/api/orders/{oid}/status", json={"status": "shipped"})

    res = client.delete(f"/api/orders/{oid}")
    assert res.status_code == 400
