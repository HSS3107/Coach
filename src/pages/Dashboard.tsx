import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDb } from '../contexts/DatabaseContext';
import { getActiveGoal, getRecentLogs } from '../services/db';
import type { Goal, MasterLog } from '../types/schema';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import { MessageSquare } from 'lucide-react';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const { db } = useDb();
    const [goal, setGoal] = useState<Goal | null>(null);
    const [logs, setLogs] = useState<MasterLog[]>([]);
    const [weightData, setWeightData] = useState<any[]>([]);

    useEffect(() => {
        const loadData = async () => {
            if (!user || !db) return;

            const activeGoal = await getActiveGoal(db, user.id);
            setGoal(activeGoal);

            const recentLogs = await getRecentLogs(db, user.id, 20);
            setLogs(recentLogs);

            // Process weight logs for chart
            const wLogs = recentLogs
                .filter(l => l.log_type === 'WEIGHT')
                .map(l => ({
                    date: format(new Date(l.log_timestamp), 'MMM d'),
                    weight: l.structured_data.weight_kg,
                    timestamp: new Date(l.log_timestamp).getTime()
                }))
                .sort((a, b) => a.timestamp - b.timestamp);

            setWeightData(wLogs);
        };

        loadData();
    }, [user, db]);

    if (!user || !goal) return <div>Loading Dashboard...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold">Hello, {user.name}</h1>
                    <p className="text-text-secondary">Let's hit your target of {goal.target_weight_kg}kg</p>
                </div>
                <div className="bg-bg-tertiary px-3 py-1 rounded-full text-xs font-medium text-accent-primary">
                    {goal.status}
                </div>
            </div>

            {/* Progress Chart */}
            <div className="card h-64 w-full">
                <h3 className="text-lg font-semibold mb-4">Weight Trend</h3>
                {weightData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weightData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis
                                dataKey="date"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={12}
                                domain={['dataMin - 1', 'dataMax + 1']}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                itemStyle={{ color: '#f8fafc' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="weight"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={{ fill: '#3b82f6', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-text-tertiary">
                        No weight logs yet. Start logging!
                    </div>
                )}
            </div>

            {/* Recent Activity */}
            <div>
                <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
                <div className="space-y-3">
                    {logs.map((log) => (
                        <div key={log.id} className="card flex justify-between items-center py-3">
                            <div>
                                <div className="font-medium text-text-primary">
                                    {log.log_type === 'WEIGHT' ? `${log.structured_data.weight_kg} kg` :
                                        log.log_type === 'FOOD' ? 'Meal Logged' : log.log_type}
                                </div>
                                <div className="text-xs text-text-tertiary">
                                    {format(new Date(log.log_timestamp), 'PP p')}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className={
                                    `text-xs px-2 py-1 rounded-md 
                    ${log.ai_status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' :
                                        log.ai_status === 'COMPLETED' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`
                                }>
                                    {log.ai_status}
                                </div>
                                <MessageSquare className="w-5 h-5 text-text-tertiary" />
                            </div>
                        </div>
                    ))}
                    {logs.length === 0 && (
                        <div className="text-center text-text-tertiary py-8">
                            No logs found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
