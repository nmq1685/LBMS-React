import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { booksAPI, categoriesAPI, usersAPI, borrowsAPI } from '../../services/api';

const STAT_CARDS = (stats) => [
    {
        label: 'Total Books',
        value: stats.books,
        icon: '📚',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        shadow: 'rgba(102, 126, 234, 0.4)',
        link: '/admin/books',
        trend: 'In catalog',
    },
    {
        label: 'Categories',
        value: stats.categories,
        icon: '🏷️',
        gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        shadow: 'rgba(17, 153, 142, 0.4)',
        link: '/admin/categories',
        trend: 'Book genres',
    },
    {
        label: 'Members',
        value: stats.users,
        icon: '👥',
        gradient: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
        shadow: 'rgba(247, 151, 30, 0.4)',
        link: '/admin/users',
        trend: 'Registered users',
    },
    {
        label: 'Total Borrows',
        value: stats.borrows,
        icon: '📖',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        shadow: 'rgba(79, 172, 254, 0.4)',
        link: null,
        trend: 'All time',
    },
    {
        label: 'Revenue',
        value: `$${stats.revenue.toFixed(2)}`,
        icon: '💰',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        shadow: 'rgba(240, 147, 251, 0.4)',
        link: null,
        trend: 'Total earnings',
    },
];

const STATUS_STYLE = {
    borrowed: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
    returned: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
    overdue: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
};

const AdminDashboard = () => {
    const [stats, setStats] = useState({ books: 0, categories: 0, users: 0, borrows: 0, revenue: 0 });
    const [recentBorrows, setRecentBorrows] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
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
                    [...borrowsRes.data]
                        .sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate))
                        .slice(0, 8)
                );
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchAll();
    }, []);

    const getBook = (id) => books.find(b => b.id === id);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
                <Spinner animation="border" style={{ width: 48, height: 48, color: '#f59e0b', borderWidth: 3 }} />
                <p style={{ marginTop: '1rem', color: '#94a3b8', fontWeight: 600 }}>Loading dashboard…</p>
            </div>
        </div>
    );

    const cards = STAT_CARDS(stats);

    return (
        <div>
            {/* Page heading */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="adm-page-title">Dashboard Overview</h1>
                <p className="adm-page-subtitle">
                    Welcome back! Here's what's happening in your library today.
                </p>
            </div>

            {/* Stat cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2rem',
            }}>
                {cards.map((card, i) => {
                    const inner = (
                        <div className="adm-stat-card" style={{ background: card.gradient, boxShadow: `0 8px 32px ${card.shadow}` }}>
                            <div className="adm-stat-card__bg-icon">{card.icon}</div>
                            <div className="adm-stat-card__icon">{card.icon}</div>
                            <div className="adm-stat-card__value">{card.value}</div>
                            <div className="adm-stat-card__label">{card.label}</div>
                            <div className="adm-stat-card__trend">{card.trend}</div>
                        </div>
                    );
                    return card.link
                        ? <Link key={i} to={card.link} style={{ textDecoration: 'none' }}>{inner}</Link>
                        : <div key={i}>{inner}</div>;
                })}
            </div>

            {/* Quick actions */}
            <div style={{ marginBottom: '2rem' }}>
                <h5 style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem', marginBottom: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Quick Actions
                </h5>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {[
                        { to: '/admin/books', label: '+ Add Book', bg: 'linear-gradient(135deg, #667eea, #764ba2)', shadow: 'rgba(102,126,234,0.4)' },
                        { to: '/admin/categories', label: '+ Category', bg: 'linear-gradient(135deg, #11998e, #38ef7d)', shadow: 'rgba(17,153,142,0.4)' },
                        { to: '/admin/users', label: '👥 View Users', bg: 'linear-gradient(135deg, #f7971e, #ffd200)', shadow: 'rgba(247,151,30,0.4)' },
                        { to: '/', label: '🌐 View Site', bg: 'linear-gradient(135deg, #4facfe, #00f2fe)', shadow: 'rgba(79,172,254,0.4)' },
                    ].map(btn => (
                        <Link
                            key={btn.to}
                            to={btn.to}
                            className="adm-quick-btn"
                            style={{ background: btn.bg, boxShadow: `0 4px 14px ${btn.shadow}` }}
                        >
                            {btn.label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent borrows */}
            <div className="adm-card">
                <div className="adm-card__header">
                    <h5 className="adm-card__title">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        Recent Borrowing Activity
                    </h5>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>Latest 8 records</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="adm-table">
                        <thead>
                            <tr>
                                {['#', 'Book', 'User', 'Borrowed', 'Due Date', 'Amount', 'Status'].map(h => (
                                    <th key={h}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {recentBorrows.map((b) => {
                                const book = getBook(b.bookId);
                                const st = STATUS_STYLE[b.status] || { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' };
                                return (
                                    <tr key={b.id}>
                                        <td style={{ color: '#cbd5e1', fontWeight: 500 }}>#{b.id}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                {book && (
                                                    <img src={book.cover} alt="" width="26" height="36"
                                                        style={{ objectFit: 'cover', borderRadius: 4, flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }}
                                                        onError={e => { e.target.style.display = 'none'; }} />
                                                )}
                                                <span style={{ fontWeight: 500, color: '#1e293b', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                                    {book?.title || `Book #${b.bookId}`}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ background: 'rgba(100,116,139,0.1)', borderRadius: 6, padding: '2px 9px', fontSize: '0.78rem', color: '#475569', fontWeight: 500 }}>
                                                #{b.userId}
                                            </span>
                                        </td>
                                        <td style={{ color: '#64748b' }}>{b.borrowDate}</td>
                                        <td style={{ color: '#64748b' }}>{b.dueDate}</td>
                                        <td style={{ fontWeight: 700, color: '#f59e0b' }}>${b.totalPrice}</td>
                                        <td>
                                            <span className="adm-badge" style={{ background: st.bg, color: st.color }}>
                                                {b.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {recentBorrows.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '2.5rem' }}>
                                        No borrow records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
