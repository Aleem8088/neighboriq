"use client";

export default function ChatBot() {
    return (
        <div className="w-full">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                AI Neighborhood Assistant
            </h3>

            {/* Chat Messages */}
            <div className="bg-background border border-border rounded-xl p-4 h-64 overflow-y-auto mb-4">
                <div className="text-text-secondary text-sm">
                    <p className="mb-2">
                        👋 Hi! I&apos;m your neighborhood AI assistant. Ask me anything about
                        this area — crime trends, safety tips, city services, and more.
                    </p>
                </div>
            </div>

            {/* Input */}
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Ask about this neighborhood..."
                    className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                />
                <button className="px-6 py-3 gradient-green text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">
                    Send
                </button>
            </div>
        </div>
    );
}
