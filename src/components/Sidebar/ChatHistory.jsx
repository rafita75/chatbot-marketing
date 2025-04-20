import React, { useState } from 'react';
import FlashCard from './FlashCard';
import '../../styles/Sidebar.css';

const ChatHistory = ({ chats, currentChatId, onSelectChat, onDeleteChat, deletingChatId }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null)

  const handleDeleteClick = (chatId, e) => {
    e.stopPropagation();
    setChatToDelete(chatId);
    setShowConfirm(true);
    setDeleteError(null); // Resetear errores previos
  };

  const confirmDelete = async () => {
    try {
      await onDeleteChat(chatToDelete); // Asegúrate de esperar esta promesa
      
      // Solo cerrar la confirmación si fue exitoso
      setShowConfirm(false);
      setChatToDelete(null);
    } catch (error) {
      console.error("Error en frontend al eliminar:", error);
      setDeleteError("No se pudo eliminar el chat. Intenta nuevamente.");
      // Mantener el diálogo abierto para que el usuario pueda reintentar
    }
  };


  const cancelDelete = () => {
    setShowConfirm(false);
    setChatToDelete(null);
    setDeleteError(null);
  };

  if (chats.length === 0) {
    return (
      <div className="empty-chats">
        <p>No hay chats anteriores</p>
      </div>
    );
  }

  return (
    <div className="chat-history">
      {showConfirm && (
        <FlashCard
          message="¿Estás seguro de que quieres eliminar este chat?"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          error={deleteError}
        />
      )}
      
      {chats.map(chat => (
        <div
          key={chat.id}
          className={`chat-item ${chat.id === currentChatId ? 'active' : ''} ${
            deletingChatId === chat.id ? 'deleting' : ''
          }`}
          onClick={() => onSelectChat(chat.id)}
        >
          <div className="chat-info">
            <div className="chat-title">
              {chat.title || `Chat ${new Date(chat.createdAt).toLocaleDateString()}`}
            </div>
            <div className="chat-date">
              {new Date(chat.createdAt).toLocaleString()}
            </div>
          </div>
          <button 
            className="delete-chat-btn"
            onClick={(e) => handleDeleteClick(chat.id, e)}
            title="Eliminar este chat"
            disabled={deletingChatId === chat.id}
          >
            {deletingChatId === chat.id ? '🗑️...' : '🗑️'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;