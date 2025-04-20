import React, { useState, useEffect } from 'react';
import { generateMarketingStrategy } from '../services/aiService';
import { getUserIP, saveChat, loadUserChats } from '../services/chatService';
import StabilityService from '../services/stabilityService';
import '../styles/App.css'; 
import '../styles/responsive.css'; 
import { generateContent } from '../services/PredisService';

const placeholderTexts = [
  "Escribe tu estrategia de marketing...",
  "Ej: ¿Cómo promociono mi tienda online?",
  "Ej: Genera un banner para Instagram"
];
const typingSpeed = 100;

const ChatInterface = ({ currentChatId, ip, onChatUpdate }) => {
  const [messages, setMessages] = useState([
    { 
      text: "¡Hola! Soy tu asistente de marketing. Pregúntame lo que necesites.", 
      sender: "bot" 
    }
  ]);


  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localIp, setLocalIp] = useState('');
  const [localChatId, setLocalChatId] = useState(null);
  
  // Efecto para el placeholder animado
  const [placeholder, setPlaceholder] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [showOptions, setShowOptions] = useState(false);
  
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)

  
  // Efecto para cargar IP si no viene por props
  useEffect(() => {
    if (!ip) {
      const fetchIP = async () => {
        try {
          const userIP = await getUserIP();
          setLocalIp(userIP);
        } catch (error) {
          console.error("Error obteniendo IP:", error);
          setLocalIp("unknown-ip");
        }
      };
      fetchIP();
    }
  }, [ip]);

  // Efecto para cargar chat cuando cambia currentChatId
  useEffect(() => {
    const loadChat = async () => {
      if (!currentChatId) {
        setMessages([{ 
          text: "¡Hola! Soy tu asistente de marketing. Pregúntame lo que necesites.", 
          sender: "bot" 
        }]);
        setLocalChatId(null);
        return;
      }

      setIsLoading(true);
      try {
        const currentIp = ip || localIp;
        const chats = await loadUserChats(currentIp);
        const chatToLoad = chats.find(chat => chat.id === currentChatId);
        
        if (chatToLoad) {
          setMessages(chatToLoad.messages);
          setLocalChatId(currentChatId);
        }
      } catch (error) {
        console.error("Error cargando chat:", error);
        setMessages([{ 
          text: "⚠️ Error al cargar el chat. Intenta nuevamente.", 
          sender: "bot" 
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    loadChat();
  }, [currentChatId, ip, localIp]);

  // Placeholder animado (tu código existente)
  useEffect(() => {
    let charIndex = 0;
    const text = placeholderTexts[currentIndex % placeholderTexts.length];
    
    const timer = setInterval(() => {
      if (charIndex <= text.length) {
        setPlaceholder(text.substring(0, charIndex));
        charIndex++;
      } else {
        clearInterval(timer);
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
        }, 2000);
      }
    }, typingSpeed);

    return () => clearInterval(timer);
  }, [currentIndex]);

  // Función para formatear la respuesta de la IA (manteniendo tu formato exacto)
  const formatResponse = (text) => {
    return text.split('\n').map((paragraph, i) => {
      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
        return <h3 key={i} style={styles.subtitle}>{paragraph.replace(/\*\*/g, '')}</h3>;
      } else if (paragraph.startsWith('* ')) {
        return (
          <ul key={i} style={styles.list}>
            <li style={styles.listItem}>{paragraph.substring(2)}</li>
          </ul>
        );
      } else if (paragraph.includes(':')) {
        const [label, value] = paragraph.split(':');
        return (
          <p key={i} style={styles.detailItem}>
            <strong style={styles.detailLabel}>{label}:</strong> {value}
          </p>
        );
      }
      return <p key={i} style={styles.paragraph}>{paragraph}</p>;
    });
  };

  const handleSendClick = () => {
    if (input.trim()) {
      setShowOptions(true);
    }
  };

  const handleSend = async (option) => {
    setShowOptions(false);
    if (!input.trim() || isLoading) return;
  
    // 1. Agregar mensaje del usuario
    const userMessage = { text: input, sender: "user" };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // 2. Obtener respuesta de la IA
      
      let aiResponse = "";
      let imageUrl = null;
      let videoUrl = null;

      switch(option) {
        case 'estrategia':
          aiResponse = await generateMarketingStrategy(input);
          break;
        case 'imagen':
          setIsGeneratingImage(true);
          try {
            imageUrl = await StabilityService.generateAndUploadImage(input, {
              // Opciones adicionales si las necesitas
              output_format: 'png' // o 'jpeg'
            });
        } catch (genError) {
            // Mensaje más amigable para errores de imagen
            aiResponse = "No pude generar la imagen. Por favor intenta con otro prompt.";
            console.error(genError);
            setIsGeneratingImage(false);
        }
          break;  
        case 'video':
          setIsGeneratingVideo(true); 
          try {
            // 3. Llamada al servicio de Predis.ai para generar video
            const brandId = '68043a0bd24f5bcdbf592af0';  // Sustituye por tu Brand ID
            const response = await generateContent(
              brandId, 
              input, 
              'generic',  // Puedes cambiar el tipo de post si lo deseas
              'spanish',  // Idioma de entrada
              'video',    // Tipo de media (en este caso video)
              'short'     // Duración del video
            );
            videoUrl = response.video_url;  // Asegúrate de que la respuesta tenga un campo de URL del video
            aiResponse = response.message || "Contenido generado exitosamente";  // Respuesta de la API
          } catch (genError) {
            aiResponse = "No pude generar el video. Por favor intenta con otro prompt.";
            console.error(genError);
          } finally {
            setIsGeneratingVideo(false);
          }
          break;
        default:
          aiResponse = await generateMarketingStrategy(input);
          break;
      }

      const botMessage = { 
        text: aiResponse, 
        sender: "bot",
        formatted: option === 'estrategia',
        ...(imageUrl && { imageUrl }),
        ...(videoUrl && { videoUrl }),
        ...(option === 'imagen' && { prompt: input }),
        ...(option === 'video' && { prompt: input })
      };

      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);
      
      // 3. Determinar IP y chatId a usar
      const currentIp = ip || localIp;
      const currentChatIdToUse = localChatId || currentChatId || Date.now().toString();
      
      // 4. Preparar datos para Firebase
      const chatData = {
        title: input.length > 30 ? `${input.substring(0, 30)}...` : input,
        messages: updatedMessages,
        createdAt: new Date(),
        lastUpdated: new Date()
      };
      
      // 5. Guardar en Firebase
      await saveChat(currentIp, currentChatIdToUse, chatData);
      
      // 6. Actualizar estado local y notificar al componente padre
      setLocalChatId(currentChatIdToUse);
      
      if (onChatUpdate) {
        onChatUpdate({
          id: currentChatIdToUse,
          ...chatData
        });
      }
      
    } catch (error) {
      console.error("❌ Error en handleSend:", error);
      setMessages(prev => [...prev, { 
        text: "⚠️ Error al procesar tu solicitud. Por favor intenta nuevamente.", 
        sender: "bot" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizado (manteniendo tus estilos exactos)
  return (
    <div style={styles.container}>
      <div style={styles.messagesContainer}>
        {messages.map((msg, i) => (
          <div 
            key={i} 
            style={{
              ...styles.message,
              ...(msg.sender === 'user' ? styles.userMessage : styles.botMessage)
            }}
          >
            {msg.imageUrl ? (
              <div style={styles.imageContainer}>
                <img 
                  src={msg.imageUrl}
                  alt="Imagen generada por IA" 
                  style={styles.generatedImage}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/image-error-placeholder.png';
                  }}
                />
                {msg.prompt && <p style={styles.imageCaption}>{msg.prompt}</p>}
              </div>
            ) : msg.videoUrl ? (
              <div style={styles.videoContainer}>
                <video 
                  controls 
                  style={styles.generatedVideo}
                >
                  <source src={msg.videoUrl} type="video/mp4" />
                  Tu navegador no soporta el video.
                </video>
                {msg.prompt && <p style={styles.videoCaption}>{msg.prompt}</p>}
              </div>
            ) : msg.formatted ? (
              <div style={styles.formattedMessage}>
                {formatResponse(msg.text)}
              </div>
            ) : (
              <p style={styles.text}>{msg.text}</p>
            )}
          </div>
        ))}
        {(isLoading)&& (
          <div style={{...styles.message, ...styles.botMessage}}>
            <div style={styles.typingIndicator}>
              <span style={styles.typingDot}></span>
              <span style={styles.typingDot}></span>
              <span style={styles.typingDot}></span>
            </div>
            {isGeneratingImage && <p style={styles.generatingText}>Generando imagen...</p>}
            {isGeneratingVideo && <p style={styles.generatingText}>Generando video (puede tomar unos minutos)...</p>}
          </div>
        )}
      </div>

      {showOptions && (
        <div style={styles.flashcard}>
          <div style={styles.flashcardContent}>
            <h3 style={styles.flashcardTitle}>¿Qué tipo de contenido deseas?</h3>
            <div style={styles.optionsContainer}>
              <button 
                onClick={() => handleSend('estrategia')}
                style={styles.optionButton}
              >
                Estrategia
              </button>
              <button 
                onClick={() => handleSend('imagen')}
                style={styles.optionButton}
              >
                Imagen
              </button>
              <button 
                onClick={() => handleSend('video')}
                style={styles.optionButton}
              >
                Video
              </button>
            </div>
            <button 
              onClick={() => setShowOptions(false)}
              style={styles.cancelButton}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div style={styles.inputContainer}>
        <input
          placeholder={placeholder}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={isLoading}
          style={styles.input}
        />
        <button 
          onClick={handleSendClick}
          disabled={isLoading || !input.trim()}
          style={styles.button}
        >
          {isLoading ? 'Generando...' : 'Enviar'}
        </button>
      </div>
    </div>
  );
};

// Tus estilos exactamente igual
const styles = {
  container: {
    maxWidth: '80%',
    margin: '2rem auto',
    display: 'flex',
    flexDirection: 'column',
    height: '83vh',
    backgroundColor: '#1A1A2E',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    marginBottom: '20px',
    padding: '15px',
    borderRadius: '8px',
    backgroundColor: 'rgba(26, 26, 46, 0.8)'
  },
  message: {
    maxWidth: '80%',
    padding: '15px 20px',
    borderRadius: '18px',
    marginBottom: '15px',
    lineHeight: '1.6',
    wordWrap: 'break-word'
  },
  userMessage: {
    alignSelf: 'flex-end',
    background: 'linear-gradient(45deg, #6E48AA, #8A2BE2)',
    borderBottomRightRadius: '5px',
    color: 'white'
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#2C2C54',
    borderBottomLeftRadius: '5px',
    color: 'white'
  },
  text: {
    margin: 0
  },
  formattedMessage: {
    padding: '5px'
  },
  subtitle: {
    color: '#00E0FF',
    fontSize: '1.2rem',
    margin: '15px 0 10px 0',
    borderBottom: '1px solid #6E48AA',
    paddingBottom: '5px'
  },
  paragraph: {
    margin: '10px 0',
    lineHeight: '1.6'
  },
  list: {
    margin: '10px 0',
    paddingLeft: '20px'
  },
  listItem: {
    marginBottom: '8px',
    position: 'relative',
    paddingLeft: '15px'
  },
  detailItem: {
    margin: '8px 0'
  },
  detailLabel: {
    color: '#FF7E5F'
  },
  inputContainer: {
    display: 'flex',
    gap: '10px',
    padding: '15px',
    backgroundColor: '#2C2C54',
    borderRadius: '10px',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    padding: '12px 15px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    fontSize: '16px',
    transition: 'all 0.3s',
    boxShadow: '0 0 0 1px rgba(110, 72, 170, 0.3)'
  },
  button: {
    padding: '12px 20px',
    background: 'linear-gradient(45deg, #6E48AA, #FF7E5F)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s',
    minWidth: '100px'
  },
  typingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  typingDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#00E0FF',
    borderRadius: '50%',
    animation: 'typingAnimation 1.4s infinite ease-in-out'
  },
  '@keyframes typingAnimation': {
    '0%, 60%, 100%': {
      transform: 'translateY(0)',
      opacity: 0.6
    },
    '30%': {
      transform: 'translateY(-5px)',
      opacity: 1
    }
  },
  flashcard: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  flashcardContent: {
    backgroundColor: '#2C2C54',
    padding: '25px',
    borderRadius: '15px',
    width: '350px',
    boxShadow: '0 5px 25px rgba(0, 0, 0, 0.5)',
    textAlign: 'center',
  },
  flashcardTitle: {
    color: '#00E0FF',
    marginBottom: '20px',
    fontSize: '1.3rem',
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
  },
  optionButton: {
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(45deg, #6E48AA, #8A2BE2)',
    color: 'white',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    ':hover': {
      transform: 'scale(1.03)',
    },
  },
  cancelButton: {
    padding: '10px 15px',
    background: 'transparent',
    border: '1px solid #FF4D4D',
    color: '#FF4D4D',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    ':hover': {
      background: 'rgba(255, 77, 77, 0.1)',
    },
  },
  imageContainer: {
    margin: '10px 0',
    textAlign: 'center'
  },
  generatedImage: {
    maxWidth: '100%',
    maxHeight: '400px',
    borderRadius: '8px',
    border: '1px solid #3E3E6B'
  },
  imageCaption: {
    marginTop: '8px',
    color: '#AAA',
    fontSize: '0.9rem'
  },
  flashcardOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  videoContainer: {
    width: '100%',
    margin: '10px 0',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  generatedVideo: {
    width: '100%',
    borderRadius: '8px',
    maxHeight: '500px',
    objectFit: 'contain'
  },
  videoCaption: {
    marginTop: '8px',
    fontSize: '0.8rem',
    color: '#666',
    fontStyle: 'italic'
  },
  generatingText: {
    marginTop: '8px',
    fontSize: '0.9rem',
    color: '#666'
  }
};

export default ChatInterface;