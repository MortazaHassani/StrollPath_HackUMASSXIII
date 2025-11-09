import { GoogleGenAI, Type } from "@google/genai";
import { Route } from "../types";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  // This is a fallback for development if the key isn't set,
  // but the instructions state it will be available.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export async function generateRouteDescription(
  name: string,
  distance: number,
  tags: string[]
): Promise<string> {
  if (!API_KEY) {
      return "AI description generation is currently unavailable."
  }
    
  const tagString = tags.length > 0 ? `The atmosphere is described by these tags: ${tags.join(', ')}.` : '';

  const prompt = `Generate a short, inspiring, and engaging description for a walking route.
  Keep it under 40 words.
  Route Name: "${name}"
  Distance: ${distance.toFixed(1)} miles.
  ${tagString}
  
  Description:`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("Failed to generate description from AI.");
  }
}

export async function getAiRouteRecommendations(
  query: string,
  routes: Route[]
): Promise<string[]> {
  if (!API_KEY) {
      throw new Error("AI recommendations are currently unavailable.");
  }

  // Simplify route data to send to the model
  const simplifiedRoutes = routes.map(r => ({
    id: r.id,
    name: r.name,
    description: r.description,
    distance: r.distance,
    tags: r.tags,
  }));

  const prompt = `You are a helpful assistant for a walking route app called "Stroll Path".
Your task is to recommend the best walking routes from a provided list based on a user's query.
Analyze the user's request and the list of available routes.
Return a JSON object containing the IDs of the routes that are the best match.

User Query: "${query}"

Available Routes:
${JSON.stringify(simplifiedRoutes, null, 2)}

Based on the query, identify the most relevant routes and return their IDs. If no routes are a good match, return an empty array.
`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      recommended_route_ids: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING
        },
        description: 'An array of string IDs for the recommended routes that best match the user query.'
      }
    },
    required: ['recommended_route_ids']
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    if (result && Array.isArray(result.recommended_route_ids)) {
      return result.recommended_route_ids;
    } else {
      console.error("AI response did not match expected schema:", result);
      return [];
    }
  } catch (error) {
    console.error("Gemini API call for recommendations failed:", error);
    throw new Error("Failed to get AI recommendations.");
  }
}