"use client";

import { ShieldAlert, TrendingDown, Clock, Newspaper, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { generateTruthInsight } from "../app/actions/gemini";
import { supabase } from "../lib/supabase";
import { Loader2, RefreshCw } from "lucide-react";

interface NewsArticle {
    id: string;
    title: string;
    sentiment_score: number;
    pub_date: string;
    source: string;
}

export default function TruthLayer() {
    const [insight, setInsight] = useState("");
    const [isGenerating, setIsGenerating] = useState(true);
    const [isScraping, setIsScraping] = useState(false);
    const [newsData, setNewsData] = useState<NewsArticle[]>([]);
    const [lastScraped, setLastScraped] = useState<string>("Just now");

    // Fetch initial news
    const fetchNews = async () => {
        const { data } = await supabase
            .from("news_articles")
            .select("*")
            .order("pub_date", { ascending: false })
            .limit(5);
        if (data) setNewsData(data);
    };

    useEffect(() => {
        async function fetchInsight() {
            setIsGenerating(true);
            const res = await generateTruthInsight();
            if (res.success && res.text) {
                setInsight(res.text);
            } else {
                setInsight("AI insight currently unavailable.");
            }
            setIsGenerating(false);
        }
        fetchNews();
        fetchInsight();
    }, []);

    const handleRefreshNews = async () => {
        setIsScraping(true);
        try {
            const res = await fetch("/api/scrape-news", { method: "POST" });
            const result = await res.json();
            if (result.articles) {
                setNewsData(result.articles);
                setLastScraped(new Date().toLocaleTimeString());
            }
        } catch (e) {
            console.error("Scrape failed", e);
        } finally {
            setIsScraping(false);
        }
    };

    // Calculate aggregated news stats
    const avgSentiment = newsData.length > 0
        ? newsData.reduce((acc, n) => acc + (n.sentiment_score ?? 0), 0) / newsData.length
        : 0;

    // Convert -1 to 1 sentiment to 0 to 100 percentage
    const sentimentPercent = Math.round((avgSentiment + 1) * 50);
    const sentimentLabel = avgSentiment > 0.3 ? "Mostly Positive" : avgSentiment < -0.3 ? "Mostly Negative" : "Neutral";
    const sentimentColor = avgSentiment > 0.3 ? "bg-green-500 text-green-500" : avgSentiment < -0.3 ? "bg-red-500 text-red-500" : "bg-yellow-500 text-yellow-500";
    const SentimentIcon = avgSentiment > 0.3 ? "↑" : avgSentiment < -0.3 ? "!" : "—";
    const latestHeadline = newsData.length > 0 ? newsData[0].title : "Waiting for latest local coverage...";

    return (
        <div className="w-full premium-glass rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col h-full shadow-3d-soft hover:shadow-3d-heavy transition-all duration-500 hover:border-primary/30">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-3">
                    <ShieldAlert className="w-6 h-6 text-primary" />
                    Truth Layer
                </h3>
                <button
                    onClick={handleRefreshNews}
                    disabled={isScraping}
                    className="flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl hover-3d-lift shadow-3d-pressed hover:shadow-3d-soft transition-all disabled:opacity-50 disabled:transform-none disabled:shadow-none"
                >
                    {isScraping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    Refresh News
                </button>
            </div>
            <p className="text-text-secondary text-sm mb-8 max-w-lg">
                Comparing hard statistics from Montgomery Open Data against sentiment and frequency of local news coverage.
            </p>

            {/* Split Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 mb-8">

                {/* Official Data */}
                <div className="bg-black/10 shadow-inner rounded-2xl p-6 border border-white/5 hover:bg-black/20 transition-colors">
                    <div className="text-xs text-text-secondary uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        Official Data Says
                    </div>

                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <TrendingDown className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <div className="text-sm text-text-secondary mb-0.5">Crime Rate</div>
                                <div className="text-foreground font-medium">Down 12% this year</div>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-5 h-5 flex items-center justify-center mt-0.5 text-blue-500 flex-shrink-0">✦</div>
                            <div>
                                <div className="text-sm text-text-secondary mb-0.5">Most Common</div>
                                <div className="text-foreground font-medium">Property crime (67%)</div>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <div className="text-sm text-text-secondary mb-0.5">Peak Time</div>
                                <div className="text-foreground font-medium">Weekends 10pm-2am</div>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* News Coverage */}
                <div className="bg-black/10 shadow-inner rounded-2xl p-6 border border-white/5 hover:bg-black/20 transition-colors">
                    <div className="text-xs text-text-secondary uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                        News Coverage Says
                    </div>

                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <div className={`w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0 font-bold ${sentimentColor.split(" ")[1]}`}>{SentimentIcon}</div>
                            <div className="w-full">
                                <div className="text-sm text-text-secondary mb-1">Sentiment</div>
                                <div className="flex items-center gap-3">
                                    <div className="text-foreground font-medium">{sentimentLabel}</div>
                                    <div className="h-1.5 flex-1 bg-card-hover rounded-full overflow-hidden">
                                        <div className={`h-full ${sentimentColor.split(" ")[0]} rounded-full`} style={{ width: `${sentimentPercent}%` }} />
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <Newspaper className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <div className="text-sm text-text-secondary mb-0.5">Coverage Frequency</div>
                                <div className="text-foreground font-medium">Tracking {newsData.length} articles</div>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-5 h-5 flex items-center justify-center mt-0.5 text-text-secondary flex-shrink-0">&quot;</div>
                            <div>
                                <div className="text-sm text-text-secondary mb-0.5">Latest Headline</div>
                                <div className="text-foreground font-medium text-sm italic line-clamp-2">&quot;{latestHeadline}&quot;</div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            {/* AI Insight Box */}
            <div className="mt-auto bg-primary/10 border border-primary/20 rounded-2xl p-5 flex items-start gap-4 shadow-inner-glow hover-3d-lift transition-all duration-300">
                <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <div className="w-full">
                    <div className="text-primary font-bold text-sm mb-1 uppercase tracking-wide flex items-center gap-2">
                        AI Insight
                        {isGenerating && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                    </div>
                    <div className="text-foreground text-sm leading-relaxed min-h-[40px]">
                        {isGenerating ? (
                            <span className="text-text-secondary italic">Analyzing Truth Layer gap...</span>
                        ) : (
                            <p>{insight}</p>
                        )}
                    </div>
                </div>
            </div>
            {/* Bright Data Badge */}
            <div className="absolute bottom-2 right-4 text-[10px] text-text-secondary font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Powered by Bright Data Web Scraper API • Last scraped: {lastScraped}
            </div>
        </div>
    );
}
