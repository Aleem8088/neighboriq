import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Type Definitions ──────────────────────────────────────────────

export interface CrimeIncident {
    id: string;
    lat: number;
    lng: number;
    type: string;
    date: string;
    description: string;
    neighborhood: string;
}

export interface Permit {
    id: string;
    address: string;
    lat: number;
    lng: number;
    type: string;
    date: string;
    value: number;
    status: string;
}

export interface NewsArticle {
    id: string;
    title: string;
    summary: string;
    sentiment: number;
    date: string;
    source: string;
    neighborhood: string;
}

export interface ReportedIssue {
    id: string;
    lat: number;
    lng: number;
    type: string;
    photo_url: string;
    status: string;
    created_at: string;
}
