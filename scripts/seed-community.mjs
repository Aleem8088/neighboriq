import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SEED_POSTS = [
    {
        category: 'Safety Alert',
        title: 'Power outage in Garden District',
        details: 'Lost power around 2 hours ago. My elderly mother uses an oxygen machine, does anyone have a portable generator we could borrow for a few hours?',
        location: 'Garden District',
        urgency: 'Urgent',
        contact: '555-0192',
        image_url: '/images/community/generator.png'
    },
    {
        category: 'Volunteer Needed',
        title: 'Cloverdale Park Cleanup',
        details: 'Organizing a quick weekend trash pickup. Bringing bags and gloves, just need more hands!',
        location: 'Cloverdale Park',
        urgency: 'Normal',
        contact: 'Email me at cleanup@example.com',
        image_url: '/images/community/cleanup.png'
    },
    {
        category: 'Emergency Help',
        title: 'Lost elder with dementia',
        details: 'My grandfather wandered off around 2pm wearing a blue jacket. He has dementia and may be confused. Please keep an eye out and call me immediately if spotted.',
        location: 'Near Dexter Ave and Decatur St',
        urgency: 'Critical',
        contact: '555-0100',
        image_url: '/images/community/elder.png'
    },
    {
        category: 'Resource Share',
        title: 'Extra baby formula available',
        details: 'Switched brands, I have 2 unopened cans of Similac infant formula (expires next year). Happy to give to a family in need.',
        location: 'Downtown area',
        urgency: 'Normal',
        contact: 'Message me here or text 555-0811',
        image_url: '/images/community/formula.png'
    },
    {
        category: 'General',
        title: 'Community Garden meeting this Sunday',
        details: 'We are planning our spring planting. If you\'d like a plot, come to the community center at 2pm! Bringing bagels.',
        location: 'Community Center',
        urgency: 'Normal',
        contact: 'hello@garden.org',
        image_url: '/images/community/garden.png'
    }
];

async function seedCommunityPosts() {
    console.log("Seeding community posts...");

    // Clear old data first
    await supabase.from('community_posts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const { error } = await supabase.from('community_posts').insert(SEED_POSTS);

    if (error) {
        console.error("Error inserting community posts:", error);
        process.exit(1);
    }

    console.log(`✅ Successfully seeded ${SEED_POSTS.length} community posts!`);
    process.exit(0);
}

seedCommunityPosts();
