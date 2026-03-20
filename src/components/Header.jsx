import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

const Header = () => {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const { wishlistItems } = useWishlist();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <Navbar
            expand="lg"
            sticky="top"
            expanded={menuOpen}
            onToggle={setMenuOpen}
            className={`lbms-header${scrolled ? ' lbms-header--scrolled' : ''}`}
        >
            <Container>
                {/* ── Brand ── */}
                <Navbar.Brand as={Link} to="/" className="brand-logo" onClick={() => setMenuOpen(false)}>
                    <img src="/images/logo.png" alt="LibraryMS" height="36" className="brand-logo-img" />
                    <span className="brand-text">Library<span className="brand-accent">MS</span></span>
                </Navbar.Brand>

                {/* ── Mobile toggle ── */}
                <Navbar.Toggle aria-controls="main-navbar" className="header-toggler">
                    <span className={`toggler-bar${menuOpen ? ' open' : ''}`} />
                    <span className={`toggler-bar${menuOpen ? ' open' : ''}`} />
                    <span className={`toggler-bar${menuOpen ? ' open' : ''}`} />
                </Navbar.Toggle>

                {/* ── Nav ── */}
                <Navbar.Collapse id="main-navbar">
                    <Nav className="ms-auto align-items-center gap-2">
                        <Nav.Link
                            as={NavLink}
                            to="/"
                            end
                            className="hdr-nav-link"
                            onClick={() => setMenuOpen(false)}
                        >
                            <span className="hdr-nav-inner">Home</span>
                        </Nav.Link>

                        {user ? (
                            <>
                                {/* Cart */}
                                <Nav.Link
                                    as={Link}
                                    to="/cart"
                                    className="hdr-icon-btn position-relative"
                                    title="Cart"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                    </svg>
                                    {cartCount > 0 && (
                                        <span className="hdr-badge hdr-badge--red">{cartCount}</span>
                                    )}
                                </Nav.Link>

                                {/* Wishlist */}
                                <Nav.Link
                                    as={Link}
                                    to="/wishlist"
                                    className="hdr-icon-btn position-relative"
                                    title="Wishlist"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                    {wishlistItems.length > 0 && (
                                        <span className="hdr-badge hdr-badge--gold">{wishlistItems.length}</span>
                                    )}
                                </Nav.Link>

                                {/* User dropdown */}
                                <NavDropdown
                                    title={
                                        <span className="hdr-avatar-wrap">
                                            <img
                                                src={user.avatar}
                                                alt={user.fullName}
                                                className="hdr-avatar"
                                                onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=f6c90e&color=13151f`; }}
                                            />
                                            <span className="hdr-avatar-name d-none d-lg-inline">{user.fullName}</span>
                                            <svg className="hdr-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </span>
                                    }
                                    id="user-dropdown"
                                    align="end"
                                    className="hdr-user-dropdown"
                                >
                                    <div className="hdr-dropdown-header">
                                        <img
                                            src={user.avatar}
                                            alt={user.fullName}
                                            className="hdr-dropdown-avatar"
                                            onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=f6c90e&color=13151f`; }}
                                        />
                                        <div>
                                            <div className="hdr-dropdown-name">{user.fullName}</div>
                                            <div className="hdr-dropdown-email">{user.email}</div>
                                        </div>
                                    </div>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item as={Link} to="/dashboard" onClick={() => setMenuOpen(false)}>
                                        <span className="hdr-menu-icon">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                                        </span>
                                        Dashboard
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/profile" onClick={() => setMenuOpen(false)}>
                                        <span className="hdr-menu-icon">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                        </span>
                                        My Profile
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/borrows" onClick={() => setMenuOpen(false)}>
                                        <span className="hdr-menu-icon">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                                        </span>
                                        Borrow History
                                    </NavDropdown.Item>
                                    {user.role === 'admin' && (
                                        <>
                                            <NavDropdown.Divider />
                                            <NavDropdown.Item as={Link} to="/admin" onClick={() => setMenuOpen(false)} className="hdr-admin-item">
                                                <span className="hdr-menu-icon">
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" /></svg>
                                                </span>
                                                Admin Panel
                                            </NavDropdown.Item>
                                        </>
                                    )}
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={handleLogout} className="hdr-logout-item">
                                        <span className="hdr-menu-icon">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                                        </span>
                                        Logout
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </>
                        ) : (
                            <>
                                <Nav.Link
                                    as={Link}
                                    to="/login"
                                    className="hdr-nav-link"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <span className="hdr-nav-inner">Login</span>
                                </Nav.Link>
                                <Link
                                    to="/register"
                                    className="hdr-register-btn"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Get Started
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;
