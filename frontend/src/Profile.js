import React, { useEffect, useState } from 'react';
import logo from './assets/bad.png';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Campos editables
  const [name, setName] = useState('');             // <--- nuevo estado para nombre
  const [birthdate, setBirthdate] = useState('');
  const [location, setLocation] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [bio, setBio] = useState('');
  useEffect(() => {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    console.error('No hay userId en localStorage');
    return;
  }

  fetch('http://localhost:3000/api/profile', {
    headers: {
      'x-user-id': userId
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data.message) {
        console.error('Error:', data.message);
        return;
      }
      setUser(data);
      setName(data.name || '');
      setBirthdate(data.birthdate ? data.birthdate.slice(0, 10) : '');
      setLocation(data.location || '');
      setProfilePicture(data.profile_picture || '');
      setBio(data.bio || '');
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
}, []);



  const handleSave = () => {
    const formData = new FormData();
    formData.append('userId', localStorage.getItem('userId'));
    formData.append('name', name);                     // <--- enviar nombre
    formData.append('birthdate', birthdate);
    formData.append('location', location);
    formData.append('bio', bio);

    if (profilePicture instanceof File) {
      formData.append('profile_picture', profilePicture);
    }

    fetch('http://localhost:3000/api/profile', {
      method: 'PUT',
      body: formData
    })
      .then(res => res.json())
      .then(result => {
        const updatedPicture = profilePicture instanceof File
          ? `http://localhost:3000${result.profile_picture}`
          : profilePicture;

        setUser({ ...user, name, birthdate, location, profile_picture: updatedPicture, bio });  // <--- actualizar nombre
        setShowModal(false);
      })
      .catch(err => console.error('Error al guardar perfil:', err));
  };

  if (loading) return <p>Cargando perfil...</p>;
  if (!user) return <p>No se pudo cargar el perfil.</p>;

  return (
    <div className="container mt-5">
      <div className="row">
        {/* Foto y nombre */}
        <div className="col-md-4">
          <div className="card">
            <img
              src={user.profile_picture || logo}
              alt="Foto de perfil"
              className="card-img-top"
            />
            <div className="card-body text-center">
              <h5 className="card-title">{user.name}</h5>
              <p className="card-text">Perfil de usuario</p>
            </div>
          </div>
        </div>

        {/* Info + botón editar */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4>Información Personal</h4>
              <button className="btn btn-sm btn-primary" onClick={() => setShowModal(true)}>Editar</button>
            </div>
            <div className="card-body">
              <ul className="list-group">
                <li className="list-group-item"><strong>Correo:</strong> {user.email}</li>
                <li className="list-group-item"><strong>Ubicación:</strong> {user.location || 'No disponible'}</li>
                <li className="list-group-item"><strong>Fecha de nacimiento:</strong> {user.birthdate ? new Date(user.birthdate).toLocaleDateString() : 'No disponible'}</li>
                <li className="list-group-item"><strong>Biografía:</strong> {user.bio || 'No disponible'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de edición */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Perfil</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nombre</label>  {/* <--- campo nuevo */}
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Fecha de nacimiento</label>
                  <input
                    type="date"
                    className="form-control"
                    value={birthdate}
                    onChange={e => setBirthdate(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Ubicación</label>
                  <input
                    type="text"
                    className="form-control"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Biografía</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label">Foto de perfil</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={e => setProfilePicture(e.target.files[0])}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleSave}>Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
