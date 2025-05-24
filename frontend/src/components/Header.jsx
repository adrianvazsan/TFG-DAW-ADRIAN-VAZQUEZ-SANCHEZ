import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import { FaSearch, FaRegComments, FaUserCircle } from 'react-icons/fa';
import './Header.css';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token'); // o lo que uses para sesión
    setMenuOpen(false);
    navigate('/login'); // o la ruta que uses para login
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light custom-header">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <Link className="navbar-brand" to="/">
            <img src={logo} alt="SkyPath" style={{ height: '80px' }} />
          </Link>
          <Link className="nav-link fw-bold" to="/" style={{ color: '#555' }}>inicio</Link>
          <Link className="nav-link" to="/wall" style={{ color: '#000' }}>muro</Link>
          <Link className="nav-link" to="/explore" style={{ color: '#000' }}>mapa</Link>
        </div>

        <div className="search-bar d-flex align-items-center bg-white rounded px-2">
          <FaSearch style={{ marginRight: '8px', color: '#666' }} />
          <input
            type="text"
            className="form-control border-0"
            placeholder="Buscar..."
            style={{ width: '200px', outline: 'none' }}
          />
          <button className="btn btn-sm btn-link text-decoration-none text-dark">✕</button>
        </div>

        <div className="d-flex align-items-center gap-3" ref={menuRef}>
          <Link to="/Chat" className="nav-link">
            <FaRegComments size={24} style={{ cursor: 'pointer', color: 'black' }} />
          </Link>

          <div style={{ position: 'relative' }}>
            <FaUserCircle
              size={32}
              style={{ cursor: 'pointer', color: 'black' }}
              onClick={() => setMenuOpen(!menuOpen)}
            />
            {menuOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '110%',
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                minWidth: '160px',
                zIndex: 1000
              }}>
                <Link to="/profile" className="dropdown-item" style={menuItemStyle}>
                  Perfil
                </Link>
                <button onClick={handleLogout} className="dropdown-item" style={{ ...menuItemStyle, borderTop: '1px solid #eee' }}>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

const menuItemStyle = {
  padding: '10px 15px',
  width: '100%',
  textAlign: 'left',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  textDecoration: 'none',
  color: '#333'
};

export default Header;
