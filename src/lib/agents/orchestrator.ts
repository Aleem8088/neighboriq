/**
 * Orchestrator Agent
 *
 * Receives a user question, routes it to the appropriate sub-agents
 * (Crime Agent, News Agent), and synthesizes responses into a single
 * plain-English answer.
 */

import { queryCrimeAgent } from "./crimeAgent";
import { queryNewsAgent } from "./newsAgent";

export interface AgentResponse {
    answer: string;
    sources: {
        crime?: string;
        news?: string;
    };
}

export async function queryOrchestrator(
    question: string,
    neighborhood: string
): Promise<AgentResponse> {
    // TODO: Integrate Claude API to route questions and synthesize answers
    // For now, return placeholder

    const [crimeData, newsData] = await Promise.all([
        queryCrimeAgent(question, neighborhood),
        queryNewsAgent(question, neighborhood),
    ]);

    return {
        answer: `[Orchestrator] Synthesized answer for "${question}" in ${neighborhood}. Crime context: ${crimeData.summary}. News context: ${newsData.summary}.`,
        sources: {
            crime: crimeData.summary,
            news: newsData.summary,
        },
    };
}
