import { db } from "../firebase";
import { doc, setDoc, getDocs, collection, deleteDoc } from "firebase/firestore"; 

    export const getUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip; // Ejemplo: "186.23.45.12"
    } catch (error) {
      console.error("Error al obtener la IP:", error);
      return "unknown-ip"; // Valor por defecto si falla
    }
  };

  export const saveChat = async (ip, chatId, chatData) => {
    try {
        const messagesToSave = chatData.messages.map(msg => {
            if (msg.image && msg.image.startsWith('data:image')) {
                return {
                    ...msg,
                    image: 'image-data-removed', // No guardar la imagen completa en Firestore
                    hasImage: true
                };
            }
            if (msg.videoUrl) {
                return {
                    ...msg,
                    hasVideo: true,
                    // Conservamos la URL del video ya que es un enlace externo
                    videoUrl: msg.videoUrl
                };
            }
            return msg;
        });

        const chatToSave = {
            ...chatData,
            messages: messagesToSave,
            lastUpdated: new Date(),
            ip: ip
        };

        await setDoc(doc(db, "chats", ip, "userChats", chatId), chatToSave);
        return chatId;
    } catch (error) {
        console.error("Error saving chat:", error);
        throw new Error("No se pudo guardar el chat. Por favor intenta nuevamente.");
    }
};
  export const loadUserChats = async (ip) => {
    try {
      const querySnapshot = await getDocs(collection(db, "chats", ip, "userChats"));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convertir Firestore Timestamp a Date
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })).sort((a, b) => b.createdAt - a.createdAt); // Ordenar por fecha descendente
    } catch (error) {
      console.error("Error cargando chats:", error);
      return [];
    }
  };
  
  export const deleteChat = async (chatId) => {
    try {
      // Obtenemos la IP usando tu función
      const userIP = await getUserIP();
      
      // Validamos la IP obtenida
      if (!userIP || userIP === "unknown-ip") {
        throw new Error("No se pudo obtener una dirección IP válida");
      }
  
      console.log(`Eliminando chat ${chatId} para IP: ${userIP}`);
      const chatRef = doc(db, "chats", userIP, "userChats", chatId);
      
      // Verificación adicional para debug
      console.log("Ruta completa de eliminación:", chatRef.path);
      
      await deleteDoc(chatRef);
      console.log("Chat eliminado exitosamente en Firestore");
      return true;
    } catch (error) {
      console.error("Error en deleteChat:", {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  };