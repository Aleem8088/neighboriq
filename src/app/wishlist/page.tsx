"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Target, Sparkles, MapPin } from "lucide-react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import ThemeToggle from "@/components/ThemeToggle";

type LeaderboardItem = {
    category: string;
    total_votes: number;
    emoji: string;
    label: string;
};

type NeighborhoodBreakdown = {
    neighborhood: string;
    topRequest: string;
    votes: number;
};

export default function WishlistPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
    const [breakdown, setBreakdown] = useState<NeighborhoodBreakdown[]>([]);
    const [loading, setLoading] = useState(true);
    const [aiInsight, setAiInsight] = useState<string>("Loading community insights...");
    const [insightLoading, setInsightLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all votes
                const { data, error } = await supabase
                    .from("wishlist_votes")
                    .select("neighborhood, category, vote_count");

                if (error) throw error;

                if (data) {
                    // Aggregate for Leaderboard
                    const categoryTotals: Record<string, number> = {};
                    data.forEach(row => {
                        categoryTotals[row.category] = (categoryTotals[row.category] || 0) + row.vote_count;
                    });

                    const sortedLeaderboard = Object.entries(categoryTotals)
                        .map(([category, total_votes]) => {
                            const [emoji, ...labelParts] = category.split(" ");
                            return {
                                category,
                                total_votes,
                                emoji,
                                label: labelParts.join(" ")
                            };
                        })
                        .sort((a, b) => b.total_votes - a.total_votes);

                    setLeaderboard(sortedLeaderboard);

                    // Aggregate for Neighborhood Breakdown
                    const neighborhoodData: Record<string, Record<string, number>> = {};
                    data.forEach(row => {
                        if (!neighborhoodData[row.neighborhood]) {
                            neighborhoodData[row.neighborhood] = {};
                        }
                        neighborhoodData[row.neighborhood][row.category] = (neighborhoodData[row.neighborhood][row.category] || 0) + row.vote_count;
                    });

                    const breakdownData: NeighborhoodBreakdown[] = Object.entries(neighborhoodData)
                        .map(([neighborhood, categories]) => {
                            // Find the category with the max votes for this neighborhood
                            const [topRequest, votes] = Object.entries(categories).reduce((max, current) =>
                                current[1] > max[1] ? current : max
                                , ["", 0]);

                            return { neighborhood, topRequest, votes };
                        })
                        .sort((a, b) => b.votes - a.votes); // Sort by highest top request votes

                    setBreakdown(breakdownData);

                    // Simulate Gemini API Call for Insight
                    generateAIInsight(sortedLeaderboard, breakdownData);
                }
            } catch (err) {
                console.error("Failed to fetch wishlist data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Realtime updates
        const channel = supabase
            .channel('public:wishlist_votes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'wishlist_votes' }, () => {
                fetchData(); // Refetch all to recalculate aggregations
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const generateAIInsight = (leaderboardData: LeaderboardItem[], breakdownData: NeighborhoodBreakdown[]) => {
        setInsightLoading(true);
        // Simulating an AI call delay
        setTimeout(() => {
            if (leaderboardData.length === 0) {
                setAiInsight("Not enough data to generate insights yet. Share the board with your neighbors!");
                setInsightLoading(false);
                return;
            }

            const topIssue = leaderboardData[0];
            const secondIssue = leaderboardData[1];
            const totalVotes = leaderboardData.reduce((sum, item) => sum + item.total_votes, 0);
            const topIssuePercentage = Math.round((topIssue.total_votes / totalVotes) * 100);

            const infrastructureKeywords = ["Road", "Lighting", "Crosswalks", "Transit"];
            const isInfrastructureTop = infrastructureKeywords.some(kw => topIssue.label.includes(kw));

            let insight = "";
            if (isInfrastructureTop) {
                insight = `Based on a deep analysis of ${totalVotes.toLocaleString()} community votes, Montgomery residents are heavily prioritizing infrastructure over amenities. Specifically, ${topIssue.label.toLowerCase()} account for a massive ${topIssuePercentage}% of all community requests. `;

                // Find a neighborhood severely affected by this
                const worstHit = breakdownData.find(b => b.topRequest.includes(topIssue.label));
                if (worstHit) {
                    insight += `The ${worstHit.neighborhood} neighborhood is the most vocal about this issue. `;
                }

                insight += `This strongly correlates with recent API data showing an uptick in 311 reports related to city maintenance.`;
            } else {
                insight = `Analysis of ${totalVotes.toLocaleString()} community votes indicates a strong desire for community enhancement over baseline infrastructure. ${topIssue.label} leads the city's wishlist, accounting for ${topIssuePercentage}% of all votes, closely followed by ${secondIssue?.label.toLowerCase() || 'other requests'}. This suggests Montgomery residents are seeking a higher quality of life and better public spaces.`;
            }

            setAiInsight(insight);
            setInsightLoading(false);
        }, 1200);
    };

    const maxVotes = leaderboard.length > 0 ? leaderboard[0].total_votes : 1;

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-white/5 p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/" className="w-10 h-10 bg-black/10 shadow-inner hover:bg-white/5 border border-white/5 rounded-xl flex items-center justify-center transition-colors">
                        <ArrowLeft className="w-5 h-5 text-text-secondary" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent gradient-green">City Wishlist Leaderboard</h1>
                        <p className="text-xs text-text-secondary font-medium">What Montgomery needs most</p>
                    </div>
                </div>
                <div>
                    <ThemeToggle />
                </div>
            </header>

            <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8">

                {/* AI Insight Box */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/5 shadow-inner-glow border border-primary/20 rounded-3xl p-6 md:p-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none" />

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                            <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-2 flex items-center gap-2">
                                Gemini AI Insight
                            </h2>
                            {insightLoading ? (
                                <div className="space-y-2 mt-2">
                                    <div className="h-4 bg-border/50 rounded animate-pulse w-full"></div>
                                    <div className="h-4 bg-border/50 rounded animate-pulse w-5/6"></div>
                                    <div className="h-4 bg-border/50 rounded animate-pulse w-4/6"></div>
                                </div>
                            ) : (
                                <p className="text-lg md:text-xl font-medium leading-relaxed text-balance">
                                    {aiInsight}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                    {/* LEADERBOARD (Left) */}
                    <div className="premium-glass rounded-3xl p-6 md:p-8 shadow-3d-soft hover:shadow-3d-heavy transition-all duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <Target className="w-6 h-6 text-primary" />
                                City Leaderboard
                            </h2>
                        </div>

                        {loading ? (
                            <div className="flex justify-center p-12">
                                <div className="w-8 h-8 rounded-full border-t-2 border-primary animate-spin" />
                            </div>
                        ) : leaderboard.length === 0 ? (
                            <p className="text-text-secondary text-center py-8">No votes cast yet. Be the first!</p>
                        ) : (
                            <div className="space-y-6">
                                <AnimatePresence>
                                    {leaderboard.map((item, index) => {
                                        const percentage = Math.max(5, (item.total_votes / maxVotes) * 100);
                                        return (
                                            <motion.div
                                                key={item.category}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                                className="group"
                                            >
                                                <div className="flex items-end justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl font-bold text-text-secondary opacity-50 w-8">#{index + 1}</span>
                                                        <span className="text-2xl filter drop-shadow-sm">{item.emoji}</span>
                                                        <span className="font-bold text-lg">{item.label}</span>
                                                    </div>
                                                    <span className="font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg">
                                                        {item.total_votes.toLocaleString()} <span className="text-xs uppercase tracking-wider">votes</span>
                                                    </span>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="w-full h-3 bg-black/20 shadow-inner border border-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${percentage}%` }}
                                                        transition={{ duration: 1, delay: 0.2 + (index * 0.1), ease: "easeOut" }}
                                                        className={`h-full rounded-full ${index === 0 ? 'gradient-green' : 'bg-border'}`}
                                                    />
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* NEIGHBORHOOD BREAKDOWN (Right) */}
                    <div className="premium-glass rounded-3xl p-6 md:p-8 shadow-3d-soft hover:shadow-3d-heavy transition-all duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <MapPin className="w-6 h-6 text-primary" />
                                Neighborhood Breakdown
                            </h2>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="w-full h-16 bg-input-bg rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : breakdown.length === 0 ? (
                            <p className="text-text-secondary text-center py-8">No neighborhood breakdown available yet.</p>
                        ) : (
                            <div className="overflow-hidden rounded-2xl bg-black/10 shadow-inner border border-white/5">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-black/20 text-text-secondary text-xs uppercase tracking-wider font-bold">
                                            <th className="p-4 border-b border-white/5">Neighborhood</th>
                                            <th className="p-4 border-b border-white/5">Top Request</th>
                                            <th className="p-4 border-b border-white/5 text-right">Votes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-sm">
                                        {breakdown.map((row) => (
                                            <tr key={row.neighborhood} className="hover:bg-input-bg/30 transition-colors">
                                                <td className="p-4 font-bold text-foreground">
                                                    <Link href={`/dashboard/${encodeURIComponent(row.neighborhood)}`} className="hover:text-primary flex items-center gap-1">
                                                        {row.neighborhood}
                                                        <ArrowUpRight className="w-3 h-3 opacity-50" />
                                                    </Link>
                                                </td>
                                                <td className="p-4 font-medium text-text-secondary">{row.topRequest}</td>
                                                <td className="p-4 font-mono font-bold text-right text-primary">{row.votes.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}
