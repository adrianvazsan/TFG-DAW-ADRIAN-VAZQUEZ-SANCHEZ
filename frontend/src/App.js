import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import Inicio from './components/Inicio'; // 👈 Importar componente de inicio


function AppContent() {
  const location = useLocation();

  // Oculta Header y Footer solo en login y register
  const hideHeaderFooter = ['/login', '/register','/inicio'].includes(location.pathname);

  return (
    <>
      {!hideHeaderFooter && <Header />}
      <main className="flex-fill">
        <Routes>
          {/* Página de bienvenida */}
          <Route path="/inicio" element={<Inicio />} />

          {/* Login y Registro */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* Rutas protegidas */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/explore"
            element={
              <ProtectedRoute>
                <Explore />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wall"
            element={
              <ProtectedRoute>
                <Wall />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />

          {/* Ruta no encontrada */}
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
      </Router>
    </div>
  );
}

export default App;
