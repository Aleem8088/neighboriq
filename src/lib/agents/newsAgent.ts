/**
 * News Agent
 *
 * Queries Supabase news_articles table for articles relevant to
 * the user's question and neighborhood. Provides sentiment context
 * for the Orchestrator to compare against crime data.
 */

import { supabase } from "../supabase";

export interface NewsAgentResult {
    summary: string;
    articleCount: number;
    averageSentiment: number;
    sources: string[];
}

export async function queryNewsAgent(
    question: string,
    neighborhood: string
): Promise<NewsAgentResult> {
    // TODO: Wire up actual Supabase queries + Claude analysis for sentiment
    // For now, return placeholder

    try {
        const { data, error } = await supabase
            .from("news_articles")
            .select("*")
            .eq("neighborhood", neighborhood)
            .order("date", { ascending: false })
            .limit(20);

        if (error) throw error;

        const sentiments = data?.map((d: { sentiment: number }) => d.sentiment) || [];
        const avgSentiment =
            sentiments.length > 0
                ? sentiments.reduce((a: number, b: number) => a + b, 0) /
                sentiments.length
                : 0;

        return {
            summary: `Found ${data?.length || 0} recent articles about ${neighborhood}. Average sentiment: ${avgSentiment.toFixed(2)}.`,
            articleCount: data?.length || 0,
            averageSentiment: avgSentiment,
            sources: Array.from(new Set<string>(data?.map((d: { source: string }) => d.source) || [])),
        };
    } catch {
        return {
            summary: "News data unavailable.",
            articleCount: 0,
            averageSentiment: 0,
            sources: [],
        };
    }
}
