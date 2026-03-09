import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
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
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using gemini-1.5-flash-latest as it is the standard model in the app
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent("Respond with the exact word 'SUCCESS'.");
        console.log("✅ Gemini API successful. Response:", result.response.text().trim());
    } catch (e) {
        console.error("❌ Gemini API failed:", e.message);
    }
}
testKeys();
