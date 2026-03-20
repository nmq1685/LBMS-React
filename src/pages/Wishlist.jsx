import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
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
        <Container className="py-5 text-center"><Spinner animation="border" variant="warning" /></Container>
    );

    return (
        <Container className="py-5">
            <h2 className="fw-bold mb-4">❤️ My Wishlist</h2>

            {wishlistItems.length === 0 ? (
                <div className="text-center py-5">
                    <p className="fs-1 mb-3">❤️</p>
                    <h4 className="text-muted">Your wishlist is empty</h4>
                    <p className="text-muted">Save books you love to your wishlist</p>
                    <Button as={Link} to="/" variant="warning" className="mt-2">Browse Books</Button>
                </div>
            ) : (
                <>
                    <p className="text-muted mb-4">{wishlistItems.length} book{wishlistItems.length > 1 ? 's' : ''} in wishlist</p>
                    <Row className="g-3">
                        {wishlistItems.map(item => {
                            const book = getBook(item.bookId);
                            if (!book) return null;
                            const cat = getCat(book.categoryId);
                            return (
                                <Col key={item.id} xs={12} md={6} lg={4}>
                                    <Card className="h-100 shadow-sm border-0">
                                        <Row className="g-0 h-100">
                                            <Col xs={4}>
                                                <img
                                                    src={book.cover} alt={book.title}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px 0 0 8px' }}
                                                    onError={e => { e.target.src = `https://placehold.co/120x180/2c3e50/white?text=Book`; }}
                                                />
                                            </Col>
                                            <Col xs={8}>
                                                <Card.Body className="p-3 d-flex flex-column h-100">
                                                    {cat && (
                                                        <span
                                                            className="badge mb-1 align-self-start"
                                                            style={{ backgroundColor: cat.color, fontSize: '0.7rem' }}
                                                        >
                                                            {cat.icon} {cat.name}
                                                        </span>
                                                    )}
                                                    <h6 className="fw-bold mb-1" style={{ fontSize: '0.85rem', lineHeight: 1.3 }}>
                                                        <Link to={`/books/${book.id}`} className="text-dark text-decoration-none">{book.title}</Link>
                                                    </h6>
                                                    <p className="text-muted small mb-1">{book.author}</p>
                                                    <p className="text-warning fw-semibold mb-2 small">${book.rentalPrice}/day</p>
                                                    <div className="mt-auto d-flex gap-1">
                                                        <Button
                                                            variant="warning" size="sm" className="flex-grow-1"
                                                            onClick={() => handleMoveToCart(book.id)}
                                                            disabled={book.stock === 0}
                                                        >
                                                            🛒 Cart
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger" size="sm"
                                                            onClick={() => handleRemove(book.id)}
                                                        >
                                                            🗑️
                                                        </Button>
                                                    </div>
                                                </Card.Body>
                                            </Col>
                                        </Row>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                </>
            )}
        </Container>
    );
};

export default Wishlist;
