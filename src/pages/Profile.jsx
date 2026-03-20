import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { usersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        fullName: user.fullName || '',
        username: user.username || '',
        phone: user.phone || '',
        address: user.address || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPwModal, setShowPwModal] = useState(false);
    const [pwData, setPwData] = useState({ current: '', next: '', confirm: '' });
    const [pwLoading, setPwLoading] = useState(false);
    const [pwError, setPwError] = useState('');

    const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.fullName.trim() || !formData.username.trim()) {
            setError('Full name and username are required.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await updateUser(user.id, formData);
            toast.success('Profile updated successfully!');
        } catch (err) {
            setError('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPwError('');
        if (!pwData.current || !pwData.next || !pwData.confirm) { setPwError('All fields required.'); return; }
        if (pwData.next.length < 6) { setPwError('New password must be at least 6 characters.'); return; }
        if (pwData.next !== pwData.confirm) { setPwError('Passwords do not match.'); return; }
        setPwLoading(true);
        try {
            const { data: currentUser } = await usersAPI.getById(user.id);
            if (currentUser.password !== pwData.current) throw new Error('Current password is incorrect.');
            await updateUser(user.id, { password: pwData.next });
            await usersAPI.update(user.id, { ...currentUser, password: pwData.next });
            toast.success('Password changed successfully!');
            setShowPwModal(false);
            setPwData({ current: '', next: '', confirm: '' });
        } catch (err) {
            setPwError(err.message || 'Failed to change password.');
        } finally {
            setPwLoading(false);
        }
    };

    return (
        <Container className="py-5" style={{ maxWidth: 800 }}>
            <h2 className="fw-bold mb-4">👤 My Profile</h2>

            <Row className="g-4">
                <Col md={4}>
                    <Card className="text-center border-0 shadow-sm">
                        <Card.Body className="p-4">
                            <img
                                src={user.avatar}
                                alt={user.fullName}
                                className="rounded-circle mb-3"
                                width="100"
                                height="100"
                            />
                            <h5 className="fw-bold">{user.fullName}</h5>
                            <p className="text-muted small mb-1">{user.email}</p>
                            <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                                {user.role === 'admin' ? '⚙️ Admin' : '👤 Member'}
                            </span>
                            <p className="text-muted small mt-2 mb-0">Member since {user.createdAt}</p>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={8}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="p-4">
                            <h5 className="mb-3">Edit Information</h5>
                            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
                            <Form onSubmit={handleSave}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Full Name</Form.Label>
                                            <Form.Control name="fullName" value={formData.fullName} onChange={handleChange} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Username</Form.Label>
                                            <Form.Control name="username" value={formData.username} onChange={handleChange} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email (cannot change)</Form.Label>
                                    <Form.Control value={user.email} disabled className="bg-light" />
                                </Form.Group>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Phone</Form.Label>
                                            <Form.Control name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone number" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Address</Form.Label>
                                            <Form.Control name="address" value={formData.address} onChange={handleChange} placeholder="Address" />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <div className="d-flex gap-2">
                                    <Button type="submit" variant="warning" disabled={loading}>
                                        {loading ? <Spinner size="sm" /> : 'Save Changes'}
                                    </Button>
                                    <Button variant="outline-secondary" type="button" onClick={() => setShowPwModal(true)}>
                                        🔑 Change Password
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Change Password Modal */}
            <Modal show={showPwModal} onHide={() => setShowPwModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>🔑 Change Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {pwError && <Alert variant="danger" onClose={() => setPwError('')} dismissible>{pwError}</Alert>}
                    <Form onSubmit={handleChangePassword}>
                        <Form.Group className="mb-3">
                            <Form.Label>Current Password</Form.Label>
                            <Form.Control
                                type="password" value={pwData.current}
                                onChange={e => setPwData(p => ({ ...p, current: e.target.value }))}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>New Password</Form.Label>
                            <Form.Control
                                type="password" value={pwData.next}
                                onChange={e => setPwData(p => ({ ...p, next: e.target.value }))}
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label>Confirm New Password</Form.Label>
                            <Form.Control
                                type="password" value={pwData.confirm}
                                onChange={e => setPwData(p => ({ ...p, confirm: e.target.value }))}
                            />
                        </Form.Group>
                        <Button type="submit" variant="warning" className="w-100" disabled={pwLoading}>
                            {pwLoading ? <Spinner size="sm" /> : 'Update Password'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default Profile;
