import { Link } from "react-router-dom";
import { Navbar as BsNavbar, Nav, Container } from "react-bootstrap";

const Navbar = () => {
  return (
    <BsNavbar bg="dark" variant="dark" expand="lg">
      <Container>
        <BsNavbar.Brand as={Link} to="/introduce">Market Analysis</BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="main-nav" />
        <BsNavbar.Collapse id="main-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/products">
              <span className="material-icons" style={{ fontSize: "1rem", verticalAlign: "middle" }}>inventory_2</span> Products
            </Nav.Link>
            <Nav.Link as={Link} to="/price-tracker">
              <span className="material-icons" style={{ fontSize: "1rem", verticalAlign: "middle" }}>bar_chart</span> Price Tracker
            </Nav.Link>
            <Nav.Link as={Link} to="/sells-tracker">
              <span className="material-icons" style={{ fontSize: "1rem", verticalAlign: "middle" }}>trending_up</span> Sells Tracker
            </Nav.Link>
            <Nav.Link as={Link} to="/about-us">
              <span className="material-icons" style={{ fontSize: "1rem", verticalAlign: "middle" }}>groups</span> About Us
            </Nav.Link>
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;