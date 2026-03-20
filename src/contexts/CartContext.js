import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);

    const fetchCart = useCallback(async () => {
        if (!user) { setCartItems([]); return; }
        try {
            const { data } = await cartAPI.getByUser(user.id);
            setCartItems(data);
        } catch (_) { }
    }, [user]);

    useEffect(() => { fetchCart(); }, [fetchCart]);

    const addToCart = async (bookId, quantity = 1, days = 7) => {
        if (!user) return;
        const existing = cartItems.find(i => i.bookId === bookId);
        if (existing) {
            const { data } = await cartAPI.update(existing.id, { ...existing, quantity: existing.quantity + quantity });
            setCartItems(prev => prev.map(i => i.id === existing.id ? data : i));
        } else {
            const { data } = await cartAPI.add({ userId: user.id, bookId, quantity, days });
            setCartItems(prev => [...prev, data]);
        }
    };

    const removeFromCart = async (cartItemId) => {
        await cartAPI.remove(cartItemId);
        setCartItems(prev => prev.filter(i => i.id !== cartItemId));
    };

    const updateCartItem = async (cartItemId, updates) => {
        const item = cartItems.find(i => i.id === cartItemId);
        const { data } = await cartAPI.update(cartItemId, { ...item, ...updates });
        setCartItems(prev => prev.map(i => i.id === cartItemId ? data : i));
    };

    const clearCart = async () => {
        if (!user) return;
        await Promise.all(cartItems.map(i => cartAPI.remove(i.id)));
        setCartItems([]);
    };

    const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems, cartCount, fetchCart, addToCart, removeFromCart, updateCartItem, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
};
