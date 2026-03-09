"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, AlertCircle, HeartHandshake, MapPin, Clock, ShieldAlert, Send } from "lucide-react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type Urgency = "Normal" | "Urgent" | "Critical";
type Category = "Emergency Help" | "Volunteer Needed" | "Resource Share" | "Safety Alert" | "General";

type CommunityPost = {
    id: string;
    category: Category;
    title: string;
    details: string;
    location: string;
    urgency: Urgency;
    contact: string;
    image_url?: string;
    created_at: string;
};

export default function CommunityBoardPage() {
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState<Category>("Volunteer Needed");
    const [details, setDetails] = useState("");
    const [location, setLocation] = useState("");
    const [urgency, setUrgency] = useState<Urgency>("Normal");
    const [contact, setContact] = useState("");

    // Fetch posts
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const { data, error } = await supabase
                    .from("community_posts")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (error) throw error;
                if (data) setPosts(data as CommunityPost[]);
            } catch (error) {
                console.error("Failed to fetch community posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();

        // Optional realtime hook
        const channel = supabase
            .channel('public:community_posts')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_posts' }, (payload) => {
                setPosts((current) => [payload.new as CommunityPost, ...current]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { error } = await supabase.from("community_posts").insert({
                title,
                category,
                details,
                location,
                urgency,
                contact
            });

            if (error) throw error;

            // Optional: reset form
            setTitle("");
            setDetails("");
            setLocation("");
            setContact("");
            setCategory("General");
            setUrgency("Normal");

            alert("Post submitted successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to submit post. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getUrgencyColor = (u: Urgency) => {
        switch (u) {
            case "Critical": return "bg-red-500/10 text-red-500 border-red-500/20";
            case "Urgent": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
            default: return "bg-blue-500/10 text-blue-500 border-blue-500/20";
        }
    };

    const getCategoryIcon = (c: Category) => {
        switch (c) {
            case "Emergency Help": return <ShieldAlert className="w-4 h-4" />;
            case "Volunteer Needed": return <HeartHandshake className="w-4 h-4" />;
            case "Safety Alert": return <AlertCircle className="w-4 h-4" />;
            default: return <HeartHandshake className="w-4 h-4" />;
        }
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-white/5 p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/" className="w-10 h-10 bg-black/10 shadow-inner hover:bg-white/5 border border-white/5 rounded-xl flex items-center justify-center transition-colors">
                        <ArrowLeft className="w-5 h-5 text-text-secondary" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent gradient-green">Montgomery Community Board</h1>
                        <p className="text-xs text-text-secondary font-medium">Neighbors helping neighbors</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8 items-start">

                {/* POST FORM */}
                <div className="premium-glass rounded-3xl p-6 md:p-8 lg:sticky lg:top-24 shadow-3d-soft">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <HeartHandshake className="w-5 h-5 text-primary" />
                        Post a Need
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as Category)}
                                className="w-full bg-black/20 shadow-inner border border-white/10 focus:border-primary/50 focus:bg-black/30 rounded-xl p-3.5 text-foreground outline-none appearance-none font-medium transition-colors"
                            >
                                <option value="Emergency Help">Emergency Help</option>
                                <option value="Volunteer Needed">Volunteer Needed</option>
                                <option value="Resource Share">Resource Share</option>
                                <option value="Safety Alert">Safety Alert</option>
                                <option value="General">General</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">Title</label>
                            <input
                                required
                                type="text"
                                placeholder="Short description"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-black/20 shadow-inner border border-white/10 focus:border-primary/50 focus:bg-black/30 rounded-xl p-3.5 text-foreground outline-none font-medium transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">Details</label>
                            <textarea
                                required
                                rows={3}
                                placeholder="Explain what you need..."
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                className="w-full bg-black/20 shadow-inner border border-white/10 focus:border-primary/50 focus:bg-black/30 rounded-xl p-3.5 text-foreground outline-none resize-none font-medium transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">Urgency</label>
                                <select
                                    value={urgency}
                                    onChange={(e) => setUrgency(e.target.value as Urgency)}
                                    className="w-full bg-black/20 shadow-inner border border-white/10 focus:border-primary/50 focus:bg-black/30 rounded-xl p-3.5 text-foreground outline-none appearance-none font-medium transition-colors"
                                >
                                    <option value="Normal">Normal</option>
                                    <option value="Urgent">Urgent</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">Location</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Neighborhood"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full bg-black/20 shadow-inner border border-white/10 focus:border-primary/50 focus:bg-black/30 rounded-xl p-3.5 text-foreground outline-none font-medium transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">Contact <span className="opacity-60 text-xs font-normal">(Optional)</span></label>
                            <input
                                type="text"
                                placeholder="Phone or Email"
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                                className="w-full bg-black/20 shadow-inner border border-white/10 focus:border-primary/50 focus:bg-black/30 rounded-xl p-3.5 text-foreground outline-none font-medium transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full mt-4 py-4 bg-primary hover:bg-primary-dark text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-3d-pressed hover-3d-lift"
                        >
                            {isSubmitting ? "Posting..." : <><Send className="w-4 h-4" /> Post to Community</>}
                        </button>
                    </form>
                </div>

                {/* COMMUNITY FEED */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2 px-1">
                        Community Feed
                        <span className="text-sm font-medium bg-border text-text-secondary px-2.5 py-0.5 rounded-full">{posts.length}</span>
                    </h2>

                    {loading ? (
                        <div className="flex justify-center p-12">
                            <div className="w-8 h-8 rounded-full border-t-2 border-primary animate-spin" />
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="premium-glass rounded-3xl p-12 text-center shadow-3d-soft">
                            <HeartHandshake className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-bold mb-2">No posts yet</h3>
                            <p className="text-text-secondary text-sm">Be the first to post a need or offer help to your neighbors.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <AnimatePresence>
                                {posts.map((post) => (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="premium-glass rounded-3xl p-6 shadow-3d-soft hover:shadow-3d-heavy transition-all duration-500 hover:-translate-y-1 group"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${getUrgencyColor(post.urgency)}`}>
                                                    {getCategoryIcon(post.category)}
                                                    {post.category}
                                                </span>
                                                {post.urgency !== "Normal" && (
                                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]`}>
                                                        {post.urgency}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-text-secondary font-medium flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {timeAgo(post.created_at)}
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold mb-2 leading-tight">{post.title}</h3>
                                        <p className="text-sm text-text-secondary mb-4 leading-relaxed line-clamp-3">{post.details}</p>

                                        {post.image_url && (
                                            <div className="w-full h-48 rounded-xl overflow-hidden mb-4 border border-white/10 shadow-inner">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={post.image_url}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-5 border-t border-white/10">
                                            <div className="flex items-center gap-2 text-sm text-text-secondary font-medium">
                                                <MapPin className="w-4 h-4 text-primary" />
                                                {post.location}
                                            </div>
                                            <button
                                                onClick={() => alert(`Contact: ${post.contact || "Please reply in thread (Feature coming soon!)"}`)}
                                                className="px-5 py-2.5 bg-black/20 shadow-inner border border-white/10 hover:bg-primary hover:text-black hover:border-primary font-bold text-sm rounded-xl transition-all hover-3d-lift shadow-3d-soft"
                                            >
                                                I&apos;ll Help
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
