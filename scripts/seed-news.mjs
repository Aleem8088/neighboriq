import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const NEWS_SOURCES = ["WSFA News", "Montgomery Advertiser", "Alabama Political Reporter"];

const HEADLINES = [
    { title: "City announces major expansion to Downtown Riverfront", sentiment: 0.8 },
    { title: "String of vehicle break-ins reported in Cloverdale", sentiment: -0.6 },
    { title: "New tech hub bringing 500 jobs to Montgomery", sentiment: 0.9 },
    { title: "Residents raise concerns over Garden District street lighting", sentiment: -0.4 },
    { title: "Historic building renovation approved by city council", sentiment: 0.6 },
    { title: "Traffic delays expected as Mobile Highway repairs begin", sentiment: -0.2 },
    { title: "Montgomery Public Schools announce new STEM program", sentiment: 0.8 },
    { title: "Local business association reports record summer sales", sentiment: 0.7 },
    { title: "Police chief addresses recent crime spike in community forum", sentiment: -0.5 },
    { title: "New neighborhood watch program launches in Chisholm", sentiment: 0.5 },
    { title: "City council debates new zoning laws for downtown development", sentiment: 0.1 },
    { title: "Annual Montgomery Half Marathon draws record crowd", sentiment: 0.8 },
    { title: "Pothole complaints surge following heavy spring rains", sentiment: -0.7 },
    { title: "Mayor proposes new budget focusing on infrastructure", sentiment: 0.3 },
    { title: "Community cleanup event collects 2 tons of trash in Highland Park", sentiment: 0.9 }
];

function getRandomDateRecent(days) {
    const start = new Date();
    start.setDate(start.getDate() - days);
    const end = new Date();
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

async function seedNews() {
    console.log("Seeding 15 realistic news articles...");

    // Check if we already have a lot of news
    const { count } = await supabase.from('news_articles').select('*', { count: 'exact', head: true });
    if (count > 30) {
        console.log("Already have " + count + " news articles. Skipping seed.");
        return;
    }

    const articles = [];

    for (let i = 0; i < 15; i++) {
        const h = HEADLINES[i];
        const source = NEWS_SOURCES[Math.floor(Math.random() * NEWS_SOURCES.length)];
        const date = getRandomDateRecent(60);

        // Jitter sentiment slightly
        const jitteredSentiment = Math.max(-1.0, Math.min(1.0, h.sentiment + (Math.random() - 0.5) * 0.2));

        // Generate a random stable hash for GUID
        const guid = crypto.createHash('md5').update(h.title).digest('hex').substring(0, 16);

        articles.push({
            guid: guid,
            title: h.title,
            link: `https://example.com/news/${guid}`,
            pub_date: date,
            source: source,
            summary: `A recent report regarding: ${h.title}. Local residents are weighing in on the implications for the community.`,
            sentiment_score: parseFloat(jitteredSentiment.toFixed(2))
        });
    }

    // Upsert on guid to prevent duplicates if running multiple times
    const { error } = await supabase.from('news_articles').upsert(articles, { onConflict: 'guid' });

    if (error) {
        console.error("Error inserting news:", error);
    } else {
        console.log(`Successfully seeded ${articles.length} news articles!`);
    }
}

seedNews().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
