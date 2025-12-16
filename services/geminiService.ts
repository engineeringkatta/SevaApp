import { GoogleGenAI } from "@google/genai";
import { Person, Seva } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateReminderMessage = async (
  person: Person,
  seva: Seva,
  date: string,
  time: string
): Promise<string> => {
  if (!apiKey) {
    return "Error: API Key is missing. Cannot generate AI message.";
  }

  try {
    const prompt = `
      You are a helpful assistant for a Temple/Prayer House. 
      Write a warm, respectful, and spiritual reminder message for a volunteer.
      
      Details:
      - Volunteer Name: ${person.fullName}
      - Seva (Service): ${seva.name}
      - Date: ${date}
      - Time: ${time}
      - Channel: ${person.preferredChannel === 'WHATSAPP' ? 'WhatsApp (keep it concise, include emoji)' : 'Email (formal but warm)'}
      
      The message should remind them to prepare and arrive on time. 
      Do not include subject lines if it is WhatsApp.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate message.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating message. Please check your connection.";
  }
};

export const generateDailySummaryMessage = async (
  date: string,
  scheduleCount: number
): Promise<string> => {
  if (!apiKey) return "API Key missing.";

  try {
    const prompt = `
      Write a brief, uplifting daily summary header for the Temple Seva Schedule for date: ${date}.
      There are ${scheduleCount} sevas scheduled for tomorrow.
      Encourage the team. Max 2 sentences.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    return "Here is the schedule for tomorrow.";
  }
};
