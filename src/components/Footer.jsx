import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => (
    <footer className="bg-dark text-light py-5 mt-auto">
        <Container>
            <Row>
                <Col md={4} className="mb-4">
                    <h5 className="text-warning fw-bold">📚 LibraryMS</h5>
                    <p className="text-secondary">
                        Your digital library management system. Explore, rent, and enjoy thousands of books at affordable prices.
                    </p>
                </Col>
                <Col md={2} className="mb-4">
                    <h6 className="text-warning mb-3">Quick Links</h6>
                    <ul className="list-unstyled">
                        <li className="mb-1"><Link to="/" className="footer-link">Home</Link></li>
                        <li className="mb-1"><Link to="/login" className="footer-link">Login</Link></li>
                        <li className="mb-1"><Link to="/register" className="footer-link">Register</Link></li>
                    </ul>
                </Col>
                <Col md={2} className="mb-4">
                    <h6 className="text-warning mb-3">My Account</h6>
                    <ul className="list-unstyled">
                        <li className="mb-1"><Link to="/dashboard" className="footer-link">Dashboard</Link></li>
                        <li className="mb-1"><Link to="/cart" className="footer-link">Cart</Link></li>
                        <li className="mb-1"><Link to="/wishlist" className="footer-link">Wishlist</Link></li>
                        <li className="mb-1"><Link to="/borrows" className="footer-link">My Borrows</Link></li>
                    </ul>
                </Col>
                <Col md={4} className="mb-4">
                    <h6 className="text-warning mb-3">Contact Us</h6>
                    <p className="text-secondary mb-1">📧 info@libraryms.com</p>
                    <p className="text-secondary mb-1">📞 +84 123 456 789</p>
                    <p className="text-secondary">📍 Ho Chi Minh City, Vietnam</p>
                </Col>
            </Row>
            <hr className="border-secondary" />
            <p className="text-center text-secondary mb-0">
                © {new Date().getFullYear()} LibraryMS. All rights reserved.
            </p>
        </Container>
    </footer>
);

export default Footer;
