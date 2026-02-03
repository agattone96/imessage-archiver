
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    MapPin,
    Lock,
    Search,
    ChevronRight,
    Sparkles,
    Folder,
    MessageSquare,
    FileText,
} from 'lucide-react';
import { cn } from '../lib/utils'; // Assuming this exists based on Sidebar.tsx

// --- Types ---
type Step = 'welcome' | 'location' | 'permissions' | 'create-vault' | 'indexing';

interface OnboardingProps {
    onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
    const [currentStep, setCurrentStep] = useState<Step>('welcome');

    // Simulate initial loading for Welcome screen
    const [initProgress, setInitProgress] = useState(0);

    // Simulate indexing progress
    const [indexProgress, setIndexProgress] = useState(0);

    const steps = [
        { id: 'welcome', label: 'Welcome', icon: Sparkles },
        { id: 'location', label: 'Location', icon: MapPin },
        { id: 'permissions', label: 'Permissions', icon: Lock },
        { id: 'create-vault', label: 'Create Vault', icon: CheckCircle2 },
        { id: 'indexing', label: 'Indexing', icon: Search },
    ];

    // --- Effects ---

    // Welcome Screen Progress Simulation
    useEffect(() => {
        if (currentStep === 'welcome') {
            const interval = setInterval(() => {
                setInitProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setTimeout(() => setCurrentStep('location'), 500); // Auto advance
                        return 100;
                    }
                    return prev + 1;
                });
            }, 30);
            return () => clearInterval(interval);
        }
    }, [currentStep]);

    // Indexing Progress Simulation (Only runs when ensuring 'indexing' step)
    useEffect(() => {
        if (currentStep === 'indexing') {
            const interval = setInterval(() => {
                setIndexProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setTimeout(onComplete, 1000); // Complete onboarding
                        return 100;
                    }
                    return prev + 0.5; // Slow progress
                });
            }, 50);
            return () => clearInterval(interval);
        }
    }, [currentStep, onComplete]);


    // --- Render Helpers ---

    const getStepIndex = (step: Step) => steps.findIndex(s => s.id === step);

    return (
        <div className="flex w-full h-screen bg-[#05060b] text-white overflow-hidden font-sans selection:bg-pink/30 relative">

            {/* --- Galaxy Background Effect --- */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink/20 rounded-full blur-[120px] opacity-20" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet/20 rounded-full blur-[120px] opacity-20" />
                <div className="absolute top-[20%] right-[30%] w-[20%] h-[20%] bg-cyan/10 rounded-full blur-[80px] opacity-20" />

                {/* Stars / Dust overlay (using CSS for simplicity) */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
            </div>

            {/* --- Left Sidebar --- */}
            <aside className="w-[280px] h-full border-r border-white/10 bg-black/20 backdrop-blur-xl flex flex-col pt-12 pb-6 relative z-10">
                <nav className="flex-1 px-4 space-y-2">
                    {steps.map((step, idx) => {
                        const isActive = currentStep === step.id;
                        const isPast = getStepIndex(currentStep) > idx;
                        const Icon = step.icon;

                        return (
                            <div
                                key={step.id}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 relative",
                                    isActive ? "bg-white/5 text-white shadow-[0_0_15px_rgba(255,42,168,0.15)]" : "text-gray-500",
                                    isPast && "text-gray-400"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-pink to-violet shadow-[0_0_10px_#FF2AA8]"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    />
                                )}

                                <div className={cn(
                                    "relative w-5 h-5 flex items-center justify-center",
                                    isActive ? "text-pink" : isPast ? "text-violet" : "text-gray-600"
                                )}>
                                    {isPast && step.id !== 'welcome' ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                                    ) : (
                                        <Icon className="w-5 h-5" />
                                    )}
                                </div>

                                <span className={cn(
                                    "font-medium tracking-wide text-sm",
                                    isActive ? "text-white" : "text-gray-400"
                                )}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </nav>
            </aside>

            {/* --- Main Content Area --- */}
            <main className="flex-1 flex flex-col relative z-20">
                <div className="flex-1 flex items-center justify-center p-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            transition={{ duration: 0.3 }}
                            className="w-full max-w-2xl"
                        >
                            {/* WELCOME STEP */}
                            {currentStep === 'welcome' && (
                                <div className="flex flex-col items-center justify-center text-center space-y-12">
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-pink/20 to-violet/20 flex items-center justify-center mb-4 relative">
                                        <div className="absolute inset-0 rounded-full border border-pink/30 animate-[spin_10s_linear_infinite]" />
                                        <div className="w-20 h-20 bg-gradient-to-br from-pink via-purple-500 to-violet-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,42,168,0.5)]">
                                            <MessageSquare className="w-10 h-10 text-white fill-white/20" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                                            ARCHIVER
                                        </h1>
                                        <p className="text-xl text-gray-400 font-light tracking-wide">
                                            Initializing Secure Environment
                                        </p>
                                    </div>

                                    <div className="w-full max-w-md space-y-3">
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-pink to-cyan"
                                                style={{ width: `${initProgress}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-center text-cyan uppercase tracking-widest font-semibold">
                                            Initializing Database...
                                        </p>
                                    </div>

                                    <div className="mt-12 opacity-60">
                                        <Lock className="w-12 h-12 text-cyan mx-auto mb-4 opacity-80" />
                                    </div>
                                </div>
                            )}

                            {/* LOCATION STEP */}
                            {currentStep === 'location' && (
                                <div className="space-y-8">
                                    <h1 className="text-4xl font-bold text-white">
                                        Create your vault
                                    </h1>
                                    <p className="text-gray-400 text-lg">
                                        Local-first archive. Stored on this Mac.
                                    </p>

                                    <div className="space-y-2 pt-8">
                                        <label className="text-sm font-medium text-gray-300 ml-1">Save to</label>
                                        <div className="flex gap-3">
                                            <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 flex items-center gap-3 text-sm text-gray-300">
                                                <Folder className="w-4 h-4 text-gray-500" />
                                                ~/Downloads/Archiver
                                            </div>
                                            <button className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors border border-white/5">
                                                Change...
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 ml-1 pt-1">
                                            We'll create a folder and store your database and exports inside it.
                                            <br />
                                            Estimated size: ~1.2 GB
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 pt-8">
                                        <button
                                            onClick={() => setCurrentStep('permissions')}
                                            className="px-8 py-3 rounded-lg bg-gradient-to-r from-pink to-violet hover:brightness-110 text-white font-semibold transition-all shadow-[0_0_20px_rgba(255,42,168,0.3)]"
                                        >
                                            Create Vault
                                        </button>
                                        <button className="px-6 py-3 rounded-lg hover:bg-white/5 text-gray-400 font-medium transition-colors">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* PERMISSIONS STEP */}
                            {currentStep === 'permissions' && (
                                <div className="space-y-8">
                                    <h1 className="text-4xl font-bold text-white">Full Disk Access</h1>
                                    <p className="text-gray-400 text-lg max-w-lg">
                                        To read your messaging database, macOS requires you to grant Full Disk Access to your Terminal / IDE.
                                    </p>

                                    <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                                            <Lock className="w-24 h-24 text-pink" />
                                        </div>
                                        <div className="relative z-10 space-y-4">
                                            <h3 className="text-xl font-bold text-white">Full Disk Access is needed</h3>
                                            <p className="text-sm text-gray-300 max-w-xs">
                                                To load data from Apple Messages and other protected locations on your Mac.
                                            </p>
                                            <hr className="border-white/10 my-4" />
                                            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
                                                <li>Open System Settings</li>
                                                <li>Enable access for Terminal / VS Code</li>
                                            </ol>

                                            <div className="pt-4 flex gap-3">
                                                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-sm font-medium transition-colors">
                                                    Open System Settings
                                                </button>
                                                <button className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-md text-sm font-medium transition-colors text-gray-400">
                                                    Re-check Access
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-8">
                                        <button
                                            onClick={() => setCurrentStep('location')}
                                            className="text-gray-500 hover:text-white transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={() => setCurrentStep('create-vault')}
                                            className="px-8 py-3 rounded-lg bg-gradient-to-r from-pink to-violet hover:brightness-110 text-white font-semibold transition-all shadow-[0_0_20px_rgba(255,42,168,0.3)]"
                                        >
                                            Verify Access
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* READY/CREATE VAULT STEP (Step 4) */}
                            {currentStep === 'create-vault' && (
                                <div className="space-y-8">
                                    <h1 className="text-4xl font-bold text-white">
                                        Ready to Index
                                    </h1>
                                    <p className="text-gray-400 text-lg">
                                        Your archive will be initialized in the default location.
                                    </p>

                                    <div className="space-y-4 pt-4">
                                        <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-4 flex items-center gap-3 text-sm text-gray-300 font-mono">
                                            <Folder className="w-4 h-4 text-gray-500" />
                                            ~/Library/Application Support/Archiver/output
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-12">
                                        <button
                                            onClick={() => setCurrentStep('permissions')}
                                            className="px-6 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 font-medium transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={() => setCurrentStep('indexing')}
                                            className="group px-8 py-3 rounded-lg bg-gradient-to-r from-pink to-violet hover:brightness-110 text-white font-semibold transition-all shadow-[0_0_30px_rgba(255,42,168,0.4)] flex items-center gap-2"
                                        >
                                            Enter Vault
                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* INDEXING STEP */}
                            {currentStep === 'indexing' && (
                                <div className="space-y-10">
                                    <div className="space-y-2">
                                        <h1 className="text-4xl font-bold text-white animate-pulse">
                                            Indexing messages...
                                        </h1>
                                        <p className="text-gray-400">
                                            Reading database and processing attachments
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <span className="text-5xl font-light text-white">{Math.floor(indexProgress)}%</span>
                                            <span className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Estimated time: 2 minutes</span>
                                        </div>

                                        {/* Glowing Progress Bar */}
                                        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden relative">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-pink via-violet to-cyan relative"
                                                style={{ width: `${indexProgress}%` }}
                                            >
                                                <div className="absolute right-0 top-0 bottom-0 w-[50px] bg-gradient-to-r from-transparent to-white/50 blur-sm" />
                                            </motion.div>
                                            <div className="absolute inset-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-full" />
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-600 font-medium">
                                            <span>Start: 12:40 PM</span>
                                            <span>~56,000 messages</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 pt-8">
                                        <div className="flex items-center gap-3 text-sm text-gray-300">
                                            <CheckCircle2 className="w-5 h-5 text-violet" />
                                            Reading local database
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-white font-medium">
                                            <div className="w-5 h-5 flex items-center justify-center relative">
                                                <div className="absolute inset-0 border-2 border-cyan/30 rounded-full" />
                                                <div className="absolute inset-0 border-2 border-cyan rounded-full border-t-transparent animate-spin" />
                                            </div>
                                            Indexing messages
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                            <div className="w-5 h-5 rounded-full border border-gray-700" />
                                            Processing attachments
                                        </div>
                                    </div>

                                    <div className="pt-8 flex justify-end">
                                        <button className="px-6 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 text-sm font-medium transition-colors flex items-center gap-2">
                                            Cancel Indexing
                                            <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* --- Right Panel (Info/Preview) --- */}
            {currentStep !== 'welcome' && (
                <aside className="w-[320px] h-full border-l border-white/5 bg-black/20 backdrop-blur-md p-8 pt-12 hidden lg:flex flex-col gap-8 relative z-10">

                    {/* Feature List */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-200">What you'll be able to do</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-pink/10 text-pink">
                                    <MessageSquare className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-300">Browse conversations</h4>
                                    <p className="text-xs text-gray-500 mt-1">Search and filter your entire history</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-violet/10 text-violet">
                                    <Search className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-300">Search everything</h4>
                                    <p className="text-xs text-gray-500 mt-1">Find any text in seconds</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-cyan/10 text-cyan">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-300">Export Options</h4>
                                    <p className="text-xs text-gray-500 mt-1">HTML, PDF, and JSON exports</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview Panel */}
                    <div className="mt-auto border border-white/10 bg-white/[0.02] rounded-xl p-6 space-y-4">
                        <h3 className="text-sm font-semibold text-gray-300">Preview</h3>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <p className="text-xs text-gray-500">Status</p>
                                <p className="text-sm text-gray-300">
                                    {currentStep === 'indexing' ? 'Indexing...' : 'No vault created yet'}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500">Messages</p>
                                    <p className="text-sm text-gray-300">—</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500">Attachments</p>
                                    <p className="text-sm text-gray-300">—</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            )}
        </div>
    );
}
