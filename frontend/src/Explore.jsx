import React, { useState, useEffect } from 'react';
import './Explore.css';
import { toast } from 'react-toastify';

const Explore = () => {
  const [continents, setContinents] = useState([]);
  const [countries, setCountries] = useState([]);
  const [places, setPlaces] = useState([]);

  const [selectedContinent, setSelectedContinent] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  const [isAdmin, setIsAdmin] = useState(false);
  const [showContinentModal, setShowContinentModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showPlaceModal, setShowPlaceModal] = useState(false);

  const [newContinentName, setNewContinentName] = useState('');
  const [newCountryName, setNewCountryName] = useState('');
  const [newPlaceTitle, setNewPlaceTitle] = useState('');
  const [newPlaceImage, setNewPlaceImage] = useState(null);

  const [editingPlace, setEditingPlace] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedImage, setEditedImage] = useState(null);


  const fetchContinents = () => {
    fetch('http://localhost:3000/api/continents')
      .then(res => res.json())
      .then(setContinents)
      .catch(console.error);
  };

  useEffect(() => {
    fetchContinents();
  }, []);

  useEffect(() => {
    if (!selectedContinent) return setCountries([]);
    fetch(`http://localhost:3000/api/countries/${selectedContinent}`)
      .then(res => res.json())
      .then(setCountries)
      .catch(console.error);
  }, [selectedContinent]);

  useEffect(() => {
    if (!selectedCountry) return setPlaces([]);
    fetch(`http://localhost:3000/api/recommended-places/${selectedCountry}`)
      .then(res => res.json())
      .then(setPlaces)
      .catch(console.error);
  }, [selectedCountry]);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      fetch('http://localhost:3000/api/profile', {
        headers: { 'x-user-id': userId },
      })
        .then(res => res.json())
        .then(data => setIsAdmin(data.role === 'admin'))
        .catch(() => setIsAdmin(false));
    }
  }, []);



const handleAddContinent = () => {
  if (!newContinentName.trim()) {
    toast.error('Nombre requerido');
    return;
  }
  fetch('http://localhost:3000/api/continents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newContinentName.trim() })
  })
    .then(res => {
      if (!res.ok) return Promise.reject('Error al agregar continente');
      return fetchContinents();
    })
    .then(() => {
      toast.success('Continente agregado');
      setNewContinentName('');
      setShowContinentModal(false);
    })
    .catch(err => toast.error(err));
};

const handleAddCountry = () => {
  if (!newCountryName.trim()) {
    toast.error('Nombre requerido');
    return;
  }
  fetch('http://localhost:3000/api/countries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: newCountryName.trim(),
      continent_id: parseInt(selectedContinent),
    })
  })
    .then(res => {
      if (!res.ok) return Promise.reject('Error al agregar país');
      return fetch(`http://localhost:3000/api/countries/${selectedContinent}`);
    })
    .then(res => res.json())
    .then(setCountries)
    .then(() => {
      toast.success('País agregado');
      setNewCountryName('');
      setShowCountryModal(false);
    })
    .catch(err => toast.error(err));
};



 const handleAddPlace = () => {
  if (!newPlaceTitle.trim() || !newPlaceImage) return alert('Completa todos los campos');
  const formData = new FormData();
  formData.append('title', newPlaceTitle);
  formData.append('image', newPlaceImage);

  fetch(`http://localhost:3000/api/recommended-places/${selectedCountry}`, {
    method: 'POST',
    body: formData,
  })
    .then(res => res.ok ? fetch(`http://localhost:3000/api/recommended-places/${selectedCountry}`) : Promise.reject('Error'))
    .then(res => res.json())
    .then(setPlaces)
    .then(() => {
      toast.success('Lugar agregado');
      setNewPlaceTitle('');
      setNewPlaceImage(null);
      setShowPlaceModal(false);
    })
    .catch(err => toast.error(err));
};

  const handleDeleteContinent = id => {
    if (!window.confirm('¿Eliminar continente?')) return;
    fetch(`http://localhost:3000/api/continents/${id}`, { method: 'DELETE' })
      .then(res => res.ok ? fetchContinents() : Promise.reject('Error'))
      .then(() => {
        setSelectedContinent('');
        setCountries([]);
        setPlaces([]);
        toast.success('Continente eliminado');
      })
      .catch(err => toast.error(err));
  };
 const handleEditPlace = (place) => {
  setEditingPlace(place);
  setEditedTitle(place.title);
  setEditedImage(null);
};



const submitEditPlace = () => {
  if (!editedTitle.trim()) {
    return toast.error('Título requerido');
  }

  const formData = new FormData();
  formData.append('title', editedTitle);
  if (editedImage) {
    formData.append('image', editedImage);
  }

  fetch(`http://localhost:3000/api/recommended-places/${editingPlace.id}/edit`, {
    method: 'PUT',
    body: formData,
  })
    .then(res => res.ok ? fetch(`http://localhost:3000/api/recommended-places/${selectedCountry}`) : Promise.reject('Error'))
    .then(res => res.json())
    .then(data => {
      setPlaces(data);
      toast.success('Lugar editado');
      setEditingPlace(null);
      setEditedTitle('');
      setEditedImage(null);
    })
    .catch(err => toast.error('Error al editar lugar'));
};



  const handleDeleteCountry = id => {
    if (!window.confirm('¿Eliminar país?')) return;
    fetch(`http://localhost:3000/api/countries/${id}`, { method: 'DELETE' })
      .then(res => res.ok ? fetch(`http://localhost:3000/api/countries/${selectedContinent}`) : Promise.reject('Error'))
      .then(res => res.json())
      .then(setCountries)
      .then(() => {
        setSelectedCountry('');
        setPlaces([]);
        toast.success('País eliminado');
      })
      .catch(err => toast.error(err));
  };

  const handleDeletePlace = id => {
    if (!window.confirm('¿Eliminar lugar?')) return;
    fetch(`http://localhost:3000/api/recommended-places/${id}`, { method: 'DELETE' })
      .then(res => res.ok ? fetch(`http://localhost:3000/api/recommended-places/${selectedCountry}`) : Promise.reject('Error'))
      .then(res => res.json())
      .then(setPlaces)
      .then(() => toast.success('Lugar eliminado'))
      .catch(err => toast.error(err));
  };

  const selectedCountryName = countries.find(c => c.id === parseInt(selectedCountry))?.name || '';

  return (
    <div className="explore-container">
      <div className="filters container py-4">
        <div>
          <label className="form-label">Selecciona un continente:</label>
          <select className="form-select" value={selectedContinent} onChange={e => setSelectedContinent(e.target.value)}>
            <option value="">-- Selecciona continente --</option>
            {continents.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {isAdmin && selectedContinent && (
            <button onClick={() => handleDeleteContinent(selectedContinent)} className="btn btn-sm btn-danger mt-2">Eliminar este continente</button>
          )}
        </div>

        {selectedContinent && (
          <div>
            <label className="form-label">Selecciona un país:</label>
            <select className="form-select" value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)}>
              <option value="">-- Selecciona país --</option>
              {countries.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {isAdmin && selectedCountry && (
              <button onClick={() => handleDeleteCountry(selectedCountry)} className="btn btn-sm btn-danger mt-2">Eliminar este país</button>
            )}
          </div>
        )}
      </div>

      {places.length > 0 && (
        <div className="container">
          <h2 className="text-center my-4">{selectedCountryName}</h2>
          <div className="row">
            {places.map(place => (
              <div className="col-md-4 mb-4" key={place.id}>
                <div className="card">
                  <img src={place.image_url} className="card-img-top" alt={place.title} />
                  <div className="card-body text-center">
                    <p className="card-text">{place.title}</p>
                    {isAdmin && (
                      <div className="d-flex justify-content-center gap-2 mt-2">
                        <button
                          onClick={() => handleEditPlace(place)}
                          className="btn btn-sm btn-warning"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeletePlace(place.id)}
                          className="btn btn-sm btn-danger"
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botones admin */}
      {isAdmin && (
        <div className="container mt-4">
          <button onClick={() => setShowContinentModal(true)} className="btn btn-primary me-2">Agregar Continente</button>
          {selectedContinent && (
            <button onClick={() => setShowCountryModal(true)} className="btn btn-warning me-2">Agregar País</button>
          )}
          {selectedCountry && (
            <button onClick={() => setShowPlaceModal(true)} className="btn btn-success">Agregar Lugar</button>
          )}
        </div>
      )}

      {/* Aquí siguen tus modales */}
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

{editingPlace && (
  <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Editar Lugar</h5>
          <button type="button" className="btn-close" onClick={() => setEditingPlace(null)}></button>
        </div>
        <div className="modal-body">
          <div className="mb-3">
            <label className="form-label">Nuevo título</label>
            <input
              type="text"
              className="form-control"
              value={editedTitle}
              onChange={e => setEditedTitle(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Nueva imagen (opcional)</label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={e => setEditedImage(e.target.files[0])}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setEditingPlace(null)}>Cancelar</button>
          <button className="btn btn-primary" onClick={submitEditPlace}>Guardar cambios</button>
        </div>
      </div>
    </div>
  </div>
)}



    </div>
  );
};

export default Explore;
