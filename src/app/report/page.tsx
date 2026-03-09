"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Upload, CheckCircle2, RotateCcw, MapPin, AlertTriangle, Share2, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { classifyIssuePhoto } from "../actions/gemini";
import { supabase } from "../../lib/supabase";

type Priority = "low" | "medium" | "high";

type Classification = {
    type: string;
    confidence: number;
    description: string;
    priority: Priority;
};

export default function ReportPage() {
    const [step, setStep] = useState(1);

    // Photo State
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [imageMime, setImageMime] = useState<string | null>(null);
    const [isClassifying, setIsClassifying] = useState(false);
    const [classification, setClassification] = useState<Classification | null>(null);

    // Form State
    const [description, setDescription] = useState("");
    const [issueType, setIssueType] = useState("");
    const [location, setLocation] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [latLng, setLatLng] = useState<{ lat: number, lng: number } | null>(null);

    // Submit State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reportId, setReportId] = useState<string | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);

        // Compress and resize image before converting to base64 to avoid Next.js 1MB Server Action limit
        const reader = new FileReader();
        reader.onloadend = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxDim = 1024;

                if (width > height) {
                    if (width > maxDim) {
                        height *= maxDim / width;
                        width = maxDim;
                    }
                } else {
                    if (height > maxDim) {
                        width *= maxDim / height;
                        height = maxDim;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                // Convert to compressed JPEG
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                const base64String = dataUrl.split(',')[1];
                setImageBase64(base64String);
                setImageMime('image/jpeg');
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleClassify = async () => {
        if (!imageBase64 || !imageMime) return;
        setIsClassifying(true);

        try {
            const res = await classifyIssuePhoto(imageBase64, imageMime);

            if (res.success && res.data) {
                setClassification(res.data);
                setIssueType(res.data.type);
                setDescription(res.data.description);
            } else {
                alert("Failed to classify image. Please fill out details manually.");
                setStep(2); // Move to manual entry anyway
            }
        } catch (error) {
            console.error("Classification error:", error);
            alert("Network error. Please fill out details manually.");
            setStep(2);
        } finally {
            setIsClassifying(false);
        }
    };

    const handleGetLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                setLatLng({ lat: position.coords.latitude, lng: position.coords.longitude });
                // We mock a reverse geocode for now
                setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)} (GPS Location)`);
            }, (error) => {
                console.error("Location error:", error);
                alert("Failed to get location. Please enter it manually.");
            });
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Save to Supabase
        const mockRandomId = Math.floor(1000 + Math.random() * 9000).toString();

        try {
            const { error } = await supabase.from("reported_issues").insert({
                lat: latLng?.lat || 32.3668, // Default to Montgomery coords if none
                lng: latLng?.lng || -86.3000,
                type: issueType,
                photo_url: "uploaded_photo.jpg", // Mock since we don't have storage bucket setup specified
                status: "reported",
                created_at: new Date().toISOString()
            });

            if (error) throw error;

            setReportId(mockRandomId);
            setStep(4); // Success screen
        } catch (error) {
            console.error(error);
            alert("Failed to submit report.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepNumbers = () => (
        <div className="flex items-center justify-between w-full max-w-sm mx-auto mb-8 relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10 -translate-y-1/2" />

            {[1, 2, 3].map((num) => (
                <div key={num} className="flex flex-col items-center gap-2 bg-background px-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= num ? "bg-primary text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]" : "bg-black/20 shadow-inner border border-white/5 text-text-secondary"
                        }`}>
                        {step > num ? <CheckCircle2 className="w-5 h-5" /> : num}
                    </div>
                    <span className={`text-xs font-semibold uppercase tracking-wider ${step >= num ? "text-primary filter drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]" : "text-text-secondary"}`}>
                        {num === 1 ? "Photo" : num === 2 ? "Details" : "Submit"}
                    </span>
                </div>
            ))}
        </div>
    );

    const getPriorityColor = (priority: Priority | undefined) => {
        if (priority === "high") return "bg-red-500/20 text-red-500 border-red-500/30";
        if (priority === "medium") return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
        return "bg-green-500/20 text-green-500 border-green-500/30";
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-white/5 shadow-sm p-4 flex items-center gap-4">
                <Link href="/" className="w-10 h-10 bg-black/10 shadow-inner hover:bg-white/5 border border-white/5 rounded-xl flex items-center justify-center transition-colors">
                    <ArrowLeft className="w-5 h-5 text-text-secondary" />
                </Link>
                <div>
                    <h1 className="text-lg font-bold">Report a City Issue</h1>
                    <p className="text-xs text-text-secondary">Reports go directly to city officials.</p>
                </div>
            </header>

            <main className="flex-1 p-4 md:p-8 max-w-2xl mx-auto w-full flex flex-col">
                {step < 4 && renderStepNumbers()}

                <AnimatePresence mode="wait">
                    {/* STEP 1: PHOTO */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 flex flex-col gap-6"
                        >
                            {!imagePreview ? (
                                <label className="flex-1 premium-glass border-white/10 hover:border-primary/50 rounded-3xl flex flex-col items-center justify-center p-8 cursor-pointer shadow-3d-soft hover:shadow-3d-heavy transition-all duration-500 hover:-translate-y-1 group min-h-[300px]">
                                    <div className="w-20 h-20 bg-black/20 shadow-inner group-hover:bg-primary/10 rounded-full flex items-center justify-center mb-6 transition-colors">
                                        <Upload className="w-8 h-8 text-text-secondary group-hover:text-primary transition-colors filter group-hover:drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-3d group-hover:text-primary transition-colors">Tap to take photo</h3>
                                    <p className="text-text-secondary text-sm">or upload from your library</p>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                </label>
                            ) : (
                                <div className="space-y-6 flex-1 flex flex-col">
                                    <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden border border-white/10 shadow-inner">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => setImagePreview(null)}
                                            className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full border border-white/10 flex items-center justify-center hover:bg-black/70 transition-colors"
                                        >
                                            <RotateCcw className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {classification && (
                                        <div className="bg-black/20 shadow-inner border border-white/10 p-5 rounded-2xl flex flex-col gap-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-primary font-bold">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    AI Classification Complete
                                                </div>
                                                <span className="text-sm font-medium text-text-secondary">
                                                    {Math.round(classification.confidence * 100)}% Match
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="px-3 py-1 bg-black/30 shadow-inner border border-white/5 rounded-lg text-sm capitalize font-medium">
                                                    {classification.type.replace('_', ' ')}
                                                </span>
                                                <span className={`px-3 py-1 rounded-lg text-sm capitalize font-medium border shadow-[0_0_10px_currentColor_rgba(0,0,0,0.1)] ${getPriorityColor(classification.priority)}`}>
                                                    {classification.priority} Priority
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-auto pt-6 flex gap-4">
                                        <button
                                            onClick={() => setStep(2)}
                                            className="flex-1 py-4 font-bold rounded-2xl border border-white/10 bg-black/10 hover:bg-white/5 shadow-inner transition-colors"
                                        >
                                            Skip AI
                                        </button>
                                        <button
                                            onClick={classification ? () => setStep(2) : handleClassify}
                                            disabled={isClassifying}
                                            className="flex-[2] py-4 bg-primary hover:bg-primary-dark text-black font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-3d-pressed hover-3d-lift"
                                        >
                                            {isClassifying ? (
                                                <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</>
                                            ) : classification ? (
                                                "Continue to Details"
                                            ) : (
                                                <><Sparkles className="w-5 h-5" /> Auto-Identify Issue</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* STEP 2: DETAILS */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 flex flex-col gap-6"
                        >
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Issue Type</label>
                                    <select
                                        value={issueType}
                                        onChange={(e) => setIssueType(e.target.value)}
                                        className="w-full bg-black/20 shadow-inner border border-white/10 focus:border-primary/50 focus:bg-black/30 rounded-xl p-4 text-foreground outline-none appearance-none transition-colors"
                                    >
                                        <option value="">Select type...</option>
                                        <option value="pothole">Pothole</option>
                                        <option value="broken streetlight">Broken Streetlight</option>
                                        <option value="graffiti">Graffiti</option>
                                        <option value="illegal dumping">Illegal Dumping</option>
                                        <option value="damaged sidewalk">Damaged Sidewalk</option>
                                        <option value="flooding">Flooding</option>
                                        <option value="fallen tree">Fallen Tree</option>
                                        <option value="broken bench">Broken Bench</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        className="w-full bg-black/20 shadow-inner border border-white/10 focus:border-primary/50 focus:bg-black/30 rounded-xl p-4 text-foreground outline-none transition-colors"
                                        placeholder="Add any extra details..."
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-text-secondary">Location</label>
                                        <button onClick={handleGetLocation} className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
                                            <MapPin className="w-4 h-4" /> Use My Location
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full bg-black/20 shadow-inner border border-white/10 focus:border-primary/50 focus:bg-black/30 rounded-xl p-4 text-foreground outline-none transition-colors"
                                        placeholder="Enter address or intersection"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-2">Your Name <span className="opacity-70">(Optional)</span></label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-black/20 shadow-inner border border-white/10 focus:border-primary/50 focus:bg-black/30 rounded-xl p-4 text-foreground outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-2">Email <span className="opacity-70">(Optional)</span></label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-black/20 shadow-inner border border-white/10 focus:border-primary/50 focus:bg-black/30 rounded-xl p-4 text-foreground outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto pt-6 flex gap-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-4 font-bold rounded-2xl border border-white/10 bg-black/10 hover:bg-white/5 shadow-inner transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    disabled={!issueType || !location}
                                    className="flex-[2] py-4 bg-primary hover:bg-primary-dark text-black font-bold rounded-2xl transition-all disabled:opacity-50 disabled:hover:bg-primary shadow-3d-pressed hover-3d-lift"
                                >
                                    Review & Submit
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: SUBMIT */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 flex flex-col gap-6"
                        >
                            <div className="premium-glass rounded-3xl p-8 mb-4 shadow-3d-soft">
                                <h3 className="text-xl font-bold mb-6">Review Report</h3>

                                <div className="space-y-5">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-black/20 shadow-inner border border-white/5 flex items-center justify-center flex-shrink-0">
                                            <AlertTriangle className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-text-secondary mb-1">Issue Type</div>
                                            <div className="font-medium capitalize text-lg">{issueType}</div>
                                            {classification && (
                                                <div className="text-xs text-primary font-medium mt-1">
                                                    AI matches with {Math.round(classification.confidence * 100)}% confidence
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-black/20 shadow-inner border border-white/5 flex items-center justify-center flex-shrink-0">
                                            <MapPin className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-text-secondary mb-1">Location</div>
                                            <div className="font-medium">{location}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                                <p className="text-sm text-orange-200/80 leading-relaxed">
                                    By submitting this report, you confirm that this is a non-emergency issue. For emergencies, please call 911 immediately.
                                </p>
                            </div>

                            <div className="mt-auto pt-6 flex gap-4">
                                <button
                                    onClick={() => setStep(2)}
                                    disabled={isSubmitting}
                                    className="flex-1 py-4 font-bold rounded-2xl border border-white/10 bg-black/10 hover:bg-white/5 shadow-inner transition-colors disabled:opacity-50"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="flex-[2] py-4 bg-primary hover:bg-primary-dark text-black font-bold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-80 shadow-3d-pressed hover-3d-lift"
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                                    ) : (
                                        "Submit Report"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* SUCCESS SCREEN */}
                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto w-full gap-6 py-12"
                        >
                            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center relative mb-4">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: 0.2 }}
                                    className="absolute inset-0 bg-green-500 rounded-full opacity-20 animate-ping"
                                />
                                <CheckCircle2 className="w-12 h-12 text-green-500 relative z-10" />
                            </div>

                            <h2 className="text-3xl font-black text-foreground">Report #{reportId} Submitted!</h2>

                            <div className="space-y-2 mb-4">
                                <p className="text-text-secondary">Montgomery city officials have been notified.</p>
                                <p className="text-primary font-medium">Estimated response time: 3-5 business days</p>
                            </div>

                            <button className="w-full py-4 bg-black/20 shadow-inner border border-white/10 hover:bg-black/30 hover:-translate-y-1 hover:shadow-3d-soft rounded-2xl flex items-center justify-center gap-2 font-medium transition-all duration-300">
                                <Share2 className="w-5 h-5" />
                                Share Report Link
                            </button>

                            <button
                                onClick={() => {
                                    setStep(1);
                                    setImagePreview(null);
                                    setImageBase64(null);
                                    setClassification(null);
                                    setIssueType("");
                                    setDescription("");
                                    setLocation("");
                                }}
                                className="w-full py-4 bg-primary hover:bg-primary-dark shadow-3d-pressed hover-3d-lift text-black font-bold rounded-2xl transition-all"
                            >
                                Report Another Issue
                            </button>

                            <Link href="/" className="text-sm font-medium mt-4 text-text-secondary hover:text-foreground transition-colors">
                                Back to Dashboard
                            </Link>

                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
