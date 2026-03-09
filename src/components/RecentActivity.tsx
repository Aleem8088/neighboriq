"use client";

import { useState, useEffect } from "react";
import { AlertCircle, FileText, Newspaper } from "lucide-react";
import { supabase } from "../lib/supabase";

type Tab = "Crime" | "Permits" | "News";

interface ActivityItem {
    id: string;
    title: string;
    desc: string;
    date: string;
    icon: React.ReactNode;
}

function timeAgo(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return "1 week ago";
    return `${Math.floor(diffDays / 7)} weeks ago`;
}

export default function RecentActivity() {
    const [activeTab, setActiveTab] = useState<Tab>("Crime");
    const [data, setData] = useState<Record<Tab, ActivityItem[]>>({
        Crime: [],
        Permits: [],
        News: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchActivity() {
            setLoading(true);
            try {
                // Fetch latest crimes
                const { data: crimes } = await supabase
                    .from("crime_incidents")
                    .select("id, type, description, date")
                    .order("date", { ascending: false })
                    .limit(5);

                // Fetch latest permits
                const { data: permits } = await supabase
                    .from("permits")
                    .select("id, type, location, status, date")
                    .order("date", { ascending: false })
                    .limit(5);

                // Fetch latest news
                const { data: news } = await supabase
                    .from("news_articles")
                    .select("id, title, summary, date")
                    .order("date", { ascending: false })
                    .limit(5);

                setData({
                    Crime: (crimes ?? []).map((c) => ({
                        id: c.id,
                        title: c.type,
                        desc: c.description || "Reported incident",
                        date: timeAgo(c.date),
                        icon: <AlertCircle className="text-red-400 w-4 h-4" />,
                    })),
                    Permits: (permits ?? []).map((p) => ({
                        id: p.id,
                        title: `${p.type} — ${p.status}`,
                        desc: p.location || "Montgomery, AL",
                        date: timeAgo(p.date),
                        icon: <FileText className="text-blue-400 w-4 h-4" />,
                    })),
                    News: (news ?? []).map((n) => ({
                        id: n.id,
                        title: n.title,
                        desc: n.summary || "",
                        date: timeAgo(n.date),
                        icon: <Newspaper className="text-purple-400 w-4 h-4" />,
                    })),
                });
            } catch (err) {
                console.error("Failed to fetch recent activity:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchActivity();
    }, []);

    const currentItems = data[activeTab];
    const isEmpty = currentItems.length === 0 && !loading;

    return (
        <div className="premium-glass rounded-3xl p-6 md:p-8 flex flex-col h-full w-full max-w-full overflow-hidden shadow-3d-soft hover:shadow-3d-heavy transition-all duration-500 hover:border-primary/30">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h3 className="text-xl md:text-2xl font-bold text-foreground">Recent Activity</h3>

                {/* Tabs */}
                <div className="flex p-1.5 bg-black/10 shadow-inner border border-white/5 rounded-2xl overflow-x-auto w-full md:w-auto">
                    {(["Crime", "Permits", "News"] as Tab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex-1 md:flex-none ${activeTab === tab
                                ? "bg-card flex-1 shadow-3d-pressed text-foreground border border-white/10"
                                : "text-text-secondary hover:text-foreground hover:bg-white/5"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {loading ? (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="p-4 bg-background/30 border border-border rounded-2xl flex gap-4 items-start animate-pulse">
                            <div className="w-10 h-10 rounded-xl bg-card-hover flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-32 bg-card-hover rounded" />
                                <div className="h-3 w-48 bg-card-hover rounded" />
                            </div>
                        </div>
                    ))
                ) : isEmpty ? (
                    <div className="flex items-center justify-center h-32 text-text-secondary text-sm">
                        No {activeTab.toLowerCase()} data available yet
                    </div>
                ) : (
                    currentItems.map((item) => (
                        <div key={item.id} className="group p-5 bg-black/10 shadow-inner border border-white/5 hover:border-primary/30 rounded-2xl transition-all duration-300 flex gap-4 items-start hover:bg-black/20 hover-3d-lift cursor-pointer">
                            <div className="w-12 h-12 rounded-xl bg-card-hover flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all shadow-inner-glow">
                                {item.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <h4 className="font-semibold text-foreground text-sm truncate">{item.title}</h4>
                                    <span className="text-xs text-text-secondary whitespace-nowrap">{item.date}</span>
                                </div>
                                <p className="text-sm text-text-secondary truncate">{item.desc}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
