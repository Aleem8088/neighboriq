/**
 * Crime Agent
 *
 * Queries Supabase crime_incidents table for data relevant to
 * the user's question and neighborhood. Returns structured context
 * for the Orchestrator to synthesize.
 */

import { supabase } from "../supabase";

export interface CrimeAgentResult {
    summary: string;
    incidentCount: number;
    recentTypes: string[];
}

export async function queryCrimeAgent(
    question: string,
    neighborhood: string
): Promise<CrimeAgentResult> {
    // TODO: Wire up actual Supabase queries + Claude analysis
    // For now, return placeholder

    try {
        const { data, error } = await supabase
            .from("crime_incidents")
            .select("*")
            .eq("neighborhood", neighborhood)
            .order("date", { ascending: false })
            .limit(50);

        if (error) throw error;

        return {
            summary: `Found ${data?.length || 0} recent incidents in ${neighborhood}.`,
            incidentCount: data?.length || 0,
            recentTypes: Array.from(new Set<string>(data?.map((d: { type: string }) => d.type) || [])),
        };
    } catch {
        return {
            summary: "Crime data unavailable.",
            incidentCount: 0,
            recentTypes: [],
        };
    }
}
