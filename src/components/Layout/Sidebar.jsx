import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="layout-container">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-logo">b4interview</h2>
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
        </div>
      </nav>
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Sidebar;
