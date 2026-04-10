import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface PromptAnalysis {
  quality: 'low' | 'medium' | 'high';
  feedback: string;
  suggestions: string[];
}

export const analyzePrompt = async (prompt: string): Promise<PromptAnalysis> => {
  if (!prompt || prompt.length < 10) {
    return { quality: 'low', feedback: 'El prompt es demasiado corto para analizar.', suggestions: [] };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analiza el siguiente prompt para un agente de IA y proporciona feedback constructivo.
      Prompt: "${prompt}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quality: {
              type: Type.STRING,
              enum: ['low', 'medium', 'high'],
              description: "Calidad general del prompt."
            },
            feedback: {
              type: Type.STRING,
              description: "Un breve comentario sobre el prompt."
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de sugerencias para mejorar el prompt."
            }
          },
          required: ['quality', 'feedback', 'suggestions']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result as PromptAnalysis;
  } catch (error) {
    console.error("Error analyzing prompt:", error);
    return { quality: 'medium', feedback: 'No se pudo analizar el prompt en este momento.', suggestions: [] };
  }
};

export const getFlowSuggestions = async (flowDescription: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Basado en la siguiente descripción de un flujo de agente, sugiere 3 posibles nodos o pasos siguientes para mejorar la experiencia del usuario.
      Descripción: "${flowDescription}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de sugerencias de próximos pasos."
            }
          },
          required: ['suggestions']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result.suggestions || [];
  } catch (error) {
    console.error("Error getting flow suggestions:", error);
    return [];
  }
};
