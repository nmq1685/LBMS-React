import React, { useState, useEffect } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { booksAPI, borrowsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

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
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const getBook = (bookId) => books.find((b) => b.id === bookId);

  const getItemTotal = (item) => {
    const book = getBook(item.bookId);
    return book
      ? (book.rentalPrice * item.days * item.quantity).toFixed(2)
      : "0.00";
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
      const borrows = cartItems.map((item) => {
        const book = getBook(item.bookId);
        const dueDate = new Date(today);
        dueDate.setDate(dueDate.getDate() + item.days);
        return {
          userId: user.id,
          bookId: item.bookId,
          borrowDate: today.toISOString().split("T")[0],
          dueDate: dueDate.toISOString().split("T")[0],
          returnDate: null,
          status: "borrowed",
          days: item.days,
          quantity: item.quantity, // thêm quantity
          totalPrice: parseFloat(
            (book.rentalPrice * item.days * item.quantity).toFixed(2),
          ),
        };
      });

      await Promise.all(borrows.map((b) => borrowsAPI.create(b)));

      // Update stock
      await Promise.all(
        cartItems.map((item) => {
          const book = getBook(item.bookId);
          if (book && book.stock > 0) {
            return booksAPI.update(book.id, {
              ...book,
              stock: Math.max(0, book.stock - item.quantity),
            });
          }
          return Promise.resolve();
        }),
      );

      await clearCart();
      toast.success("Checkout successful! Enjoy your books! 📚");
      navigate("/borrows");
    } catch (e) {
      toast.error("Checkout failed. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading)
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="warning" />
      </Container>
    );

  return (
    <div className="cart-page">
      {/* ── Page Banner ── */}
      <div className="page-banner">
        <Container>
          <span className="page-banner-icon">🛒</span>
          <h1 className="page-banner-title">My Cart</h1>
          <p className="page-banner-sub">
            {cartItems.length === 0
              ? "Your cart is empty"
              : `${cartItems.length} item${cartItems.length > 1 ? "s" : ""} ready to borrow`}
          </p>
        </Container>
      </div>

      <Container className="py-4">
        {cartItems.length === 0 ? (
          <div className="cart-empty-wrap">
            <span className="cart-empty-icon">🛒</span>
            <p className="text-muted mb-4 mt-2">
              Browse books and add them to your cart to get started
            </p>
            <Link
              to="/"
              className="btn btn-warning fw-bold px-4 py-2"
              style={{ borderRadius: 12 }}
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <Row className="g-4">
            {/* ── Items ── */}
            <Col lg={8}>
              <div className="d-flex flex-column gap-3">
                {cartItems.map((item, idx) => {
                  const book = getBook(item.bookId);
                  if (!book) return null;
                  return (
                    <div
                      key={item.id}
                      className="cart-item-card p-3"
                      style={{ animationDelay: `${idx * 0.07}s` }}
                    >
                      <div className="d-flex gap-3 align-items-start">
                        {/* Cover */}
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="cart-item-cover"
                          onError={(e) => {
                            e.target.src = `https://placehold.co/80x120/2c3e50/white?text=Book`;
                          }}
                        />

                        {/* Details */}
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6
                                className="fw-bold mb-0"
                                style={{ fontSize: "0.95rem" }}
                              >
                                <Link
                                  to={`/books/${book.id}`}
                                  className="text-dark text-decoration-none"
                                >
                                  {book.title}
                                </Link>
                              </h6>
                              <p
                                className="text-muted mb-2"
                                style={{ fontSize: "0.82rem" }}
                              >
                                {book.author}
                              </p>
                              <span className="fw-bold text-warning">
                                ${book.rentalPrice}
                                <span
                                  className="text-muted fw-normal"
                                  style={{ fontSize: "0.78rem" }}
                                >
                                  /day
                                </span>
                              </span>
                            </div>
                            <button
                              className="btn btn-link text-danger p-0"
                              style={{ fontSize: "1.1rem", lineHeight: 1 }}
                              onClick={async () => {
                                await removeFromCart(item.id);
                                toast.info("Removed from cart");
                              }}
                            >
                              🗑️
                            </button>
                          </div>

                          <div className="d-flex flex-wrap gap-4 mt-2">
                            {/* Days */}
                            <div>
                              <div
                                className="text-muted mb-1"
                                style={{
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                }}
                              >
                                Days
                              </div>
                              <div className="d-flex align-items-center gap-1">
                                <button
                                  className="qty-btn"
                                  onClick={() =>
                                    updateCartItem(item.id, {
                                      days: Math.max(1, item.days - 1),
                                    })
                                  }
                                >
                                  −
                                </button>
                                <div className="qty-display">{item.days}</div>
                                <button
                                  className="qty-btn"
                                  onClick={() =>
                                    updateCartItem(item.id, {
                                      days: item.days + 1,
                                    })
                                  }
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            {/* Quantity */}
                            <div>
                              <div
                                className="text-muted mb-1"
                                style={{
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                }}
                              >
                                Qty
                              </div>
                              <div className="d-flex align-items-center gap-1">
                                <button
                                  className="qty-btn"
                                  onClick={() => {
                                    if (item.quantity > 1)
                                      updateCartItem(item.id, {
                                        quantity: item.quantity - 1,
                                      });
                                  }}
                                >
                                  −
                                </button>
                                <div className="qty-display">
                                  {item.quantity}
                                </div>
                                <button
                                  className="qty-btn"
                                  onClick={() =>
                                    updateCartItem(item.id, {
                                      quantity: item.quantity + 1,
                                    })
                                  }
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            {/* Item total */}
                            <div className="ms-auto text-end">
                              <div
                                className="text-muted mb-1"
                                style={{
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                }}
                              >
                                Subtotal
                              </div>
                              <div
                                style={{
                                  fontSize: "1.15rem",
                                  fontWeight: 800,
                                  color: "#e0a800",
                                }}
                              >
                                ${getItemTotal(item)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Col>

            {/* ── Summary ── */}
            <Col lg={4}>
              <div className="cart-summary-card">
                <div className="cart-summary-hdg">📋 Order Summary</div>

                {cartItems.map((item) => {
                  const book = getBook(item.bookId);
                  if (!book) return null;
                  return (
                    <div key={item.id} className="cart-summary-row">
                      <span
                        style={{
                          maxWidth: 160,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {book.title} ({item.days}d×{item.quantity})
                      </span>
                      <span style={{ color: "white", fontWeight: 600 }}>
                        ${getItemTotal(item)}
                      </span>
                    </div>
                  );
                })}

                <div className="cart-summary-total-row">
                  <span className="fw-bold text-white">Grand Total</span>
                  <div className="cart-total-price">
                    ${grandTotal.toFixed(2)}
                  </div>
                </div>

                <button
                  className="cart-checkout-btn"
                  onClick={handleCheckout}
                  disabled={checkingOut}
                >
                  {checkingOut ? <Spinner size="sm" /> : "✅ Checkout & Borrow"}
                </button>
                <button
                  className="cart-clear-btn"
                  onClick={async () => {
                    await clearCart();
                    toast.info("Cart cleared");
                  }}
                >
                  🗑️ Clear Cart
                </button>
              </div>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default Cart;
