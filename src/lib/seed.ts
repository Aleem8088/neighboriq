import { supabase } from "./supabase";

// ─── Real Montgomery AL Street Names by Neighborhood ─────────────────
const NEIGHBORHOODS = [
    { name: "Downtown", lat: 32.3792, lng: -86.3077 },
    { name: "Cloverdale", lat: 32.3614, lng: -86.2758 },
    { name: "Garden District", lat: 32.3667, lng: -86.2833 },
    { name: "Mobile Heights", lat: 32.3447, lng: -86.2928 },
    { name: "Old Cloverdale", lat: 32.3583, lng: -86.2714 },
];

const STREETS: Record<string, string[]> = {
    "Downtown": [
        "Dexter Ave", "Commerce St", "Monroe St", "Court St",
        "Perry St", "Lawrence St", "Bibb St", "Coosa St",
        "Tallapoosa St", "Washington Ave",
    ],
    "Cloverdale": [
        "Cloverdale Rd", "Gilmer Ave", "Felder Ave", "Woodley Rd",
        "Ponce De Leon Ave", "Richmond Ave",
    ],
    "Garden District": [
        "Adams Ave", "Sayre St", "South Hull St", "South Court St",
        "High St", "Forest Ave",
    ],
    "Mobile Heights": [
        "Mobile St", "Day St", "Rosa Parks Ave", "Jeff Davis Ave",
        "Holt St", "Cleveland Ave",
    ],
    "Old Cloverdale": [
        "Fairview Ave", "Clanton Ave", "Narrow Lane Rd", "Edgemont Ave",
        "Felder Ave", "Woodward Ave",
    ],
};

// ─── Crime Templates ────────────────────────────────────────────────
// Distribution: Property Theft 40%, Vehicle Break-in 25%, Assault 15%, Vandalism 12%, Other 8%
interface CrimeTemplate {
    type: string;
    descriptions: string[];
}

const CRIME_TEMPLATES: { template: CrimeTemplate; count: number }[] = [
    {
        template: {
            type: "Property Theft",
            descriptions: [
                "Stolen bicycle from front porch",
                "Package theft from doorstep reported",
                "Shoplifting incident at convenience store",
                "Theft of copper wiring from vacant lot",
                "Stolen lawn equipment from backyard shed",
                "Purse snatching near bus stop",
                "Tools stolen from unlocked garage",
                "Catalytic converter theft in parking lot",
            ],
        },
        count: 20, // 40%
    },
    {
        template: {
            type: "Vehicle Break-in",
            descriptions: [
                "Car window smashed, electronics stolen",
                "Vehicle burglarized in apartment parking lot",
                "Break-in of pickup truck, tools taken",
                "Smash-and-grab at shopping center parking",
                "Vehicle rummaged, wallet and documents taken",
                "Window broken on sedan, GPS unit stolen",
            ],
        },
        count: 12, // 24% (rounding down)
    },
    {
        template: {
            type: "Assault",
            descriptions: [
                "Altercation outside downtown bar",
                "Physical confrontation at gas station",
                "Domestic disturbance call, minor injuries",
                "Fight reported at convenience store",
                "Road rage incident led to physical altercation",
            ],
        },
        count: 8, // 16%
    },
    {
        template: {
            type: "Vandalism",
            descriptions: [
                "Graffiti spray-painted on retaining wall",
                "Mailbox destroyed overnight",
                "Vehicle keyed in residential driveway",
                "Windows broken at abandoned storefront",
                "Park bench damaged by vandals",
            ],
        },
        count: 6, // 12%
    },
    {
        template: {
            type: "Other",
            descriptions: [
                "Trespassing reported at vacant property",
                "Suspicious activity near school perimeter",
                "Noise complaint from house party",
                "Public intoxication near downtown park",
            ],
        },
        count: 4, // 8%
    },
];

// ─── Deterministic seeded random (for reproducibility) ──────────────
function seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
        s = (s * 16807 + 0) % 2147483647;
        return s / 2147483647;
    };
}

function generateCrimeIncidents() {
    const crimes: {
        lat: number;
        lng: number;
        type: string;
        date: string;
        description: string;
        neighborhood: string;
    }[] = [];

    const rand = seededRandom(42);
    const now = Date.now();

    for (const { template, count } of CRIME_TEMPLATES) {
        for (let i = 0; i < count; i++) {
            // Pick a neighborhood
            const nhIdx = Math.floor(rand() * NEIGHBORHOODS.length);
            const nh = NEIGHBORHOODS[nhIdx];
            const streets = STREETS[nh.name];
            const street = streets[Math.floor(rand() * streets.length)];
            const streetNum = 100 + Math.floor(rand() * 2900);

            // Jitter coordinates within ~0.5 mile of neighborhood center
            const latJitter = (rand() - 0.5) * 0.015;
            const lngJitter = (rand() - 0.5) * 0.015;

            // Random date within last 30 days
            const daysAgo = Math.floor(rand() * 30);
            const hoursAgo = Math.floor(rand() * 24);
            const date = new Date(now - daysAgo * 86400000 - hoursAgo * 3600000);

            // Pick a description
            const desc = template.descriptions[Math.floor(rand() * template.descriptions.length)];

            crimes.push({
                lat: nh.lat + latJitter,
                lng: nh.lng + lngJitter,
                type: template.type,
                date: date.toISOString().split("T")[0],
                description: `${desc} — ${streetNum} ${street}`,
                neighborhood: nh.name,
            });
        }
    }

    return crimes;
}

export async function seedDatabase() {
    try {
        // 1. Check if we already have enough data to prevent re-seeding
        const { count, error: countError } = await supabase
            .from("crime_incidents")
            .select("*", { count: "exact", head: true });

        if (countError) {
            console.error("Error checking DB seed status:", countError);
            return;
        }

        if (count && count >= 50) {
            console.log(`Database already has ${count} crime records. Skipping seed.`);
            return;
        }

        console.log("Seeding crime_incidents with 50 realistic Montgomery records...");

        const crimes = generateCrimeIncidents();

        // Clear any partial data from previous attempts
        if (count && count > 0) {
            await supabase.from("crime_incidents").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        }

        // Insert in batches of 25
        for (let i = 0; i < crimes.length; i += 25) {
            const batch = crimes.slice(i, i + 25);
            const { error } = await supabase.from("crime_incidents").insert(batch);
            if (error) {
                console.error(`Error inserting batch ${i / 25 + 1}:`, error);
            } else {
                console.log(`Inserted batch ${i / 25 + 1} (${batch.length} records)`);
            }
        }

        console.log(`✅ Seeded ${crimes.length} crime incidents into Supabase.`);
    } catch (e) {
        console.error("Fatal error during seeding:", e);
    }
}

// Export for standalone script usage
export { generateCrimeIncidents };
