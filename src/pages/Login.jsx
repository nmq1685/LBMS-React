import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
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
        <div className="auth-page d-flex align-items-center min-vh-100">
            <Container>
                <Row className="justify-content-center">
                    <Col xs={12} sm={10} md={7} lg={5}>
                        <div className="text-center mb-4">
                            <h2 className="fw-bold">📚 LibraryMS</h2>
                            <p className="text-muted">Sign in to your account</p>
                        </div>
                        <Card className="shadow-sm border-0">
                            <Card.Body className="p-4">
                                {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email address</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter your email"
                                            autoComplete="email"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label>Password</Form.Label>
                                        <div className="input-group">
                                            <Form.Control
                                                type={showPw ? 'text' : 'password'}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Enter your password"
                                                autoComplete="current-password"
                                            />
                                            <Button variant="outline-secondary" onClick={() => setShowPw(s => !s)}>
                                                {showPw ? '🙈' : '👁️'}
                                            </Button>
                                        </div>
                                    </Form.Group>

                                    <Button type="submit" variant="warning" className="w-100 fw-semibold" disabled={loading}>
                                        {loading ? <Spinner size="sm" /> : 'Sign In'}
                                    </Button>
                                </Form>

                                <hr className="my-3" />
                                <p className="text-center text-muted small mb-2">Demo accounts:</p>
                                <div className="d-flex gap-2">
                                    <Button variant="outline-secondary" size="sm" className="flex-grow-1" onClick={() => fillDemo('admin')}>
                                        Admin Demo
                                    </Button>
                                    <Button variant="outline-secondary" size="sm" className="flex-grow-1" onClick={() => fillDemo('user')}>
                                        User Demo
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>

                        <p className="text-center mt-3 text-muted">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-warning fw-semibold">Register here</Link>
                        </p>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Login;
