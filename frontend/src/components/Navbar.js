import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <i className="fas fa-chart-line"></i>
          Contas Financeiras
        </Link>

        <div className="navbar-menu">
          <Link 
            to="/dashboard" 
            className={`navbar-item ${isActive('/dashboard')}`}
          >
            <i className="fas fa-tachometer-alt"></i>
            Dashboard
          </Link>
          
          <Link 
            to="/accounts" 
            className={`navbar-item ${isActive('/accounts')}`}
          >
            <i className="fas fa-file-invoice"></i>
            Contas
          </Link>

          <div className="navbar-user">
            <div className="user-info">
              <i className="fas fa-user-circle"></i>
              <span>{user?.username}</span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="logout-btn"
              title="Sair"
            >
              <i className="fas fa-sign-out-alt"></i>
              Sair
            </button>
          </div>
        </div>

        {/* Mobile menu toggle */}
        <div className="mobile-toggle">
          <i className="fas fa-bars"></i>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;