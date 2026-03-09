import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables!");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Real Montgomery street names clustered around neighborhood centers
const NEIGHBORHOODS = {
    "Downtown": { lat: 32.3792, lng: -86.3077, streets: ["Dexter Ave", "Monroe St", "Commerce St", "Perry St", "Court St", "Madison Ave"] },
    "Cloverdale": { lat: 32.3614, lng: -86.2758, streets: ["Carter Hill Rd", "Narrow Lane Rd", "Felder Ave", "Norman Bridge Rd"] },
    "Garden District": { lat: 32.3667, lng: -86.2833, streets: ["Ann St", "McDonough St", "Hull St", "Decatur St"] },
    "Mobile Heights": { lat: 32.3447, lng: -86.2928, streets: ["Mobile Hwy", "Atlanta Hwy", "West Fairview Ave"] }
};

// Distribution: Property theft 40%, Vehicle break-in 25%, Assault 15%, Vandalism 12%, Other 8%
const CRIME_TYPES = [
    ...Array(20).fill({ type: 'Property Theft', descs: ['Stolen bicycle from front porch', 'Package stolen from doorstep', 'Lawn equipment taken from shed', 'Theft of unsecured property', 'Shoplifting reported at local store'] }),
    ...Array(12).fill({ type: 'Vehicle Break-in', descs: ['Window smashed, electronics stolen', 'Unlocked vehicle rummaged through', 'Catalytic converter theft', 'Theft of tools from truck bed'] }),
    ...Array(8).fill({ type: 'Assault', descs: ['Altercation outside establishment', 'Domestic disturbance reported', 'Physical dispute between neighbors'] }),
    ...Array(6).fill({ type: 'Vandalism', descs: ['Graffiti on commercial building', 'Mailbox damaged overnight', 'Property defaced in public park'] }),
    ...Array(4).fill({ type: 'Other', descs: ['Suspicious activity reported', 'Noise ordinance violation', 'Public disturbance'] })
];

// Helper to generate jittered coordinates around a center point (roughly within a few miles)
function jitterCoordinate(base) {
    const jitter = (Math.random() - 0.5) * 0.02; // ~1-2km jitter
    return base + jitter;
}

// Helper to get random date within last N days
function getRandomDateRecent(days) {
    const start = new Date();
    start.setDate(start.getDate() - days);
    const end = new Date();
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString();
}

async function seedCrimes() {
    console.log("Seeding 50 realistic crime incidents for Montgomery, AL...");

    // Check if we already have a lot of crimes
    const { count } = await supabase.from('crime_incidents').select('*', { count: 'exact', head: true });
    if (count > 100) {
        console.log("Already have " + count + " crimes. Skipping seed to prevent bloat.");
        return;
    }

    const incidents = [];
    const neighborhoodKeys = Object.keys(NEIGHBORHOODS);

    for (let i = 0; i < 50; i++) {
        const t = CRIME_TYPES[i];
        const category = t.type;
        const desc = t.descs[Math.floor(Math.random() * t.descs.length)];

        // Pick random neighborhood
        const nKey = neighborhoodKeys[Math.floor(Math.random() * neighborhoodKeys.length)];
        const nData = NEIGHBORHOODS[nKey];

        // Pick random street
        const street = nData.streets[Math.floor(Math.random() * nData.streets.length)];
        // Generate random block number
        const block = Math.floor(Math.random() * 2000) + 100;

        const lat = jitterCoordinate(nData.lat);
        const lng = jitterCoordinate(nData.lng);

        // Dates across last 90 days
        const date = getRandomDateRecent(90);

        // Generate a random ID format mimicking police codes
        const cid = "MPD-" + new Date(date).getFullYear() + "-" + Math.floor(Math.random() * 900000 + 100000);

        incidents.push({
            incident_id: cid,
            type: category,
            date: date,
            location: `${block} ${street}, Montgomery, AL`,
            description: desc,
            lat: lat,
            lng: lng,
            source: 'Montgomery Police Department Data',
            status: Math.random() > 0.3 ? 'resolved' : 'open'
        });
    }

    const { error } = await supabase.from('crime_incidents').insert(incidents);

    if (error) {
        console.error("Error inserting crimes:", error);
    } else {
        console.log(`Successfully seeded ${incidents.length} crime incidents!`);
    }
}

seedCrimes().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
