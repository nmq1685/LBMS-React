import React, { useState } from 'react';
import { Container, Row, Col, Alert, Spinner, Modal } from 'react-bootstrap';
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
        <div className="profile-page">
            {/* ── Page Banner ── */}
            <div className="page-banner">
                <Container>
                    <span className="page-banner-icon">👤</span>
                    <h1 className="page-banner-title">My Profile</h1>
                    <p className="page-banner-sub">Manage your account settings and information</p>
                </Container>
            </div>

            <Container className="py-4" style={{ maxWidth: 860 }}>
                <Row className="g-4">
                    {/* ── Left: Avatar card ── */}
                    <Col md={4}>
                        <div className="profile-top-card">
                            <div className="profile-banner-bg"></div>
                            <div className="p-3 text-center">
                                <div className="profile-avatar-ring mx-auto">
                                    <img src={user.avatar} alt={user.fullName} className="profile-avatar-img" />
                                </div>
                                <div className="profile-role-chip">
                                    {user.role === 'admin' ? '⚙️ Admin' : '👤 Member'}
                                </div>
                                <h5 className="fw-bold mt-3 mb-0">{user.fullName}</h5>
                                <p className="text-muted small mb-3">{user.email}</p>
                                <p className="text-muted" style={{ fontSize: '0.78rem' }}>
                                    Member since {user.createdAt}
                                </p>

                                {/* Quick stats */}
                                <div className="d-flex gap-2 justify-content-center mt-3">
                                    <div className="profile-stat-item flex-fill">
                                        <div className="profile-stat-val">0</div>
                                        <div className="profile-stat-lbl">Borrows</div>
                                    </div>
                                    <div className="profile-stat-item flex-fill">
                                        <div className="profile-stat-val text-warning">★</div>
                                        <div className="profile-stat-lbl">Member</div>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-outline-secondary w-100 mt-3"
                                    style={{ borderRadius: 10, fontSize: '0.85rem', fontWeight: 600 }}
                                    onClick={() => setShowPwModal(true)}
                                >
                                    🔑 Change Password
                                </button>
                            </div>
                        </div>
                    </Col>

                    {/* ── Right: Edit form ── */}
                    <Col md={8}>
                        <div className="profile-form-card p-4">
                            <h5 className="fw-bold mb-1" style={{ fontSize: '1.1rem' }}>Edit Information</h5>
                            <p className="text-muted small mb-4">Update your personal details below</p>

                            {error && (
                                <Alert variant="danger" onClose={() => setError('')} dismissible style={{ borderRadius: 10 }}>
                                    {error}
                                </Alert>
                            )}

                            <form onSubmit={handleSave}>
                                <Row className="g-3">
                                    <Col md={6}>
                                        <label className="profile-field-label">Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                                        <input name="fullName" className="profile-field-input" value={formData.fullName} onChange={handleChange} placeholder="Your full name" />
                                    </Col>
                                    <Col md={6}>
                                        <label className="profile-field-label">Username <span style={{ color: '#ef4444' }}>*</span></label>
                                        <input name="username" className="profile-field-input" value={formData.username} onChange={handleChange} placeholder="username" />
                                    </Col>
                                    <Col xs={12}>
                                        <label className="profile-field-label">Email</label>
                                        <input className="profile-field-input" value={user.email} disabled />
                                    </Col>
                                    <Col md={6}>
                                        <label className="profile-field-label">Phone</label>
                                        <input name="phone" className="profile-field-input" value={formData.phone} onChange={handleChange} placeholder="e.g. +84 123 456 789" />
                                    </Col>
                                    <Col md={6}>
                                        <label className="profile-field-label">Address</label>
                                        <input name="address" className="profile-field-input" value={formData.address} onChange={handleChange} placeholder="Your address" />
                                    </Col>
                                </Row>

                                <div className="mt-4">
                                    <button type="submit" className="profile-save-btn" disabled={loading}>
                                        {loading ? <Spinner size="sm" /> : '💾 Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* ── Change Password Modal ── */}
            <Modal show={showPwModal} onHide={() => setShowPwModal(false)} centered>
                <Modal.Header closeButton style={{ border: 'none', paddingBottom: 0 }}>
                    <Modal.Title style={{ fontWeight: 800, fontSize: '1.15rem' }}>🔑 Change Password</Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4 pb-4">
                    {pwError && (
                        <Alert variant="danger" onClose={() => setPwError('')} dismissible style={{ borderRadius: 10, fontSize: '0.88rem' }}>
                            {pwError}
                        </Alert>
                    )}
                    <form onSubmit={handleChangePassword}>
                        <div className="mb-3">
                            <label className="profile-field-label">Current Password</label>
                            <input type="password" className="pw-modal-input" value={pwData.current} onChange={e => setPwData(p => ({ ...p, current: e.target.value }))} />
                        </div>
                        <div className="mb-3">
                            <label className="profile-field-label">New Password</label>
                            <input type="password" className="pw-modal-input" value={pwData.next} onChange={e => setPwData(p => ({ ...p, next: e.target.value }))} />
                        </div>
                        <div className="mb-4">
                            <label className="profile-field-label">Confirm New Password</label>
                            <input type="password" className="pw-modal-input" value={pwData.confirm} onChange={e => setPwData(p => ({ ...p, confirm: e.target.value }))} />
                        </div>
                        <button type="submit" className="profile-save-btn w-100" disabled={pwLoading}
                            style={{ justifyContent: 'center' }}>
                            {pwLoading ? <Spinner size="sm" /> : '🔒 Update Password'}
                        </button>
                    </form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Profile;


