import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem('token');

  // Si no está logueado, redirige a la página pública
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
}
