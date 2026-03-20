import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { booksAPI, categoriesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import BookCard from '../components/BookCard';

const BookDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    const [book, setBook] = useState(null);
    const [category, setCategory] = useState(null);
    const [relatedBooks, setRelatedBooks] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(7);
    const [error, setError] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetch = async () => {
            setLoading(true);
            setError('');
            try {
                const [bookRes, catsRes] = await Promise.all([booksAPI.getById(id), categoriesAPI.getAll()]);
                setBook(bookRes.data);
                setAllCategories(catsRes.data);
                const cat = catsRes.data.find(c => c.id === bookRes.data.categoryId);
                setCategory(cat);
                const relRes = await booksAPI.getAll({ categoryId: bookRes.data.categoryId });
                setRelatedBooks(relRes.data.filter(b => b.id !== bookRes.data.id).slice(0, 4));
            } catch (e) {
                setError('Book not found.');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    if (loading) return (
        <div className="text-center py-5">
            <Spinner animation="border" variant="warning" size="lg" />
        </div>
    );

    if (error || !book) return (
        <Container className="py-5">
            <Alert variant="danger">{error || 'Book not found.'}</Alert>
            <button className="btn btn-outline-dark" onClick={() => navigate('/')}>← Back to Home</button>
        </Container>
    );

    const inWishlist = isInWishlist(book.id);
    const totalPrice = (book.rentalPrice * days).toFixed(2);

    const handleAddToCart = async () => {
        if (!user) { navigate('/login'); return; }
        await addToCart(book.id, 1, days);
        toast.success('Added to cart!');
    };

    const handleWishlist = async () => {
        if (!user) { navigate('/login'); return; }
        if (inWishlist) {
            await removeFromWishlist(book.id);
            toast.info('Removed from wishlist');
        } else {
            await addToWishlist(book.id);
            toast.success('Added to wishlist!');
        }
    };

    const stars = Math.round(book.rating);

    return (
        <div>
            {/* ── Dark Hero Banner ── */}
            <div className="book-detail-hero">
                <Container>
                    <button
                        className="btn btn-link text-white text-decoration-none ps-0 mb-4 opacity-75"
                        onClick={() => navigate(-1)}
                        style={{ fontSize: '0.9rem' }}
                    >
                        ← Back
                    </button>
                    <Row className="g-5 pb-5 align-items-end">
                        {/* Cover */}
                        <Col md={3} className="text-center">
                            <img
                                src={book.cover}
                                alt={book.title}
                                className="book-detail-cover-3d"
                                style={{ width: '100%', maxWidth: 220, display: 'block', margin: '0 auto', borderRadius: 10 }}
                                onError={e => { e.target.src = `https://placehold.co/300x450/2c3e50/white?text=${encodeURIComponent(book.title.slice(0, 20))}`; }}
                            />
                        </Col>

                        {/* Info */}
                        <Col md={9}>
                            {/* Badges */}
                            <div className="d-flex flex-wrap gap-2 mb-3">
                                {category && (
                                    <span className="book-hero-badge" style={{ backgroundColor: category.color, color: '#fff' }}>
                                        {category.icon} {category.name}
                                    </span>
                                )}
                                {book.featured && (
                                    <span className="book-hero-badge" style={{ background: 'rgba(246,201,14,0.2)', border: '1px solid rgba(246,201,14,0.4)', color: '#f6c90e' }}>
                                        ⭐ Featured
                                    </span>
                                )}
                                {book.stock > 0
                                    ? <span className="book-hero-badge" style={{ background: 'rgba(72,187,120,0.2)', border: '1px solid rgba(72,187,120,0.3)', color: '#68d391' }}>✓ In Stock ({book.stock})</span>
                                    : <span className="book-hero-badge" style={{ background: 'rgba(252,129,74,0.2)', border: '1px solid rgba(252,129,74,0.3)', color: '#fc8149' }}>✗ Out of Stock</span>
                                }
                            </div>

                            <h1 className="fw-bold text-white mb-1" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)' }}>{book.title}</h1>
                            <p className="mb-3" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.05rem' }}>by {book.author}</p>

                            {/* Stars */}
                            <div className="d-flex align-items-center gap-2 mb-4">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <span key={s} style={{ fontSize: '1.3rem', color: s <= stars ? '#f6c90e' : 'rgba(255,255,255,0.2)' }}>★</span>
                                ))}
                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>({book.rating}/5)</span>
                            </div>

                            {/* Meta pills */}
                            <Row className="g-2 mb-4">
                                {[
                                    { label: 'Publisher', value: book.publisher },
                                    { label: 'Year', value: book.publishYear },
                                    { label: 'Pages', value: book.pages },
                                    { label: 'Language', value: book.language },
                                    { label: 'ISBN', value: book.isbn },
                                ].filter(m => m.value).map(({ label, value }) => (
                                    <Col xs={6} sm={4} md={3} key={label}>
                                        <div className="meta-pill">
                                            <div className="meta-pill-label">{label}</div>
                                            <div className="meta-pill-val">{value}</div>
                                        </div>
                                    </Col>
                                ))}
                            </Row>

                            {/* Action buttons */}
                            <div className="d-flex gap-3 flex-wrap">
                                <button
                                    className="cart-checkout-btn"
                                    style={{ width: 'auto', padding: '0 2rem', background: 'linear-gradient(135deg,#f6c90e,#e0a800)' }}
                                    onClick={handleAddToCart}
                                    disabled={book.stock === 0}
                                >
                                    🛒 Add to Cart
                                </button>
                                <button
                                    className="btn"
                                    style={{
                                        height: 52, borderRadius: 14,
                                        border: inWishlist ? '2px solid #ef4444' : '2px solid rgba(255,255,255,0.25)',
                                        background: inWishlist ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)',
                                        color: inWishlist ? '#ef4444' : 'white',
                                        fontWeight: 700, fontSize: '1.2rem',
                                        transition: 'all .25s',
                                        padding: '0 1.2rem'
                                    }}
                                    onClick={handleWishlist}
                                >
                                    {inWishlist ? '❤️' : '🤍'}
                                </button>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* ── Body ── */}
            <Container className="py-5">
                <Row className="g-5">
                    {/* Description */}
                    <Col lg={8}>
                        <div
                            style={{ background: 'white', borderRadius: 18, padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}
                        >
                            <h4 className="fw-bold mb-3" style={{ fontSize: '1.1rem' }}>📝 Description</h4>
                            <p className="text-secondary lh-lg mb-0" style={{ fontSize: '0.97rem' }}>{book.description}</p>
                        </div>
                    </Col>

                    {/* Rental calculator */}
                    <Col lg={4}>
                        <div className="rental-calc-card">
                            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                <span style={{ background: '#fffbeb', borderRadius: 8, width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>💰</span>
                                Rental Calculator
                            </h5>

                            <div className="mb-3">
                                <label className="profile-field-label">Number of Days</label>
                                <input
                                    type="number"
                                    className="profile-field-input"
                                    min="1" max="60"
                                    value={days}
                                    onChange={e => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                                />
                                <div className="d-flex gap-2 mt-2 flex-wrap">
                                    {[3, 7, 14, 30].map(d => (
                                        <button
                                            key={d}
                                            className={`rental-days-chip${days === d ? ' active' : ''}`}
                                            onClick={() => setDays(d)}
                                        >
                                            {d}d
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ background: '#fefce8', borderRadius: 12, padding: '1rem', border: '1px solid rgba(246,201,14,0.25)' }}>
                                <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.88rem', color: '#6b7280' }}>
                                    <span>Price per day</span>
                                    <span className="fw-bold text-dark">${book.rentalPrice}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.88rem', color: '#6b7280' }}>
                                    <span>Duration</span>
                                    <span className="fw-bold text-dark">{days} day{days > 1 ? 's' : ''}</span>
                                </div>
                                <hr style={{ borderColor: 'rgba(246,201,14,0.3)' }} />
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-bold">Total Amount</span>
                                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#e0a800' }}>${totalPrice}</span>
                                </div>
                            </div>

                            <button
                                className="cart-checkout-btn mt-3"
                                onClick={handleAddToCart}
                                disabled={book.stock === 0}
                                style={{ width: '100%' }}
                            >
                                🛒 Rent for {days} Day{days > 1 ? 's' : ''}
                            </button>
                        </div>
                    </Col>
                </Row>

                {/* Related Books */}
                {relatedBooks.length > 0 && (
                    <section className="mt-5">
                        <h3 className="section-title">📖 Related Books</h3>
                        <Row className="g-3">
                            {relatedBooks.map(b => (
                                <Col key={b.id} xs={6} md={3}>
                                    <BookCard book={b} categories={allCategories} />
                                </Col>
                            ))}
                        </Row>
                    </section>
                )}
            </Container>
        </div>
    );
};

export default BookDetail;
