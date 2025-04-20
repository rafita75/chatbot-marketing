import axios from 'axios';
import { Buffer } from 'buffer';
import { uploadImageToCloudinary } from './cloudinaryService';

const StabilityService = {
  /**
   * Genera una imagen usando Stability AI y la sube a Cloudinary
   * @param {string} prompt - Descripción de la imagen
   * @param {object} options - Opciones adicionales
   * @returns {Promise<string>} - URL pública de la imagen en Cloudinary
   */
  generateAndUploadImage: async function(prompt, options = {}) {
    // Validación básica
    if (!prompt || prompt.trim().length < 3) {
      throw new Error('El prompt debe tener al menos 3 caracteres');
    }

    // Configuración por defecto
    const config = {
      model: 'sd3',
      output_format: 'png', // Cambiado a png para mejor calidad
      aspect_ratio: '1:1',
      timeout: 20000,
      ...options
    };

    try {
      // 1. Generar la imagen con Stability AI
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('model', config.model);
      formData.append('output_format', config.output_format);
      formData.append('aspect_ratio', config.aspect_ratio);

      const response = await axios.post(
        'https://api.stability.ai/v2beta/stable-image/generate/sd3',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_STABILITY_API_KEY}`,
            'Accept': 'image/*'
          },
          responseType: 'arraybuffer',
          timeout: config.timeout
        }
      );

      // 2. Convertir a base64
      const base64Image = Buffer.from(response.data).toString('base64');
      const imageDataUrl = `data:image/${config.output_format};base64,${base64Image}`;

      // 3. Subir a Cloudinary
      const cloudinaryUrl = await uploadImageToCloudinary(imageDataUrl);
      
      return cloudinaryUrl;

    } catch (error) {
      console.error('Error en StabilityService:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data ? 
          (typeof error.response.data === 'string' ? 
            error.response.data : 
            new TextDecoder().decode(error.response.data)) : 
          'No hay datos de error'
      });

      // Manejar errores específicos
      if (error.response) {
        switch (error.response.status) {
          case 400:
            throw new Error('Prompt rechazado. Por favor usa una descripción diferente.');
          case 401:
            throw new Error('Problema de autenticación. Verifica tu API key.');
          case 402:
            throw new Error('Se requiere actualizar el plan de Stability AI.');
          case 429:
            throw new Error('Has excedido el límite de solicitudes. Intenta más tarde.');
          default:
            throw new Error(`Error al comunicarse con Stability AI: ${error.response.status}`);
        }
      } else if (error.message.includes('Cloudinary')) {
        throw new Error('Error al guardar la imagen en la nube. Intenta nuevamente.');
      } else {
        throw new Error(`Error al generar la imagen: ${error.message}`);
      }
    }
  }
};

export default StabilityService;
