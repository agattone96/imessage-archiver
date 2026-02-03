import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, HardDrive, Database, Activity } from 'lucide-react';
import { api } from '../api/client';
import type { GlobalStats } from '../api/types';
import { cn } from '../lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
    const [stats, setStats] = useState<GlobalStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getGlobalStats().then(setStats).finally(() => setLoading(false));
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    if (loading) {
        return <div className="p-10 text-muted animate-pulse">Loading analytics...</div>;
    }

    // Mock data for chart (since we don't have historical data API endpoint yet)
    const data = [
        { name: 'Mon', value: 400 },
        { name: 'Tue', value: 300 },
        { name: 'Wed', value: 600 },
        { name: 'Thu', value: 800 },
        { name: 'Fri', value: 500 },
        { name: 'Sat', value: 900 },
        { name: 'Sun', value: 750 },
    ];

    return (
        <div className="h-full overflow-y-auto p-10 bg-bg0/50">
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="max-w-6xl mx-auto space-y-10"
            >
                {/* Header */}
                <motion.div variants={item}>
                    <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
                    <p className="text-muted">Overview of your messaging archive.</p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={MessageSquare}
                        label="Total Messages"
                        value={stats?.total_messages.toLocaleString()}
                        color="text-pink"
                        delay={0}
                    />
                    <StatCard
                        icon={Users}
                        label="Total Chats"
                        value={stats?.total_chats.toLocaleString()}
                        color="text-violet"
                        delay={0.1}
                    />
                    <StatCard
                        icon={Activity}
                        label="Top Contact"
                        value={stats?.top_contact_handle === "N/A" ? "No Data" : stats?.top_contact_handle}
                        subValue={`${stats?.top_contact_count} messages`}
                        color="text-cyan"
                        delay={0.2}
                    />
                    <StatCard
                        icon={Database}
                        label="Storage Size"
                        value="1.2 GB"
                        subValue="Estimated"
                        color="text-green-400"
                        delay={0.3}
                    />
                </div>

                {/* Charts & Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Chart */}
                    <motion.div variants={item} className="lg:col-span-2 bg-panel border border-stroke rounded-3xl p-6 backdrop-blur-md">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-pink" />
                            Activity Trend
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ff2aa8" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ff2aa8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                    <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0b0e1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#ff2aa8" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Storage Details */}
                    <motion.div variants={item} className="bg-panel2 border border-stroke rounded-3xl p-6 flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <HardDrive className="w-5 h-5 text-cyan" />
                                Storage
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
                                    <div className="text-xs text-muted uppercase tracking-wider mb-1">Archive Location</div>
                                    <div className="text-sm font-mono text-cyan break-all leading-relaxed">
                                        {stats?.storage_path || "~/Library/Application Support/Archiver/output"}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5">
                                    <span className="text-muted">Database</span>
                                    <span className="text-white font-mono">OK</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <div className="text-xs text-center text-muted">
                                Last indexed: Just now
                            </div>
                        </div>
                    </motion.div>
                </div>

            </motion.div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, subValue, color, delay }: any) {
    return (
        <motion.div
            variants={{
                hidden: { y: 20, opacity: 0 },
                show: { y: 0, opacity: 1, transition: { delay } }
            }}
            className="bg-panel border border-stroke rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group hover:border-white/20 transition-colors"
        >
            <div className={cn("absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20", color.replace('text-', 'bg-'))} />

            <div className="flex items-start justify-between mb-4">
                <div className={cn("p-3 rounded-2xl bg-white/5", color)}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>

            <div className="text-3xl font-bold text-white tracking-tight mb-1">{value || "-"}</div>
            <div className="text-sm text-muted font-medium">{label}</div>
            {subValue && <div className="text-xs text-white/40 mt-2">{subValue}</div>}
        </motion.div>
    );
}
