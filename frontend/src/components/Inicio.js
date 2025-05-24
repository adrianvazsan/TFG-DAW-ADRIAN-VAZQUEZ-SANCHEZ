import React from 'react';
import './Inicio.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Inicio = () => {
  return (
    <div className="inicio-container">
      <video autoPlay muted loop playsInline className="video-background">
        <source src="/video-fondo.mp4" type="video/mp4" />
        Tu navegador no soporta video.
      </video>
       

      <div className="overlay text-white text-center">
        <h1>Bienvenido a SkyPath</h1>
        <div className="d-flex flex-column gap-3 mt-4">
          <a href="/login" className="btn btn-primary btn-lg">Iniciar Sesión</a>
          <a href="/register" className="btn btn-outline-light btn-lg">Registrarte</a>
        </div>
      </div>
    </div>
  );
};

export default Inicio;
