import { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Table } from "react-bootstrap";
import "./ProductsPage.css";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Brand  { id: number; name: string; }
interface Model  { id: number; name: string; }

interface Specs {
  panel_type:      string;
  resolution:      string;
  refresh_rate_hz: number;
  brightness_nits: number;
  hdr_support:     string;
  hdmi_21_ports:   number;
  input_lag_ms:    number;
  sound_system:    string;
  wifi_version:    string;
  smart_os:        string;
}

interface Product {
  id:     number;
  brand:  string;
  model:  string;
  inches: number;
  market: string;
  year:   number;
  specs:  Specs;
}

interface ProductFilter {
  id:         number;
  brandId:    string;
  modelId:    string;
  inches:     string;
  brands:     Brand[];
  models:     Model[];
  inchesList: number[];
}

interface SpecColumn {
  key:   keyof Specs;
  label: string;
}

// ── Config ────────────────────────────────────────────────────────────────────

const SPEC_COLUMNS: SpecColumn[] = [
  { key: "panel_type",      label: "Panel Type"     },
  { key: "resolution",      label: "Resolution"     },
  { key: "refresh_rate_hz", label: "Refresh Rate"   },
  { key: "brightness_nits", label: "Brightness"     },
  { key: "hdr_support",     label: "HDR"            },
  { key: "hdmi_21_ports",   label: "HDMI 2.1 Ports" },
  { key: "input_lag_ms",    label: "Input Lag"      },
  { key: "sound_system",    label: "Sound System"   },
  { key: "wifi_version",    label: "Wi-Fi"          },
  { key: "smart_os",        label: "Smart OS"       },
];

const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const emptyFilter = (id: number): ProductFilter => ({
  id, brandId: "", modelId: "", inches: "", brands: [], models: [], inchesList: [],
});

const formatSpec = (key: keyof Specs, value: any): string => {
  if (value === null || value === undefined) return "—";
  if (key === "refresh_rate_hz") return `${value} Hz`;
  if (key === "brightness_nits") return `${value} nits`;
  if (key === "input_lag_ms")    return `${value} ms`;
  return String(value);
};

const brandClass = (brand: string): string => {
  const map: Record<string, string> = {
    Samsung: "brand-samsung",
    LG:      "brand-lg",
    Hisense: "brand-hisense",
  };
  return `brand-cell ${map[brand] ?? "brand-default"}`;
};

// ── Component ─────────────────────────────────────────────────────────────────

const ProductsPage = () => {
  const [selectedMarket, setSelectedMarket]   = useState("");
  const [selectedYear, setSelectedYear]       = useState("");
  const [filters, setFilters]                 = useState<ProductFilter[]>([emptyFilter(1)]);
  const [nextId, setNextId]                   = useState(2);
  const [brands, setBrands]                   = useState<Brand[]>([]);
  const [products, setProducts]               = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [highlightDiff, setHighlightDiff]     = useState(false);
  const [highlightSame, setHighlightSame]     = useState(false);

  const [visibleSpecs, setVisibleSpecs] = useState<Set<keyof Specs>>(
    new Set(SPEC_COLUMNS.map((c) => c.key))
  );

  const markets = ["US", "KR", "CN"];
  const years   = ["2023", "2024", "2025"];

  useEffect(() => {
    fetch(`${API}/brands`)
      .then((r) => r.json())
      .then(setBrands)
      .catch(console.error);
  }, []);

  // ── Spec visibility ───────────────────────────────────────────────────────

  const toggleSpec = (key: keyof Specs) => {
    setVisibleSpecs((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const activeColumns = SPEC_COLUMNS.filter((c) => visibleSpecs.has(c.key));

  // ── Highlight logic ───────────────────────────────────────────────────────

  const columnStats = (key: keyof Specs): "same" | "diff" | "single" => {
    if (products.length <= 1) return "single";
    const values = products.map((p) => String(p.specs[key]));
    return values.every((v) => v === values[0]) ? "same" : "diff";
  };

  const getCellClass = (key: keyof Specs): string => {
    const stat = columnStats(key);
    if (highlightDiff && stat === "diff") return "highlight-diff";
    if (highlightSame && stat === "same") return "highlight-same";
    return "";
  };

  const getHeaderClass = (key: keyof Specs): string => {
    const stat = columnStats(key);
    if (highlightDiff && stat === "diff") return "highlight-diff-hdr";
    if (highlightSame && stat === "same") return "highlight-same-hdr";
    return "";
  };

  // ── Filter updaters ───────────────────────────────────────────────────────

  const handleMarketChange = (value: string) => {
    setSelectedMarket(value);
    setFilters((prev) =>
      prev.map((f) => ({ ...f, modelId: "", models: [], inches: "", inchesList: [] }))
    );
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    setFilters((prev) =>
      prev.map((f) => ({ ...f, modelId: "", models: [], inches: "", inchesList: [] }))
    );
  };

  const handleBrandChange = async (filterId: number, brandId: string) => {
    setFilters((prev) =>
      prev.map((f) =>
        f.id === filterId
          ? { ...f, brandId, modelId: "", models: [], inches: "", inchesList: [] }
          : f
      )
    );
    if (!brandId) return;

    const params = new URLSearchParams({ brand_id: brandId });
    if (selectedMarket) params.append("market", selectedMarket);
    if (selectedYear)   params.append("year", selectedYear);

    const res    = await fetch(`${API}/models?${params}`);
    const models = await res.json();
    setFilters((prev) =>
      prev.map((f) => (f.id === filterId ? { ...f, models } : f))
    );
  };

  const handleModelChange = async (filterId: number, modelId: string) => {
    setFilters((prev) =>
      prev.map((f) =>
        f.id === filterId ? { ...f, modelId, inches: "", inchesList: [] } : f
      )
    );
    if (!modelId) return;

    const params = new URLSearchParams({ model_id: modelId });
    if (selectedMarket) params.append("market", selectedMarket);
    if (selectedYear)   params.append("year", selectedYear);

    const res        = await fetch(`${API}/inches?${params}`);
    const inchesList = await res.json();
    setFilters((prev) =>
      prev.map((f) => (f.id === filterId ? { ...f, inchesList } : f))
    );
  };

  const handleInchesChange = (filterId: number, inches: string) => {
    setFilters((prev) =>
      prev.map((f) => (f.id === filterId ? { ...f, inches } : f))
    );
  };

  const addFilter = () => {
    if (filters.length >= 5) return;
    setFilters((prev) => [...prev, emptyFilter(nextId)]);
    setNextId((n) => n + 1);
  };

  const removeFilter = (id: number) => {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  };

  // ── Search ────────────────────────────────────────────────────────────────

  const handleSearch = async () => {
    setLoadingProducts(true);
    setProducts([]);
    try {
      const requests = filters
        .filter((f) => f.brandId)
        .map((f) => {
          const params = new URLSearchParams();
          if (f.modelId)      params.append("model_id", f.modelId);
          if (f.inches)       params.append("inches", f.inches);
          if (selectedMarket) params.append("market", selectedMarket);
          if (selectedYear)   params.append("year", selectedYear);
          return fetch(`${API}/products?${params}`).then((r) => r.json());
        });

      const results = await Promise.all(requests);
      setProducts(results.flat());
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Container fluid className="mt-4 px-4">
      <Row>

        {/* ── Left: Filters ── */}
        <Col xs={12} lg={4}>
          <div className="filter-panel">
            <h5 className="mb-4 fw-bold">Filters</h5>

            {/* Market */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="filter-label">Market</span>
              <Form.Select size="sm" value={selectedMarket} onChange={(e) => handleMarketChange(e.target.value)}>
                <option value="">All</option>
                {markets.map((m) => <option key={m} value={m}>{m}</option>)}
              </Form.Select>
            </div>

            {/* Year */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="filter-label">Year</span>
              <Form.Select size="sm" value={selectedYear} onChange={(e) => handleYearChange(e.target.value)}>
                <option value="">All</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </Form.Select>
            </div>

            <hr className="my-3" />

            {/* Column headers */}
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="column-header">Brand</span>
              <span className="column-header">Model</span>
              <span className="column-header">Inches</span>
              <div className="column-spacer" />
            </div>

            {/* Product rows */}
            {filters.map((f) => (
              <div key={f.id} className="mb-2">
                <div className="d-flex align-items-center gap-2">

                  <Form.Select size="sm" value={f.brandId} onChange={(e) => handleBrandChange(f.id, e.target.value)}>
                    <option value="">—</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </Form.Select>

                  <Form.Select size="sm" value={f.modelId} disabled={!f.brandId} onChange={(e) => handleModelChange(f.id, e.target.value)}>
                    <option value="">—</option>
                    {f.models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </Form.Select>

                  <Form.Select size="sm" value={f.inches} disabled={!f.modelId} onChange={(e) => handleInchesChange(f.id, e.target.value)}>
                    <option value="">—</option>
                    {f.inchesList.map((i) => <option key={i} value={i}>{i}"</option>)}
                  </Form.Select>

                  {filters.length > 1 ? (
                    <Button variant="outline-danger" size="sm" onClick={() => removeFilter(f.id)} className="column-spacer">−</Button>
                  ) : (
                    <div className="column-spacer" />
                  )}
                </div>
              </div>
            ))}

            {/* Add button */}
            {filters.length < 5 && (
              <div className="d-flex justify-content-center mt-3">
                <Button variant="outline-primary" size="sm" onClick={addFilter}>+</Button>
              </div>
            )}

            <hr className="my-3" />

            {/* Highlight options */}
            <p className="highlight-label mb-2">Highlight</p>
            <Form.Check
              type="checkbox"
              id="highlight-diff"
              label="Differences"
              checked={highlightDiff}
              onChange={(e) => setHighlightDiff(e.target.checked)}
              className="highlight-check mb-1"
            />
            <Form.Check
              type="checkbox"
              id="highlight-same"
              label="Similarities"
              checked={highlightSame}
              onChange={(e) => setHighlightSame(e.target.checked)}
              className="highlight-check mb-3"
            />

            {/* Search button */}
            <div className="d-flex justify-content-end">
              <Button variant="primary" onClick={handleSearch} disabled={loadingProducts}>
                {loadingProducts ? "Searching…" : "Search"}
              </Button>
            </div>

          </div>
        </Col>

        {/* ── Right: Columns toggle + Table ── */}
        <Col xs={12} lg={8}>

          {/* Spec columns toggle box */}
          <div className="columns-panel mt-2 mt-md-0">
            <h6 className="fw-bold mb-3">Visible Columns</h6>
            <Row>
              {SPEC_COLUMNS.map((col) => (
                <Col key={col.key} xs={6} md={4} lg={3}>
                  <Form.Check
                    type="checkbox"
                    id={`col-${col.key}`}
                    label={col.label}
                    checked={visibleSpecs.has(col.key)}
                    onChange={() => toggleSpec(col.key)}
                    className="column-check"
                  />
                </Col>
              ))}
            </Row>
          </div>

          {/* Results */}
          {loadingProducts && <p className="text-muted">Loading products…</p>}

          {!loadingProducts && products.length === 0 && (
            <p className="text-muted">Select filters on the left and click Search.</p>
          )}

          {products.length > 0 && (
            <div className="overflow-auto">
              <Table bordered hover size="sm" className="products-table">
                <thead className="table-dark">
                  <tr>
                    <th>Product</th>
                    <th>Size</th>
                    <th>Market</th>
                    <th>Year</th>
                    {activeColumns.map((col) => (
                      <th key={col.key} className={getHeaderClass(col.key)}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td className={brandClass(p.brand)}>{p.brand} {p.model}</td>
                      <td>{p.inches}"</td>
                      <td>{p.market}</td>
                      <td>{p.year}</td>
                      {activeColumns.map((col) => (
                        <td key={col.key} className={getCellClass(col.key)}>
                          {formatSpec(col.key, p.specs[col.key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

        </Col>
      </Row>
    </Container>
  );
};

export default ProductsPage;