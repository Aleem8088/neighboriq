import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

async function testKeys() {
    console.log("Testing Supabase...");
    try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            throw new Error("Missing Supabase URL or Key in .env.local");
        }
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
        const { data, error } = await supabase.from('crime_incidents').select('*').limit(1);
        if (error) throw error;
        console.log("✅ Supabase connection successful.");
    } catch (e) {
        console.error("❌ Supabase failed:", e.message);
    }

    console.log("\nTesting Gemini API...");
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("Missing GEMINI_API_KEY in .env.local");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Respond with the exact word 'SUCCESS'.",
        });
        console.log("✅ Gemini API successful. Response:", response.text.trim());
    } catch (e) {
        console.error("❌ Gemini API failed:", e.message);
    }
}
testKeys();
