import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="custom-footer py-4 mt-auto text-muted">
      <Container>
        <Row className="align-items-center justify-content-between">
          <Col md="auto" className="text-center text-md-start mb-3 mb-md-0">
            <span>&copy; {currentYear} Tran Van Tuyen. All rights reserved.</span>
          </Col>
          <Col md="auto" className="text-center text-md-end">
            <a
              href="https://github.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted mx-2 transition-colors hover:text-white"
              style={{ textDecoration: 'none' }}
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted mx-2 hover:text-white"
              style={{ textDecoration: 'none' }}
            >
              LinkedIn
            </a>
            <a
              href="https://web.facebook.com/t.v.tuyen21?locale=vi_VN"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted mx-2 hover:text-white"
              style={{ textDecoration: 'none' }}
            >
              Facebook
            </a>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
