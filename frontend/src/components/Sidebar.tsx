import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, PieChart, Settings, HardDrive } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export function Sidebar() {
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
        { icon: MessageSquare, label: 'Messages', to: '/messages' },
        { icon: PieChart, label: 'Analytics', to: '/analytics' },
        { icon: HardDrive, label: 'Media', to: '/media' },
    ];

    return (
        <aside className="h-screen w-[260px] flex flex-col pt-10 pb-6 px-4 bg-bg0/80 backdrop-blur-xl border-r border-stroke select-none shrink-0"
            style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>

            {/* Header */}
            <div className="flex items-center gap-3 px-2 mb-10">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink to-violet shadow-[0_0_15px_rgba(255,42,168,0.4)] flex items-center justify-center text-white font-bold text-lg">
                    A
                </div>
                <div>
                    <h1 className="font-bold text-lg tracking-tight text-white leading-tight">Archiver</h1>
                    <p className="text-[10px] font-medium text-muted tracking-wider uppercase">Vault v1.0</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                            isActive
                                ? "text-white bg-white/5 shadow-inner"
                                : "text-muted hover:text-white hover:bg-white/5"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute inset-0 bg-white/5 rounded-xl border border-white/5"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <item.icon className={cn("w-5 h-5 relative z-10", isActive ? "text-pink drop-shadow-[0_0_8px_rgba(255,42,168,0.5)]" : "group-hover:text-white")} />
                                <span className="font-medium text-sm relative z-10">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer / Settings */}
            <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
                <NavLink
                    to="/settings"
                    className={({ isActive }) => cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-muted hover:text-white hover:bg-white/5",
                        isActive && "text-white bg-white/5"
                    )}
                >
                    <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                    <span className="font-medium text-sm">Settings</span>
                </NavLink>
            </div>
        </aside>
    );
}
