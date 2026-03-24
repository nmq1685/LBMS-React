import React, { useState, useEffect } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { borrowsAPI, booksAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const statusCfg = {
  borrowed: { cls: "bstatus-borrowed", label: "📖 Active", bc: "#4299e1" },
  returned: { cls: "bstatus-returned", label: "✅ Returned", bc: "#48bb78" },
  overdue: { cls: "bstatus-overdue", label: "⚠️ Overdue", bc: "#fc8149" },
};

const BorrowHistory = () => {
  const { user } = useAuth();
  const [borrows, setBorrows] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [returning, setReturning] = useState(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [borrowsRes, booksRes] = await Promise.all([
        borrowsAPI.getByUser(user.id),
        booksAPI.getAll(),
      ]);
      setBorrows(
        borrowsRes.data.sort(
          (a, b) => new Date(b.borrowDate) - new Date(a.borrowDate),
        ),
      );
      setBooks(booksRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getBook = (id) => books.find((b) => b.id === id);

  const handleReturn = async (borrow) => {
    setReturning(borrow.id);
    try {
      const today = new Date().toISOString().split("T")[0];
      await borrowsAPI.update(borrow.id, {
        ...borrow,
        status: "returned",
        returnDate: today,
      });
      const book = getBook(borrow.bookId);
      if (book)
        await booksAPI.update(book.id, {
          ...book,
          stock: book.stock + (borrow.quantity || 1), // logic cập nhật trả sách
        });
      await fetchData();
      toast.success("Book returned successfully!");
    } catch (e) {
      toast.error("Failed to return book.");
    } finally {
      setReturning(null);
    }
  };

  const filtered =
    filter === "all" ? borrows : borrows.filter((b) => b.status === filter);
  const total = borrows.reduce((s, b) => s + (b.totalPrice || 0), 0);

  const miniStats = [
    {
      label: "Total Borrows",
      value: borrows.length,
      bg: "linear-gradient(135deg,#6c63ff,#4c46cc)",
      delay: "0s",
    },
    {
      label: "Active",
      value: borrows.filter((b) => b.status === "borrowed").length,
      bg: "linear-gradient(135deg,#00b4d8,#0077b6)",
      delay: "0.07s",
    },
    {
      label: "Overdue",
      value: borrows.filter((b) => b.status === "overdue").length,
      bg: "linear-gradient(135deg,#fc8149,#e63946)",
      delay: "0.14s",
    },
    {
      label: "Total Spent",
      value: `$${total.toFixed(2)}`,
      bg: "linear-gradient(135deg,#f4a261,#e76f51)",
      delay: "0.21s",
    },
  ];

  const filterPills = [
    { key: "all", label: `All (${borrows.length})` },
    {
      key: "borrowed",
      label: `Active (${borrows.filter((b) => b.status === "borrowed").length})`,
    },
    {
      key: "overdue",
      label: `Overdue (${borrows.filter((b) => b.status === "overdue").length})`,
    },
    {
      key: "returned",
      label: `Returned (${borrows.filter((b) => b.status === "returned").length})`,
    },
  ];

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="warning" />
      </div>
    );

  return (
    <div className="borrows-page">
      {/* ── Page Banner ── */}
      <div className="page-banner">
        <Container>
          <span className="page-banner-icon">📖</span>
          <h1 className="page-banner-title">Borrow History</h1>
          <p className="page-banner-sub">
            Track all your book rentals in one place
          </p>
        </Container>
      </div>

      <Container className="py-4">
        {/* ── Mini stats ── */}
        <Row className="g-3 mb-4">
          {miniStats.map((s, i) => (
            <Col xs={6} md={3} key={i}>
              <div
                className="borrow-stat-mini"
                style={{ background: s.bg, animationDelay: s.delay }}
              >
                <div className="borrow-stat-num">{s.value}</div>
                <div className="borrow-stat-lbl">{s.label}</div>
              </div>
            </Col>
          ))}
        </Row>

        {/* ── Filter pills ── */}
        <div className="filter-pill-row mb-4">
          {filterPills.map((fp) => (
            <button
              key={fp.key}
              className={`filter-pill${filter === fp.key ? " active" : ""}`}
              onClick={() => setFilter(fp.key)}
            >
              {fp.label}
            </button>
          ))}
        </div>

        {/* ── Borrow cards ── */}
        {filtered.length === 0 ? (
          <div
            className="text-center py-5"
            style={{
              background: "white",
              borderRadius: 20,
              boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
            }}
          >
            <p style={{ fontSize: "3rem" }}>📚</p>
            <h4 className="text-muted">
              {filter === "all" ? "No borrows yet" : `No ${filter} books`}
            </h4>
            {filter === "all" && (
              <Link
                to="/"
                className="btn btn-warning fw-bold px-4 mt-2"
                style={{ borderRadius: 12 }}
              >
                Browse Books
              </Link>
            )}
          </div>
        ) : (
          <Row className="g-3">
            {filtered.map((borrow, idx) => {
              const book = getBook(borrow.bookId);
              const cfg = statusCfg[borrow.status] || {
                cls: "bstatus-borrowed",
                label: borrow.status,
                bc: "#6c63ff",
              };
              const isActive =
                borrow.status === "borrowed" || borrow.status === "overdue";
              return (
                <Col xs={12} md={6} key={borrow.id}>
                  <div
                    className="borrow-card p-3"
                    style={{ "--bc": cfg.bc, animationDelay: `${idx * 0.06}s` }}
                  >
                    <div className="d-flex gap-3">
                      {book && (
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="borrow-cover"
                          onError={(e) => {
                            e.target.src = `https://placehold.co/62x88/2c3e50/white?text=Book`;
                          }}
                        />
                      )}
                      <div className="flex-grow-1 min-width-0">
                        <div className="d-flex justify-content-between align-items-start mb-1 gap-2">
                          <h6
                            className="fw-bold mb-0"
                            style={{
                              fontSize: "0.92rem",
                              lineHeight: 1.3,
                              flex: 1,
                            }}
                          >
                            <Link
                              to={`/books/${borrow.bookId}`}
                              className="text-dark text-decoration-none"
                            >
                              {book?.title || `Book #${borrow.bookId}`}
                            </Link>
                          </h6>
                          <span className={`borrow-status-pill ${cfg.cls}`}>
                            {cfg.label}
                          </span>
                        </div>
                        {book?.author && (
                          <p
                            className="text-muted mb-2"
                            style={{ fontSize: "0.78rem" }}
                          >
                            {book.author}
                          </p>
                        )}

                        <div className="d-flex flex-wrap gap-2 mb-2">
                          <span className="borrow-date-chip">
                            📅 {borrow.borrowDate}
                          </span>
                          <span
                            className={`borrow-date-chip${borrow.status === "overdue" ? " overdue" : ""}`}
                          >
                            ⏰ Due {borrow.dueDate}
                          </span>
                          {borrow.returnDate && (
                            <span className="borrow-date-chip">
                              ✅ {borrow.returnDate}
                            </span>
                          )}
                          <span className="borrow-date-chip">
                            📆 {borrow.days}d
                          </span>
                        </div>

                        <div className="d-flex align-items-center justify-content-between">
                          <span
                            style={{ fontSize: "0.82rem", color: "#6b7280" }}
                          >
                            Total:{" "}
                            <strong style={{ color: "#e0a800" }}>
                              ${borrow.totalPrice}
                            </strong>
                          </span>
                          {isActive && (
                            <button
                              className="return-book-btn"
                              onClick={() => handleReturn(borrow)}
                              disabled={returning === borrow.id}
                            >
                              {returning === borrow.id ? (
                                <Spinner size="sm" />
                              ) : (
                                "📦 Return"
                              )}
                            </button>
                          )}
                        </div>
                      </div>
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

export default BorrowHistory;
