import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AdminLayout.css';

const NAV_ITEMS = [
    {
        to: '/admin', end: true,
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
        ),
        label: 'Dashboard',
    },
    {
        to: '/admin/books', end: false,
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
        ),
        label: 'Books',
    },
    {
        to: '/admin/categories', end: false,
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
        ),
        label: 'Categories',
    },
    {
        to: '/admin/users', end: false,
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        label: 'Users',
    },
];

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const avatarSrc = user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`;

    return (
        <div className="adm-layout">
            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="adm-overlay" onClick={() => setMobileOpen(false)} />
            )}

            {/* ═══════════════ SIDEBAR ═══════════════ */}
            <aside className={`adm-sidebar ${collapsed ? 'adm-sidebar--collapsed' : ''} ${mobileOpen ? 'adm-sidebar--mobile-open' : ''}`}>

                {/* Logo */}
                <div className="adm-sidebar__brand">
                    <div className="adm-sidebar__brand-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        </svg>
                    </div>
                    <div className="adm-sidebar__brand-text">
                        <span className="adm-sidebar__brand-name">LBMS</span>
                        <span className="adm-sidebar__brand-sub">Admin Panel</span>
                    </div>
                </div>

                {/* Section label */}
                <div className="adm-sidebar__section-label">NAVIGATION</div>

                {/* Nav */}
                <nav className="adm-sidebar__nav">
                    {NAV_ITEMS.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `adm-nav-item ${isActive ? 'adm-nav-item--active' : ''}`
                            }
                        >
                            <span className="adm-nav-item__icon">{item.icon}</span>
                            <span className="adm-nav-item__label">{item.label}</span>
                            {!collapsed && (
                                <span className="adm-nav-item__arrow">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Divider */}
                <div className="adm-sidebar__divider" />
                <div className="adm-sidebar__section-label">SYSTEM</div>

                {/* Bottom links */}
                <div className="adm-sidebar__system">
                    <Link to="/" className="adm-nav-item adm-nav-item--muted">
                        <span className="adm-nav-item__icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="2" y1="12" x2="22" y2="12" />
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                            </svg>
                        </span>
                        <span className="adm-nav-item__label">View Website</span>
                    </Link>
                    <button className="adm-nav-item adm-nav-item--danger" onClick={handleLogout}>
                        <span className="adm-nav-item__icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </span>
                        <span className="adm-nav-item__label">Sign Out</span>
                    </button>
                </div>

                {/* User profile */}
                <div className="adm-sidebar__user">
                    <img className="adm-sidebar__avatar" src={avatarSrc} alt="" />
                    <div className="adm-sidebar__user-info">
                        <span className="adm-sidebar__user-name">{user?.username || 'Admin'}</span>
                        <span className="adm-sidebar__user-role">
                            <span className="adm-role-dot" />
                            Administrator
                        </span>
                    </div>
                </div>
            </aside>

            {/* ═══════════════ MAIN AREA ═══════════════ */}
            <div className={`adm-main ${collapsed ? 'adm-main--wide' : ''}`}>

                {/* Topbar */}
                <header className="adm-topbar">
                    <div className="adm-topbar__left">
                        <button
                            className="adm-topbar__toggle"
                            onClick={() => setCollapsed(c => !c)}
                            aria-label="Toggle sidebar"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                    </div>

                    <div className="adm-topbar__right">
                        <span className="adm-topbar__date">
                            {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                        <div className="adm-topbar__user-chip">
                            <img src={avatarSrc} alt="" className="adm-topbar__chip-avatar" />
                            <span className="adm-topbar__chip-name">{user?.username || 'Admin'}</span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="adm-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
