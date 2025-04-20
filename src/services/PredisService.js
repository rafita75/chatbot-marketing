const API_URL = "https://brain.predis.ai/predis_api/v1/create_content/";
const API_STATUS_URL = "https://brain.predis.ai/predis_api/v1/check_status/";
const API_KEY = 'ZPwFdRk0ycNY514wYoRUaKpj7rfGJE8J';

// Función para verificar el estado del contenido
const checkContentStatus = async (taskId, maxAttempts = 30, interval = 5000) => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(`${API_STATUS_URL}?task_id=${taskId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'completed') {
        return data; // Video listo
      } else if (data.status === 'failed') {
        throw new Error('La generación del video falló');
      }
      
      // Si no está listo, esperamos antes de reintentar
      await new Promise(resolve => setTimeout(resolve, interval));
    } catch (error) {
      console.error('Error verificando estado:', error);
      if (attempt === maxAttempts - 1) throw error;
    }
  }
  throw new Error('Tiempo de espera agotado para la generación del video');
};

export const generateContent = async (
  brandId, 
  text, 
  postType = 'generic', 
  language = 'english', 
  mediaType = 'single_image', 
  videoDuration = 'short'
) => {
  const formData = new FormData();
  
  formData.append('brand_id', brandId);
  formData.append('text', text);
  formData.append('post_type', postType);
  formData.append('input_language', language);
  formData.append('output_language', language);
  formData.append('media_type', mediaType);
  
  if (mediaType === 'video') {
    formData.append('video_duration', videoDuration);
  }

  try {
    // 1. Iniciar la generación del contenido
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error HTTP! estado: ${response.status}`);
    }

    const data = await response.json();
    
    // 2. Si es video, verificar estado hasta que esté listo
    if (mediaType === 'video' && data.task_id) {
      const finalResult = await checkContentStatus(data.task_id);
      return {
        ...finalResult,
        message: "Video generado exitosamente",
        video_url: finalResult.video_url || finalResult.result_url
      };
    }
    
    return data; // Para imágenes u otros tipos de media

  } catch (error) {
    console.error('❌ Error en la solicitud a Predis.ai:', error);
    
    // Mejorar mensajes de error
    const friendlyError = new Error(
      error.message.includes('429') ? 
      "Límite de solicitudes alcanzado. Por favor espera unos minutos." :
      "Error al generar el contenido. Por favor intenta nuevamente."
    );
    
    throw friendlyError;
  }
};