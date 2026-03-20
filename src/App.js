import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';

import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

import Home from './pages/Home';
import BookDetail from './pages/BookDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import BorrowHistory from './pages/BorrowHistory';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageBooks from './pages/admin/ManageBooks';
import ManageCategories from './pages/admin/ManageCategories';
import ManageUsers from './pages/admin/ManageUsers';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <CartProvider>
          <WishlistProvider>
            <div className="d-flex flex-column min-vh-100">
              <Header />
              <main className="flex-grow-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/books/:id" element={<BookDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                  <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                  <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
                  <Route path="/wishlist" element={<PrivateRoute><Wishlist /></PrivateRoute>} />
                  <Route path="/borrows" element={<PrivateRoute><BorrowHistory /></PrivateRoute>} />

                  <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                  <Route path="/admin/books" element={<AdminRoute><ManageBooks /></AdminRoute>} />
                  <Route path="/admin/categories" element={<AdminRoute><ManageCategories /></AdminRoute>} />
                  <Route path="/admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />

                  <Route path="*" element={
                    <div className="text-center py-5 my-5">
                      <h1 className="display-1 fw-bold text-warning">404</h1>
                      <p className="fs-4 text-muted">Page not found</p>
                      <a href="/" className="btn btn-warning">Go Home</a>
                    </div>
                  } />
                </Routes>
              </main>
              <Footer />
            </div>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme="colored" />
          </WishlistProvider>
        </CartProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

