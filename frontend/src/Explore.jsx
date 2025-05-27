import React, { useState, useEffect } from 'react';
import './Explore.css';

const Explore = () => {
  const [continents, setContinents] = useState([]);
  const [countries, setCountries] = useState([]);
  const [places, setPlaces] = useState([]);

  const [selectedContinent, setSelectedContinent] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  const [isAdmin, setIsAdmin] = useState(true); // <-- Cambiar según usuario

  // Modal control
  const [showModal, setShowModal] = useState(false);

  // Campos para nuevo continente
  const [newContinentName, setNewContinentName] = useState('');
  // MODALES
const [showContinentModal, setShowContinentModal] = useState(false);
const [showCountryModal, setShowCountryModal] = useState(false);
const [showPlaceModal, setShowPlaceModal] = useState(false);

// Campos para nuevo país
const [newCountryName, setNewCountryName] = useState('');

// Campos para nuevo lugar
const [newPlaceTitle, setNewPlaceTitle] = useState('');
const [newPlaceImage, setNewPlaceImage] = useState(null);


// FUNCIONES para guardar país y lugar

const handleAddCountry = () => {
  if (!newCountryName.trim()) {
    alert('Debe ingresar un nombre para el país');
    return;
  }

  fetch('http://localhost:3000/api/countries', {  // sin continentId en URL
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      name: newCountryName.trim(),
      continent_id: parseInt(selectedContinent), // aquí mandas el continente
    }),
  })
    .then(res => {
      if (!res.ok) throw new Error('Error al agregar país');
      return res.json();
    })
    .then(() => {
      setNewCountryName('');
      setShowCountryModal(false);
      return fetch(`http://localhost:3000/api/countries/${selectedContinent}`);
    })
    .then(res => res.json())
    .then(data => setCountries(data))
    .catch(err => alert(err.message));
};


const handleAddPlace = () => {
  if (!newPlaceTitle.trim() || !newPlaceImage) {
    alert('Debe completar todos los campos del lugar');
    return;
  }

  const formData = new FormData();
  formData.append('title', newPlaceTitle.trim());
  formData.append('image', newPlaceImage);

  fetch(`http://localhost:3000/api/recommended-places/${selectedCountry}`, {
    method: 'POST',
    body: formData, // importante
  })
    .then(res => {
      if (!res.ok) throw new Error('Error al agregar lugar');
      return res.json();
    })
    .then(() => {
      setNewPlaceTitle('');
      setNewPlaceImage(null);
      setShowPlaceModal(false);
      return fetch(`http://localhost:3000/api/recommended-places/${selectedCountry}`);
    })
    .then(res => res.json())
    .then(data => setPlaces(data))
    .catch(err => alert(err.message));
};



  // Cargar continentes al montar
  const fetchContinents = () => {
    fetch('http://localhost:3000/api/continents')
      .then(res => res.json())
      .then(data => setContinents(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchContinents();
  }, []);

  // Cargar países cuando cambia continente
  useEffect(() => {
    if (!selectedContinent) {
      setCountries([]);
      setSelectedCountry('');
      return;
    }

    fetch(`http://localhost:3000/api/countries/${selectedContinent}`)
      .then(res => res.json())
      .then(data => {
        setCountries(data);
        setSelectedCountry('');
        setPlaces([]);
      })
      .catch(console.error);
  }, [selectedContinent]);

  // Cargar lugares cuando cambia país
  useEffect(() => {
    if (!selectedCountry) {
      setPlaces([]);
      return;
    }

    fetch(`http://localhost:3000/api/recommended-places/${selectedCountry}`)
      .then(res => res.json())
      .then(data => setPlaces(data))
      .catch(console.error);
  }, [selectedCountry]);

  // Función para guardar nuevo continente
  const handleAddContinent = () => {
    if (!newContinentName.trim()) {
      alert('Debe ingresar un nombre para el continente');
      return;
    }

    fetch('http://localhost:3000/api/continents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newContinentName.trim() }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al agregar continente');
        return res.json();
      })
      .then(() => {
        setNewContinentName('');
        setShowModal(false);
        fetchContinents(); // Recargar continentes
      })
      .catch(err => alert(err.message));
  };

  // Obtener nombre del país seleccionado
  const selectedCountryName = countries.find(c => c.id === parseInt(selectedCountry))?.name || '';

  return (
    <div className="explore-container">
      <div className="filters container py-4">
        <div>
          <label className="form-label">Selecciona un continente:</label>
          <select
            className="form-select"
            value={selectedContinent}
            onChange={(e) => setSelectedContinent(e.target.value)}
          >
            <option value="">-- Selecciona continente --</option>
            {continents.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {selectedContinent && (
          <div>
            <label className="form-label">Selecciona un país:</label>
            <select
              className="form-select"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              <option value="">-- Selecciona país --</option>
              {countries.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {places.length > 0 && (
        <div className="container">
          <h2 className="text-center my-4">{selectedCountryName}</h2>
          <div className="row">
            {places.map((place) => (
              <div className="col-md-4 mb-4" key={place.id}>
                <div className="card">
                  <img src={place.image_url} className="card-img-top" alt={place.title} />
                  <div className="card-body text-center">
                    <p className="card-text">{place.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botones de admin */}
{isAdmin && (
  <div className="container mt-4">
    <button onClick={() => setShowContinentModal(true)} className="btn btn-primary me-2">
      Agregar Continente
    </button>
    {selectedContinent && (
      <button onClick={() => setShowCountryModal(true)} className="btn btn-warning me-2">
        Agregar País
      </button>
    )}
    {selectedCountry && (
      <button onClick={() => setShowPlaceModal(true)} className="btn btn-success">
        Agregar Lugar
      </button>
    )}
  </div>
)}

{/* Modal: Agregar Continente */}
{showContinentModal && (
  <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Agregar Continente</h5>
          <button type="button" className="btn-close" onClick={() => setShowContinentModal(false)}></button>
        </div>
        <div className="modal-body">
          <input
            type="text"
            className="form-control"
            placeholder="Nombre del continente"
            value={newContinentName}
            onChange={e => setNewContinentName(e.target.value)}
          />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowContinentModal(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleAddContinent}>Guardar</button>
        </div>
      </div>
    </div>
  </div>
)}

{/* Modal: Agregar País */}
{showCountryModal && (
  <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Agregar País</h5>
          <button type="button" className="btn-close" onClick={() => setShowCountryModal(false)}></button>
        </div>
        <div className="modal-body">
          <input
            type="text"
            className="form-control"
            placeholder="Nombre del país"
            value={newCountryName}
            onChange={e => setNewCountryName(e.target.value)}
          />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowCountryModal(false)}>Cancelar</button>
          <button className="btn btn-warning" onClick={handleAddCountry}>Guardar</button>
        </div>
      </div>
    </div>
  </div>
)}

{/* Modal: Agregar Lugar */}
{showPlaceModal && (
  <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Agregar Lugar Recomendado</h5>
          <button type="button" className="btn-close" onClick={() => setShowPlaceModal(false)}></button>
        </div>
        <div className="modal-body">
          <div className="mb-3">
            <label className="form-label">Título del lugar</label>
            <input
              type="text"
              className="form-control"
              value={newPlaceTitle}
              onChange={e => setNewPlaceTitle(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Imagen del lugar</label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={e => setNewPlaceImage(e.target.files[0])}
            />
          </div>

        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowPlaceModal(false)}>Cancelar</button>
          <button className="btn btn-success" onClick={handleAddPlace}>Guardar</button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Explore;
