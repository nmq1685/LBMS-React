import React, { createContext, useContext, useState, useEffect } from 'react';
import { usersAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem('lbms_user');
        if (saved) {
            try { setUser(JSON.parse(saved)); } catch (_) { }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await usersAPI.getByEmail(email);
        if (data.length === 0) throw new Error('Email not found');
        const found = data[0];
        if (found.password !== password) throw new Error('Incorrect password');
        const { password: _pw, ...safeUser } = found;
        setUser(safeUser);
        localStorage.setItem('lbms_user', JSON.stringify(safeUser));
        return safeUser;
    };

    const register = async (userData) => {
        const { data: existing } = await usersAPI.getByEmail(userData.email);
        if (existing.length > 0) throw new Error('Email already registered');
        const newUser = {
            ...userData,
            role: 'user',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
            createdAt: new Date().toISOString().split('T')[0],
        };
        const { data: created } = await usersAPI.create(newUser);
        const { password: _pw, ...safeUser } = created;
        setUser(safeUser);
        localStorage.setItem('lbms_user', JSON.stringify(safeUser));
        return safeUser;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('lbms_user');
    };

    const refreshUser = async () => {
        if (!user) return;
        const { data } = await usersAPI.getById(user.id);
        const { password: _pw, ...safeUser } = data;
        setUser(safeUser);
        localStorage.setItem('lbms_user', JSON.stringify(safeUser));
        return safeUser;
    };

    const updateUser = async (id, updates) => {
        const { data: current } = await usersAPI.getById(id);
        const { data } = await usersAPI.update(id, { ...current, ...updates });
        const { password: _pw, ...safeUser } = data;
        setUser(safeUser);
        localStorage.setItem('lbms_user', JSON.stringify(safeUser));
        return safeUser;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, refreshUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
