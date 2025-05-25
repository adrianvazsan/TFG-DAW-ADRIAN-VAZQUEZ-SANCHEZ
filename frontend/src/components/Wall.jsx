import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import './Wall.css';
import profilePic from '../assets/bad.png';

const containerStyle = { width: '100%', height: '300px' };
const center = { lat: 40.4168, lng: -3.7038 }; // Madrid de ejemplo

const Wall = () => {
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState({});
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    image: null,
    location_name: '',
    coordinates: null,
  });
  const [showForm, setShowForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://localhost:3000/posts');
      setPosts(res.data);
    } catch (err) {
      console.error('Error al cargar posts', err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPost({ ...newPost, image: file });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost({ ...newPost, [name]: value });
  };

  const handleLocationChange = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setSelectedLocation({ lat, lng });
    setNewPost({ ...newPost, coordinates: JSON.stringify({ lat, lng }) });
  };

  const handlePost = async () => {
    const { title, description, image, location_name, coordinates } = newPost;

    if (!image || !description) {
      alert('La imagen y la descripción son obligatorias');
      return;
    }

    const formData = new FormData();
    formData.append('user_id', localStorage.getItem('userId'));
    formData.append('title', title);
    formData.append('description', description);
    formData.append('location_name', location_name);
    formData.append('coordinates', coordinates);
    formData.append('image', image);

    try {
      const res = await axios.post('http://localhost:3000/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        alert('Publicación creada con éxito');
        setShowForm(false);
        setNewPost({
          title: '',
          description: '',
          image: null,
          location_name: '',
          coordinates: null,
        });
        fetchPosts();
      }
    } catch (err) {
      console.error('Error al crear post', err);
      alert('Error al crear la publicación');
    }
  };

  const fetchLikes = async () => {
  try {
    const res = await axios.get('http://localhost:3000/posts');
    setPosts(res.data);

    const likesData = {};
    for (const post of res.data) {
      const likeRes = await axios.get(`http://localhost:3000/posts/${post.post_id}/likes`);
      likesData[post.post_id] = likeRes.data.likes;
    }
    setLikes(likesData);
  } catch (err) {
    console.error('Error al cargar likes', err);
  }
};
const handleLike = async (postId) => {
  try {
    const userId = localStorage.getItem('userId');
    const res = await axios.post(`http://localhost:3000/posts/${postId}/like`, { userId });
    
    // Actualizar conteo después del like
    const updatedLikeRes = await axios.get(`http://localhost:3000/posts/${postId}/likes`);
    setLikes(prev => ({ ...prev, [postId]: updatedLikeRes.data.likes }));
  } catch (err) {
    console.error('Error al dar like', err);
  }
};
const handleShare = (postId) => {
  const shareUrl = `${window.location.origin}/posts/${postId}`; // o personalízalo
  navigator.clipboard.writeText(shareUrl)
    .then(() => alert('¡Enlace copiado al portapapeles!'))
    .catch(err => console.error('Error al copiar', err));
};




  return (
    <div className="container mt-4">
      <button className="btn btn-success mb-3" onClick={() => setShowForm(true)}>➕ Publicar</button>

      {showForm && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Nueva publicación</h5>
                <button className="btn-close" onClick={() => setShowForm(false)} />
              </div>
              <div className="modal-body">
                <input type="file" className="form-control mb-2" accept="image/*" onChange={handleImageUpload} />
                {newPost.image && (
                  <img
                    src={URL.createObjectURL(newPost.image)}
                    alt="preview"
                    className="img-fluid mb-3"
                    style={{ maxHeight: '200px', objectFit: 'contain' }}
                  />
                )}
                <input type="text" name="title" placeholder="Título (opcional)" className="form-control mb-2" value={newPost.title} onChange={handleInputChange} />
                <textarea name="description" placeholder="Comentario" rows="3" className="form-control mb-2" value={newPost.description} onChange={handleInputChange} />
                <input type="text" name="location_name" placeholder="Lugar (opcional)" className="form-control mb-2" value={newPost.location_name} onChange={handleInputChange} />

                <LoadScript googleMapsApiKey="TU_API_KEY">
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={12}
                    onClick={handleLocationChange}
                  >
                    {selectedLocation && <Marker position={selectedLocation} />}
                  </GoogleMap>
                </LoadScript>

                {newPost.coordinates && (
                  <p><strong>Coordenadas:</strong> {newPost.coordinates}</p>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={handlePost}>Publicar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {posts.map(post => (
        <div className="card mb-4" key={post.post_id}>
          <div className="card-header d-flex align-items-center gap-2">
            <img src={post.profile_picture ? `http://localhost:3000${post.profile_picture}` : profilePic} alt="avatar" className="rounded-circle" width="40" />
            <strong>{post.name}</strong>
          </div>
          <img src={`http://localhost:3000${post.image_url}`} className="card-img-top" alt="post" />
          <div className="card-body">
            <h5>{post.title}</h5>
            <p>{post.description}</p>
            {post.location_name && <p><strong>Ubicación:</strong> {post.location_name}</p>}
            {post.coordinates && <p><strong>Coordenadas:</strong> {post.coordinates}</p>}
            <div className="d-flex gap-3">
              <button className="btn btn-outline-danger btn-sm" onClick={() => handleLike(post.post_id)}>
                ❤️ Like ({likes[post.post_id] || 0})
              </button>
              <button className="btn btn-outline-primary btn-sm" onClick={() => handleShare(post.post_id)}>
                🔗 Compartir
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Wall;
