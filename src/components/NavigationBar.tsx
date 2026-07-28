import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

export const NavigationBar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Navbar expand="lg" className="custom-navbar sticky-top">
      <Container>
        <Navbar.Brand as={NavLink} to="/">
          Trần Văn Tuyên
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={NavLink} to="/" end>
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/portfolio">
              Portfolio
            </Nav.Link>
            <Nav.Link as={NavLink} to="/resources">
              Resources
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/admin"
              className="text-muted ms-lg-3 me-lg-2"
              style={{ fontSize: '0.75rem', opacity: 0.25 }}
            >
              Admin
            </Nav.Link>
            <Button
              variant="link"
              onClick={toggleTheme}
              className="text-secondary p-0 ms-lg-2 border-0 d-flex align-items-center"
              style={{ fontSize: '1.2rem', textDecoration: 'none' }}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <FiSun /> : <FiMoon />}
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
