"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Search, Map, ShieldAlert, Bot, MessageSquareWarning, HeartHandshake } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

function use3DTilt(movementIntensity = 15) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [`${movementIntensity}deg`, `-${movementIntensity}deg`]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [`-${movementIntensity}deg`, `${movementIntensity}deg`]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return { ref, rotateX, rotateY, handleMouseMove, handleMouseLeave };
}

export default function Home() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const heroTilt = use3DTilt(10); // Subtle tilt for the whole hero

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      router.push(`/dashboard/${encodeURIComponent(address.trim())}`);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-between px-4 relative overflow-hidden bg-background">
      {/* Background Orbs */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] -z-10 mix-blend-screen animate-pulse-slow" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] -z-10 mix-blend-screen animate-float" />

      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentcolor 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      />

      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <div className="flex-1 w-full flex flex-col items-center justify-center pt-24 pb-16 z-10" style={{ perspective: "1000px" }}>
        <motion.div
          ref={heroTilt.ref}
          onMouseMove={heroTilt.handleMouseMove}
          onMouseLeave={heroTilt.handleMouseLeave}
          style={{
            rotateX: heroTilt.rotateX,
            rotateY: heroTilt.rotateY,
            transformStyle: "preserve-3d"
          }}
          className="text-center max-w-4xl mx-auto w-full relative"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-7xl md:text-9xl font-extrabold tracking-tighter mb-4 text-gradient-metallic text-3d select-none"
            style={{ transform: "translateZ(80px)" }} // Pops off the screen
          >
            NeighborIQ
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-2xl md:text-4xl font-semibold text-primary mb-6"
            style={{ transform: "translateZ(40px)" }}
          >
            The truth about your neighborhood
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-text-secondary text-lg md:text-2xl mb-14 max-w-2xl mx-auto text-balance"
            style={{ transform: "translateZ(20px)" }}
          >
            Real crime data. Live news. AI analysis.
            <br className="hidden md:block" />
            All for your Montgomery, AL address.
          </motion.p>

          {/* Address Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ transform: "translateZ(60px)" }}
          >
            <form
              onSubmit={handleSearch}
              className="w-full max-w-2xl mx-auto relative group hover-3d-lift"
            >
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none z-10">
                <Search className="w-6 h-6 text-text-secondary group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter any Montgomery, AL address..."
                className="w-full pl-16 pr-[200px] py-6 md:py-8 premium-glass rounded-2xl text-foreground placeholder-text-secondary text-lg md:text-xl focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-300 relative z-0"
                required
              />
              <button
                type="submit"
                className="absolute right-3 top-3 bottom-3 px-6 md:px-8 bg-primary hover:bg-primary-dark shadow-[0_5px_15px_rgba(34,197,94,0.3)] hover:shadow-[0_5px_20px_rgba(34,197,94,0.5)] text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center transform hover:-translate-y-1 active:translate-y-0 z-10"
              >
                See My Neighborhood
              </button>
            </form>
          </motion.div>
        </motion.div>
      </div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 py-16 border-t border-border z-10"
      >
        {[
          { label: "Crime Records Analyzed", value: "2,847" },
          { label: "Permits Tracked", value: "1,204" },
          { label: "Real-Time News Intelligence", value: "Live" },
        ].map((stat) => (
          <div key={stat.label} className="text-center flex flex-col items-center justify-center hover-3d-lift cursor-default rounded-2xl p-6 transition-colors hover:bg-card/20">
            <div className="text-4xl md:text-5xl font-bold text-primary tracking-tight" style={{ textShadow: '0 4px 12px rgba(34,197,94,0.3)' }}>{stat.value}</div>
            <div className="text-text-secondary text-sm md:text-base mt-3 font-semibold uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Features Section */}
      <div className="w-full py-24 z-10 bg-gradient-to-b from-transparent to-card/5">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4 perspective-[1000px]">
          <FeatureCard
            icon={<Map className="w-8 h-8 text-primary" />}
            title="Address Intelligence"
            description="Crime, permits, flood risk on one map"
            delay={0.1}
          />
          <FeatureCard
            icon={<ShieldAlert className="w-8 h-8 text-primary" />}
            title="Truth Layer"
            description="Official data vs what the news actually says"
            delay={0.2}
          />
          <FeatureCard
            icon={<Bot className="w-8 h-8 text-primary" />}
            title="AI Assistant"
            description="Ask anything about your neighborhood"
            delay={0.3}
          />
          <FeatureCard
            icon={<MessageSquareWarning className="w-8 h-8 text-primary" />}
            title="Report Issues"
            description="One tap to report problems to the city"
            delay={0.4}
            href="/report"
          />
          <FeatureCard
            icon={<HeartHandshake className="w-8 h-8 text-primary" />}
            title="Community Board"
            description="Neighbors helping neighbors in real-time"
            delay={0.5}
            href="/community"
            className="md:col-span-2 lg:col-span-1"
          />
        </div>
      </div>

      {/* Scale Section */}
      <div className="w-full py-32 premium-glass border-y-0 relative z-10">
        <div className="max-w-6xl mx-auto px-6 text-center perspective-[1000px]">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-6xl font-black text-foreground mb-6 tracking-tight text-3d"
          >
            Built for Montgomery.<br className="md:hidden" />
            <span className="text-gradient-metallic"> Ready for Every City.</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 mb-20 text-left">
            <FeatureCard
              icon={<span className="text-4xl">🏙️</span>}
              title="Any City&apos;s Data"
              description="NeighborIQ connects to any city&apos;s open data portal. Montgomery is just the beginning."
              delay={0.1}
              is3DTilt={true}
            />
            <FeatureCard
              icon={<span className="text-4xl">💰</span>}
              title="City License Model"
              description="License NeighborIQ to city governments for $2,000-$5,000/month. Residents get it free."
              delay={0.2}
              is3DTilt={true}
            />
            <FeatureCard
              icon={<span className="text-4xl">🌍</span>}
              title="50M+ Americans"
              description="Every American living in a city with open data could benefit from NeighborIQ today."
              delay={0.3}
              is3DTilt={true}
            />
          </div>

          <motion.a
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            href="mailto:contact@neighboriq.ai"
            className="inline-flex items-center gap-3 px-10 py-5 premium-glass hover:bg-primary/20 text-primary font-bold rounded-2xl transition-all duration-300 text-xl hover-3d-lift shadow-3d-soft"
          >
            Interested in bringing NeighborIQ to your city? <span>→</span>
          </motion.a>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-12 z-10 mt-auto premium-glass border-t-0 rounded-t-none shadow-none">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="text-foreground font-bold text-lg mb-1">NeighborIQ</div>
            <div className="text-text-secondary text-sm">Powered by City Open Data + Bright Data + Google Gemini</div>
          </div>
          <div className="px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-bold tracking-widest uppercase border border-primary/20">
            Hackathon 2026 Ready
          </div>
        </div>
      </footer>
    </main>
  );
}

import Link from "next/link";
import React from "react";

function FeatureCard({ icon, title, description, delay, href, className = "", is3DTilt = false }: { icon: React.ReactNode, title: string, description: string, delay: number, href?: string, className?: string, is3DTilt?: boolean }) {
  const tilt = use3DTilt(15);

  const content = (
    <>
      <div
        className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-primary/20 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500 shadow-inner-glow"
        style={is3DTilt ? { transform: "translateZ(40px)" } : {}}
      >
        {icon}
      </div>
      <h3
        className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2"
        style={is3DTilt ? { transform: "translateZ(30px)" } : {}}
      >
        {title}
        {href && <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-primary shrink-0 relative top-[1px]">→</span>}
      </h3>
      <p
        className="text-text-secondary text-lg leading-relaxed"
        style={is3DTilt ? { transform: "translateZ(20px)" } : {}}
      >
        {description}
      </p>
    </>
  );

  const wrapperClass = `premium-glass rounded-3xl p-10 hover:border-primary/50 transition-all duration-500 group ${href ? "cursor-pointer" : "cursor-default"} ${className}`;

  if (is3DTilt) {
    return (
      <motion.div
        ref={tilt.ref}
        onMouseMove={tilt.handleMouseMove}
        onMouseLeave={tilt.handleMouseLeave}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
        style={{
          rotateX: tilt.rotateX,
          rotateY: tilt.rotateY,
          transformStyle: "preserve-3d"
        }}
        className="h-full relative"
      >
        {/* Deep shadow that moves based on tilt could go here, for now using standard shadow */}
        {href ? (
          <Link href={href} className={wrapperClass + " block h-full hover-3d-lift shadow-3d-soft"}>
            {content}
          </Link>
        ) : (
          <div className={wrapperClass + " h-full hover-3d-lift shadow-3d-soft"}>
            {content}
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="h-full"
    >
      {href ? (
        <Link href={href} className={wrapperClass + " block h-full shadow-3d-soft"}>
          {content}
        </Link>
      ) : (
        <div className={wrapperClass + " h-full shadow-3d-soft"}>
          {content}
        </div>
      )}
    </motion.div>
  );
}
