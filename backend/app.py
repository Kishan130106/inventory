from flask import Flask, request, jsonify
from database import get_db, init_db

app = Flask(__name__)

init_db()

@app.route("/")
def home():
    return "Core Inventory API running"


@app.route("/product", methods=["POST"])
def add_product():
    data = request.json

    name = data["name"]
    sku = data["sku"]
    category = data["category"]
    unit = data["unit"]
    stock = data.get("stock", 0)

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO products (name, sku, category, unit, stock) VALUES (?, ?, ?, ?, ?)",
        (name, sku, category, unit, stock),
    )

    conn.commit()
    conn.close()

    return jsonify({"message": "Product added"})


@app.route("/products", methods=["GET"])
def get_products():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM products")
    products = cursor.fetchall()

    result = [dict(p) for p in products]

    conn.close()

    return jsonify(result)

@app.route("/receipt", methods=["POST"])
def receive_stock():
    data = request.json

    product_id = data["product_id"]
    quantity = data["quantity"]

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE products SET stock = stock + ? WHERE id = ?",
        (quantity, product_id)
    )

    cursor.execute(
        "INSERT INTO transactions (product_id, type, quantity) VALUES (?, ?, ?)",
        (product_id, "receipt", quantity)
    )

    conn.commit()
    conn.close()

    return jsonify({"message": "Stock received"})

@app.route("/delivery", methods=["POST"])
def deliver_stock():
    data = request.json

    product_id = data["product_id"]
    quantity = data["quantity"]

    conn = get_db()
    cursor = conn.cursor()

    # Check current stock
    cursor.execute("SELECT stock FROM products WHERE id = ?", (product_id,))
    product = cursor.fetchone()

    if not product:
        return jsonify({"error": "Product not found"}), 404

    if product["stock"] < quantity:
        return jsonify({"error": "Not enough stock"}), 400

    # Reduce stock
    cursor.execute(
        "UPDATE products SET stock = stock - ? WHERE id = ?",
        (quantity, product_id)
    )

    # Log transaction
    cursor.execute(
        "INSERT INTO transactions (product_id, type, quantity) VALUES (?, ?, ?)",
        (product_id, "delivery", quantity)
    )

    conn.commit()
    conn.close()

    return jsonify({"message": "Stock delivered"})

@app.route("/product/search", methods=["GET"])
def search_product():

    sku = request.args.get("sku")

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM products WHERE sku = ?", (sku,))
    product = cursor.fetchone()

    conn.close()

    if product:
        return jsonify(dict(product))
    else:
        return jsonify({"error": "Product not found"}), 404

@app.route("/history", methods=["GET"])
def get_history():

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT transactions.id, products.name, transactions.type, transactions.quantity, transactions.date
        FROM transactions
        JOIN products ON transactions.product_id = products.id
        ORDER BY transactions.date DESC
    """)

    rows = cursor.fetchall()
    result = [dict(r) for r in rows]

    conn.close()

    return jsonify(result)

@app.route("/low-stock", methods=["GET"])
def low_stock():

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM products WHERE stock <= 5")

    items = cursor.fetchall()
    result = [dict(i) for i in items]

    conn.close()

    return jsonify(result)

@app.route("/dashboard", methods=["GET"])
def dashboard():

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as total_products FROM products")
    total_products = cursor.fetchone()["total_products"]

    cursor.execute("SELECT COUNT(*) as low_stock FROM products WHERE stock <= 5")
    low_stock = cursor.fetchone()["low_stock"]

    cursor.execute("SELECT SUM(stock) as total_stock FROM products")
    total_stock = cursor.fetchone()["total_stock"]

    conn.close()

    return jsonify({
        "total_products": total_products,
        "low_stock_items": low_stock,
        "total_stock": total_stock
    })


app.run(debug=True)