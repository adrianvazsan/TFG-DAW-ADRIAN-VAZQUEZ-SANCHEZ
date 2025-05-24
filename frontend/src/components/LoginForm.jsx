import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css'; // 👉 Asegúrate de tener este archivo CSS

export default function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const cleanedForm = {
        email: form.email.trim(),
        password: form.password,
      };

      const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Error al iniciar sesión');
        return;
      }

      if (!data.userId) {
        setError('Error: No se recibió el ID del usuario.');
        return;
      }

      localStorage.setItem('token', data.token || 'loggedin');
      localStorage.setItem('email', cleanedForm.email);
      localStorage.setItem('userId', data.userId);

      alert('¡Login exitoso!');
      navigate('/');
    } catch (err) {
      console.error('❌ Error en login:', err);
      setError('Error al conectar con el servidor');
    }
  };

  return (
    <div className="login-container">
      <video autoPlay muted loop playsInline className="video-background">
        <source src="/video-fondo.mp4" type="video/mp4" />
        Tu navegador no soporta video.
      </video>

      <div className="form-wrapper">
        <form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm bg-light">
          <h2 className="mb-4 text-center">Iniciar sesión</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <input
            type="email"
            placeholder="Email"
            className="form-control mb-3"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="form-control mb-3"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
          <button type="submit" className="btn btn-primary w-100">Entrar</button>
        </form>
      </div>
    </div>
  );
}
