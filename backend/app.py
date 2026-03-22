from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ── Database connection ───────────────────────────────────────────────────────
# Replace 'your_password' with the password you set during PostgreSQL installation
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:post1234@localhost:5432/market_analysis"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# ── Models ────────────────────────────────────────────────────────────────────

class Brand(db.Model):
    __tablename__ = "brands"
    id   = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)

class Model(db.Model):
    __tablename__ = "models"
    id       = db.Column(db.Integer, primary_key=True)
    brand_id = db.Column(db.Integer, db.ForeignKey("brands.id"), nullable=False)
    name     = db.Column(db.String(150), nullable=False)

class Product(db.Model):
    __tablename__ = "products"
    id       = db.Column(db.Integer, primary_key=True)
    model_id = db.Column(db.Integer, db.ForeignKey("models.id"), nullable=False)
    inches   = db.Column(db.Integer, nullable=False)
    market   = db.Column(db.String(10), nullable=False)
    year     = db.Column(db.Integer, nullable=False)

class ProductSpec(db.Model):
    __tablename__ = "product_specs"
    id               = db.Column(db.Integer, primary_key=True)
    product_id       = db.Column(db.Integer, db.ForeignKey("products.id"), unique=True)
    panel_type       = db.Column(db.String(50))
    resolution       = db.Column(db.String(50))
    refresh_rate_hz  = db.Column(db.Integer)
    brightness_nits  = db.Column(db.Integer)
    hdr_support      = db.Column(db.Text)
    hdmi_21_ports    = db.Column(db.Integer)
    input_lag_ms     = db.Column(db.Numeric(5, 2))
    sound_system     = db.Column(db.Text)
    wifi_version     = db.Column(db.String(20))
    smart_os         = db.Column(db.String(50))

# ── Routes ────────────────────────────────────────────────────────────────────

# GET /api/brands
# Returns all brands
@app.route("/api/brands", methods=["GET"])
def get_brands():
    brands = Brand.query.order_by(Brand.name).all()
    return jsonify([{"id": b.id, "name": b.name} for b in brands])


# GET /api/models?brand_id=1&market=US&year=2024
# Returns models filtered by brand, and optionally by market and year
@app.route("/api/models", methods=["GET"])
def get_models():
    brand_id = request.args.get("brand_id", type=int)
    market   = request.args.get("market")
    year     = request.args.get("year", type=int)

    if not brand_id:
        return jsonify({"error": "brand_id is required"}), 400

    query = (
        db.session.query(Model)
        .join(Product, Product.model_id == Model.id)
        .filter(Model.brand_id == brand_id)
    )

    if market:
        query = query.filter(Product.market == market)
    if year:
        query = query.filter(Product.year == year)

    models = query.distinct().order_by(Model.name).all()
    return jsonify([{"id": m.id, "name": m.name} for m in models])


# GET /api/inches?model_id=1&market=US&year=2024
# Returns available inch sizes for a model
@app.route("/api/inches", methods=["GET"])
def get_inches():
    model_id = request.args.get("model_id", type=int)
    market   = request.args.get("market")
    year     = request.args.get("year", type=int)

    if not model_id:
        return jsonify({"error": "model_id is required"}), 400

    query = Product.query.filter_by(model_id=model_id)

    if market:
        query = query.filter_by(market=market)
    if year:
        query = query.filter_by(year=year)

    products = query.order_by(Product.inches).all()
    return jsonify([p.inches for p in products])


# GET /api/products?model_id=1&inches=65&market=US&year=2024
# Returns product with full specs
@app.route("/api/products", methods=["GET"])
def get_products():
    model_id = request.args.get("model_id", type=int)
    inches   = request.args.get("inches", type=int)
    market   = request.args.get("market")
    year     = request.args.get("year", type=int)

    query = (
        db.session.query(Product, ProductSpec, Model, Brand)
        .join(ProductSpec, ProductSpec.product_id == Product.id)
        .join(Model, Model.id == Product.model_id)
        .join(Brand, Brand.id == Model.brand_id)
    )

    if model_id: query = query.filter(Product.model_id == model_id)
    if inches:   query = query.filter(Product.inches == inches)
    if market:   query = query.filter(Product.market == market)
    if year:     query = query.filter(Product.year == year)

    results = query.all()

    return jsonify([
        {
            "id":              p.id,
            "brand":           b.name,
            "model":           m.name,
            "inches":          p.inches,
            "market":          p.market,
            "year":            p.year,
            "specs": {
                "panel_type":      s.panel_type,
                "resolution":      s.resolution,
                "refresh_rate_hz": s.refresh_rate_hz,
                "brightness_nits": s.brightness_nits,
                "hdr_support":     s.hdr_support,
                "hdmi_21_ports":   s.hdmi_21_ports,
                "input_lag_ms":    float(s.input_lag_ms) if s.input_lag_ms else None,
                "sound_system":    s.sound_system,
                "wifi_version":    s.wifi_version,
                "smart_os":        s.smart_os,
            }
        }
        for p, s, m, b in results
    ])

# GET /api/price-history?product_id=1
@app.route("/api/price-history", methods=["GET"])
def get_price_history():
    product_id = request.args.get("product_id", type=int)

    if not product_id:
        return jsonify({"error": "product_id is required"}), 400

    from sqlalchemy import text
    result = db.session.execute(
        text("SELECT prices FROM price_history WHERE product_id = :pid AND year = 2024"),
        {"pid": product_id}
    ).fetchone()

    if not result:
        return jsonify({"error": "No price history found"}), 404

    return jsonify(result[0])

# GET /api/products/find?model_id=1&inches=65&market=US&year=2024
@app.route("/api/products/find", methods=["GET"])
def find_product():
    model_id = request.args.get("model_id", type=int)
    inches   = request.args.get("inches", type=int)
    market   = request.args.get("market")
    year     = request.args.get("year", type=int)

    product = Product.query.filter_by(
        model_id=model_id,
        inches=inches,
        market=market,
        year=year
    ).first()

    if not product:
        return jsonify({"error": "Product not found"}), 404

    model = Model.query.get(product.model_id)
    brand = Brand.query.get(model.brand_id)

    return jsonify({
        "id":     product.id,
        "brand":  brand.name,
        "model":  model.name,
        "inches": product.inches,
        "market": product.market,
        "year":   product.year,
    })

# GET /api/sales-history?product_id=1
@app.route("/api/sales-history", methods=["GET"])
def get_sales_history():
    product_id = request.args.get("product_id", type=int)

    if not product_id:
        return jsonify({"error": "product_id is required"}), 400

    from sqlalchemy import text
    result = db.session.execute(
        text("SELECT sales FROM sales_history WHERE product_id = :pid AND year = 2024"),
        {"pid": product_id}
    ).fetchone()

    if not result:
        return jsonify({"error": "No sales history found"}), 404

    return jsonify(result[0])

# ── Run ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, port=5000)