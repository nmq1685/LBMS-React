import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { booksAPI, categoriesAPI } from '../services/api';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';

const Wishlist = () => {
    const { wishlistItems, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const [booksRes, catsRes] = await Promise.all([booksAPI.getAll(), categoriesAPI.getAll()]);
                setBooks(booksRes.data);
                setCategories(catsRes.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    const getBook = (id) => books.find(b => b.id === id);
    const getCat = (id) => categories.find(c => c.id === id);

    const handleMoveToCart = async (bookId) => {
        await addToCart(bookId);
        await removeFromWishlist(bookId);
        toast.success('Moved to cart!');
    };

    const handleRemove = async (bookId) => {
        await removeFromWishlist(bookId);
        toast.info('Removed from wishlist');
    };

    if (loading) return (
        <div className="text-center py-5"><Spinner animation="border" variant="warning" /></div>
    );

    return (
        <div className="wishlist-page">
            {/* ── Page Banner ── */}
            <div className="page-banner">
                <Container>
                    <span className="page-banner-icon">❤️</span>
                    <h1 className="page-banner-title">My Wishlist</h1>
                    <p className="page-banner-sub">
                        {wishlistItems.length === 0
                            ? 'Save your favourite books here'
                            : `${wishlistItems.length} book${wishlistItems.length > 1 ? 's' : ''} saved`}
                    </p>
                </Container>
            </div>

            <Container className="py-4">
                {wishlistItems.length === 0 ? (
                    <div className="wishlist-empty-wrap">
                        <span className="wishlist-empty-icon">❤️</span>
                        <h4 className="fw-bold mt-2 mb-2">Your wishlist is empty</h4>
                        <p className="text-muted mb-4">Save books you love to read later</p>
                        <Link to="/" className="btn btn-warning fw-bold px-4 py-2" style={{ borderRadius: 12 }}>
                            Browse Books
                        </Link>
                    </div>
                ) : (
                    <Row className="g-3">
                        {wishlistItems.map((item, idx) => {
                            const book = getBook(item.bookId);
                            if (!book) return null;
                            const cat = getCat(book.categoryId);
                            return (
                                <Col key={item.id} xs={6} sm={4} md={3} lg={2}>
                                    <div
                                        className="wishlist-grid-card"
                                        style={{ animationDelay: `${idx * 0.05}s` }}
                                    >
                                        <div className="wishlist-cover-wrap">
                                            <img
                                                src={book.cover}
                                                alt={book.title}
                                                className="wishlist-cover-img"
                                                onError={e => { e.target.src = `https://placehold.co/200x300/2c3e50/white?text=Book`; }}
                                            />
                                            {/* Overlay on hover */}
                                            <div className="wishlist-overlay">
                                                <p className="text-white fw-bold mb-1" style={{ fontSize: '0.82rem', lineHeight: 1.3, margin: 0 }}>
                                                    {book.title}
                                                </p>
                                                <p className="mb-2" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.72rem', margin: 0 }}>
                                                    {book.author}
                                                </p>
                                                <button
                                                    className="wishlist-add-cart-btn"
                                                    onClick={() => handleMoveToCart(book.id)}
                                                    disabled={book.stock === 0}
                                                >
                                                    {book.stock === 0 ? 'Out of Stock' : '🛒 Move to Cart'}
                                                </button>
                                                <Link
                                                    to={`/books/${book.id}`}
                                                    className="d-block text-center mt-1"
                                                    style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', textDecoration: 'none' }}
                                                >
                                                    View Details →
                                                </Link>
                                            </div>
                                            {/* Remove FAB */}
                                            <button
                                                className="wishlist-remove-fab"
                                                onClick={() => handleRemove(book.id)}
                                                title="Remove from wishlist"
                                            >
                                                ✕
                                            </button>
                                            {/* Category badge */}
                                            {cat && (
                                                <span
                                                    className="position-absolute bottom-0 start-0 m-2 badge"
                                                    style={{ background: cat.color, fontSize: '0.65rem' }}
                                                >
                                                    {cat.icon} {cat.name}
                                                </span>
                                            )}
                                        </div>
                                        <div className="p-2">
                                            <div className="fw-bold" style={{ fontSize: '0.8rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                <Link to={`/books/${book.id}`} className="text-dark text-decoration-none">
                                                    {book.title}
                                                </Link>
                                            </div>
                                            <div className="text-muted" style={{ fontSize: '0.72rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.author}</div>
                                            <div className="fw-bold text-warning" style={{ fontSize: '0.82rem' }}>${book.rentalPrice}/day</div>
                                        </div>
                                    </div>
                                </Col>
                            );
                        })}
                    </Row>
                )}
            </Container>
        </div>
    );
};

export default Wishlist;
