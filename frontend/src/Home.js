// src/Home.js
import React from 'react';
import imagen1 from './assets/imagen1.jpg';
import imagen2 from './assets/imagen2.jpg';
import imagen3 from './assets/imagen3.jpg';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './Home.css';

function Home() {
  return (
    <div className="container my-5">
      <h2 className="text-center mb-5 fw-bold text-secondary">Descubre SkyPath</h2>

      <div className="row align-items-stretch">
        {/* Columna de texto */}
        <div className="col-md-6 mb-4">
          <div className="bg-light p-4 rounded shadow h-100 d-flex flex-column justify-content-center">
            <h3 className="mb-3 text-primary">Una red social hecha por viajeros, para viajeros</h3>
            <p>
              ¿Te sientes abrumado al planear un viaje? ¿No sabes qué lugares valen realmente la pena?
              <strong> SkyPath</strong> está aquí para ayudarte a descubrir rincones únicos y recomendaciones reales
              hechas por viajeros como tú.
            </p>
            <ul>
              <li>📍 Recomendaciones auténticas y ubicaciones en Google Maps.</li>
              <li>📸 Comparte tus fotos y experiencias en el muro de viajes.</li>
              <li>💬 Chat en tiempo real con otros exploradores.</li>
              <li>👤 Crea y personaliza tu perfil de viajero.</li>
              <li>🔍 Encuentra y sigue a otros usuarios fácilmente.</li>
            </ul>
            <p>
              A diferencia de plataformas como Instagram o TripAdvisor, en SkyPath el foco está en lo humano,
              lo auténtico y lo local. Aquí puedes explorar desde los destinos más conocidos hasta los secretos
              mejor guardados del mundo.
            </p>
            <p>
              Y esto es solo el comienzo: en el futuro podrás crear itinerarios interactivos, ganar recompensas
              por tu actividad, descubrir música para tus viajes y mucho más.
            </p>
            <p className="fw-bold text-success">
              Únete a SkyPath y empieza a descubrir el mundo como nunca antes 🌍✈️
            </p>
          </div>
        </div>

        {/* Columna del carrusel */}
        <div className="col-md-6 mb-4">
          <div className="carousel-container shadow rounded h-100 d-flex align-items-center justify-content-center">
            <div
              id="carouselExampleAutoplaying"
              className="carousel slide w-100"
              data-bs-ride="carousel"
              data-bs-interval="3000"
            >
              <div className="carousel-inner">
                <div className="carousel-item active">
                  <img src={imagen1} className="d-block w-100 rounded" alt="Imagen 1" />
                </div>
                <div className="carousel-item">
                  <img src={imagen2} className="d-block w-100 rounded" alt="Imagen 2" />
                </div>
                <div className="carousel-item">
                  <img src={imagen3} className="d-block w-100 rounded" alt="Imagen 3" />
                </div>
              </div>
              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#carouselExampleAutoplaying"
                data-bs-slide="prev"
              >
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Anterior</span>
              </button>
              <button
                className="carousel-control-next"
                type="button"
                data-bs-target="#carouselExampleAutoplaying"
                data-bs-slide="next"
              >
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Siguiente</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
