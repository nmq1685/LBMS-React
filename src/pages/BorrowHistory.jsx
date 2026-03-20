import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { borrowsAPI, booksAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const statusConfig = {
    borrowed: { variant: 'primary', label: '📖 Borrowed' },
    returned: { variant: 'success', label: '✅ Returned' },
    overdue: { variant: 'danger', label: '⚠️ Overdue' },
};

const BorrowHistory = () => {
    const { user } = useAuth();
    const [borrows, setBorrows] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [returning, setReturning] = useState(null);

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        try {
            const [borrowsRes, booksRes] = await Promise.all([
                borrowsAPI.getByUser(user.id),
                booksAPI.getAll(),
            ]);
            setBorrows(borrowsRes.data.sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate)));
            setBooks(booksRes.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [user.id]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const getBook = (id) => books.find(b => b.id === id);

    const handleReturn = async (borrow) => {
        setReturning(borrow.id);
        try {
            const today = new Date().toISOString().split('T')[0];
            await borrowsAPI.update(borrow.id, { ...borrow, status: 'returned', returnDate: today });
            // Return stock
            const book = getBook(borrow.bookId);
            if (book) {
                await booksAPI.update(book.id, { ...book, stock: book.stock + 1 });
            }
            await fetchData();
            toast.success('Book returned successfully!');
        } catch (e) {
            toast.error('Failed to return book.');
        } finally {
            setReturning(null);
        }
    };

    const filtered = filter === 'all' ? borrows : borrows.filter(b => b.status === filter);
    const total = borrows.reduce((s, b) => s + (b.totalPrice || 0), 0);

    if (loading) return (
        <Container className="py-5 text-center"><Spinner animation="border" variant="warning" /></Container>
    );

    return (
        <Container className="py-5">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                <h2 className="fw-bold mb-0">📖 Borrow History</h2>
                <div className="d-flex align-items-center gap-2">
                    <span className="text-muted small">Filter:</span>
                    <Form.Select value={filter} onChange={e => setFilter(e.target.value)} size="sm" style={{ width: 'auto' }}>
                        <option value="all">All ({borrows.length})</option>
                        <option value="borrowed">Borrowed ({borrows.filter(b => b.status === 'borrowed').length})</option>
                        <option value="overdue">Overdue ({borrows.filter(b => b.status === 'overdue').length})</option>
                        <option value="returned">Returned ({borrows.filter(b => b.status === 'returned').length})</option>
                    </Form.Select>
                </div>
            </div>

            {/* Summary */}
            <Row className="g-3 mb-4">
                {[
                    { label: 'Total Borrows', value: borrows.length, color: '#6c63ff' },
                    { label: 'Active', value: borrows.filter(b => b.status === 'borrowed').length, color: '#00b4d8' },
                    { label: 'Overdue', value: borrows.filter(b => b.status === 'overdue').length, color: '#e74c3c' },
                    { label: 'Total Spent', value: `$${total.toFixed(2)}`, color: '#f4a261' },
                ].map((s, i) => (
                    <Col xs={6} md={3} key={i}>
                        <div className="text-center p-3 rounded bg-light">
                            <div className="fw-bold fs-5" style={{ color: s.color }}>{s.value}</div>
                            <div className="text-muted small">{s.label}</div>
                        </div>
                    </Col>
                ))}
            </Row>

            {filtered.length === 0 ? (
                <div className="text-center py-5">
                    <p className="fs-1">📚</p>
                    <h4 className="text-muted">{filter === 'all' ? 'No borrows yet' : `No ${filter} books`}</h4>
                    {filter === 'all' && (
                        <Button as={Link} to="/" variant="warning" className="mt-2">Browse Books</Button>
                    )}
                </div>
            ) : (
                <Row className="g-3">
                    {filtered.map(borrow => {
                        const book = getBook(borrow.bookId);
                        const cfg = statusConfig[borrow.status] || { variant: 'secondary', label: borrow.status };
                        const isActive = borrow.status === 'borrowed' || borrow.status === 'overdue';
                        return (
                            <Col xs={12} md={6} key={borrow.id}>
                                <Card className="shadow-sm border-0 h-100">
                                    <Card.Body className="p-3">
                                        <div className="d-flex gap-3">
                                            {book && (
                                                <img
                                                    src={book.cover} alt={book.title}
                                                    style={{ width: 60, height: 85, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                                                    onError={e => { e.target.src = `https://placehold.co/60x85/2c3e50/white?text=Book`; }}
                                                />
                                            )}
                                            <div className="flex-grow-1">
                                                <div className="d-flex justify-content-between align-items-start mb-1">
                                                    <h6 className="fw-bold mb-0 me-2" style={{ fontSize: '0.9rem' }}>
                                                        <Link to={`/books/${borrow.bookId}`} className="text-dark text-decoration-none">
                                                            {book?.title || `Book #${borrow.bookId}`}
                                                        </Link>
                                                    </h6>
                                                    <Badge bg={cfg.variant}>{cfg.label}</Badge>
                                                </div>
                                                <p className="text-muted small mb-2">{book?.author}</p>
                                                <div className="row g-2 small text-muted">
                                                    <div className="col-6">📅 Borrowed: <strong>{borrow.borrowDate}</strong></div>
                                                    <div className="col-6">⏰ Due: <strong className={borrow.status === 'overdue' ? 'text-danger' : ''}>{borrow.dueDate}</strong></div>
                                                    {borrow.returnDate && <div className="col-6">✅ Returned: <strong>{borrow.returnDate}</strong></div>}
                                                    <div className="col-6">📆 {borrow.days} days</div>
                                                    <div className="col-12">💰 Total: <strong className="text-warning">${borrow.totalPrice}</strong></div>
                                                </div>
                                            </div>
                                        </div>
                                        {isActive && (
                                            <div className="mt-3 pt-2 border-top">
                                                <Button
                                                    variant="outline-success" size="sm"
                                                    onClick={() => handleReturn(borrow)}
                                                    disabled={returning === borrow.id}
                                                >
                                                    {returning === borrow.id ? <Spinner size="sm" /> : '📦 Return Book'}
                                                </Button>
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}
        </Container>
    );
};

export default BorrowHistory;
