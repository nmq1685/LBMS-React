import React, { useState } from 'react';
import { Navbar, Nav, Container, NavDropdown, Badge, Form, Button } from 'react-bootstrap';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

const Header = () => {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const { wishlistItems } = useWishlist();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
            setSearchTerm('');
        }
    };

    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="lbms-header" sticky="top">
            <Container>
                <Navbar.Brand as={Link} to="/" className="brand-logo">
                    <span className="brand-icon">📚</span>
                    <span className="brand-name ms-2">LibraryMS</span>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="main-navbar" />
                <Navbar.Collapse id="main-navbar">
                    <Form className="d-flex mx-auto search-form" onSubmit={handleSearch} style={{ maxWidth: 400, width: '100%' }}>
                        <Form.Control
                            type="search"
                            placeholder="Search books..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <Button type="submit" variant="outline-warning" className="ms-1">🔍</Button>
                    </Form>

                    <Nav className="ms-auto align-items-center gap-1">
                        <Nav.Link as={NavLink} to="/" className="nav-home">Home</Nav.Link>

                        {user ? (
                            <>
                                <Nav.Link as={Link} to="/cart" className="position-relative nav-icon-link">
                                    <span>🛒</span>
                                    {cartCount > 0 && (
                                        <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle" style={{ fontSize: '0.65rem' }}>
                                            {cartCount}
                                        </Badge>
                                    )}
                                </Nav.Link>

                                <Nav.Link as={Link} to="/wishlist" className="position-relative nav-icon-link">
                                    <span>❤️</span>
                                    {wishlistItems.length > 0 && (
                                        <Badge bg="warning" text="dark" pill className="position-absolute top-0 start-100 translate-middle" style={{ fontSize: '0.65rem' }}>
                                            {wishlistItems.length}
                                        </Badge>
                                    )}
                                </Nav.Link>

                                <NavDropdown
                                    title={
                                        <span className="d-inline-flex align-items-center gap-1">
                                            <img src={user.avatar} alt="" width="28" height="28" className="rounded-circle" />
                                            <span className="d-none d-lg-inline">{user.fullName}</span>
                                        </span>
                                    }
                                    id="user-dropdown"
                                    align="end"
                                >
                                    <NavDropdown.Item as={Link} to="/dashboard">📊 Dashboard</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/profile">👤 My Profile</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/borrows">📖 Borrow History</NavDropdown.Item>
                                    {user.role === 'admin' && (
                                        <>
                                            <NavDropdown.Divider />
                                            <NavDropdown.Item as={Link} to="/admin">⚙️ Admin Panel</NavDropdown.Item>
                                        </>
                                    )}
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={handleLogout} className="text-danger">🚪 Logout</NavDropdown.Item>
                                </NavDropdown>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                                <Nav.Link as={Link} to="/register">
                                    <Button variant="warning" size="sm" className="px-3">Register</Button>
                                </Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;
