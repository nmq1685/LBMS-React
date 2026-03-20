import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { categoriesAPI } from '../../services/api';

const emptyCat = { name: '', description: '', icon: '📖', color: '#6c63ff' };

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editCat, setEditCat] = useState(null);
    const [formData, setFormData] = useState(emptyCat);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await categoriesAPI.getAll();
            setCategories(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const openAdd = () => { setEditCat(null); setFormData(emptyCat); setError(''); setShowModal(true); };
    const openEdit = (cat) => { setEditCat(cat); setFormData({ ...cat }); setError(''); setShowModal(true); };
    const openDelete = (cat) => { setDeleteTarget(cat); setShowDeleteModal(true); };

    const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) { setError('Name is required.'); return; }
        setSaving(true);
        setError('');
        try {
            if (editCat) {
                await categoriesAPI.update(editCat.id, formData);
                toast.success('Category updated!');
            } else {
                await categoriesAPI.create(formData);
                toast.success('Category added!');
            }
            await fetchData();
            setShowModal(false);
        } catch (e) {
            setError('Failed to save category.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await categoriesAPI.delete(deleteTarget.id);
            toast.success('Category deleted!');
            await fetchData();
            setShowDeleteModal(false);
        } catch (e) {
            toast.error('Failed to delete category.');
        }
    };

    const presetIcons = ['📖', '🔬', '💻', '🏛️', '🧙', '❤️', '🔍', '👤', '🌟', '🤔', '🎭', '🌍', '🏆', '🎵', '🍳'];

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">🏷️ Manage Categories</h2>
                <Button variant="warning" onClick={openAdd}>+ Add Category</Button>
            </div>

            {loading ? (
                <div className="text-center py-5"><Spinner animation="border" variant="warning" /></div>
            ) : (
                <Row className="g-3">
                    {/* Category cards */}
                    {categories.map(cat => (
                        <Col xs={12} sm={6} md={4} key={cat.id}>
                            <Card className="h-100 shadow-sm border-0">
                                <Card.Body className="p-3">
                                    <div className="d-flex align-items-center gap-3 mb-2">
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center"
                                            style={{ width: 48, height: 48, backgroundColor: cat.color + '22', fontSize: '1.5rem' }}
                                        >
                                            {cat.icon}
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-0">{cat.name}</h6>
                                            <span className="badge" style={{ backgroundColor: cat.color, fontSize: '0.65rem' }}>
                                                #{cat.id}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-muted small mb-3" style={{ minHeight: 36 }}>{cat.description}</p>
                                    <div className="d-flex gap-2">
                                        <Button size="sm" variant="outline-primary" className="flex-grow-1" onClick={() => openEdit(cat)}>✏️ Edit</Button>
                                        <Button size="sm" variant="outline-danger" onClick={() => openDelete(cat)}>🗑️</Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Table view */}
            {!loading && (
                <div className="mt-5">
                    <h5 className="mb-3">📋 All Categories</h5>
                    <Table hover className="align-middle shadow-sm">
                        <thead className="table-dark">
                            <tr>
                                <th>#</th>
                                <th>Icon</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Color</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(cat => (
                                <tr key={cat.id}>
                                    <td>{cat.id}</td>
                                    <td style={{ fontSize: '1.4rem' }}>{cat.icon}</td>
                                    <td className="fw-semibold">{cat.name}</td>
                                    <td className="small text-muted">{cat.description}</td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <div style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: cat.color }} />
                                            <code style={{ fontSize: '0.75rem' }}>{cat.color}</code>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex gap-1">
                                            <Button size="sm" variant="outline-primary" onClick={() => openEdit(cat)}>✏️</Button>
                                            <Button size="sm" variant="outline-danger" onClick={() => openDelete(cat)}>🗑️</Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className="bg-dark text-white">
                    <Modal.Title>{editCat ? '✏️ Edit Category' : '+ Add Category'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
                    <Form onSubmit={handleSave}>
                        <Form.Group className="mb-3">
                            <Form.Label>Category Name <span className="text-danger">*</span></Form.Label>
                            <Form.Control name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Science Fiction" />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" rows={2} name="description" value={formData.description} onChange={handleChange} placeholder="Brief description..." />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Icon</Form.Label>
                            <div className="d-flex flex-wrap gap-1 mb-2">
                                {presetIcons.map(ic => (
                                    <Button
                                        key={ic} type="button" size="sm"
                                        variant={formData.icon === ic ? 'warning' : 'outline-secondary'}
                                        style={{ fontSize: '1.2rem', padding: '2px 8px' }}
                                        onClick={() => setFormData(prev => ({ ...prev, icon: ic }))}
                                    >
                                        {ic}
                                    </Button>
                                ))}
                            </div>
                            <Form.Control name="icon" value={formData.icon} onChange={handleChange} placeholder="Or type custom emoji" />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Color</Form.Label>
                            <div className="d-flex align-items-center gap-3">
                                <Form.Control type="color" name="color" value={formData.color} onChange={handleChange} style={{ width: 60, height: 40 }} />
                                <Form.Control name="color" value={formData.color} onChange={handleChange} placeholder="#6c63ff" style={{ maxWidth: 140 }} />
                                <div className="d-flex gap-1">
                                    {['#6c63ff', '#00b4d8', '#06d6a0', '#f4a261', '#9b5de5', '#f72585', '#560bad', '#fb8500'].map(c => (
                                        <div key={c} style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: c, cursor: 'pointer', border: formData.color === c ? '3px solid #333' : '2px solid transparent' }}
                                            onClick={() => setFormData(prev => ({ ...prev, color: c }))} />
                                    ))}
                                </div>
                            </div>
                        </Form.Group>

                        <div className="d-flex gap-2 justify-content-end">
                            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button variant="warning" type="submit" disabled={saving}>
                                {saving ? <Spinner size="sm" /> : (editCat ? 'Save Changes' : 'Add Category')}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Delete Confirm */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Delete category <strong>"{deleteTarget?.name}"</strong>?</p>
                    <p className="text-danger small">Books in this category will lose their category reference.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size="sm" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ManageCategories;
