import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { borrowsAPI, booksAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

const statusVariant = { borrowed: 'primary', returned: 'success', overdue: 'danger' };

const Dashboard = () => {
    const { user } = useAuth();
    const { cartItems } = useCart();
    const { wishlistItems } = useWishlist();
    const [borrows, setBorrows] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const [borrowsRes, booksRes] = await Promise.all([
                    borrowsAPI.getByUser(user.id),
                    booksAPI.getAll(),
                ]);
                setBorrows(borrowsRes.data);
                setBooks(booksRes.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetch();
    }, [user.id]);

    const getBook = (bookId) => books.find(b => b.id === bookId);
    const activeBorrows = borrows.filter(b => b.status === 'borrowed');
    const overdueBorrows = borrows.filter(b => b.status === 'overdue');
    const recentBorrows = [...borrows].sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate)).slice(0, 5);

    const stats = [
        { icon: '📖', label: 'Total Borrowed', value: borrows.length, color: '#6c63ff', link: '/borrows' },
        { icon: '⏳', label: 'Active Borrows', value: activeBorrows.length, color: '#00b4d8', link: '/borrows' },
        { icon: '⚠️', label: 'Overdue', value: overdueBorrows.length, color: '#e74c3c', link: '/borrows' },
        { icon: '🛒', label: 'In Cart', value: cartItems.length, color: '#f4a261', link: '/cart' },
        { icon: '❤️', label: 'Wishlist', value: wishlistItems.length, color: '#f72585', link: '/wishlist' },
    ];

    if (loading) return (
        <Container className="py-5 text-center">
            <Spinner animation="border" variant="warning" />
        </Container>
    );

    return (
        <Container className="py-5">
            {/* Welcome */}
            <div className="d-flex align-items-center gap-3 mb-5">
                <img src={user.avatar} alt="" className="rounded-circle" width="64" height="64" />
                <div>
                    <h2 className="fw-bold mb-0">Welcome back, {user.fullName}! 👋</h2>
                    <p className="text-muted mb-0">{user.email}</p>
                </div>
                <Button as={Link} to="/profile" variant="outline-secondary" size="sm" className="ms-auto">
                    Edit Profile
                </Button>
            </div>

            {/* Stats */}
            <Row className="g-3 mb-5">
                {stats.map((s, i) => (
                    <Col xs={6} md={4} lg key={i}>
                        <Card as={Link} to={s.link} className="stat-link-card text-decoration-none h-100 shadow-sm border-0">
                            <Card.Body className="text-center p-3">
                                <div style={{ fontSize: '2rem' }}>{s.icon}</div>
                                <div className="fw-bold fs-4" style={{ color: s.color }}>{s.value}</div>
                                <div className="text-muted small">{s.label}</div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Quick links */}
            <Row className="g-3 mb-5">
                <Col xs={12}>
                    <h4 className="section-title">🚀 Quick Actions</h4>
                </Col>
                {[
                    { to: '/', icon: '📚', label: 'Browse Books', variant: 'warning' },
                    { to: '/cart', icon: '🛒', label: 'View Cart', variant: 'primary' },
                    { to: '/wishlist', icon: '❤️', label: 'My Wishlist', variant: 'danger' },
                    { to: '/borrows', icon: '📖', label: 'Borrow History', variant: 'success' },
                ].map(({ to, icon, label, variant }) => (
                    <Col xs={6} md={3} key={to}>
                        <Button as={Link} to={to} variant={`outline-${variant}`} className="w-100 py-3">
                            <div style={{ fontSize: '1.5rem' }}>{icon}</div>
                            <div className="small mt-1">{label}</div>
                        </Button>
                    </Col>
                ))}
            </Row>

            {/* Recent borrows */}
            <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="section-title mb-0">📋 Recent Borrows</h4>
                    <Button as={Link} to="/borrows" variant="link" className="text-warning p-0">View All →</Button>
                </div>
                {recentBorrows.length === 0 ? (
                    <p className="text-muted">No borrows yet. <Link to="/" className="text-warning">Browse books</Link> to get started!</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Book</th>
                                    <th>Borrowed</th>
                                    <th>Due</th>
                                    <th>Days</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBorrows.map(borrow => {
                                    const book = getBook(borrow.bookId);
                                    return (
                                        <tr key={borrow.id}>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    {book && (
                                                        <img src={book.cover} alt="" width="36" height="50" style={{ objectFit: 'cover', borderRadius: 4 }}
                                                            onError={e => { e.target.style.display = 'none'; }} />
                                                    )}
                                                    <div>
                                                        <div className="fw-semibold small">{book?.title || `Book #${borrow.bookId}`}</div>
                                                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{book?.author}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="small">{borrow.borrowDate}</td>
                                            <td className="small">{borrow.dueDate}</td>
                                            <td className="small">{borrow.days}d</td>
                                            <td className="small fw-semibold">${borrow.totalPrice}</td>
                                            <td>
                                                <Badge bg={statusVariant[borrow.status] || 'secondary'} className="text-capitalize">
                                                    {borrow.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Container>
    );
};

export default Dashboard;
