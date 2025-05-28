import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Chat.css';

const currentUserId = parseInt(localStorage.getItem('userId'), 10);

function ChatPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  const fetchUsers = () => {
    axios.get(`http://localhost:3001/users-with-unread/${currentUserId}`)
      .then(res => {
        setUsers(res.data);
        if (!selectedUser && res.data.length > 0) {
          setSelectedUser(res.data[0]);
        }
      })
      .catch(err => {
        console.error('❌ Error al cargar usuarios:', err);
      });
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 5000);
    return () => clearInterval(interval);
  }, [currentUserId, selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      // Obtener mensajes
      axios.get(`http://localhost:3001/messages/${currentUserId}/${selectedUser.id}`)
        .then(res => setMessages(res.data));

      // Marcar como leídos los mensajes recibidos
      axios.put(`http://localhost:3001/messages/read/${currentUserId}/${selectedUser.id}`)
        .catch(err => console.error('❌ Error al marcar mensajes como leídos', err));
    }
  }, [selectedUser]);

  const handleSend = () => {
    if (!text.trim()) return;

    const newMessage = {
      sender_id: currentUserId,
      receiver_id: selectedUser.id,
      message: text,
    };

    axios.post('http://localhost:3001/messages', newMessage)
      .then(() => {
        setMessages([...messages, { ...newMessage, sent_at: new Date() }]);
        setText('');
      });
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <h5 className="sidebar-title">Chats</h5>
        {users.map(user => (
  <div
    key={user.id}
    className={`chat-user ${selectedUser?.id === user.id ? 'active' : ''}`}
    onClick={() => setSelectedUser(user)}
  >
    <img src={user.profile_picture || '/default-avatar.png'} alt={user.name} />
    <span>{user.name}</span>

    {/* NUEVO: Mostrar contador si tiene mensajes no leídos */}
    {user.unreadCount > 0 && (
      <span className="badge bg-danger ms-auto">
        {user.unreadCount > 9 ? '9+' : user.unreadCount}
      </span>
    )}
  </div>
))}

      </div>

      <div className="chat-main">
        {selectedUser && (
          <>
            <div className="chat-header">
              <img src={selectedUser.profile_picture || '/default-avatar.png'} alt={selectedUser.name} />
              <strong>{selectedUser.name}</strong>
            </div>

            <div className="chat-messages">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`chat-bubble ${msg.sender_id === currentUserId ? 'yo' : 'otro'}`}
                >
                  {msg.message}
                </div>
              ))}
            </div>

            <div className="chat-input">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escribe un mensaje..."
              />
              <button onClick={handleSend}>➤</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ChatPage;
