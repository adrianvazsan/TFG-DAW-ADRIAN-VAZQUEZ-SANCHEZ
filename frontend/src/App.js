import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from './Home';
import Explore from './Explore';
import Profile from './Profile';
import Header from './components/Header';
import Footer from './components/Footer';
import Wall from './components/Wall';
import Chat from './components/Chat';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ProtectedRoute from './components/ProtectedRoute';
import Inicio from './components/Inicio';

function AppContent() {
  const location = useLocation();
  const hideHeaderFooter = ['/login', '/register', '/'].includes(location.pathname);

  return (
    <>
      {!hideHeaderFooter && <Header />}
      <main className="flex-fill">
        <Routes>
          {/* Página de bienvenida pública */}
          <Route path="/" element={<Inicio />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* Rutas protegidas */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/wall" element={<ProtectedRoute><Wall /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

          <Route path="*" element={<h2>404 - Página no encontrada</h2>} />
        </Routes>
      </main>
      {!hideHeaderFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Router>
        <AppContent />
        <ToastContainer position="top-right" autoClose={2000} hideProgressBar theme="colored" />
      </Router>
    </div>
  );
}

export default App;
