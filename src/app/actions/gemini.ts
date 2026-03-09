"use server";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateReportSummary(address: string, safetyScore: number, crimeIncidents: number, activePermits: number, newsSentiment: number) {
    try {
        const prompt = `You are a civic intelligence AI for Montgomery, Alabama. 
Based on this neighborhood data:
- Safety Score: ${safetyScore}/100
- Crime incidents (30 days): ${crimeIncidents}
- Active permits: ${activePermits}  
- News sentiment: ${newsSentiment}/100
- Address: ${address}

Write a 2-sentence neighborhood summary that:
1. States what the data shows objectively
2. Highlights the most important thing residents should know

Be specific, factual, and helpful. No fluff.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        const text = response.text || "";
        return { success: true, text: text.trim() };
    } catch (error) {
        console.error("Gemini AI Error:", error);
        return { success: false, text: "Unable to generate summary at this time. Please try again later." };
    }
}

export async function generateTruthInsight() {
    try {
        // Hardcoded stats based on prompt spec, realistically would be passed in
        const prompt = `Montgomery neighborhood data shows crime is down 12% officially, but news sentiment score is 65/100 (slightly negative). In one sentence, explain what this gap means for residents and why it might exist.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        const text = response.text || "";
        return { success: true, text: text.trim() };
    } catch (error) {
        console.error("Gemini AI Error:", error);
        return { success: false, text: "AI insight currently unavailable." };
    }
}

export async function chatNeighborIQ(message: string, history: { role: string; parts: { text: string }[] }[], contextStats: string) {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: message }] }],
            config: {
                systemInstruction: `You are NeighborIQ, a civic AI assistant for Montgomery, Alabama. You help residents understand their neighborhood using official city data. 
Be helpful, specific, and concise. If asked about safety, reference that crime data shows ${contextStats}. 
If asked about development, reference that there are active permits nearby. No fluff.`
            }
        });
        const text = response.text || "";
        return { success: true, text: text.trim() };
    } catch (error) {
        console.error("Gemini AI Chat Error:", error);
        return { success: false, text: "Failed to connect to NeighborIQ. Please try asking again." };
    }
}

export async function classifyIssuePhoto(base64Data: string, mimeType: string) {
    try {
        const promptText = `Look at this photo of a city issue. 
Classify it as one of: pothole, broken streetlight, graffiti, illegal dumping, damaged sidewalk, flooding, fallen tree, broken bench, other.
Return JSON strictly in this format: {"type": "string", "confidence": number, "description": "string", "priority": "low"|"medium"|"high"}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{
                role: "user",
                parts: [
                    { text: promptText },
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: mimeType
                        }
                    }
                ]
            }]
        });
        const text = response.text || "";

        // Clean up markdown JSON block if present
        const jsonStr = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonStr);
        return { success: true, data: parsed };
    } catch (error) {
        console.error("Gemini Vision Error:", error);
        return { success: false, error: "Failed to classify image." };
    }
}
