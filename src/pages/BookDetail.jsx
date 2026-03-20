import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Badge, Form, Spinner, Alert } from 'react-bootstrap';
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
        <Container className="py-5 text-center">
            <Spinner animation="border" variant="warning" size="lg" />
        </Container>
    );

    if (error || !book) return (
        <Container className="py-5">
            <Alert variant="danger">{error || 'Book not found.'}</Alert>
            <Button variant="outline-dark" onClick={() => navigate('/')}>← Back to Home</Button>
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

    return (
        <Container className="py-5">
            <Button variant="link" className="text-dark ps-0 mb-3 text-decoration-none" onClick={() => navigate(-1)}>
                ← Back
            </Button>

            <Row className="g-5">
                <Col md={4}>
                    <div className="book-detail-cover-wrapper">
                        <img
                            src={book.cover}
                            alt={book.title}
                            className="book-detail-cover"
                            onError={e => { e.target.src = `https://placehold.co/300x450/2c3e50/white?text=${encodeURIComponent(book.title.slice(0, 20))}`; }}
                        />
                    </div>
                    <div className="d-flex gap-2 mt-3">
                        <Button
                            variant="warning"
                            className="flex-grow-1"
                            onClick={handleAddToCart}
                            disabled={book.stock === 0}
                        >
                            🛒 Add to Cart
                        </Button>
                        <Button
                            variant={inWishlist ? 'danger' : 'outline-danger'}
                            onClick={handleWishlist}
                        >
                            {inWishlist ? '❤️' : '🤍'}
                        </Button>
                    </div>
                </Col>

                <Col md={8}>
                    <div className="d-flex flex-wrap gap-2 mb-2 align-items-center">
                        {category && (
                            <Badge style={{ backgroundColor: category.color, fontSize: '0.85rem' }}>
                                {category.icon} {category.name}
                            </Badge>
                        )}
                        {book.featured && <Badge bg="warning" text="dark">⭐ Featured</Badge>}
                        {book.stock > 0
                            ? <Badge bg="success">In Stock ({book.stock})</Badge>
                            : <Badge bg="danger">Out of Stock</Badge>
                        }
                    </div>

                    <h1 className="fw-bold mb-1">{book.title}</h1>
                    <h5 className="text-muted mb-3">by {book.author}</h5>

                    <div className="d-flex align-items-center mb-4">
                        <span className="text-warning fs-5">
                            {'★'.repeat(Math.round(book.rating))}{'☆'.repeat(5 - Math.round(book.rating))}
                        </span>
                        <span className="ms-2 text-muted">({book.rating}/5)</span>
                    </div>

                    <Row className="g-3 mb-4">
                        {[
                            { label: 'Publisher', value: book.publisher },
                            { label: 'Year', value: book.publishYear },
                            { label: 'Pages', value: book.pages },
                            { label: 'Language', value: book.language },
                            { label: 'ISBN', value: book.isbn },
                        ].map(({ label, value }) => (
                            <Col xs={6} sm={4} key={label}>
                                <div className="meta-box p-2 rounded bg-light">
                                    <div className="text-muted small">{label}</div>
                                    <div className="fw-semibold small">{value}</div>
                                </div>
                            </Col>
                        ))}
                    </Row>

                    <p className="text-secondary lh-lg mb-4">{book.description}</p>

                    {/* Rental box */}
                    <div className="rental-box p-4 rounded border">
                        <h5 className="mb-3">💰 Rental Options</h5>
                        <Row className="align-items-end g-3">
                            <Col xs={12} sm={5}>
                                <Form.Label className="fw-semibold">Number of Days</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    max="60"
                                    value={days}
                                    onChange={e => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                                />
                                <div className="d-flex gap-2 mt-2">
                                    {[3, 7, 14, 30].map(d => (
                                        <Button key={d} size="sm" variant={days === d ? 'warning' : 'outline-secondary'} onClick={() => setDays(d)}>
                                            {d}d
                                        </Button>
                                    ))}
                                </div>
                            </Col>
                            <Col xs={12} sm={7}>
                                <div className="p-3 bg-light rounded">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span className="text-muted">Price per day:</span>
                                        <span className="fw-semibold">${book.rentalPrice}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-1">
                                        <span className="text-muted">Duration:</span>
                                        <span className="fw-semibold">{days} day{days > 1 ? 's' : ''}</span>
                                    </div>
                                    <hr className="my-2" />
                                    <div className="d-flex justify-content-between">
                                        <span className="fw-bold">Total:</span>
                                        <span className="fw-bold text-warning fs-5">${totalPrice}</span>
                                    </div>
                                </div>
                            </Col>
                        </Row>
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
    );
};

export default BookDetail;
