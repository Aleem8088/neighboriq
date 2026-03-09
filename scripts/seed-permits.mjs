import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const NEIGHBORHOODS = {
    "Downtown": { lat: 32.3792, lng: -86.3077, streets: ["Dexter Ave", "Court St", "Madison Ave"] },
    "Cloverdale": { lat: 32.3614, lng: -86.2758, streets: ["Carter Hill Rd", "Norman Bridge Rd"] },
    "Garden District": { lat: 32.3667, lng: -86.2833, streets: ["Ann St", "McDonough St"] },
    "Mobile Heights": { lat: 32.3447, lng: -86.2928, streets: ["Mobile Hwy", "West Fairview Ave"] }
};

const PERMIT_TYPES = ["Residential Renovation", "Commercial Construction", "Demolition", "New Construction", "Roofing", "Electrical Upgrade"];

function jitterCoordinate(base) {
    return base + (Math.random() - 0.5) * 0.02;
}

function getRandomDateRecent(days) {
    const start = new Date();
    start.setDate(start.getDate() - days);
    const end = new Date();
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

async function seedPermits() {
    console.log("Seeding 20 realistic building permits...");

    const permits = [];
    const nKeys = Object.keys(NEIGHBORHOODS);

    for (let i = 0; i < 20; i++) {
        const type = PERMIT_TYPES[Math.floor(Math.random() * PERMIT_TYPES.length)];
        const nKey = nKeys[Math.floor(Math.random() * nKeys.length)];
        const nData = NEIGHBORHOODS[nKey];
        const street = nData.streets[Math.floor(Math.random() * nData.streets.length)];
        const block = Math.floor(Math.random() * 2000) + 100;

        // Values between $5k and $500k
        const value = Math.floor(Math.random() * 495000) + 5000;

        const date = getRandomDateRecent(90);
        const pid = "BLD-" + new Date(date).getFullYear() + "-" + Math.floor(Math.random() * 90000 + 10000);

        // 80% active
        const status = Math.random() > 0.2 ? 'active' : 'completed';

        permits.push({
            permit_id: pid,
            type: type,
            date: date,
            location: `${block} ${street}, Montgomery, AL`,
            description: `${type} project valued at $${value.toLocaleString()}`,
            value: value,
            lat: jitterCoordinate(nData.lat),
            lng: jitterCoordinate(nData.lng),
            status: status
        });
    }

    const { error } = await supabase.from('permits').insert(permits);

    if (error) {
        console.error("Error inserting permits:", error);
    } else {
        console.log(`Successfully seeded ${permits.length} building permits!`);
    }
}

seedPermits().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
