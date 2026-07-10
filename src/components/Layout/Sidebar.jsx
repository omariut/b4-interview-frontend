import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  useEffect(() => {
    // Auth check or other global sidebar logic if needed
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <div className="layout-container">
      {/* Mobile Topbar */}
      <div className="mobile-topbar">
        <div className="sidebar-logo-container">
          <img src="/logo.png" alt="logo" className="sidebar-logo-img" />
          <h2 className="sidebar-logo-text">b4interview</h2>
        </div>
        <button className="mobile-logout-btn" onClick={handleLogout}>
          <span className="nav-icon" style={{ marginBottom: 0, marginRight: 0 }}>🚪</span>
          Logout
        </button>
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
        </div>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            Logout
          </button>
        </div>
      </nav>
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Sidebar;
