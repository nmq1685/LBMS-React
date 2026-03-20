import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Spinner, Alert, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { booksAPI, categoriesAPI } from '../../services/api';

const emptyBook = {
    title: '', author: '', categoryId: '', cover: '', description: '',
    rentalPrice: '', stock: '', rating: '', pages: '', publisher: '',
    publishYear: '', language: 'English', isbn: '', featured: false,
};

const ManageBooks = () => {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editBook, setEditBook] = useState(null);
    const [formData, setFormData] = useState(emptyBook);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('all');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [booksRes, catsRes] = await Promise.all([booksAPI.getAll(), categoriesAPI.getAll()]);
            setBooks(booksRes.data);
            setCategories(catsRes.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const getCat = (id) => categories.find(c => c.id === id);

    const openAdd = () => { setEditBook(null); setFormData(emptyBook); setError(''); setShowModal(true); };
    const openEdit = (book) => {
        setEditBook(book);
        setFormData({ ...book, categoryId: String(book.categoryId), rentalPrice: String(book.rentalPrice) });
        setError('');
        setShowModal(true);
    };
    const openDelete = (book) => { setDeleteTarget(book); setShowDeleteModal(true); };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const validate = () => {
        if (!formData.title.trim()) return 'Title is required.';
        if (!formData.author.trim()) return 'Author is required.';
        if (!formData.categoryId) return 'Category is required.';
        if (!formData.rentalPrice || isNaN(formData.rentalPrice) || parseFloat(formData.rentalPrice) <= 0) return 'Valid rental price required.';
        if (!formData.stock || isNaN(formData.stock) || parseInt(formData.stock) < 0) return 'Valid stock quantity required.';
        return null;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const err = validate();
        if (err) { setError(err); return; }
        setSaving(true);
        setError('');
        try {
            const payload = {
                ...formData,
                categoryId: parseInt(formData.categoryId),
                rentalPrice: parseFloat(formData.rentalPrice),
                stock: parseInt(formData.stock),
                pages: parseInt(formData.pages) || 0,
                publishYear: parseInt(formData.publishYear) || 0,
                rating: parseFloat(formData.rating) || 0,
            };
            if (editBook) {
                await booksAPI.update(editBook.id, payload);
                toast.success('Book updated!');
            } else {
                await booksAPI.create(payload);
                toast.success('Book added!');
            }
            await fetchData();
            setShowModal(false);
        } catch (e) {
            setError('Failed to save book.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await booksAPI.delete(deleteTarget.id);
            toast.success('Book deleted!');
            await fetchData();
            setShowDeleteModal(false);
        } catch (e) {
            toast.error('Failed to delete book.');
        }
    };

    const filtered = books.filter(b => {
        const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
        const matchCat = filterCat === 'all' || b.categoryId === parseInt(filterCat);
        return matchSearch && matchCat;
    });

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">📚 Manage Books</h2>
                <Button variant="warning" onClick={openAdd}>+ Add Book</Button>
            </div>

            <Card className="shadow-sm border-0 mb-4">
                <Card.Body>
                    <Row className="g-2">
                        <Col md={6}>
                            <InputGroup>
                                <InputGroup.Text>🔍</InputGroup.Text>
                                <Form.Control placeholder="Search by title or author..." value={search} onChange={e => setSearch(e.target.value)} />
                            </InputGroup>
                        </Col>
                        <Col md={4}>
                            <Form.Select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                                <option value="all">All Categories</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                            </Form.Select>
                        </Col>
                        <Col md={2} className="text-muted d-flex align-items-center">
                            {filtered.length} books
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {loading ? (
                <div className="text-center py-5"><Spinner animation="border" variant="warning" /></div>
            ) : (
                <div className="table-responsive">
                    <Table hover className="align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th style={{ width: 50 }}>Cover</th>
                                <th>Title</th>
                                <th>Author</th>
                                <th>Category</th>
                                <th>Price/Day</th>
                                <th>Stock</th>
                                <th>Rating</th>
                                <th style={{ width: 120 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(book => {
                                const cat = getCat(book.categoryId);
                                return (
                                    <tr key={book.id}>
                                        <td>
                                            <img src={book.cover} alt="" width="36" height="50"
                                                style={{ objectFit: 'cover', borderRadius: 4 }}
                                                onError={e => { e.target.src = `https://placehold.co/36x50/ccc/666?text=N/A`; }} />
                                        </td>
                                        <td>
                                            <div className="fw-semibold small">{book.title}</div>
                                            {book.featured && <Badge bg="warning" text="dark" style={{ fontSize: '0.65rem' }}>Featured</Badge>}
                                        </td>
                                        <td className="small text-muted">{book.author}</td>
                                        <td>
                                            {cat && (
                                                <Badge style={{ backgroundColor: cat.color, fontSize: '0.7rem' }}>{cat.icon} {cat.name}</Badge>
                                            )}
                                        </td>
                                        <td className="fw-semibold text-warning">${book.rentalPrice}</td>
                                        <td>
                                            <Badge bg={book.stock > 0 ? 'success' : 'danger'}>{book.stock}</Badge>
                                        </td>
                                        <td>
                                            <span className="text-warning">★</span> {book.rating}
                                        </td>
                                        <td>
                                            <div className="d-flex gap-1">
                                                <Button size="sm" variant="outline-primary" onClick={() => openEdit(book)}>✏️</Button>
                                                <Button size="sm" variant="outline-danger" onClick={() => openDelete(book)}>🗑️</Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-dark text-white">
                    <Modal.Title>{editBook ? '✏️ Edit Book' : '+ Add New Book'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
                    <Form onSubmit={handleSave}>
                        <Row className="g-3">
                            <Col md={8}>
                                <Form.Group>
                                    <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                                    <Form.Control name="title" value={formData.title} onChange={handleChange} placeholder="Book title" />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Category <span className="text-danger">*</span></Form.Label>
                                    <Form.Select name="categoryId" value={formData.categoryId} onChange={handleChange}>
                                        <option value="">Select category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={8}>
                                <Form.Group>
                                    <Form.Label>Author <span className="text-danger">*</span></Form.Label>
                                    <Form.Control name="author" value={formData.author} onChange={handleChange} placeholder="Author name(s)" />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>ISBN</Form.Label>
                                    <Form.Control name="isbn" value={formData.isbn} onChange={handleChange} placeholder="e.g. 9780439708180" />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Cover Image URL</Form.Label>
                                    <Form.Control name="cover" value={formData.cover} onChange={handleChange} placeholder="https://covers.openlibrary.org/b/isbn/..." />
                                    <Form.Text className="text-muted">
                                        Use: <code>https://covers.openlibrary.org/b/isbn/{'<ISBN>'}-L.jpg</code>
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Rental Price ($/day) <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="number" step="0.01" min="0" name="rentalPrice" value={formData.rentalPrice} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Stock <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="number" min="0" name="stock" value={formData.stock} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Rating (0–5)</Form.Label>
                                    <Form.Control type="number" step="0.1" min="0" max="5" name="rating" value={formData.rating} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Pages</Form.Label>
                                    <Form.Control type="number" min="0" name="pages" value={formData.pages} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Publisher</Form.Label>
                                    <Form.Control name="publisher" value={formData.publisher} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Publish Year</Form.Label>
                                    <Form.Control type="number" name="publishYear" value={formData.publishYear} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Language</Form.Label>
                                    <Form.Control name="language" value={formData.language} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Check
                                    type="checkbox" name="featured" checked={formData.featured} onChange={handleChange}
                                    label="⭐ Mark as Featured Book"
                                />
                            </Col>
                        </Row>
                        <div className="d-flex gap-2 justify-content-end mt-4">
                            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button variant="warning" type="submit" disabled={saving}>
                                {saving ? <Spinner size="sm" /> : (editBook ? 'Save Changes' : 'Add Book')}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Delete <strong>"{deleteTarget?.title}"</strong>?</p>
                    <p className="text-danger small">This action cannot be undone.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size="sm" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ManageBooks;
