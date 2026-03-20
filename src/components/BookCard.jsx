import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

const BookCard = ({ book, categories = [] }) => {
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const navigate = useNavigate();

    const category = categories.find(c => c.id === book.categoryId);
    const inWishlist = isInWishlist(book.id);

    const handleAddToCart = async (e) => {
        e.preventDefault();
        if (!user) { navigate('/login'); return; }
        await addToCart(book.id);
        toast.success(`Added "${book.title}" to cart!`);
    };

    const handleWishlist = async (e) => {
        e.preventDefault();
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
        <Card className="book-card h-100 shadow-sm">
            <div className="book-cover-wrapper position-relative">
                <Card.Img
                    variant="top"
                    src={book.cover}
                    alt={book.title}
                    className="book-cover"
                    onError={e => { e.target.src = `https://placehold.co/200x300/2c3e50/white?text=${encodeURIComponent(book.title.slice(0, 15))}`; }}
                />
                <button
                    className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
                    onClick={handleWishlist}
                    title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    {inWishlist ? '❤️' : '🤍'}
                </button>
                {book.featured && (
                    <Badge bg="warning" text="dark" className="position-absolute top-0 start-0 m-2" style={{ fontSize: '0.7rem' }}>
                        ⭐ Featured
                    </Badge>
                )}
                {book.stock === 0 && (
                    <div className="out-of-stock-overlay">Out of Stock</div>
                )}
            </div>

            <Card.Body className="d-flex flex-column p-3">
                {category && (
                    <Badge
                        className="align-self-start mb-2"
                        style={{ backgroundColor: category.color, fontSize: '0.7rem' }}
                    >
                        {category.icon} {category.name}
                    </Badge>
                )}
                <Card.Title className="book-title mb-1" style={{ fontSize: '0.9rem' }}>
                    <Link to={`/books/${book.id}`} className="book-title-link stretched-link-title">
                        {book.title}
                    </Link>
                </Card.Title>
                <Card.Text className="text-muted small mb-2">{book.author}</Card.Text>
                <div className="d-flex align-items-center mb-3">
                    <span className="text-warning" style={{ fontSize: '0.8rem' }}>
                        {'★'.repeat(Math.round(book.rating))}{'☆'.repeat(5 - Math.round(book.rating))}
                    </span>
                    <span className="ms-1 text-muted" style={{ fontSize: '0.75rem' }}>({book.rating})</span>
                </div>
                <div className="mt-auto d-flex justify-content-between align-items-center">
                    <div>
                        <span className="fw-bold text-warning">${book.rentalPrice}</span>
                        <small className="text-muted">/day</small>
                    </div>
                    <div className="d-flex gap-1">
                        <Button as={Link} to={`/books/${book.id}`} variant="outline-primary" size="sm">
                            Details
                        </Button>
                        <Button
                            variant="warning"
                            size="sm"
                            onClick={handleAddToCart}
                            disabled={book.stock === 0}
                        >
                            🛒
                        </Button>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default BookCard;
