import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import { usePostHog } from 'posthog-js/react';
import './Sidebar.css';

const Sidebar = ({ theme, toggleTheme }) => {
  const navigate = useNavigate();
  const posthog = usePostHog();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const mobileMenuRef = useRef(null);
  const desktopMenuRef = useRef(null);

  const fetchProfile = async () => {
    try {
      const data = await authApi.getMe();
      setUser(data);
      if (posthog) {
        posthog.identify(data.id, {
          email: data.email,
          name: data.full_name,
          phone: data.phone_number
        });
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchProfile();
    
    // Listen for profile updates from the Profile page
    window.addEventListener('profileUpdated', fetchProfile);
    return () => window.removeEventListener('profileUpdated', fetchProfile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedMobile = mobileMenuRef.current && mobileMenuRef.current.contains(event.target);
      const clickedDesktop = desktopMenuRef.current && desktopMenuRef.current.contains(event.target);
      if (!clickedMobile && !clickedDesktop) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    if (posthog) posthog.reset();
    navigate('/login');
  };

  const toggleMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8050';
  const avatarUrl = user?.profile_picture_url 
    ? (user.profile_picture_url.startsWith('http') ? user.profile_picture_url : `${API_BASE_URL}${user.profile_picture_url}`)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&background=38bdf8&color=fff&rounded=true&bold=true`;

  const ProfileMenu = ({ isDesktop = false }) => (
    <div className={`profile-menu-container ${isDesktop ? 'desktop-only' : ''}`} ref={isDesktop ? desktopMenuRef : mobileMenuRef}>
      <img 
        src={avatarUrl} 
        alt="Profile" 
        className="avatar-circle" 
        onClick={toggleMenu} 
        style={{ padding: '2px', background: 'var(--bg-surface)' }}
      />
      {isProfileMenuOpen && (
        <div className="profile-dropdown">
          <button className="dropdown-item" onClick={() => { navigate('/profile'); setIsProfileMenuOpen(false); }}>
            <span className="nav-icon">👤</span> Profile
          </button>
          <button className="dropdown-item" onClick={() => { toggleTheme(); setIsProfileMenuOpen(false); }}>
            <span className="nav-icon">{theme === 'dark' ? '☀️' : '🌙'}</span> 
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button className="dropdown-item logout" onClick={handleLogout}>
            <span className="nav-icon">🚪</span> Logout
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="layout-container">
      {/* Mobile Topbar */}
      <div className="mobile-topbar">
        <div className="sidebar-logo-container">
          <img src="/logo.png" alt="logo" className="sidebar-logo-img" />
          <h2 className="sidebar-logo-text">b4interview</h2>
        </div>
        <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
          <ProfileMenu />
        </div>
      </div>

      <nav className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo-container">
            <img src="/logo.png" alt="logo" className="sidebar-logo-img" />
            <h2 className="sidebar-logo-text">b4interview</h2>
          </div>
        </div>
        
        <div className="sidebar-nav">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </NavLink>
          
          <NavLink 
            to="/upload-cv" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">📤</span>
            Upload CV
          </NavLink>
          
          <NavLink 
            to="/cvs" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">📄</span>
            My CVs
          </NavLink>

          <NavLink 
            to="/questions" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">❓</span>
            Questions
          </NavLink>

          <NavLink 
            to="/subscription" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">⭐</span>
            Subscription
          </NavLink>

          <NavLink 
            to="/payment-history" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">💳</span>
            Payment History
          </NavLink>
        </div>

        <div className="sidebar-footer">
          {/* Footer removed since avatar is in top right now */}
        </div>
      </nav>
      
      <main className="main-content">
        <ProfileMenu isDesktop={true} />
        <Outlet />
      </main>
    </div>
  );
};

export default Sidebar;
