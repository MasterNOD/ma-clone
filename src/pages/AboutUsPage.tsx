import { Container, Row, Col } from "react-bootstrap";
import "./AboutUsPage.css";

const team = [
  {
    name:  "Alexandra Chen",
    role:  "Lead Data Analyst",
    bio:   "10+ years tracking consumer electronics markets across US, KR and CN. Passionate about turning raw numbers into actionable insights.",
    icon:  "analytics",
  },
  {
    name:  "Marcus Rivera",
    role:  "Product Intelligence",
    bio:   "Former retail buyer turned data specialist. Deep expertise in TV panel technology and pricing strategy across major brands.",
    icon:  "tv",
  },
  {
    name:  "Yuna Park",
    role:  "Market Research",
    bio:   "Fluent in Korean and Mandarin, Yuna bridges the gap between Asian and Western consumer electronics markets.",
    icon:  "language",
  },
  {
    name:  "Daniel Brooks",
    role:  "Engineering Lead",
    bio:   "Built the data pipelines and visualization tools that power Market Analysis. Obsessed with performance and clean architecture.",
    icon:  "code",
  },
];

const stats = [
  { value: "3",    label: "Markets Covered",   icon: "public"       },
  { value: "15+",  label: "Models Tracked",    icon: "tv"           },
  { value: "110+", label: "Product Variants",  icon: "inventory_2"  },
  { value: "2024", label: "Data Year",         icon: "calendar_today"},
];

const AboutUsPage = () => {
  return (
    <div className="about-page">

      {/* ── Hero ── */}
      <div className="about-hero">
        <Container>
          <Row className="justify-content-center text-center">
            <Col xs={12} md={8}>
              <p className="about-hero-label">Who we are</p>
              <h1 className="about-hero-title">
                Bringing Clarity to the<br />Consumer Electronics Market
              </h1>
              <p className="about-hero-subtitle">
                Market Analysis is a platform built for professionals who need precise,
                up-to-date intelligence on TV products, pricing trends, and sales performance
                across global markets.
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      {/* ── Stats ── */}
      <div className="about-stats">
        <Container>
          <Row className="justify-content-center g-4">
            {stats.map((s) => (
              <Col key={s.label} xs={6} md={3}>
                <div className="about-stat-card">
                  <span className="material-icons about-stat-icon">{s.icon}</span>
                  <div className="about-stat-value">{s.value}</div>
                  <div className="about-stat-label">{s.label}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* ── Mission ── */}
      <div className="about-section">
        <Container>
          <Row className="align-items-center g-5">
            <Col xs={12} md={6}>
              <p className="about-section-label">Our Mission</p>
              <h2 className="about-section-title">
                Data-driven decisions for a fast-moving industry
              </h2>
              <p className="about-section-text">
                The consumer electronics market moves fast. Prices shift monthly,
                new models launch across different regions at different times, and
                understanding what sells — and why — requires more than intuition.
              </p>
              <p className="about-section-text">
                Market Analysis was built to cut through the noise. We aggregate
                product data, track price histories, and monitor sales trends across
                the US, Korean and Chinese markets so our users always have the full picture.
              </p>
            </Col>
            <Col xs={12} md={6}>
              <div className="about-mission-visual">
                <div className="about-mission-ring about-mission-ring--lg" />
                <div className="about-mission-ring about-mission-ring--md" />
                <div className="about-mission-ring about-mission-ring--sm" />
                <span className="material-icons about-mission-icon">bar_chart</span>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* ── What we track ── */}
      <div className="about-section about-section--alt">
        <Container>
          <Row className="justify-content-center text-center mb-5">
            <Col xs={12} md={7}>
              <p className="about-section-label">What we track</p>
              <h2 className="about-section-title">
                Every spec, every price, every market
              </h2>
            </Col>
          </Row>
          <Row className="g-4">
            {[
              { icon: "tv",           title: "Product Catalog",   text: "Full specs for every model — panel type, resolution, refresh rate, brightness, HDR, HDMI ports, sound system, Wi-Fi and Smart OS."  },
              { icon: "bar_chart",    title: "Price History",     text: "Monthly price tracking throughout 2024 across all product variants, markets and sizes so you can spot trends and anticipate shifts."   },
              { icon: "trending_up",  title: "Sales Performance", text: "Unit sales data by month, market and size to understand what consumers are actually buying and where demand is growing."               },
              { icon: "public",       title: "Global Markets",    text: "Simultaneous coverage of the US, Korean and Chinese markets, the three most influential regions in the consumer TV industry."           },
            ].map((item) => (
              <Col key={item.title} xs={12} sm={6} lg={3}>
                <div className="about-feature-card">
                  <span className="material-icons about-feature-icon">{item.icon}</span>
                  <h5 className="about-feature-title">{item.title}</h5>
                  <p className="about-feature-text">{item.text}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* ── Team ── */}
      <div className="about-section">
        <Container>
          <Row className="justify-content-center text-center mb-5">
            <Col xs={12} md={7}>
              <p className="about-section-label">The team</p>
              <h2 className="about-section-title">People behind the platform</h2>
            </Col>
          </Row>
          <Row className="g-4 justify-content-center">
            {team.map((member) => (
              <Col key={member.name} xs={12} sm={6} lg={3}>
                <div className="about-team-card">
                  <div className="about-team-avatar">
                    <span className="material-icons">{member.icon}</span>
                  </div>
                  <h5 className="about-team-name">{member.name}</h5>
                  <p className="about-team-role">{member.role}</p>
                  <p className="about-team-bio">{member.bio}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* ── Footer ── */}
      <div className="about-footer">
        <Container>
          <Row className="justify-content-center text-center">
            <Col xs={12} md={6}>
              <span className="material-icons about-footer-icon">insights</span>
              <h3 className="about-footer-title">Market Analysis</h3>
              <p className="about-footer-text">
                Tracking the global TV market, one data point at a time.
              </p>
            </Col>
          </Row>
        </Container>
      </div>

    </div>
  );
};

export default AboutUsPage;