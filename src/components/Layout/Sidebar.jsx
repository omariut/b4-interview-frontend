import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import './Sidebar.css';

const Sidebar = ({ theme, toggleTheme }) => {
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    // Auth check or other global sidebar logic if needed
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const toggleMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);

  const ProfileMenu = () => (
    <div className="profile-menu-container" ref={menuRef}>
      <div className="avatar-circle" onClick={toggleMenu}>
        U
      </div>
      {isProfileMenuOpen && (
        <div className="profile-dropdown">
          <button className="dropdown-item" onClick={() => { /* Navigate to profile */ setIsProfileMenuOpen(false); }}>
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
          <ProfileMenu />
        </div>
      </nav>
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Sidebar;
