import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterForm.css'; // 👉 Asegúrate de tener este CSS

export default function RegisterForm() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      alert(data.message);

      if (res.ok) {
        navigate('/login');
      }
    } catch (error) {
      alert('Error al conectar con el servidor');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <video autoPlay muted loop playsInline className="video-background">
        <source src="/video-fondo.mp4" type="video/mp4" />
        Tu navegador no soporta el video.
      </video>

      <div className="form-wrapper">
        <form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm bg-light">
          <h4 className="mb-3 text-center">Registro</h4>

          <input
            type="text"
            name="name"
            placeholder="Nombre"
            className="form-control mb-3"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="form-control mb-3"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            className="form-control mb-4"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>
  );
}
