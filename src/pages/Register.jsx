import React, { useState } from 'react';
import { Form, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: '', username: '', email: '', password: '', confirmPassword: '', phone: '', address: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPw, setShowPw] = useState(false);

    const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const validate = () => {
        if (!formData.fullName.trim()) return 'Full name is required.';
        if (!formData.username.trim()) return 'Username is required.';
        if (formData.username.length < 3) return 'Username must be at least 3 characters.';
        if (!formData.email.trim()) return 'Email is required.';
        if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Invalid email address.';
        if (!formData.password) return 'Password is required.';
        if (formData.password.length < 6) return 'Password must be at least 6 characters.';
        if (formData.password !== formData.confirmPassword) return 'Passwords do not match.';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const validationError = validate();
        if (validationError) { setError(validationError); return; }
        setLoading(true);
        try {
            const { confirmPassword: _, ...userData } = formData;
            await register(userData);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-split-page">
            {/* Left form panel */}
            <div className="auth-split-right">
                <div className="auth-form-wrapper auth-form-wrapper--wide">
                    <div className="auth-form-header">
                        <h3 className="auth-form-title">Create Account</h3>
                        <p className="auth-form-sub">Fill in your details to get started</p>
                    </div>

                    {error && (
                        <Alert variant="danger" onClose={() => setError('')} dismissible className="auth-alert">
                            {error}
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <div className="auth-field-row">
                            <Form.Group className="auth-field">
                                <label className="auth-label">Full Name <span className="auth-required">*</span></label>
                                <div className="auth-input-wrap">
                                    <span className="auth-input-icon">👤</span>
                                    <Form.Control
                                        name="fullName" value={formData.fullName} onChange={handleChange}
                                        placeholder="Your full name" className="auth-input"
                                    />
                                </div>
                            </Form.Group>
                            <Form.Group className="auth-field">
                                <label className="auth-label">Username <span className="auth-required">*</span></label>
                                <div className="auth-input-wrap">
                                    <span className="auth-input-icon">🏷️</span>
                                    <Form.Control
                                        name="username" value={formData.username} onChange={handleChange}
                                        placeholder="Choose a username" className="auth-input"
                                    />
                                </div>
                            </Form.Group>
                        </div>

                        <Form.Group className="auth-field">
                            <label className="auth-label">Email Address <span className="auth-required">*</span></label>
                            <div className="auth-input-wrap">
                                <span className="auth-input-icon">✉️</span>
                                <Form.Control
                                    type="email" name="email" value={formData.email} onChange={handleChange}
                                    placeholder="you@example.com" className="auth-input"
                                    autoComplete="email"
                                />
                            </div>
                        </Form.Group>

                        <div className="auth-field-row">
                            <Form.Group className="auth-field">
                                <label className="auth-label">Password <span className="auth-required">*</span></label>
                                <div className="auth-input-wrap">
                                    <span className="auth-input-icon">🔒</span>
                                    <Form.Control
                                        type={showPw ? 'text' : 'password'}
                                        name="password" value={formData.password} onChange={handleChange}
                                        placeholder="Min. 6 characters" className="auth-input auth-input-pw"
                                    />
                                    <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(s => !s)}>
                                        {showPw ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </Form.Group>
                            <Form.Group className="auth-field">
                                <label className="auth-label">Confirm Password <span className="auth-required">*</span></label>
                                <div className="auth-input-wrap">
                                    <span className="auth-input-icon">🔒</span>
                                    <Form.Control
                                        type="password" name="confirmPassword" value={formData.confirmPassword}
                                        onChange={handleChange} placeholder="Repeat password" className="auth-input"
                                    />
                                </div>
                            </Form.Group>
                        </div>

                        <div className="auth-field-row">
                            <Form.Group className="auth-field">
                                <label className="auth-label">Phone Number</label>
                                <div className="auth-input-wrap">
                                    <span className="auth-input-icon">📱</span>
                                    <Form.Control
                                        name="phone" value={formData.phone} onChange={handleChange}
                                        placeholder="e.g. 0912345678" className="auth-input"
                                    />
                                </div>
                            </Form.Group>
                            <Form.Group className="auth-field">
                                <label className="auth-label">Address</label>
                                <div className="auth-input-wrap">
                                    <span className="auth-input-icon">📍</span>
                                    <Form.Control
                                        name="address" value={formData.address} onChange={handleChange}
                                        placeholder="Your address" className="auth-input"
                                    />
                                </div>
                            </Form.Group>
                        </div>

                        <button type="submit" className="auth-submit-btn mt-1" disabled={loading}>
                            {loading ? <><Spinner size="sm" className="me-2" />Creating account...</> : 'Create Account →'}
                        </button>
                    </Form>

                    <p className="auth-switch-link mt-4">
                        Already have an account? <Link to="/login">Sign in here</Link>
                    </p>
                </div>
            </div>

            {/* Right decorative panel */}
            <div className="auth-split-left">
                <div className="auth-left-content">
                    <h2 className="auth-left-title">Join our community!</h2>
                    <p className="auth-left-sub">
                        Create a free account and get instant access to thousands of books, manage your reading, and connect with a world of knowledge.
                    </p>
                    <div className="auth-features">
                        <div className="auth-feature-item">
                            <span className="auth-feature-icon">🏛️</span>
                            <span>Access the full library</span>
                        </div>
                        <div className="auth-feature-item">
                            <span className="auth-feature-icon">🔖</span>
                            <span>Manage your reading list</span>
                        </div>
                        <div className="auth-feature-item">
                            <span className="auth-feature-icon">🚀</span>
                            <span>Get started in seconds</span>
                        </div>
                    </div>
                </div>
                <div className="auth-left-deco">❝</div>
            </div>
        </div>
    );
};

export default Register;
