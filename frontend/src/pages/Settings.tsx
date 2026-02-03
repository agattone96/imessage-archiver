export function Settings() {
    return (
        <div className="h-full overflow-y-auto p-10 bg-bg0/50">
            <div className="max-w-2xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold text-white mb-8">Settings</h1>

                <div className="bg-panel border border-stroke rounded-3xl p-6 backdrop-blur-md space-y-6">
                    <h2 className="text-xl font-bold text-white">General</h2>

                    <div className="flex items-center justify-between py-4 border-b border-white/5">
                        <div>
                            <div className="font-medium text-white">Theme</div>
                            <div className="text-sm text-muted">Customize the look and feel</div>
                        </div>
                        <div className="px-3 py-1 bg-white/10 rounded-lg text-sm">System</div>
                    </div>

                    <div className="flex items-center justify-between py-4 border-b border-white/5">
                        <div>
                            <div className="font-medium text-white">Export Path</div>
                            <div className="text-sm text-muted">Where your archives are saved</div>
                        </div>
                        <button className="text-pink hover:text-pink2 text-sm font-medium">Change</button>
                    </div>

                    <div className="pt-4">
                        <button className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 font-medium transition-colors">
                            Reset Onboarding (Debug)
                        </button>
                    </div>
                </div>

                <div className="text-center text-xs text-muted">
                    Archiver v1.0.0 • Antigravity
                </div>
            </div>
        </div>
    );
}
