export default function ReportCard() {
    return (
        <div className="w-full">
            <h3 className="text-lg font-semibold mb-4">Neighborhood Report Card</h3>

            {/* AI Summary */}
            <div className="bg-background border border-border rounded-xl p-4 mb-6">
                <p className="text-text-secondary text-sm italic">
                    AI-generated neighborhood summary will appear here once data is loaded.
                </p>
            </div>

            {/* Metrics */}
            <div className="space-y-4">
                <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-text-secondary">Crime Trend</span>
                        <span className="text-text-secondary">—</span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                        <div className="h-full w-0 gradient-green rounded-full transition-all duration-500" />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-text-secondary">Development Activity</span>
                        <span className="text-text-secondary">—</span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                        <div className="h-full w-0 gradient-green rounded-full transition-all duration-500" />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-text-secondary">City Investment</span>
                        <span className="text-text-secondary">—</span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                        <div className="h-full w-0 gradient-green rounded-full transition-all duration-500" />
                    </div>
                </div>
            </div>

            {/* What's Improving / Needs Attention */}
            <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                    <h4 className="text-sm font-medium text-primary mb-2">
                        ✅ What&apos;s Improving
                    </h4>
                    <ul className="text-text-secondary text-xs space-y-1">
                        <li>Loading...</li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-sm font-medium text-orange-400 mb-2">
                        ⚠️ Needs Attention
                    </h4>
                    <ul className="text-text-secondary text-xs space-y-1">
                        <li>Loading...</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
