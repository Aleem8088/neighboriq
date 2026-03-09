"use client";

import { useEffect, useState } from "react";
import { AlertOctagon, Hammer, Wrench, Newspaper } from "lucide-react";
import { supabase } from "../lib/supabase";

interface StatsRowProps {
    address?: string;
}

interface Stats {
    crimeCount: number;
    permitCount: number;
    issueCount: number;
    newsCount: number;
    crimeTrend: number | null;
}

export default function StatsRow({ address }: StatsRowProps) {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            setLoading(true);
            try {
                const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
                const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000).toISOString().split("T")[0];

                // Current 30-day crime count
                const { count: crimeCount } = await supabase
                    .from("crime_incidents")
                    .select("*", { count: "exact", head: true })
                    .gte("date", thirtyDaysAgo);

                // Previous 30-day crime count (for trend)
                const { count: prevCrimeCount } = await supabase
                    .from("crime_incidents")
                    .select("*", { count: "exact", head: true })
                    .gte("date", sixtyDaysAgo)
                    .lt("date", thirtyDaysAgo);

                // Active permits
                const { count: permitCount } = await supabase
                    .from("permits")
                    .select("*", { count: "exact", head: true })
                    .eq("status", "active");

                // Open reported issues
                const { count: issueCount } = await supabase
                    .from("reported_issues")
                    .select("*", { count: "exact", head: true })
                    .eq("status", "pending");

                // News articles
                const { count: newsCount } = await supabase
                    .from("news_articles")
                    .select("*", { count: "exact", head: true });

                // Calculate trend percentage
                let crimeTrend: number | null = null;
                if (prevCrimeCount && prevCrimeCount > 0) {
                    crimeTrend = Math.round(
                        (((crimeCount ?? 0) - prevCrimeCount) / prevCrimeCount) * 100
                    );
                }

                setStats({
                    crimeCount: crimeCount ?? 0,
                    permitCount: permitCount ?? 0,
                    issueCount: issueCount ?? 0,
                    newsCount: newsCount ?? 0,
                    crimeTrend,
                });
            } catch (err) {
                console.error("Failed to fetch stats:", err);
                setStats({ crimeCount: 0, permitCount: 0, issueCount: 0, newsCount: 0, crimeTrend: null });
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, [address]);

    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-card border border-border rounded-2xl p-5 h-[120px] animate-pulse">
                        <div className="w-10 h-10 rounded-xl bg-card-hover mb-4" />
                        <div className="h-8 w-16 bg-card-hover rounded mb-1" />
                        <div className="h-3 w-24 bg-card-hover rounded" />
                    </div>
                ))}
            </div>
        );
    }

    const crimesTrend = stats?.crimeTrend !== null && stats?.crimeTrend !== undefined
        ? `${stats.crimeTrend > 0 ? "+" : ""}${stats.crimeTrend}%`
        : undefined;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <StatCard
                icon={<AlertOctagon className="w-5 h-5 text-red-400" />}
                label="Total Crimes (30d)"
                value={String(stats?.crimeCount ?? 0)}
                trend={crimesTrend}
                trendUp={stats?.crimeTrend !== null && stats?.crimeTrend !== undefined ? stats.crimeTrend > 0 : undefined}
            />
            <StatCard
                icon={<Hammer className="w-5 h-5 text-blue-400" />}
                label="Active Permits"
                value={String(stats?.permitCount ?? 0)}
            />
            <StatCard
                icon={<Wrench className="w-5 h-5 text-orange-400" />}
                label="Open 311 Issues"
                value={String(stats?.issueCount ?? 0)}
            />
            <StatCard
                icon={<Newspaper className="w-5 h-5 text-purple-400" />}
                label="News Articles"
                value={String(stats?.newsCount ?? 0)}
            />
        </div>
    );
}

function StatCard({ icon, label, value, trend, trendUp }: { icon: React.ReactNode, label: string, value: string, trend?: string, trendUp?: boolean }) {
    return (
        <div className="premium-glass rounded-3xl p-6 hover:shadow-3d-heavy shadow-3d-soft transition-all duration-500 flex flex-col justify-between h-full hover-3d-lift">
            <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-black/10 shadow-inner border border-white/5 flex items-center justify-center">
                    {icon}
                </div>
                {trend && (
                    <div className={`text-xs font-bold px-3 py-1.5 rounded-xl shadow-inner-glow ${trendUp === true ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        trendUp === false ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                            'bg-white/10 text-text-secondary border border-white/20'
                        }`}
                    >
                        {trend}
                    </div>
                )}
            </div>
            <div>
                <div className="text-4xl font-extrabold text-foreground mb-2 tracking-tight text-3d">{value}</div>
                <div className="text-xs text-text-secondary font-bold uppercase tracking-widest">{label}</div>
            </div>
        </div>
    );
}
