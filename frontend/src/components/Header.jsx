import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.jpg';
import { FaSearch } from 'react-icons/fa';
import { FiMessageSquare } from 'react-icons/fi';
import { toast } from 'react-toastify'; // ✅ NUEVO
import './Header.css';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [followedIds, setFollowedIds] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingUnfollowId, setPendingUnfollowId] = useState(null);

  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setResults([]);
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
        .then(res => {
          setUser(res.data);
          return axios.get(`http://localhost:3000/following/${res.data.id}`);
        })
        .then(res => {
          const ids = res.data.map(u => u.id);
          setFollowedIds(ids);
        })
        .catch(err => console.error('❌ Error al cargar usuario o seguidos:', err));
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        fetch(`http://localhost:3001/notifications/${userId}`)
          .then(res => res.json())
          .then(data => setUnreadCount(data.unreadCount || 0))
          .catch(err => console.error('❌ Error al obtener notificaciones:', err));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setResults([]);
      return;
    }

    const delay = setTimeout(() => {
      axios
        .get(`http://localhost:3000/search-users?q=${searchTerm}`)
        .then(res => setResults(res.data))
        .catch(err => console.error('❌ Error al buscar usuarios:', err));
    }, 300);

    return () => clearTimeout(delay);
  }, [searchTerm]);

  const handleFollow = (followedId) => {
    const followerId = localStorage.getItem('userId');
    axios.post('http://localhost:3000/follow', { followerId, followedId })
      .then(() => {
        toast.success('✅ Ahora sigues a este usuario');
        setFollowedIds(prev => [...prev, followedId]);
      })
      .catch(() => toast.error('❌ Error al seguir al usuario'));
  };

  const askUnfollow = (userId) => {
    setPendingUnfollowId(userId);
    setShowConfirmModal(true);
  };

  const confirmUnfollow = () => {
    const followerId = localStorage.getItem('userId');
    axios.post('http://localhost:3000/unfollow', {
      followerId,
      followedId: pendingUnfollowId
    })
      .then(() => {
        toast.info('👋 Has dejado de seguir al usuario');
        setFollowedIds(prev => prev.filter(id => id !== pendingUnfollowId));
      })
      .catch(() => toast.error('❌ Error al dejar de seguir al usuario'))
      .finally(() => {
        setShowConfirmModal(false);
        setPendingUnfollowId(null);
      });
  };

  const handleLogout = () => {
    localStorage.clear();
    setMenuOpen(false);
    navigate('/login');
  };

  return (
    <>
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
          <div className="position-relative" ref={searchRef}>
            <div className="search-bar d-flex align-items-center bg-white rounded px-2">
              <FaSearch style={{ marginRight: '8px', color: '#666' }} />
              <input
                type="text"
                className="form-control border-0"
                placeholder="Buscar..."
                style={{ width: '200px', outline: 'none' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                className="btn btn-sm btn-link text-decoration-none text-dark"
                onClick={() => setSearchTerm('')}
              >
                ✕
              </button>
            </div>

            {results.length > 0 && (
              <ul className="position-absolute bg-white border rounded shadow p-2 mt-2" style={{ zIndex: 999, right: 0, width: '250px' }}>
                {results.map((u) => (
                  <li key={u.id} className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center">
                      <img
                        src={u.profile_picture || '/default-avatar.png'}
                        alt=""
                        className="rounded-circle me-2"
                        width="30"
                        height="30"
                      />
                      <span>{u.name}</span>
                    </div>
                    {user?.id !== u.id && (
                      followedIds.includes(u.id) ? (
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => askUnfollow(u.id)}
                        >
                          Siguiendo
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleFollow(u.id)}
                        >
                          Seguir
                        </button>
                      )
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Usuario y menú */}
          <div className="d-flex align-items-center gap-3" ref={menuRef}>
            <Link to="/Chat" className="nav-link position-relative">
              <FiMessageSquare
                size={24}
                style={{
                  cursor: 'pointer',
                  color: unreadCount > 0 ? 'red' : 'black',
                  transition: 'color 0.3s ease'
                }}
              />
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {unreadCount > 9 ? '9+' : unreadCount}
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

      {/* Modal personalizado de confirmación */}
      {showConfirmModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar acción</h5>
                <button className="btn-close" onClick={() => setShowConfirmModal(false)} />
              </div>
              <div className="modal-body">
                ¿Estás seguro de que quieres dejar de seguir a este usuario?
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>Cancelar</button>
                <button className="btn btn-danger" onClick={confirmUnfollow}>Sí, dejar de seguir</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
