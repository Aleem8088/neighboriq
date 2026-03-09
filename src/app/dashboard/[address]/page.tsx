"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import NeighborhoodScore from "../../../components/NeighborhoodScore";
import TruthLayer from "../../../components/TruthLayer";
import StatsRow from "../../../components/StatsRow";
import RecentActivity from "../../../components/RecentActivity";
import NeighborhoodChat from "../../../components/NeighborhoodChat";
import WishlistSection from "../../../components/WishlistSection";
import { Plus, Search, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

// Dynamic import for Leaflet map to prevent SSR window is not defined errors
const Map = dynamic(() => import("../../../components/Map"), {
    ssr: false,
    loading: function MapLoading() {
        return (
            <div className="w-full h-[400px] bg-black/10 shadow-inner border border-white/5 animate-pulse rounded-3xl flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        );
    }
});

export default function DashboardPage({
    params,
}: {
    params: { address: string };
}) {
    const router = useRouter();
    const address = decodeURIComponent(params.address);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [coordinates, setCoordinates] = useState<[number, number]>([32.3792, -86.3077]); // Montgomery default

    useEffect(() => {
        async function validateAddress() {
            setLoading(true);
            try {
                const query = encodeURIComponent(`${address}, Montgomery, AL`);
                const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`);
                const data = await res.json();

                if (data && data.length > 0) {
                    setCoordinates([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                    setNotFound(false);
                } else {
                    setNotFound(true);
                }
            } catch (e) {
                console.error("Geocoding failed", e);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        }

        // Only run geocoding if address is provided
        if (address) validateAddress();
    }, [address]);

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (searchInput.trim()) {
            router.push(`/dashboard/${encodeURIComponent(searchInput.trim())}`);
        }
    };

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (notFound) {
        return (
            <div className="p-4 md:p-8 max-w-2xl mx-auto w-full min-h-[70vh] flex flex-col items-center justify-center">
                <div className="premium-glass border-red-500/30 rounded-3xl p-8 md:p-12 w-full text-center shadow-3d-heavy">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner-glow">
                        <MapPin className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-3">
                        We couldn&apos;t find that address in Montgomery, AL
                    </h2>
                    <p className="text-text-secondary mb-8 leading-relaxed max-w-md mx-auto">
                        Try searching for a street name like &quot;Dexter Ave, Montgomery AL&quot; or use one of our suggested examples below.
                    </p>

                    <form onSubmit={handleSearch} className="relative w-full mb-10 max-w-md mx-auto">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-text-secondary" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-12 pr-24 py-4 md:py-5 border border-white/10 rounded-2xl bg-black/10 shadow-inner text-foreground placeholder-text-secondary outline-none focus:ring-2 focus:ring-primary focus:bg-black/20 transition-all"
                            placeholder='Try "500 Dexter Ave"...'
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-2 bottom-2 px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors shadow-sm"
                        >
                            Search
                        </button>
                    </form>

                    <div className="text-left w-full max-w-md mx-auto">
                        <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-4 h-[1px] bg-border block"></span>
                            Suggested Addresses
                            <span className="flex-1 h-[1px] bg-border block"></span>
                        </h3>
                        <div className="flex flex-col gap-3">
                            <button onClick={() => router.push('/dashboard/500%20Dexter%20Ave')} className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group text-left">
                                <div>
                                    <div className="font-bold text-foreground">500 Dexter Ave</div>
                                    <div className="text-xs text-text-secondary mt-0.5">City Hall Area</div>
                                </div>
                            </button>
                            <button onClick={() => router.push('/dashboard/1%20Dexter%20Ave')} className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group text-left">
                                <div>
                                    <div className="font-bold text-foreground">1 Dexter Ave</div>
                                    <div className="text-xs text-text-secondary mt-0.5">State Capitol</div>
                                </div>
                            </button>
                            <button onClick={() => router.push('/dashboard/2625%20Zelda%20Rd')} className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group text-left">
                                <div>
                                    <div className="font-bold text-foreground">2625 Zelda Rd</div>
                                    <div className="text-xs text-text-secondary mt-0.5">Cloverdale</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full pb-24 relative min-h-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">

                {/* Top Row: Score & Stats */}
                <div className="lg:col-span-12 space-y-6">
                    <NeighborhoodScore address={address} />
                    <StatsRow address={address} />
                </div>

                {/* Middle Row: Map & Layout */}
                <div className="lg:col-span-7 h-full min-h-[500px] flex flex-col">
                    <div className="flex-1 bg-black/10 shadow-inner rounded-3xl overflow-hidden relative border border-white/5">
                        <Map address={address} externalCoordinates={coordinates} />
                    </div>
                </div>

                <div className="lg:col-span-5 flex flex-col gap-6">
                    <TruthLayer />
                    <RecentActivity />
                </div>

                {/* Bottom Chat Section */}
                <div className="lg:col-span-12 pt-6 border-t border-[#222]">
                    <NeighborhoodChat />
                </div>

                {/* Wishlist Section */}
                <div className="lg:col-span-12">
                    <WishlistSection neighborhood={address} />
                </div>

            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => router.push("/report")}
                className="fixed bottom-6 right-6 md:bottom-12 md:right-12 w-16 h-16 bg-primary hover:bg-primary-dark text-black rounded-full flex items-center justify-center shadow-3d-heavy hover-3d-lift transition-all duration-300 z-50 group"
                title="Report Issue"
            >
                <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
                {/* Tooltip on hover */}
                <span className="absolute right-20 bg-background/80 backdrop-blur-md border border-white/10 shadow-3d-soft text-foreground text-sm font-bold px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none before:content-[''] before:absolute before:-right-2 before:top-1/2 before:-translate-y-1/2 before:border-8 before:border-transparent before:border-l-border">
                    Report Issue
                </span>
            </button>
        </div>
    );
}

// Full page skeleton loader keeping the layout structure
function DashboardSkeleton() {
    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Neighborhood Score Skeleton */}
                <div className="lg:col-span-12 bg-black/10 shadow-inner border border-white/5 rounded-3xl p-8 h-[340px]" />

                {/* Stats Row Skeleton */}
                <div className="lg:col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-black/10 shadow-inner border border-white/5 rounded-3xl h-[120px]" />
                    <div className="bg-black/10 shadow-inner border border-white/5 rounded-3xl h-[120px]" />
                    <div className="bg-black/10 shadow-inner border border-white/5 rounded-3xl h-[120px]" />
                    <div className="bg-black/10 shadow-inner border border-white/5 rounded-3xl h-[120px]" />
                </div>

                {/* Map Skeleton */}
                <div className="lg:col-span-7 bg-black/10 shadow-inner border border-white/5 rounded-3xl h-[600px]" />

                {/* Truth Layer & Recent Activity Skeleton */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="bg-black/10 shadow-inner border border-white/5 rounded-3xl h-[300px]" />
                    <div className="bg-black/10 shadow-inner border border-white/5 rounded-3xl h-[276px]" />
                </div>
            </div>
        </div>
    );
}
