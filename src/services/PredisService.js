const PREDIS_API_URL = "https://brain.predis.ai/predis_api/v1/create_content/";
const GET_POSTS_URL = "https://brain.predis.ai/predis_api/v1/get_posts/";

export const PredisService = {
  /**
   * Genera contenido con manejo de webhook
   * @param {string} apiKey - Tu API key
   * @param {string} brandId - Tu Brand ID
   * @param {string} text - Texto del prompt
   * @param {string} webhookUrl - URL de webhook configurada
   * @param {string} [mediaType='video'] - Tipo de media
   * @param {string} [duration='short'] - Duración del video
   * @returns {Promise<Object>} - Respuesta de la API
   */
  async createContentWithWebhook(apiKey, brandId, text, webhookUrl, mediaType = 'video', duration = 'long') {
    // 1. Iniciar generación del video
    const formData = new FormData();
    formData.append('brand_id', brandId);
    formData.append('text', text);
    formData.append('media_type', mediaType);
    formData.append('video_duration', duration);
    formData.append('webhook_url', webhookUrl);
    formData.append('template_ids', '[]');

    const response = await fetch(PREDIS_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`${response.status}: ${JSON.stringify(data)}`);
    }

    // 2. Obtener el post_id de la respuesta
    const postId = data.post_ids?.[0];
    if (!postId) {
      throw new Error('No se recibió post_id en la respuesta');
    }

    console.log(postId);

    // 3. Esperar inicialmente (ajustable según necesidad)
    await new Promise(resolve => setTimeout(resolve, 120000)); // 30 segundos
    console.log("la pase los 60s");
    // 4. Buscar el post específico con polling (5 intentos máximo)

      console.log("entre");
      // Buscar posts filtrando por el post_id específico
      const postsResponse = await fetch(`${GET_POSTS_URL}?brand_id=${brandId}&post_id=${postId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        }
      });

      const postsData = await postsResponse.json();
      console.log("post data", postsData);

      if (!postsResponse.ok) {
        throw new Error(postsData.detail || `Error ${postsResponse.status}`);
      }

      // Encontrar nuestro post específico
      const ourPost = postsData.posts?.find(post => post.post_id === postId);
      console.log("ourPost", ourPost);
      console.log("ourPost1", ourPost?.generated_media[0].url);
      console.log("ourPost2", ourPost?.generated_media[0].url_hq);
      console.log("ourPost3", ourPost?.generated_media[0].thumb_url);
      const urlfinal = ourPost?.generated_media[0].url;

      return {
        url: urlfinal,
        caption: ourPost.caption,
        post_id: postId,
        status: 'completed'
      };
  }
};
