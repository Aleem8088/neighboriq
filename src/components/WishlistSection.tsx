"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, ChevronUp } from "lucide-react";
import { supabase } from "../lib/supabase";

type VoteCategory = {
    emoji: string;
    label: string;
};

const CATEGORIES: VoteCategory[] = [
    { emoji: "🔦", label: "Better Street Lighting" },
    { emoji: "🛣️", label: "Road Repairs" },
    { emoji: "🌳", label: "More Green Spaces" },
    { emoji: "🚶", label: "Safer Crosswalks" },
    { emoji: "🧹", label: "Cleaner Streets" },
    { emoji: "🚌", label: "Better Public Transit" },
];

type VoteCounts = Record<string, number>;

export default function WishlistSection({ neighborhood }: { neighborhood: string }) {
    const [counts, setCounts] = useState<VoteCounts>({});
    const [votedCategories, setVotedCategories] = useState<Set<string>>(new Set());
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        // Load initial votes from Supabase
        const fetchVotes = async () => {
            const { data, error } = await supabase
                .from("wishlist_votes")
                .select("category, vote_count")
                .eq("neighborhood", neighborhood);

            if (!error && data) {
                const newCounts: VoteCounts = {};
                data.forEach(row => {
                    // Match by full label from DB
                    const matchedCategory = CATEGORIES.find(c => `${c.emoji} ${c.label}` === row.category);
                    if (matchedCategory) {
                        newCounts[matchedCategory.label] = row.vote_count;
                    }
                });
                setCounts(newCounts);
            }
        };

        fetchVotes();

        // Load voted state from localStorage
        const storedVotes = localStorage.getItem(`voted_${neighborhood}`);
        if (storedVotes) {
            setVotedCategories(new Set(JSON.parse(storedVotes)));
        }

        // Realtime updates
        const channel = supabase
            .channel(`wishlist_votes_${neighborhood}`)
            .on("postgres_changes", { event: "*", schema: "public", table: "wishlist_votes", filter: `neighborhood=eq.${neighborhood}` }, fetchVotes)
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [neighborhood]);

    const handleVote = async (category: VoteCategory) => {
        if (votedCategories.has(category.label)) return;

        const dbCategoryStr = `${category.emoji} ${category.label}`;

        // Optimistic UI update
        const currentCount = counts[category.label] || 0;
        setCounts(prev => ({ ...prev, [category.label]: currentCount + 1 }));

        const newVoted = new Set(votedCategories).add(category.label);
        setVotedCategories(newVoted);
        localStorage.setItem(`voted_${neighborhood}`, JSON.stringify(Array.from(newVoted)));

        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);

        // Upsert to Supabase
        const { data: existingRow } = await supabase
            .from("wishlist_votes")
            .select("id, vote_count")
            .eq("neighborhood", neighborhood)
            .eq("category", dbCategoryStr)
            .single();

        if (existingRow) {
            await supabase
                .from("wishlist_votes")
                .update({ vote_count: existingRow.vote_count + 1 })
                .eq("id", existingRow.id);
        } else {
            await supabase
                .from("wishlist_votes")
                .insert({ neighborhood, category: dbCategoryStr, vote_count: 1 });
        }
    };

    return (
        <section className="premium-glass rounded-3xl p-6 md:p-8 mt-6 w-full relative overflow-hidden shadow-3d-soft hover:shadow-3d-heavy transition-all duration-500">
            {/* Background styling */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

            <div className="relative z-10 mb-8">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent gradient-green">What does {neighborhood} need?</h2>
                <p className="text-text-secondary mt-1">Your votes go directly to city officials to prioritize improvements.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                {CATEGORIES.map((cat, i) => {
                    const hasVoted = votedCategories.has(cat.label);
                    const count = counts[cat.label] || 0;

                    return (
                        <motion.button
                            key={cat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: i * 0.1 }}
                            whileHover={!hasVoted ? { y: -4, scale: 1.02 } : {}}
                            whileTap={!hasVoted ? { scale: 0.98 } : {}}
                            onClick={() => handleVote(cat)}
                            disabled={hasVoted}
                            className={`flex flex-col items-start p-6 rounded-3xl border transition-all duration-300 text-left ${hasVoted
                                ? "bg-primary/10 border-primary/30 cursor-default shadow-inner-glow"
                                : "bg-black/10 shadow-inner border-white/5 hover:border-primary/50 hover:bg-black/20 cursor-pointer"
                                }`}
                        >
                            <div className="flex w-full justify-between items-start mb-3">
                                <span className="text-4xl filter drop-shadow-sm">{cat.emoji}</span>
                                <div className="flex flex-col items-end">
                                    <span className="text-2xl font-bold text-foreground font-mono">{count}</span>
                                    <span className="text-[10px] uppercase tracking-wider text-text-secondary font-bold">Votes</span>
                                </div>
                            </div>

                            <span className="font-bold text-foreground text-lg leading-tight mb-4 flex-1">{cat.label}</span>

                            <div className={`w-full py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${hasVoted
                                ? "bg-primary text-black shadow-3d-pressed"
                                : "bg-black/20 shadow-inner border border-white/10 text-foreground hover:bg-black/30"
                                }`}>
                                {hasVoted ? (
                                    <>
                                        <Check className="w-4 h-4" /> Voted!
                                    </>
                                ) : (
                                    <>
                                        <ChevronUp className="w-4 h-4" /> Upvote
                                    </>
                                )}
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Toast Notification */}
            <motion.div
                initial={{ opacity: 0, y: 50, x: "-50%" }}
                animate={{ opacity: showToast ? 1 : 0, y: showToast ? 0 : 50, x: "-50%" }}
                className="fixed bottom-8 left-1/2 z-50 bg-primary text-black font-bold px-6 py-3 rounded-full flex items-center gap-2 shadow-xl"
                style={{ pointerEvents: showToast ? "auto" : "none" }}
            >
                <Check className="w-5 h-5" />
                Your voice has been heard
            </motion.div>
        </section>
    );
}
