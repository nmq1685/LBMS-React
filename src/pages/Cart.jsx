import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { booksAPI, borrowsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Cart = () => {
    const { user } = useAuth();
    const { cartItems, removeFromCart, updateCartItem, clearCart } = useCart();
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checkingOut, setCheckingOut] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const { data } = await booksAPI.getAll();
                setBooks(data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    const getBook = (bookId) => books.find(b => b.id === bookId);

    const getItemTotal = (item) => {
        const book = getBook(item.bookId);
        return book ? (book.rentalPrice * item.days * item.quantity).toFixed(2) : '0.00';
    };

    const grandTotal = cartItems.reduce((sum, item) => {
        const book = getBook(item.bookId);
        return sum + (book ? book.rentalPrice * item.days * item.quantity : 0);
    }, 0);

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;
        setCheckingOut(true);
        try {
            const today = new Date();
            const borrows = cartItems.map(item => {
                const book = getBook(item.bookId);
                const dueDate = new Date(today);
                dueDate.setDate(dueDate.getDate() + item.days);
                return {
                    userId: user.id,
                    bookId: item.bookId,
                    borrowDate: today.toISOString().split('T')[0],
                    dueDate: dueDate.toISOString().split('T')[0],
                    returnDate: null,
                    status: 'borrowed',
                    days: item.days,
                    totalPrice: parseFloat((book.rentalPrice * item.days * item.quantity).toFixed(2)),
                };
            });

            await Promise.all(borrows.map(b => borrowsAPI.create(b)));

            // Update stock
            await Promise.all(
                cartItems.map(item => {
                    const book = getBook(item.bookId);
                    if (book && book.stock > 0) {
                        return booksAPI.update(book.id, { ...book, stock: Math.max(0, book.stock - item.quantity) });
                    }
                    return Promise.resolve();
                })
            );

            await clearCart();
            toast.success('Checkout successful! Enjoy your books! 📚');
            navigate('/borrows');
        } catch (e) {
            toast.error('Checkout failed. Please try again.');
        } finally {
            setCheckingOut(false);
        }
    };

    if (loading) return (
        <Container className="py-5 text-center"><Spinner animation="border" variant="warning" /></Container>
    );

    return (
        <Container className="py-5">
            <h2 className="fw-bold mb-4">🛒 My Cart</h2>

            {cartItems.length === 0 ? (
                <div className="text-center py-5">
                    <p className="fs-1 mb-3">🛒</p>
                    <h4 className="text-muted">Your cart is empty</h4>
                    <p className="text-muted">Browse books and add them to your cart</p>
                    <Button as={Link} to="/" variant="warning" className="mt-2">Browse Books</Button>
                </div>
            ) : (
                <Row className="g-4">
                    <Col lg={8}>
                        {cartItems.map(item => {
                            const book = getBook(item.bookId);
                            if (!book) return null;
                            return (
                                <Card key={item.id} className="mb-3 shadow-sm border-0">
                                    <Card.Body>
                                        <Row className="align-items-center g-3">
                                            <Col xs={3} md={2}>
                                                <img
                                                    src={book.cover} alt={book.title}
                                                    style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', borderRadius: 6 }}
                                                    onError={e => { e.target.src = `https://placehold.co/80x120/2c3e50/white?text=Book`; }}
                                                />
                                            </Col>
                                            <Col xs={9} md={5}>
                                                <h6 className="fw-bold mb-1">
                                                    <Link to={`/books/${book.id}`} className="text-dark text-decoration-none">{book.title}</Link>
                                                </h6>
                                                <p className="text-muted small mb-1">{book.author}</p>
                                                <p className="text-warning fw-semibold mb-0">${book.rentalPrice}/day</p>
                                            </Col>
                                            <Col xs={6} md={3}>
                                                <Form.Label className="small text-muted">Days to rent</Form.Label>
                                                <div className="d-flex align-items-center gap-1">
                                                    <Button size="sm" variant="outline-secondary" onClick={() => updateCartItem(item.id, { days: Math.max(1, item.days - 1) })}>−</Button>
                                                    <Form.Control
                                                        type="number" size="sm" min="1" max="60" value={item.days}
                                                        onChange={e => updateCartItem(item.id, { days: Math.max(1, parseInt(e.target.value) || 1) })}
                                                        style={{ width: 55, textAlign: 'center' }}
                                                    />
                                                    <Button size="sm" variant="outline-secondary" onClick={() => updateCartItem(item.id, { days: item.days + 1 })}>+</Button>
                                                </div>
                                                <div className="d-flex align-items-center gap-1 mt-1">
                                                    <Form.Label className="small text-muted mb-0">Qty:</Form.Label>
                                                    <Button size="sm" variant="outline-secondary" onClick={() => { if (item.quantity > 1) updateCartItem(item.id, { quantity: item.quantity - 1 }); }}>−</Button>
                                                    <span className="px-2 small fw-semibold">{item.quantity}</span>
                                                    <Button size="sm" variant="outline-secondary" onClick={() => updateCartItem(item.id, { quantity: item.quantity + 1 })}>+</Button>
                                                </div>
                                            </Col>
                                            <Col xs={6} md={2} className="text-end">
                                                <div className="fw-bold text-warning">${getItemTotal(item)}</div>
                                                <Button
                                                    variant="link" size="sm" className="text-danger p-0 mt-1"
                                                    onClick={async () => { await removeFromCart(item.id); toast.info('Removed from cart'); }}
                                                >
                                                    🗑️ Remove
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            );
                        })}
                    </Col>

                    <Col lg={4}>
                        <Card className="shadow-sm border-0 sticky-top" style={{ top: 80 }}>
                            <Card.Body className="p-4">
                                <h5 className="fw-bold mb-4">Order Summary</h5>
                                {cartItems.map(item => {
                                    const book = getBook(item.bookId);
                                    if (!book) return null;
                                    return (
                                        <div key={item.id} className="d-flex justify-content-between mb-2 small">
                                            <span className="text-truncate me-2" style={{ maxWidth: 180 }}>{book.title} ({item.days}d × {item.quantity})</span>
                                            <span className="fw-semibold">${getItemTotal(item)}</span>
                                        </div>
                                    );
                                })}
                                <hr />
                                <div className="d-flex justify-content-between fw-bold fs-5 mb-4">
                                    <span>Total</span>
                                    <span className="text-warning">${grandTotal.toFixed(2)}</span>
                                </div>
                                <Button
                                    variant="warning" className="w-100 fw-semibold"
                                    onClick={handleCheckout} disabled={checkingOut}
                                >
                                    {checkingOut ? <Spinner size="sm" /> : '✅ Checkout & Borrow'}
                                </Button>
                                <Button
                                    variant="outline-danger" size="sm" className="w-100 mt-2"
                                    onClick={async () => { await clearCart(); toast.info('Cart cleared'); }}
                                >
                                    Clear Cart
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default Cart;
