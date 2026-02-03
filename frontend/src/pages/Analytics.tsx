import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

export function Analytics() {
    const data = [
        { name: 'Mon', msgs: 400 },
        { name: 'Tue', msgs: 300 },
        { name: 'Wed', msgs: 600 },
        { name: 'Thu', msgs: 800 },
        { name: 'Fri', msgs: 500 },
        { name: 'Sat', msgs: 900 },
        { name: 'Sun', msgs: 750 },
    ];

    const pieData = [
        { name: 'iMessage', value: 70 },
        { name: 'SMS', value: 30 },
    ];

    const COLORS = ['#ff2aa8', '#7b5cff'];

    return (
        <div className="h-full overflow-y-auto p-10 bg-bg0/50">
            <div className="max-w-6xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold text-white mb-8">Analytics</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Activity Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-panel border border-stroke rounded-3xl p-6 backdrop-blur-md h-[400px]"
                    >
                        <h3 className="text-lg font-bold text-white mb-6">Weekly Activity</h3>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#0b0e1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                                />
                                <Bar dataKey="msgs" fill="#ff2aa8" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Service Distribution */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-panel border border-stroke rounded-3xl p-6 backdrop-blur-md h-[400px]"
                    >
                        <h3 className="text-lg font-bold text-white mb-6">Service Distribution</h3>
                        <ResponsiveContainer width="100%" height="90%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0b0e1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-6 text-sm">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-pink" />iMessage</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-violet" />SMS</div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
