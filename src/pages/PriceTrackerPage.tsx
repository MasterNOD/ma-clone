import { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import PriceChart from "../components/PriceChart";
import "./PriceTrackerPage.css";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Brand   { id: number; name: string; }
interface Model   { id: number; name: string; }
interface Product { id: number; brand: string; model: string; inches: number; market: string; year: number; }

// ── Config ────────────────────────────────────────────────────────────────────

const API = "http://localhost:5000/api";
const markets = ["US", "KR", "CN"];

// ── Component ─────────────────────────────────────────────────────────────────

const PriceTrackerPage = () => {
  const [brands, setBrands]           = useState<Brand[]>([]);
  const [models, setModels]           = useState<Model[]>([]);
  const [inchesList, setInchesList]   = useState<number[]>([]);

  const [selectedMarket, setSelectedMarket] = useState("");
  const [selectedBrand, setSelectedBrand]   = useState("");
  const [selectedModel, setSelectedModel]   = useState("");
  const [selectedInches, setSelectedInches] = useState("");

  const [product, setProduct]           = useState<Product | null>(null);
  const [priceData, setPriceData]       = useState<Record<string, number> | null>(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/brands`)
      .then((r) => r.json())
      .then(setBrands)
      .catch(console.error);
  }, []);

  // ── Filter handlers ───────────────────────────────────────────────────────

  const handleMarketChange = (value: string) => {
    setSelectedMarket(value);
    setSelectedModel("");
    setModels([]);
    setSelectedInches("");
    setInchesList([]);
  };

  const handleBrandChange = async (brandId: string) => {
    setSelectedBrand(brandId);
    setSelectedModel("");
    setModels([]);
    setSelectedInches("");
    setInchesList([]);

    if (!brandId) return;

    const params = new URLSearchParams({ brand_id: brandId });
    if (selectedMarket) params.append("market", selectedMarket);
    params.append("year", "2024");

    const res  = await fetch(`${API}/models?${params}`);
    const data = await res.json();
    setModels(data);
  };

  const handleModelChange = async (modelId: string) => {
    setSelectedModel(modelId);
    setSelectedInches("");
    setInchesList([]);

    if (!modelId) return;

    const params = new URLSearchParams({ model_id: modelId });
    if (selectedMarket) params.append("market", selectedMarket);
    params.append("year", "2024");

    const res  = await fetch(`${API}/inches?${params}`);
    const data = await res.json();
    setInchesList(data);
  };

  // ── Search ────────────────────────────────────────────────────────────────

  const handleSearch = async () => {
    if (!selectedBrand || !selectedModel || !selectedInches) return;

    setLoading(true);
    setError(null);
    setProduct(null);
    setPriceData(null);

    try {
      // Step 1 — find product_id
      const params = new URLSearchParams({
        model_id: selectedModel,
        inches:   selectedInches,
        year:     "2024",
      });
      if (selectedMarket) params.append("market", selectedMarket);

      const productRes = await fetch(`${API}/products/find?${params}`);
      if (!productRes.ok) { setError("Product not found."); return; }
      const productData: Product = await productRes.json();
      setProduct(productData);

      // Step 2 — fetch price history
      const priceRes = await fetch(`${API}/price-history?product_id=${productData.id}`);
      if (!priceRes.ok) { setError("No price history found for this product."); return; }
      const prices = await priceRes.json();
      setPriceData(prices);

    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Container fluid className="mt-4 px-4">
      <Row>

        {/* ── Left: Filters ── */}
        <Col xs={12} xl={3}>
          <div className="filter-panel">
            <h5 className="mb-4 fw-bold">Filters</h5>

            {/* Year — disabled */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="filter-label">Year</span>
              <Form.Select size="sm" value="2024" disabled>
                <option value="2024">2024</option>
              </Form.Select>
            </div>

            {/* Market */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="filter-label">Market</span>
              <Form.Select size="sm" value={selectedMarket} onChange={(e) => handleMarketChange(e.target.value)}>
                <option value="">— Select —</option>
                {markets.map((m) => <option key={m} value={m}>{m}</option>)}
              </Form.Select>
            </div>

            <hr className="my-3" />

            {/* Product selector */}
            <div className="mb-3">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="column-header">Brand</span>
                <span className="column-header">Model</span>
                <span className="column-header">Inches</span>
              </div>

              <div className="d-flex align-items-center gap-2">
                <Form.Select size="sm" value={selectedBrand} onChange={(e) => handleBrandChange(e.target.value)}>
                  <option value="">—</option>
                  {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </Form.Select>

                <Form.Select size="sm" value={selectedModel} disabled={!selectedBrand} onChange={(e) => handleModelChange(e.target.value)}>
                  <option value="">—</option>
                  {models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </Form.Select>

                <Form.Select size="sm" value={selectedInches} disabled={!selectedModel} onChange={(e) => setSelectedInches(e.target.value)}>
                  <option value="">—</option>
                  {inchesList.map((i) => <option key={i} value={i}>{i}"</option>)}
                </Form.Select>
              </div>
            </div>

            <hr className="my-3" />

            {/* Search button */}
            <div className="d-flex justify-content-end">
              <Button
                variant="primary"
                onClick={handleSearch}
                disabled={!selectedBrand || !selectedModel || !selectedInches || loading}
              >
                {loading ? "Searching…" : "Search"}
              </Button>
            </div>

          </div>
        </Col>

        {/* ── Right: Chart ── */}
        <Col xs={12} xl={9} className="mt-2 mt-xl-0">
          <div className="content-panel">

            {!product && !loading && !error && (
              <p className="text-muted mb-0">Select a product on the left and click Search.</p>
            )}

            {loading && <p className="text-muted mb-0">Loading…</p>}

            {error && <p className="text-danger mb-0">{error}</p>}

            {product && priceData && (
              <>
                <div className="d-flex align-items-baseline gap-2 mb-4">
                  <h5 className="fw-bold mb-0">
                    {product.brand} {product.model} — {product.inches}"
                  </h5>
                  <span className="text-muted" style={{ fontSize: "13px" }}>
                    {product.market} · {product.year}
                  </span>
                </div>
                <PriceChart
                  data={priceData}
                  productName={`${product.model} ${product.inches}"`}
                  brandName={product.brand}
                />
              </>
            )}

          </div>
        </Col>

      </Row>
    </Container>
  );
};

export default PriceTrackerPage;