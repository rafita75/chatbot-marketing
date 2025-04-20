import { GoogleGenerativeAI } from "@google/generative-ai";

// Configuración inicial
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_KEY);

export const generateMarketingStrategy = async (userPrompt) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  
  const prompt = `
    Como experto en marketing con 10 años de experiencia, genera una estrategia completa basada en:
    "${userPrompt}"

    Incluye:
    1. Objetivos SMART
    2. Público objetivo (buyer persona)
    3. 3 ideas de contenido para redes
    4. Ejemplo de copy para un post

    Usa emojis relevantes y formato markdown.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error al generar contenido:", error);
    return "⚠️ Error al procesar tu solicitud. Intenta nuevamente.";
  }
};