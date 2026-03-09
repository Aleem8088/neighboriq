"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

import { triggerDatabaseSeed } from "../actions/seed";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [address, setAddress] = useState("Loading...");
    const [isCollapsed, setIsCollapsed] = useState(false);

    // We can grab the address from the URL to display in header
    useEffect(() => {
        const path = window.location.pathname;
        const parts = path.split("/");
        if (parts.length > 2) {
            let decoded = decodeURIComponent(parts[2]);
            // If the user typed "Downtown", we want it to look like "Downtown, Montgomery, AL"
            // If they typed "500 Dexter Ave", it becomes "500 Dexter Ave, Montgomery, AL"
            if (decoded && !decoded.toLowerCase().includes("montgomery")) {
                decoded = `${decoded}, Montgomery, AL`;
            }
            setAddress(decoded);
        }

        // Quietly trigger ArcGIS data seeding in the background on startup
        triggerDatabaseSeed().catch(console.error);
    }, []);

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden">
            {/* Mobile Tabs (Top) / Desktop Sidebar (Left) */}
            <nav className={`premium-glass border-0 flex-shrink-0 flex md:flex-col justify-around md:justify-start p-4 md:p-6 gap-2 md:gap-4 overflow-x-auto md:overflow-visible shadow-3d-soft z-50 md:rounded-r-3xl transition-all duration-300 relative ${isCollapsed ? "w-full md:w-24" : "w-full md:w-64"}`}>

                {/* Desktop Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden md:flex absolute -right-4 top-8 w-8 h-8 bg-black/20 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-full items-center justify-center text-text-secondary hover:text-primary transition-all shadow-3d-soft z-50"
                >
                    {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>

                <button
                    onClick={() => router.push("/")}
                    className={`hidden md:flex items-center gap-3 text-foreground font-bold text-xl mb-8 hover:text-primary transition-colors ${isCollapsed ? "justify-center" : ""}`}
                >
                    <div className="w-8 h-8 rounded-lg gradient-green flex items-center justify-center text-sm shadow-lg glow-green flex-shrink-0 relative group">
                        {"NIQ"}
                        {isCollapsed && (
                            <div className="absolute left-full ml-4 px-2 py-1 bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                                NeighborIQ
                            </div>
                        )}
                    </div>
                    {!isCollapsed && <span>NeighborIQ</span>}
                </button>

                <SidebarItem icon="📊" label="Overview" active isCollapsed={isCollapsed} />
                <SidebarItem icon="🗺️" label="Maps & Data" isCollapsed={isCollapsed} />
                <SidebarItem icon="📰" label="News Feed" isCollapsed={isCollapsed} />
                <SidebarItem icon="📋" label="City Reports" isCollapsed={isCollapsed} />
                <SidebarItem icon="🤝" label="Community Board" href="/community" urgent isCollapsed={isCollapsed} />
                <SidebarItem icon="🗳️" label="Community Wishlist" href="/wishlist" badge="Vote now" isCollapsed={isCollapsed} />
            </nav>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen min-w-0">

                {/* Sticky Header */}
                <header className="sticky top-0 z-40 bg-background/60 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-4 flex items-center justify-between shadow-sm">
                    <div className="flex flex-1 items-center gap-4 min-w-0">
                        <button
                            onClick={() => router.push("/")}
                            className="p-2 -ml-2 hover:bg-card rounded-full transition-colors hidden md:block flex-shrink-0"
                            title="Back to search"
                        >
                            <ArrowLeft className="w-5 h-5 text-text-secondary hover:text-foreground" />
                        </button>
                        <div className="min-w-0">
                            <div className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-0.5">Viewing</div>
                            <h1 className="text-sm md:text-base text-foreground font-medium truncate">
                                {address}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                        <ThemeToggle />
                        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#22c55e]" />
                            <span className="text-primary text-xs font-semibold tracking-wide uppercase hidden sm:inline-block">Live Data</span>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}

import Link from "next/link";

function SidebarItem({ icon, label, active = false, href, urgent = false, badge, isCollapsed = false }: { icon: string, label: string, active?: boolean, href?: string, urgent?: boolean, badge?: string, isCollapsed?: boolean }) {
    const Component = href ? Link : "button";
    return (
        // @ts-expect-error - Next.js Link component types can be tricky with polymorphic components
        <Component href={href} className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-xl transition-all duration-300 w-full group relative ${active
            ? "bg-primary text-black font-bold shadow-3d-pressed transform scale-[0.98]"
            : "text-text-secondary hover:bg-black/10 hover:text-foreground hover-3d-lift cursor-pointer border border-transparent hover:border-white/5"
            }`}>
            <div className={`flex items-center gap-3 ${isCollapsed ? 'w-full justify-center' : ''}`}>
                <span className="text-lg flex-shrink-0 group-hover:scale-110 transition-transform">{icon}</span>
                {!isCollapsed && <span className="truncate">{label}</span>}
            </div>

            {/* Indicators for expanded state */}
            {!isCollapsed && urgent && (
                <span className="w-2 h-2 flex-shrink-0 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
            )}
            {!isCollapsed && badge && (
                <span className="text-[10px] flex-shrink-0 font-bold uppercase tracking-wider bg-primary/20 text-primary px-2 py-0.5 rounded-md border border-primary/30 group-hover:bg-primary group-hover:text-black transition-colors">
                    {badge}
                </span>
            )}

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-black/80 backdrop-blur-md border border-white/10 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 flex items-center gap-2 shadow-xl whitespace-nowrap">
                    {label}
                    {urgent && <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />}
                    {badge && <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary px-2 py-0.5 rounded-md">{badge}</span>}
                </div>
            )}

            {/* Urgent pip on icon for collapsed state */}
            {isCollapsed && urgent && (
                <span className="absolute top-2 right-2 md:right-auto md:left-2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
            )}
        </Component>
    );
}
