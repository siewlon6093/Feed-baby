import { GoogleGenAI } from "@google/genai";
import { FeedingLog, FeedingType } from "../types";

const SYSTEM_INSTRUCTION = `
You are a helpful, empathetic pediatric nutrition assistant and baby data analyst. 
Analyze the provided feeding logs for a baby. 
Identify patterns, suggest improvements if relevant (standard generic advice, always with a disclaimer to consult a doctor), and summarize the day's progress.
Keep responses concise, encouraging, and easy for a tired parent to read.
Focus on:
1. Total feeding time or volume per day.
2. Frequency of feedings.
3. Balance between sides (if breastfeeding).
4. Any trends (e.g., "Cluster feeding detected").

Do not provide medical diagnosis.
`;

export const analyzeFeedingLogs = async (logs: FeedingLog[], unit: 'ML' | 'OZ' = 'ML'): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Please provide an API Key to generate insights.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Filter to last 3 days to keep context relevant and manageable
    const recentLogs = logs
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, 50)
      .map(log => {
        let amountStr = 'N/A';
        if (log.amountMl) {
            if (unit === 'OZ') {
                // 1 fl oz approx 29.5735 ml
                amountStr = `${(log.amountMl / 29.5735).toFixed(1)}oz`;
            } else {
                amountStr = `${log.amountMl}ml`;
            }
        }
        return {
            type: log.type,
            time: new Date(log.startTime).toLocaleString(),
            duration: log.durationSeconds ? `${Math.round(log.durationSeconds / 60)} mins` : 'N/A',
            amount: amountStr,
            food: log.foodItem || 'N/A'
      }});

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Here are the recent feeding logs: ${JSON.stringify(recentLogs)}. Please provide a summary and any helpful insights.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate insights at the moment. Please try again later.";
  }
};