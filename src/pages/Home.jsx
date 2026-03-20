import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { booksAPI, categoriesAPI } from '../services/api';
import BookCard from '../components/BookCard';

const BOOKS_PER_PAGE = 12;

const Home = () => {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('default');
    const [page, setPage] = useState(1);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get('search');
        if (q) setSearchTerm(q);
    }, [location.search]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [booksRes, catsRes] = await Promise.all([booksAPI.getAll(), categoriesAPI.getAll()]);
                setBooks(booksRes.data);
                setCategories(catsRes.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        if (searchTerm.trim()) {
            navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
        } else {
            navigate('/');
        }
    };

    const getFiltered = useCallback(() => {
        let result = [...books];
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            result = result.filter(b =>
                b.title.toLowerCase().includes(q) ||
                b.author.toLowerCase().includes(q) ||
                (b.isbn && b.isbn.includes(q))
            );
        }
        if (selectedCategory !== 'all') {
            result = result.filter(b => b.categoryId === parseInt(selectedCategory));
        }
        switch (sortBy) {
            case 'price-asc': result.sort((a, b) => a.rentalPrice - b.rentalPrice); break;
            case 'price-desc': result.sort((a, b) => b.rentalPrice - a.rentalPrice); break;
            case 'rating': result.sort((a, b) => b.rating - a.rating); break;
            case 'title': result.sort((a, b) => a.title.localeCompare(b.title)); break;
            case 'newest': result.sort((a, b) => b.publishYear - a.publishYear); break;
            default: break;
        }
        return result;
    }, [books, searchTerm, selectedCategory, sortBy]);

    const filtered = getFiltered();
    const totalPages = Math.ceil(filtered.length / BOOKS_PER_PAGE);
    const paginated = filtered.slice((page - 1) * BOOKS_PER_PAGE, page * BOOKS_PER_PAGE);
    const featuredBooks = books.filter(b => b.featured);

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setSortBy('default');
        setPage(1);
        navigate('/');
    };

    return (
        <div className="home-page">
            {/* ── Hero ── */}
            <div className="hero-section">
                <Container>
                    <Row className="py-5 align-items-center">
                        <Col lg={6} className="text-center text-lg-start">
                            <div className="hero-tag">✨ Welcome to LBMS 2026</div>
                            <h1 className="hero-title">Discover Your Next<br /><span className="text-warning">Great Read</span></h1>
                            <p className="hero-subtitle">Rent from thousands of books. Read today, return tomorrow.</p>
                            <form className="d-flex gap-2 mt-4 hero-search" onSubmit={handleSearch}>
                                <input
                                    type="text"
                                    className="form-control flex-grow-1"
                                    placeholder="Search by title, author, ISBN..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                                <button type="submit" className="btn btn-warning px-3 fw-bold">🔍 Search</button>
                            </form>
                        </Col>
                        <Col lg={6} className="d-none d-lg-flex justify-content-center align-items-center">
                            <div className="hero-book-scene">
                                <div className="hero-book">
                                    <div className="hero-book-front">
                                        <div className="hb-top-stripe"></div>
                                        <div className="hb-icon">📚</div>
                                        <div className="hb-title">Library<br />Book<br />Management</div>
                                        <div className="hb-divider"></div>
                                        <div className="hb-subtitle">Digital Library System</div>
                                        <div className="hb-bottom-stripe"></div>
                                    </div>
                                    <div className="hero-book-back">
                                        <div className="hb-back-header">✨ Why Choose Us?</div>
                                        <ul className="hb-back-list">
                                            <li>📚 {books.length}+ Books</li>
                                            <li>🏷️ {categories.length} Categories</li>
                                            <li>💰 From $1.75/day</li>
                                            <li>⚡ 24/7 Online Access</li>
                                            <li>🔄 Easy Returns</li>
                                        </ul>
                                        <div className="hb-back-footer">LBMS • 2026</div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container className="py-5">
                {/* ── Stats ── */}
                <Row className="mb-5 g-3">
                    {[
                        { icon: '📚', number: `${books.length}+`, label: 'Books Available', delay: '0s' },
                        { icon: '🏷️', number: categories.length, label: 'Categories', delay: '0.08s' },
                        { icon: '💰', number: '$1.75', label: 'Starting Price/Day', delay: '0.16s' },
                        { icon: '⚡', number: '24/7', label: 'Online Access', delay: '0.24s' },
                    ].map((stat, i) => (
                        <Col xs={6} md={3} key={i}>
                            <div className="stat-card-v2" style={{ animationDelay: stat.delay }}>
                                <span className="stat-v2-icon">{stat.icon}</span>
                                <div className="stat-v2-num">{stat.number}</div>
                                <div className="stat-v2-label">{stat.label}</div>
                            </div>
                        </Col>
                    ))}
                </Row>

                {/* ── Featured Books ── */}
                {!searchTerm && selectedCategory === 'all' && featuredBooks.length > 0 && (
                    <section className="mb-5">
                        <h2 className="section-title">⭐ Featured Books</h2>
                        <Row className="g-3">
                            {featuredBooks.slice(0, 6).map(book => (
                                <Col key={book.id} xs={6} md={4} lg={2}>
                                    <BookCard book={book} categories={categories} />
                                </Col>
                            ))}
                        </Row>
                    </section>
                )}

                {/* ── All Books ── */}
                <section>
                    <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                        <h2 className="section-title mb-0">📖 All Books</h2>
                        <select
                            className="sort-select-modern"
                            value={sortBy}
                            onChange={e => { setSortBy(e.target.value); setPage(1); }}
                        >
                            <option value="default">Sort: Default</option>
                            <option value="price-asc">Price: Low → High</option>
                            <option value="price-desc">Price: High → Low</option>
                            <option value="rating">Top Rated</option>
                            <option value="title">Title A–Z</option>
                            <option value="newest">Newest First</option>
                        </select>
                    </div>

                    {/* Category filters */}
                    <div className="d-flex flex-wrap gap-2 mb-4">
                        <button
                            className="category-chip"
                            style={selectedCategory === 'all'
                                ? { background: '#f6c90e', borderColor: '#f6c90e', color: '#13151f' }
                                : { background: 'white', borderColor: '#e5e7eb', color: '#374151' }}
                            onClick={() => { setSelectedCategory('all'); setPage(1); }}
                        >
                            🌐 All
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                className="category-chip"
                                style={selectedCategory === String(cat.id)
                                    ? { backgroundColor: cat.color, borderColor: cat.color, color: '#fff' }
                                    : { backgroundColor: 'white', borderColor: cat.color, color: cat.color }}
                                onClick={() => { setSelectedCategory(String(cat.id)); setPage(1); }}
                            >
                                {cat.icon} {cat.name}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="warning" />
                            <p className="mt-3 text-muted">Loading books...</p>
                        </div>
                    ) : paginated.length === 0 ? (
                        <div className="text-center py-5">
                            <p className="fs-1">📭</p>
                            <p className="text-muted fs-5">No books found matching your criteria.</p>
                            <button className="btn btn-outline-warning" onClick={resetFilters}>Clear Filters</button>
                        </div>
                    ) : (
                        <>
                            <p className="text-muted small mb-3">{filtered.length} books found</p>
                            <Row className="g-3">
                                {paginated.map((book, idx) => (
                                    <Col key={book.id} xs={6} md={4} lg={2} style={{ animationDelay: `${idx * 0.04}s` }}>
                                        <BookCard book={book} categories={categories} />
                                    </Col>
                                ))}
                            </Row>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-center gap-2 mt-5">
                                    <button
                                        className="pagination-btn"
                                        disabled={page === 1}
                                        onClick={() => setPage(p => p - 1)}
                                    >
                                        ←
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                        <button
                                            key={p}
                                            className={`pagination-btn${p === page ? ' active' : ''}`}
                                            onClick={() => setPage(p)}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                    <button
                                        className="pagination-btn"
                                        disabled={page === totalPages}
                                        onClick={() => setPage(p => p + 1)}
                                    >
                                        →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </Container>
        </div>
    );
};

export default Home;
