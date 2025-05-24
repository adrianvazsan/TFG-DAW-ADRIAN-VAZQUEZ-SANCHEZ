import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.jpg';
import { FaSearch, FaRegComments } from 'react-icons/fa';
import './Header.css';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
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

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      axios
        .get('http://localhost:3000/api/profile', {
          headers: { 'x-user-id': userId }
        })
        .then(res => setUser(res.data))
        .catch(err => console.error('❌ Error al cargar usuario en Header', err));
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        fetch(`http://localhost:3001/notifications/${userId}`)
          .then(res => res.json())
          .then(data => {
            if (data.unreadCount > 0) {
              setShowNotification(true);
            } else {
              setShowNotification(false);
            }
          })
          .catch(err => {
            console.error('❌ Error al obtener notificaciones:', err);
            setShowNotification(false);
          });
      }
    }, 5000); // Cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light custom-header">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        {/* Logo y navegación */}
        <div className="d-flex align-items-center gap-3">
          <Link className="navbar-brand" to="/home">
            <img src={logo} alt="SkyPath" style={{ height: '80px' }} />
          </Link>
          <Link className="nav-link fw-bold" to="/home" style={{ color: '#555' }}>inicio</Link>
          <Link className="nav-link" to="/wall" style={{ color: '#000' }}>muro</Link>
          <Link className="nav-link" to="/explore" style={{ color: '#000' }}>mapa</Link>
        </div>

        {/* Barra de búsqueda */}
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

        {/* Usuario */}
        <div className="d-flex align-items-center gap-3" ref={menuRef}>
          <Link to="/Chat" className="nav-link position-relative">
            <FaRegComments size={24} style={{ cursor: 'pointer', color: 'black' }} />
            {showNotification && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                ●
              </span>
            )}
          </Link>

          {user && (
            <div className="user-menu" onClick={() => setMenuOpen(!menuOpen)}>
              <img
                src={user.profile_picture || '/default-avatar.png'}
                alt="avatar"
                className="user-avatar"
              />
              <span className="user-name">{user.name}</span>

              {menuOpen && (
                <div className="user-dropdown">
                  <Link to="/profile" className="dropdown-item">Perfil</Link>
                  <button onClick={handleLogout} className="dropdown-item" style={{ borderTop: '1px solid #eee' }}>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;
