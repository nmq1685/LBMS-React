import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { booksAPI, categoriesAPI, usersAPI, borrowsAPI } from '../../services/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ books: 0, categories: 0, users: 0, borrows: 0, revenue: 0 });
    const [recentBorrows, setRecentBorrows] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const [booksRes, catsRes, usersRes, borrowsRes] = await Promise.all([
                    booksAPI.getAll(), categoriesAPI.getAll(), usersAPI.getAll(), borrowsAPI.getAll(),
                ]);
                setBooks(booksRes.data);
                const revenue = borrowsRes.data.reduce((s, b) => s + (b.totalPrice || 0), 0);
                setStats({
                    books: booksRes.data.length,
                    categories: catsRes.data.length,
                    users: usersRes.data.length,
                    borrows: borrowsRes.data.length,
                    revenue,
                });
                setRecentBorrows(
                    [...borrowsRes.data].sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate)).slice(0, 8)
                );
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    const getBook = (id) => books.find(b => b.id === id);

    const adminCards = [
        { icon: '📚', title: 'Books', value: stats.books, link: '/admin/books', color: '#6c63ff', desc: 'Manage library catalog' },
        { icon: '🏷️', title: 'Categories', value: stats.categories, link: '/admin/categories', color: '#06d6a0', desc: 'Manage book categories' },
        { icon: '👥', title: 'Users', value: stats.users, link: '/admin/users', color: '#00b4d8', desc: 'Manage user accounts' },
        { icon: '📖', title: 'Total Borrows', value: stats.borrows, link: '/admin/users', color: '#f4a261', desc: 'All time borrows' },
        { icon: '💰', title: 'Revenue', value: `$${stats.revenue.toFixed(2)}`, link: null, color: '#f72585', desc: 'Total rental revenue' },
    ];

    if (loading) return (
        <Container className="py-5 text-center"><Spinner animation="border" variant="warning" /></Container>
    );

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-0">⚙️ Admin Dashboard</h2>
                    <p className="text-muted mb-0">Library Management System</p>
                </div>
            </div>

            {/* Stat cards */}
            <Row className="g-3 mb-5">
                {adminCards.map((c, i) => (
                    <Col xs={6} md={4} lg key={i}>
                        {c.link ? (
                            <Card as={Link} to={c.link} className="text-decoration-none h-100 shadow-sm border-0 stat-link-card">
                                <Card.Body className="p-3 text-center">
                                    <div style={{ fontSize: '2rem' }}>{c.icon}</div>
                                    <div className="fw-bold fs-3" style={{ color: c.color }}>{c.value}</div>
                                    <div className="fw-semibold">{c.title}</div>
                                    <div className="text-muted small">{c.desc}</div>
                                </Card.Body>
                            </Card>
                        ) : (
                            <Card className="h-100 shadow-sm border-0">
                                <Card.Body className="p-3 text-center">
                                    <div style={{ fontSize: '2rem' }}>{c.icon}</div>
                                    <div className="fw-bold fs-3" style={{ color: c.color }}>{c.value}</div>
                                    <div className="fw-semibold">{c.title}</div>
                                    <div className="text-muted small">{c.desc}</div>
                                </Card.Body>
                            </Card>
                        )}
                    </Col>
                ))}
            </Row>

            {/* Quick links */}
            <Row className="g-3 mb-5">
                {[
                    { to: '/admin/books', icon: '📚', label: 'Manage Books' },
                    { to: '/admin/categories', icon: '🏷️', label: 'Manage Categories' },
                    { to: '/admin/users', icon: '👥', label: 'Manage Users' },
                    { to: '/', icon: '🌐', label: 'View Website' },
                ].map(({ to, icon, label }) => (
                    <Col xs={6} md={3} key={to}>
                        <Card as={Link} to={to} className="text-decoration-none text-center shadow-sm border-0 p-3 admin-quick-card">
                            <div style={{ fontSize: '2rem' }}>{icon}</div>
                            <div className="fw-semibold mt-1 small">{label}</div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Recent borrows */}
            <div>
                <h4 className="section-title mb-3">📋 Recent Borrows</h4>
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th>#</th>
                                <th>Book</th>
                                <th>User ID</th>
                                <th>Borrow Date</th>
                                <th>Due Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentBorrows.map((b) => {
                                const book = getBook(b.bookId);
                                const statusColor = { borrowed: 'primary', returned: 'success', overdue: 'danger' }[b.status] || 'secondary';
                                return (
                                    <tr key={b.id}>
                                        <td>#{b.id}</td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                {book && (
                                                    <img src={book.cover} alt="" width="32" height="45"
                                                        style={{ objectFit: 'cover', borderRadius: 3 }}
                                                        onError={e => { e.target.style.display = 'none'; }} />
                                                )}
                                                <span className="small fw-semibold">{book?.title || `Book #${b.bookId}`}</span>
                                            </div>
                                        </td>
                                        <td><span className="badge bg-secondary">User #{b.userId}</span></td>
                                        <td className="small">{b.borrowDate}</td>
                                        <td className="small">{b.dueDate}</td>
                                        <td className="fw-semibold text-warning">${b.totalPrice}</td>
                                        <td><span className={`badge bg-${statusColor} text-capitalize`}>{b.status}</span></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </Container>
    );
};

export default AdminDashboard;
