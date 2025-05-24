import React, { useState } from 'react';
import './Explore.css'; // para fondo de mapa

const data = {
  europa: {
    españa: [
      { src: 'https://via.placeholder.com/200?text=Madrid', title: 'Madrid' },
      { src: 'https://via.placeholder.com/200?text=Barcelona', title: 'Barcelona' }
    ],
    francia: [
      { src: 'https://via.placeholder.com/200?text=Paris', title: 'París' },
      { src: 'https://via.placeholder.com/200?text=Niza', title: 'Niza' }
    ]
  },
  asia: {
    japon: [
      { src: 'https://via.placeholder.com/200?text=Shibuya', title: 'Cruce de Shibuya' },
      { src: 'https://via.placeholder.com/200?text=Kyoto', title: 'Kyoto' }
    ]
  },
  america: {
    argentina: [
      { src: 'https://via.placeholder.com/200?text=Buenos+Aires', title: 'Buenos Aires' },
      { src: 'https://via.placeholder.com/200?text=Ushuaia', title: 'Ushuaia' }
    ]
  }
};

const Explore = () => {
  const [continent, setContinent] = useState('');
  const [country, setCountry] = useState('');

  const handleContinentChange = (e) => {
    setContinent(e.target.value);
    setCountry(''); // reset país al cambiar continente
  };

  return (
    <div className="explore-container">
    <div className="filters container py-4">
        <div>
            <label className="form-label">Selecciona un continente:</label>
            <select className="form-select" value={continent} onChange={handleContinentChange}>
            <option value="">-- Selecciona continente --</option>
            {Object.keys(data).map((cont) => (
                <option key={cont} value={cont}>{cont}</option>
            ))}
            </select>
        </div>

        {continent && (
            <div>
            <label className="form-label">Selecciona un país:</label>
            <select className="form-select" value={country} onChange={(e) => setCountry(e.target.value)}>
                <option value="">-- Selecciona país --</option>
                {Object.keys(data[continent]).map((pais) => (
                <option key={pais} value={pais}>{pais}</option>
                ))}
            </select>
            </div>
        )}
    </div>


      {country && (
        <div className="container">
          <h2 className="text-capitalize">{country}</h2>
          <div className="row">
            {data[continent][country].map((place, index) => (
              <div className="col-md-4 mb-4" key={index}>
                <div className="card">
                  <img src={place.src} className="card-img-top" alt={place.title} />
                  <div className="card-body text-center">
                    <p className="card-text">{place.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;
