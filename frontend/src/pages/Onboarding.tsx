import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, HardDrive, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../api/client';

export function Onboarding({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const steps = [
        { num: 1, label: 'Initialize', desc: 'Local-only Vault' },
        { num: 2, label: 'Permission', desc: 'Full Disk Access' },
        { num: 3, label: 'Context', desc: 'Setting directory' },
        { num: 4, label: 'Browse', desc: 'Ready to explore' },
    ];

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const verifyAccess = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.checkAccess();
            if (res.success) {
                handleNext();
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError("Failed to connect to backend service.");
        } finally {
            setLoading(false);
        }
    };

    const finishOnboarding = async () => {
        await api.completeOnboarding();
        onComplete();
    };

    return (
        <div className="flex h-screen w-full bg-bg0 text-text overflow-hidden relative">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,42,168,0.08),transparent_70%)] pointer-events-none" />

            {/* Grid Layout - simplified to 2 columns for better spacing */}
            <div className="w-full h-full flex items-center justify-center px-16 py-12">
                <div className="w-full max-w-[1400px] grid grid-cols-[240px_1fr] gap-16 items-center relative z-10">

                    {/* LEFT: Timeline Rail */}
                    <div className="h-full flex flex-col justify-center border-r border-stroke/30 pr-8">
                        <div className="space-y-12 relative">
                            <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-pink/50 to-transparent" />

                            {steps.map((s) => {
                                const isActive = step === s.num;
                                const isDone = step > s.num;

                                return (
                                    <div key={s.num} className={cn("relative flex items-center gap-6 transition-opacity duration-300", isActive ? "opacity-100" : "opacity-40")}>
                                        <div className={cn(
                                            "w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300 bg-bg0",
                                            isActive ? "border-pink shadow-[0_0_15px_rgba(255,42,168,0.5)] scale-110" :
                                                isDone ? "border-cyan bg-cyan/10" : "border-stroke"
                                        )}>
                                            {isDone ? <CheckCircle2 className="w-5 h-5 text-cyan" /> : <div className={cn("w-2.5 h-2.5 rounded-full", isActive ? "bg-pink" : "bg-stroke")} />}
                                        </div>
                                        <div>
                                            <div className={cn("font-bold text-lg", isActive ? "text-white" : "text-muted")}>{s.label}</div>
                                            <div className="text-sm text-muted/60 font-medium">{s.desc}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* CENTER: Action Card */}
                    <div className="flex flex-col justify-center min-h-[500px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-8"
                            >
                                {step === 1 && (
                                    <>
                                        <h1 className="text-[3.5rem] font-extrabold tracking-tight text-white leading-[1.1] mb-6">
                                            Initialize your <br />
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink to-violet">iMessage Archive</span>
                                        </h1>
                                        <p className="text-lg text-muted/90 leading-relaxed mb-8">
                                            Export, index, and browse locally. No cloud. No tracking. <br />
                                            <span className="text-muted/70 text-base">Your data stays on your device.</span>
                                        </p>

                                        <div className="bg-panel/80 border border-stroke/50 rounded-3xl p-7 backdrop-blur-md space-y-5 mb-8">
                                            <div className="flex items-start gap-4 group">
                                                <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center shrink-0">
                                                    <ShieldCheck className="w-5 h-5 text-green-400" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-white text-base">Local-only processing</div>
                                                    <div className="text-sm text-muted/80 leading-relaxed">Messages never leave this machine.</div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4 group">
                                                <div className="w-10 h-10 rounded-xl bg-cyan/10 flex items-center justify-center shrink-0">
                                                    <HardDrive className="w-5 h-5 text-cyan" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-white text-base">Stored on this Mac</div>
                                                    <div className="text-sm text-muted/80 leading-relaxed">Saved to your secure ~/Analyzed folder.</div>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleNext}
                                            className="group relative bg-gradient-to-r from-pink to-violet text-white px-10 py-5 rounded-full font-bold text-lg flex items-center gap-3 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,42,168,0.5)] transition-all duration-300 shadow-[0_0_30px_rgba(255,42,168,0.3)] border border-pink/20"
                                        >
                                            <span className="relative z-10">Initialize Archive</span>
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                                            <div className="absolute inset-0 bg-gradient-to-r from-pink/80 to-violet/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </button>
                                    </>
                                )}

                                {step === 2 && (
                                    <>
                                        <div className="w-16 h-16 bg-pink/20 rounded-2xl flex items-center justify-center mb-4">
                                            <Lock className="w-8 h-8 text-pink" />
                                        </div>
                                        <h2 className="text-4xl font-bold text-white">Full Disk Access</h2>
                                        <p className="text-lg text-muted">
                                            To read your messages database, macOS require you to grant Full Disk Access to your terminal or IDE.
                                        </p>

                                        <div className="bg-bg1 border border-stroke2 rounded-2xl p-6 text-sm text-muted space-y-3 font-mono">
                                            <div>1. Open <span className="text-white">System Settings</span></div>
                                            <div>2. Go to <span className="text-white">Privacy & Security {'>'} Full Disk Access</span></div>
                                            <div>3. Enable access for your <span className="text-white">Terminal / VS Code</span></div>
                                        </div>

                                        {error && (
                                            <div className="flex items-center gap-3 text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-400/20">
                                                <AlertCircle className="w-5 h-5" />
                                                {error}
                                            </div>
                                        )}

                                        <div className="flex gap-4 pt-4">
                                            <button onClick={handleBack} className="text-muted hover:text-white px-6 py-3 font-medium transition-colors">Back</button>
                                            <button
                                                onClick={verifyAccess}
                                                disabled={loading}
                                                className="bg-pink text-white px-8 py-3 rounded-full font-bold hover:bg-pink2 transition-colors flex items-center gap-2"
                                            >
                                                {loading ? "Verifying..." : "Verify Access"}
                                                {!loading && <ArrowRight className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </>
                                )}

                                {step === 3 && (
                                    <>
                                        <h2 className="text-4xl font-bold text-white">Ready to Index</h2>
                                        <p className="text-lg text-muted">
                                            Your archive will be initialized in the default location.
                                        </p>

                                        <div className="p-6 rounded-2xl bg-cyan/5 border border-cyan/20 text-cyan font-mono text-sm break-all">
                                            ~/Library/Application Support/Archiver/output
                                        </div>

                                        <div className="flex gap-4 pt-8">
                                            <button onClick={handleBack} className="text-muted hover:text-white px-6 py-3 font-medium transition-colors">Back</button>
                                            <button
                                                onClick={finishOnboarding}
                                                className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
                                            >
                                                Enter Vault
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </div>
    );
}
