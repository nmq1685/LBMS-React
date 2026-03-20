import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
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
        <div className="auth-page d-flex align-items-center py-5">
            <Container>
                <Row className="justify-content-center">
                    <Col xs={12} sm={10} md={8} lg={6}>
                        <div className="text-center mb-4">
                            <h2 className="fw-bold">📚 LibraryMS</h2>
                            <p className="text-muted">Create your account</p>
                        </div>
                        <Card className="shadow-sm border-0">
                            <Card.Body className="p-4">
                                {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

                                <Form onSubmit={handleSubmit}>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
                                                <Form.Control
                                                    name="fullName" value={formData.fullName} onChange={handleChange}
                                                    placeholder="Your full name"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Username <span className="text-danger">*</span></Form.Label>
                                                <Form.Control
                                                    name="username" value={formData.username} onChange={handleChange}
                                                    placeholder="Choose a username"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Email address <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="email" name="email" value={formData.email} onChange={handleChange}
                                            placeholder="your@email.com"
                                        />
                                    </Form.Group>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Password <span className="text-danger">*</span></Form.Label>
                                                <div className="input-group">
                                                    <Form.Control
                                                        type={showPw ? 'text' : 'password'}
                                                        name="password" value={formData.password} onChange={handleChange}
                                                        placeholder="Min. 6 characters"
                                                    />
                                                    <Button variant="outline-secondary" onClick={() => setShowPw(s => !s)}>
                                                        {showPw ? '🙈' : '👁️'}
                                                    </Button>
                                                </div>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Confirm Password <span className="text-danger">*</span></Form.Label>
                                                <Form.Control
                                                    type="password" name="confirmPassword" value={formData.confirmPassword}
                                                    onChange={handleChange} placeholder="Repeat password"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Phone Number</Form.Label>
                                                <Form.Control
                                                    name="phone" value={formData.phone} onChange={handleChange}
                                                    placeholder="e.g. 0912345678"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Address</Form.Label>
                                                <Form.Control
                                                    name="address" value={formData.address} onChange={handleChange}
                                                    placeholder="Your address"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Button type="submit" variant="warning" className="w-100 fw-semibold mt-2" disabled={loading}>
                                        {loading ? <Spinner size="sm" /> : 'Create Account'}
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>

                        <p className="text-center mt-3 text-muted">
                            Already have an account?{' '}
                            <Link to="/login" className="text-warning fw-semibold">Sign in here</Link>
                        </p>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Register;
