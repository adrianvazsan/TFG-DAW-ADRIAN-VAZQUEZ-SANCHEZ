import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem('token'); // o 'loggedIn'

  if (!isLoggedIn) {
    // Si no está logueado, redirige a login
    return <Navigate to="/login" replace />;
  }

  // Si sí está logueado, renderiza los hijos (la página protegida)
  return children;
}
