import { useNavigate } from "react-router-dom";
import { Carousel, Col, Container, Row } from "react-bootstrap";
import "./IntroducePage.css";

const images = [
  "https://www.slashgear.com/img/gallery/upgrade-full-replacement-x-major-tv-brands-ranked-worst-to-best-by-owner-satisfaction/tcl-1741883978.jpg",
  "https://blog.movistar.com.co/wp-content/uploads/2025/01/que-es-smart-tv.webp",
  "https://i.rtings.com/assets/pages/albp8ige/best-tv-brands-20251202-medium.jpg?format=auto",
];

const stats = [
  { value: "3",    label: "Markets Covered",  icon: "public"        },
  { value: "15+",  label: "Models Tracked",   icon: "tv"            },
  { value: "110+", label: "Product Variants", icon: "inventory_2"   },
  { value: "2024", label: "Data Year",        icon: "calendar_today" },
];

const features = [
  {
    title:       "Products",
    icon:        "inventory_2",
    description: "Browse and compare full product specs across all major TV brands and markets.",
    route:       "/products",
  },
  {
    title:       "Price Tracker",
    icon:        "bar_chart",
    description: "Monitor monthly price trends and spot the best time to buy or sell.",
    route:       "/price-tracker",
  },
  {
    title:       "Sells Tracker",
    icon:        "trending_up",
    description: "Track unit sales performance by market, model and size throughout the year.",
    route:       "/sells-tracker",
  },
  {
    title:       "About Us",
    icon:        "groups",
    description: "Learn about the team and mission behind Market Analysis.",
    route:       "/about-us",
  },
];

const IntroducePage = () => {
  const navigate = useNavigate();

  return (
    <div className="introduce-page">

      {/* ── Hero + Carousel ── */}
      <div className="introduce-hero">
        <Container>
          <Row className="justify-content-center text-center mb-4">
            <Col xs={12} md={8}>
              <p className="introduce-hero-label">Welcome to</p>
              <h1 className="introduce-hero-title">Market Analysis</h1>
              <p className="introduce-hero-subtitle">
                Real-time intelligence on TV products, pricing and sales
                across the US, Korean and Chinese markets.
              </p>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col xs={10}>
              <div className="introduce-carousel-wrapper">
                <Carousel indicators={true} controls={true}>
                  {images.map((url, index) => (
                    <Carousel.Item key={index}>
                      <div className="introduce-carousel-slide">
                        <div className="introduce-carousel-overlay" />
                        <img
                          src={url}
                          alt={`Slide ${index + 1}`}
                          className="introduce-carousel-img"
                        />
                      </div>
                    </Carousel.Item>
                  ))}
                </Carousel>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* ── Stats ── */}
      <div className="introduce-stats">
        <Container>
          <Row className="justify-content-center g-4">
            {stats.map((s) => (
              <Col key={s.label} xs={6} md={3}>
                <div className="introduce-stat-card">
                  <span className="material-icons introduce-stat-icon">{s.icon}</span>
                  <div className="introduce-stat-value">{s.value}</div>
                  <div className="introduce-stat-label">{s.label}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* ── Feature cards ── */}
      <div className="introduce-features">
        <Container>
          <Row className="justify-content-center text-center mb-5">
            <Col xs={12} md={7}>
              <p className="introduce-section-label">Explore</p>
              <h2 className="introduce-section-title">Everything in one place</h2>
            </Col>
          </Row>
          <Row className="g-4">
            {features.map((f) => (
              <Col key={f.title} xs={12} sm={6} lg={3}>
                <div
                  className="introduce-feature-card"
                  onClick={() => navigate(f.route)}
                >
                  <span className="material-icons introduce-feature-icon">{f.icon}</span>
                  <h5 className="introduce-feature-title">{f.title}</h5>
                  <p className="introduce-feature-text">{f.description}</p>
                  <span className="introduce-feature-arrow material-icons">arrow_forward</span>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

    </div>
  );
};

export default IntroducePage;