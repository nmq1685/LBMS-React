import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { borrowsAPI, booksAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

const statusCls = { borrowed: 'ds-borrowed', returned: 'ds-returned', overdue: 'ds-overdue' };
const statusLabel = { borrowed: '📖 Active', returned: '✅ Returned', overdue: '⚠️ Overdue' };

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

    const quickActions = [
        { to: '/', icon: '📚', label: 'Browse Books', qaColor: 'rgba(246,201,14,0.08)', border: 'rgba(246,201,14,0.35)' },
        { to: '/cart', icon: '🛒', label: 'View Cart', qaColor: 'rgba(66,153,225,0.08)', border: 'rgba(66,153,225,0.35)' },
        { to: '/wishlist', icon: '❤️', label: 'My Wishlist', qaColor: 'rgba(247,37,133,0.08)', border: 'rgba(247,37,133,0.35)' },
        { to: '/borrows', icon: '📖', label: 'Borrow History', qaColor: 'rgba(72,187,120,0.08)', border: 'rgba(72,187,120,0.35)' },
    ];

    if (loading) return (
        <div className="text-center py-5">
            <Spinner animation="border" variant="warning" />
        </div>
    );

    return (
        <div className="dashboard-page">
            <Container className="py-4">
                {/* ── Welcome banner ── */}
                <div className="dash-welcome">
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                        <img src={user.avatar} alt="" className="dash-avatar" />
                        <div className="flex-grow-1">
                            <p className="mb-1" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                                Welcome back 👋
                            </p>
                            <h2 className="fw-bold text-white mb-0" style={{ fontSize: 'clamp(1.4rem,3vw,2rem)' }}>
                                {user.fullName}
                            </h2>
                            <p className="mb-0" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem' }}>
                                {user.email}
                            </p>
                        </div>
                        <Link
                            to="/profile"
                            className="btn"
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: 'white',
                                borderRadius: 10,
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                padding: '8px 16px',
                                transition: 'all .2s',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            ✏️ Edit Profile
                        </Link>
                    </div>
                </div>

                {/* ── Stats ── */}
                <Row className="g-3 mb-4">
                    {stats.map((s, i) => (
                        <Col xs={6} md={4} lg key={i}>
                            <Link
                                to={s.link}
                                className="dash-stat-card"
                                style={{ '--ds-color': s.color, animationDelay: `${i * 0.07}s` }}
                            >
                                <span className="dash-stat-icon">{s.icon}</span>
                                <div className="dash-stat-num">{s.value}</div>
                                <div className="dash-stat-lbl">{s.label}</div>
                            </Link>
                        </Col>
                    ))}
                </Row>

                {/* ── Quick Actions ── */}
                <div className="mb-4">
                    <div className="dash-section-title">🚀 Quick Actions</div>
                    <Row className="g-3">
                        {quickActions.map(({ to, icon, label, qaColor, border }) => (
                            <Col xs={6} md={3} key={to}>
                                <Link
                                    to={to}
                                    className="quick-act-btn"
                                    style={{ '--qa-bg': qaColor, '--qa-border': border }}
                                >
                                    <span className="quick-act-icon">{icon}</span>
                                    <span>{label}</span>
                                </Link>
                            </Col>
                        ))}
                    </Row>
                </div>

                {/* ── Recent Borrows ── */}
                <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="dash-section-title mb-0">📋 Recent Borrows</div>
                        <Link to="/borrows" className="text-warning text-decoration-none fw-bold" style={{ fontSize: '0.85rem' }}>
                            View All →
                        </Link>
                    </div>

                    {recentBorrows.length === 0 ? (
                        <div
                            className="text-center py-4"
                            style={{ background: 'white', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
                        >
                            <p style={{ fontSize: '2.5rem', margin: 0 }}>📚</p>
                            <p className="text-muted mt-2 mb-1 fw-semibold">No borrows yet</p>
                            <Link to="/" className="text-warning fw-semibold text-decoration-none" style={{ fontSize: '0.85rem' }}>
                                Browse books to get started →
                            </Link>
                        </div>
                    ) : (
                        <div className="dash-recent-card">
                            <div className="table-responsive">
                                <table className="table mb-0">
                                    <thead>
                                        <tr className="dash-table-head">
                                            <th>Book</th>
                                            <th>Borrowed</th>
                                            <th>Due</th>
                                            <th>Days</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentBorrows.map((borrow, idx) => {
                                            const book = getBook(borrow.bookId);
                                            return (
                                                <tr key={borrow.id} className="dash-table-row" style={{ animationDelay: `${idx * 0.06}s` }}>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-2">
                                                            {book && (
                                                                <img
                                                                    src={book.cover} alt=""
                                                                    width="34" height="48"
                                                                    style={{ objectFit: 'cover', borderRadius: 5, flexShrink: 0 }}
                                                                    onError={e => { e.target.style.display = 'none'; }}
                                                                />
                                                            )}
                                                            <div>
                                                                <div className="fw-semibold" style={{ fontSize: '0.84rem', lineHeight: 1.3 }}>
                                                                    {book?.title || `Book #${borrow.bookId}`}
                                                                </div>
                                                                <div className="text-muted" style={{ fontSize: '0.72rem' }}>{book?.author}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ color: '#6b7280' }}>{borrow.borrowDate}</td>
                                                    <td style={{ color: borrow.status === 'overdue' ? '#c05621' : '#6b7280', fontWeight: borrow.status === 'overdue' ? 700 : 400 }}>
                                                        {borrow.dueDate}
                                                    </td>
                                                    <td style={{ color: '#6b7280' }}>{borrow.days}d</td>
                                                    <td style={{ color: '#e0a800', fontWeight: 700 }}>${borrow.totalPrice}</td>
                                                    <td>
                                                        <span className={`dash-status-badge ${statusCls[borrow.status] || 'ds-borrowed'}`}>
                                                            {statusLabel[borrow.status] || borrow.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
};

export default Dashboard;
