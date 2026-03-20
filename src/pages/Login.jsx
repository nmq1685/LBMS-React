import React, { useState } from 'react';
import { Form, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPw, setShowPw] = useState(false);

    const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.email || !formData.password) { setError('Please fill in all fields.'); return; }
        setLoading(true);
        try {
            const user = await login(formData.email, formData.password);
            navigate(user.role === 'admin' ? '/admin' : from, { replace: true });
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fillDemo = (type) => {
        if (type === 'admin') setFormData({ email: 'admin@lbms.com', password: 'admin123' });
        else setFormData({ email: 'john@example.com', password: 'john123' });
    };

    return (
        <div className="auth-split-page">
            {/* Left decorative panel */}
            <div className="auth-split-left">
                <div className="auth-left-content">
                    <h2 className="auth-left-title">Welcome back!</h2>
                    <p className="auth-left-sub">
                        Sign in to access your personal library, manage your borrows, and discover thousands of new books.
                    </p>
                    <div className="auth-features">
                        <div className="auth-feature-item">
                            <span className="auth-feature-icon">📖</span>
                            <span>Borrow books anytime</span>
                        </div>
                        <div className="auth-feature-item">
                            <span className="auth-feature-icon">❤️</span>
                            <span>Save to your wishlist</span>
                        </div>
                        <div className="auth-feature-item">
                            <span className="auth-feature-icon">📊</span>
                            <span>Track borrow history</span>
                        </div>
                    </div>
                </div>
                <div className="auth-left-deco">❝</div>
            </div>

            {/* Right form panel */}
            <div className="auth-split-right">
                <div className="auth-form-wrapper">
                    <div className="auth-form-header">
                        <h3 className="auth-form-title">Sign In</h3>
                        <p className="auth-form-sub">Enter your credentials to continue</p>
                    </div>

                    {error && (
                        <Alert variant="danger" onClose={() => setError('')} dismissible className="auth-alert">
                            {error}
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="auth-field">
                            <label className="auth-label">Email Address</label>
                            <div className="auth-input-wrap">
                                <span className="auth-input-icon">✉️</span>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    className="auth-input"
                                />
                            </div>
                        </Form.Group>

                        <Form.Group className="auth-field">
                            <label className="auth-label">Password</label>
                            <div className="auth-input-wrap">
                                <span className="auth-input-icon">🔒</span>
                                <Form.Control
                                    type={showPw ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Your password"
                                    autoComplete="current-password"
                                    className="auth-input auth-input-pw"
                                />
                                <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(s => !s)}>
                                    {showPw ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </Form.Group>

                        <button type="submit" className="auth-submit-btn" disabled={loading}>
                            {loading ? <><Spinner size="sm" className="me-2" />Signing in...</> : 'Sign In →'}
                        </button>
                    </Form>

                    <div className="auth-divider"><span>or try a demo account</span></div>

                    <div className="auth-demo-btns">
                        <button className="auth-demo-btn" onClick={() => fillDemo('admin')}>
                            <span>⚙️</span> Admin Demo
                        </button>
                        <button className="auth-demo-btn" onClick={() => fillDemo('user')}>
                            <span>👤</span> User Demo
                        </button>
                    </div>

                    <p className="auth-switch-link">
                        Don't have an account? <Link to="/register">Create one free</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
