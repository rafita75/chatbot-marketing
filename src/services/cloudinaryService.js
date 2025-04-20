import axios from 'axios';

const CLOUD_NAME = 'dqsytxsrx'; // Reemplaza con tu cloud name de Cloudinary
const UPLOAD_PRESET = 'ml_default'; // Configura un upload preset en Cloudinary

export const uploadImageToCloudinary = async (imageData) => {
  try {
    // Convertir data URL a blob
    const blob = await fetch(imageData).then(res => res.blob());
    
    // Crear FormData para la subida
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('cloud_name', CLOUD_NAME);

    // Subir a Cloudinary
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return response.data.secure_url; // Retorna la URL pública de la imagen
  } catch (error) {
    console.error('Error subiendo imagen a Cloudinary:', error);
    throw new Error('No se pudo guardar la imagen en Cloudinary');
  }
};

export const uploadVideoToCloudinary = async (videoBlobOrUrl) => {
  try {
    const formData = new FormData();
    
    // Si es una URL de objeto (Blob)
    if (typeof videoBlobOrUrl === 'string' && videoBlobOrUrl.startsWith('blob:')) {
      const response = await fetch(videoBlobOrUrl);
      const blob = await response.blob();
      formData.append('file', blob);
    } 
    // Si ya es un Blob
    else if (videoBlobOrUrl instanceof Blob) {
      formData.append('file', videoBlobOrUrl);
    }
    // Si es una URL normal
    else {
      formData.append('file', videoBlobOrUrl);
    }
    
    formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
    formData.append('resource_type', 'video');

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return response.data.secure_url;
  } catch (error) {
    console.error('Error uploading video to Cloudinary:', error);
    throw new Error('Error al subir el video a Cloudinary');
  }
};