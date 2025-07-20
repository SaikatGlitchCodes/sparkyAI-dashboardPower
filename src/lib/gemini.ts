import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'AIzaSyC04U0iupqzYJUVnsspIITdX3wHX0Bmdl4';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const generateFarmingInsights = async (
  farmData: any,
  weatherData: any,
  cropHealthData: any,
  userQuery?: string
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = userQuery || `
      As an expert agricultural AI assistant, analyze the following farm data and provide actionable insights:

      Farm Information:
      - Field ID: ${farmData?.field_id || 'N/A'}
      - Crop: ${farmData?.crop || 'N/A'}
      - Location: ${farmData?.location || 'N/A'}
      - Field Area: ${cropHealthData?.FieldArea || 'N/A'} sq.m

      Crop Health Indices:
      - NDVI: ${cropHealthData?.Health?.ndvi ? Object.values(cropHealthData.Health.ndvi)[0] : 'N/A'}
      - EVI: ${cropHealthData?.Health?.evi ? Object.values(cropHealthData.Health.evi)[0] : 'N/A'}
      - LAI: ${cropHealthData?.Health?.lai ? Object.values(cropHealthData.Health.lai)[0] : 'N/A'}
      - NDMI: ${cropHealthData?.Health?.ndmi ? Object.values(cropHealthData.Health.ndmi)[0] : 'N/A'}
      - Soil Organic Carbon: ${cropHealthData?.Health?.soc ? Object.values(cropHealthData.Health.soc)[0] : 'N/A'}%

      Weather Forecast:
      ${weatherData?.daily?.slice(0, 3).map((day: any, index: number) => `
      Day ${index + 1}: ${day.weather[0].description}, Temp: ${Math.round(day.temp.max - 273.15)}°C, Rain: ${Math.round(day.pop * 100)}%`).join('\n') || 'Weather data unavailable'}

      Please provide:
      1. Overall crop health assessment
      2. Specific recommendations for irrigation, fertilization, and pest management
      3. Weather-based action items for the next 3 days
      4. Any alerts or warnings based on the data
      5. Optimization suggestions for better yield

      Keep the response practical, actionable, and farmer-friendly.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('Error generating farming insights:', error);
    throw new Error('Failed to generate AI insights. Please try again.');
  }
};

export const chatWithGemini = async (
  message: string,
  farmContext: any,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const contextPrompt = `
      You are an expert agricultural AI assistant helping farmers optimize their operations. 
      
      Current Farm Context:
      - Field ID: ${farmContext?.fieldId || 'N/A'}
      - Crop: ${farmContext?.crop || 'N/A'}
      - Location: ${farmContext?.location || 'N/A'}
      - Field Area: ${farmContext?.fieldArea || 'N/A'} sq.m
      - Current Health Indices: NDVI: ${farmContext?.ndvi || 'N/A'}, EVI: ${farmContext?.evi || 'N/A'}, LAI: ${farmContext?.lai || 'N/A'}
      
      Conversation History:
      ${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}
      
      User Question: ${message}
      
      Please provide a helpful, accurate, and practical response based on modern agricultural practices and the farm context provided. Keep responses concise but informative.
    `;

    const result = await model.generateContent(contextPrompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('Error in Gemini chat:', error);
    throw new Error('Failed to get AI response. Please try again.');
  }
};

// Enhanced chat function with conversation history support
export const chatWithGeminiAdvanced = async (
  message: string,
  farmContext: any,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Start a chat session with history
    const chat = model.startChat({
      history: conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })),
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    // Add farm context to the message
    const contextualMessage = `
      Farm Context: Field ID: ${farmContext?.fieldId || 'N/A'}, Crop: ${farmContext?.crop || 'N/A'}, Location: ${farmContext?.location || 'N/A'}
      Health Indices: NDVI: ${farmContext?.ndvi || 'N/A'}, EVI: ${farmContext?.evi || 'N/A'}, LAI: ${farmContext?.lai || 'N/A'}
      
      Question: ${message}
    `;

    const result = await chat.sendMessage(contextualMessage);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('Error in advanced Gemini chat:', error);
    // Fallback to basic chat
    return await chatWithGemini(message, farmContext, conversationHistory);
  }
};

// Function to analyze crop health and provide recommendations
export const analyzeCropHealth = async (cropHealthData: any): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      As an agricultural expert, analyze the following crop health data and provide specific recommendations:

      Health Indices:
      ${Object.entries(cropHealthData?.Health || {}).map(([index, values]: [string, any]) => {
        const latestDate = Object.keys(values)[0];
        const value = values[latestDate];
        return `- ${index.toUpperCase()}: ${value}`;
      }).join('\n')}

      Field Area: ${cropHealthData?.FieldArea || 'N/A'} sq.m
      Crop Code: ${cropHealthData?.CropCode || 'N/A'}

      Please provide:
      1. Health status assessment (Good/Fair/Poor)
      2. Specific areas of concern
      3. Immediate action items
      4. Long-term recommendations
      5. Expected outcomes if recommendations are followed

      Keep the response practical and actionable for farmers.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('Error analyzing crop health:', error);
    throw new Error('Failed to analyze crop health. Please try again.');
  }
};

// Function to generate weather-based recommendations
export const generateWeatherRecommendations = async (weatherData: any, farmContext: any): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Based on the following weather forecast, provide farming recommendations:

      Farm: ${farmContext?.crop || 'Unknown crop'} in ${farmContext?.location || 'Unknown location'}
      
      Weather Forecast (next 5 days):
      ${weatherData?.daily?.slice(0, 5).map((day: any, index: number) => `
      Day ${index + 1}: 
      - Weather: ${day.weather[0].description}
      - Temperature: ${Math.round(day.temp.min - 273.15)}°C to ${Math.round(day.temp.max - 273.15)}°C
      - Rain Probability: ${Math.round(day.pop * 100)}%
      - Wind Speed: ${Math.round(day.wind_speed)} m/s
      - Humidity: ${day.humidity}%
      - UV Index: ${day.uvi}
      ${day.rain ? `- Expected Rainfall: ${day.rain}mm` : ''}
      `).join('\n') || 'Weather data unavailable'}

      Please provide:
      1. Irrigation recommendations
      2. Field work scheduling
      3. Pest and disease risk assessment
      4. Harvest timing considerations (if applicable)
      5. Equipment and labor planning

      Focus on actionable advice for the next 5 days.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('Error generating weather recommendations:', error);
    throw new Error('Failed to generate weather recommendations. Please try again.');
  }
};