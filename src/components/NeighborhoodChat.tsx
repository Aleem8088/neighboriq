"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { chatNeighborIQ } from "../app/actions/gemini";

type Message = {
    role: "user" | "model";
    text: string;
};

export default function NeighborhoodChat() {
    const [messages, setMessages] = useState<Message[]>([
        { role: "model", text: "Hi! I'm NeighborIQ. Ask me anything about this neighborhood's safety, development, or activity." }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");

        // Add user message to UI immediately
        const newMessages: Message[] = [...messages, { role: "user", text: userMsg }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            // Format history for Gemini SDK
            // We slice(1) to remove the initial greeting because Gemini strictly requires history to start with a "user" message
            const formattedHistory = messages
                .slice(1)
                .filter(m => m.role === "user" || m.role === "model")
                .map(m => ({
                    role: m.role,
                    parts: [{ text: m.text }]
                }));

            // Context stats to pass to agent
            const contextStats = "82/100 composite safety score with 23 recent incidents";

            const res = await chatNeighborIQ(userMsg, formattedHistory, contextStats);

            if (res.success && res.text) {
                setMessages([...newMessages, { role: "model", text: res.text }]);
            } else {
                setMessages([...newMessages, { role: "model", text: res.text || "Something went wrong." }]);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages([...newMessages, { role: "model", text: "Sorry, I'm having trouble connecting to the network." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full premium-glass rounded-3xl overflow-hidden flex flex-col h-[500px] shadow-3d-soft hover:shadow-3d-heavy transition-all duration-500">
            {/* Header */}
            <div className="bg-black/10 shadow-inner border-b border-white/5 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-green flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                    <Sparkles className="w-5 h-5 text-black" />
                </div>
                <div>
                    <h3 className="text-foreground font-bold leading-tight">NeighborIQ Assistant</h3>
                    <p className="text-xs text-primary font-medium flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        Online
                    </p>
                </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3 text-sm md:text-base leading-relaxed shadow-sm ${msg.role === "user"
                            ? "bg-black/20 text-foreground rounded-br-none border border-white/10 shadow-inner"
                            : "bg-primary/10 text-foreground rounded-bl-none border border-primary/20 shadow-inner-glow"
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-bl-none px-5 py-3.5 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-primary animate-spin" />
                            <span className="text-primary text-sm font-medium">Analyzing...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 bg-black/10 shadow-inner border-t border-white/5">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything about this neighborhood..."
                        disabled={isLoading}
                        className="w-full bg-black/20 border border-white/10 focus:border-primary/50 text-foreground rounded-2xl py-3.5 pl-5 pr-14 outline-none transition-colors placeholder:text-text-secondary shadow-inner disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 w-10 h-10 bg-primary hover:bg-primary-dark text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:hover:bg-primary shadow-3d-pressed hover-3d-lift"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
}
