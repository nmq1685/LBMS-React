import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Badge, Spinner, Alert, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { usersAPI, borrowsAPI } from '../../services/api';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [borrows, setBorrows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showBorrowsModal, setShowBorrowsModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({ role: 'user', fullName: '', phone: '', address: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, borrowsRes] = await Promise.all([usersAPI.getAll(), borrowsAPI.getAll()]);
            setUsers(usersRes.data);
            setBorrows(borrowsRes.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const getUserBorrows = (userId) => borrows.filter(b => b.userId === userId);

    const openEdit = (user) => {
        setSelectedUser(user);
        setFormData({ role: user.role, fullName: user.fullName || '', phone: user.phone || '', address: user.address || '' });
        setError('');
        setShowEditModal(true);
    };

    const openBorrows = (user) => { setSelectedUser(user); setShowBorrowsModal(true); };
    const openDelete = (user) => { setSelectedUser(user); setShowDeleteModal(true); };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.fullName.trim()) { setError('Full name is required.'); return; }
        setSaving(true);
        setError('');
        try {
            const { data: current } = await usersAPI.getById(selectedUser.id);
            await usersAPI.update(selectedUser.id, { ...current, ...formData });
            toast.success('User updated!');
            await fetchData();
            setShowEditModal(false);
        } catch (e) {
            setError('Failed to update user.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await usersAPI.delete(selectedUser.id);
            toast.success('User deleted!');
            await fetchData();
            setShowDeleteModal(false);
        } catch (e) {
            toast.error('Failed to delete user.');
        }
    };

    const filteredUsers = users.filter(u =>
        !search ||
        u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.username?.toLowerCase().includes(search.toLowerCase())
    );

    const statusColor = { borrowed: 'primary', returned: 'success', overdue: 'danger' };

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">👥 Manage Users</h2>
                <span className="text-muted">{users.length} total users</span>
            </div>

            <div className="mb-3">
                <InputGroup style={{ maxWidth: 400 }}>
                    <InputGroup.Text>🔍</InputGroup.Text>
                    <Form.Control placeholder="Search by name, email or username..." value={search} onChange={e => setSearch(e.target.value)} />
                </InputGroup>
            </div>

            {loading ? (
                <div className="text-center py-5"><Spinner animation="border" variant="warning" /></div>
            ) : (
                <div className="table-responsive">
                    <Table hover className="align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th>Avatar</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Borrows</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => {
                                const userBorrows = getUserBorrows(user.id);
                                return (
                                    <tr key={user.id}>
                                        <td>
                                            <img src={user.avatar} alt="" width="36" height="36"
                                                className="rounded-circle"
                                                onError={e => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`; }} />
                                        </td>
                                        <td className="fw-semibold">{user.fullName}</td>
                                        <td className="small text-muted">{user.email}</td>
                                        <td className="small">@{user.username}</td>
                                        <td>
                                            <Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>
                                                {user.role === 'admin' ? '⚙️ Admin' : '👤 User'}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Button
                                                variant="link" size="sm" className="p-0 text-decoration-none"
                                                onClick={() => openBorrows(user)}
                                            >
                                                {userBorrows.length} borrow{userBorrows.length !== 1 ? 's' : ''}
                                            </Button>
                                        </td>
                                        <td className="small text-muted">{user.createdAt}</td>
                                        <td>
                                            <div className="d-flex gap-1">
                                                <Button size="sm" variant="outline-primary" onClick={() => openEdit(user)}>✏️</Button>
                                                <Button size="sm" variant="outline-danger" onClick={() => openDelete(user)}
                                                    disabled={user.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1}>
                                                    🗑️
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </div>
            )}

            {/* Edit Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <Modal.Header closeButton className="bg-dark text-white">
                    <Modal.Title>✏️ Edit User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
                    {selectedUser && (
                        <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded">
                            <img src={selectedUser.avatar} alt="" className="rounded-circle" width="48" height="48" />
                            <div>
                                <div className="fw-bold">{selectedUser.fullName}</div>
                                <div className="text-muted small">{selectedUser.email}</div>
                            </div>
                        </div>
                    )}
                    <Form onSubmit={handleSave}>
                        <Form.Group className="mb-3">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control value={formData.fullName} onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Role</Form.Label>
                            <Form.Select value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}>
                                <option value="user">👤 User</option>
                                <option value="admin">⚙️ Admin</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Phone</Form.Label>
                            <Form.Control value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label>Address</Form.Label>
                            <Form.Control as="textarea" rows={2} value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} />
                        </Form.Group>
                        <div className="d-flex gap-2 justify-content-end">
                            <Button variant="secondary" type="button" onClick={() => setShowEditModal(false)}>Cancel</Button>
                            <Button variant="warning" type="submit" disabled={saving}>
                                {saving ? <Spinner size="sm" /> : 'Save Changes'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* User Borrows Modal */}
            <Modal show={showBorrowsModal} onHide={() => setShowBorrowsModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>📖 Borrows — {selectedUser?.fullName}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedUser && (() => {
                        const userBorrows = getUserBorrows(selectedUser.id);
                        if (userBorrows.length === 0) return <p className="text-muted text-center py-3">No borrow history.</p>;
                        return (
                            <Table size="sm" hover>
                                <thead className="table-light">
                                    <tr><th>#</th><th>Book ID</th><th>Borrow</th><th>Due</th><th>Days</th><th>Total</th><th>Status</th></tr>
                                </thead>
                                <tbody>
                                    {userBorrows.map(b => (
                                        <tr key={b.id}>
                                            <td>{b.id}</td>
                                            <td>#{b.bookId}</td>
                                            <td>{b.borrowDate}</td>
                                            <td>{b.dueDate}</td>
                                            <td>{b.days}d</td>
                                            <td className="text-warning fw-semibold">${b.totalPrice}</td>
                                            <td><Badge bg={statusColor[b.status] || 'secondary'} className="text-capitalize">{b.status}</Badge></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        );
                    })()}
                </Modal.Body>
            </Modal>

            {/* Delete Confirm */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
                <Modal.Header closeButton><Modal.Title>Confirm Delete</Modal.Title></Modal.Header>
                <Modal.Body>
                    <p>Delete user <strong>{selectedUser?.fullName}</strong>?</p>
                    <p className="text-danger small">This will permanently remove the user account.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size="sm" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ManageUsers;
