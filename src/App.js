import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar/Sidebar';
import { getUserIP, loadUserChats } from './services/chatService';
import './styles/GlobalStyles.css';
import './styles/responsive.css';
import { motion } from "framer-motion";
import BubbleBackground from './components/BubbleBackground';

function App() {
  const [ip, setIp] = useState('');
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar IP y chats al iniciar
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const userIP = await getUserIP();
        setIp(userIP);
        
        const userChats = await loadUserChats(userIP);
        setChats(userChats);
      } catch (error) {
        console.error("Error inicializando app:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeApp();
  }, []);

  const handleChatDeleted = (deletedChatId) => {
    setChats(chats.filter(chat => chat.id !== deletedChatId));
    if (currentChatId === deletedChatId) {
      setCurrentChatId(null);
    }
  };


  const handleChatUpdate = (updatedChat) => {
    setChats(prevChats => {
      const existingIndex = prevChats.findIndex(c => c.id === updatedChat.id);
      if (existingIndex >= 0) {
        const newChats = [...prevChats];
        newChats[existingIndex] = updatedChat;
        return newChats;
      }
      return [updatedChat, ...prevChats];
    });
  };

  if (isLoading) return <div className="loading">Cargando...</div>;

  return (
    <div className="app-container" style={{ 
      background: '#1A1A2E', 
      minHeight: '100vh', 
      display: 'flex' 
    }}>
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={() => setCurrentChatId(null)}
        onSelectChat={setCurrentChatId}
        onChatDeleted={handleChatDeleted}
      />
      
      <div className="main-content">
        <BubbleBackground />
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ color: '#00E0FF', textAlign: 'center' }}
        >
          Marketing AI Genius
        </motion.h1>
        <ChatInterface
          key={currentChatId || 'new'} // Forzar re-render al cambiar chat
          currentChatId={currentChatId}
          ip={ip}
          onChatUpdate={handleChatUpdate}
        />
      </div>
    </div>
  );
}

export default App;