import React, { useState, useEffect } from 'react';
import ChatHistory from './ChatHistory';
import NewChatButton from './NewChatButton';
import SidebarToggle from './SidebarToggle';
import { deleteChat } from '../../services/chatService';
import '../../styles/Sidebar.css';

const Sidebar = ({ chats, currentChatId, onNewChat, onSelectChat, onChatDeleted }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [deletingChatId, setDeletingChatId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSelect = (chatId) => {
    onSelectChat(chatId);
    if (isMobile) setIsOpen(false);
  };

  const handleDeleteChat = async (chatId) => {
    setDeletingChatId(chatId);
    setError(null); // Resetear errores previos
    
    try {
      // Ahora deleteChat maneja la IP internamente
      await deleteChat(chatId);
      
      // Notificar al componente padre
      onChatDeleted(chatId);
      
      // Si el chat eliminado es el actual, limpiar la selección
      if (currentChatId === chatId) {
        onSelectChat(null);
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      setError(error.message); // Guardar el error para mostrarlo en la UI
    } finally {
      setDeletingChatId(null);
    }
  };

  return (
    <>
      <SidebarToggle isOpen={isOpen} setIsOpen={setIsOpen}/>
      
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <NewChatButton onClick={onNewChat} />
        {error && (
          <div className="error-message">
            Error: {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}
        <ChatHistory 
          chats={chats}
          currentChatId={currentChatId}
          onSelectChat={handleSelect}
          onDeleteChat={handleDeleteChat}
          deletingChatId={deletingChatId}
        />
      </div>

      {isMobile && isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
};

export default Sidebar;