import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistAPI } from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
    const { user } = useAuth();
    const [wishlistItems, setWishlistItems] = useState([]);

    const fetchWishlist = useCallback(async () => {
        if (!user) { setWishlistItems([]); return; }
        try {
            const { data } = await wishlistAPI.getByUser(user.id);
            setWishlistItems(data);
        } catch (_) { }
    }, [user]);

    useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

    const addToWishlist = async (bookId) => {
        if (!user) return;
        if (wishlistItems.find(i => i.bookId === bookId)) return;
        const { data } = await wishlistAPI.add({ userId: user.id, bookId });
        setWishlistItems(prev => [...prev, data]);
    };

    const removeFromWishlist = async (bookId) => {
        const item = wishlistItems.find(i => i.bookId === bookId);
        if (!item) return;
        await wishlistAPI.remove(item.id);
        setWishlistItems(prev => prev.filter(i => i.bookId !== bookId));
    };

    const isInWishlist = (bookId) => wishlistItems.some(i => i.bookId === bookId);

    return (
        <WishlistContext.Provider value={{ wishlistItems, fetchWishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
    return ctx;
};
