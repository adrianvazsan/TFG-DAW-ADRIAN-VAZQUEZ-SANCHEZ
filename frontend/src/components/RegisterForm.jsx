import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './RegisterForm.css';

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

      if (res.ok) {
        toast.success(data.message || 'Registro exitoso');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast.error(data.message || 'Error al registrar');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al conectar con el servidor');
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

              <label className="form-label">
                  Nombre <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre"
                  className="form-control mb-3"
                  value={form.name}
                  onChange={handleChange}
                  required
                />

                <label className="form-label">
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="form-control mb-3"
                  value={form.email}
                  onChange={handleChange}
                  required
                />

                <label className="form-label">
                  Contraseña <span className="text-danger">*</span>
                </label>
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
