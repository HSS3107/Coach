import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDb } from '../contexts/DatabaseContext';
import { getRecentLogs } from '../services/db';
import type { MasterLog } from '../types/schema';
import { format } from 'date-fns';
import { Calendar, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AllLogs: React.FC = () => {
    const { user } = useAuth();
    const { db } = useDb();
    const navigate = useNavigate();
    const [logs, setLogs] = useState<MasterLog[]>([]);

    useEffect(() => {
        const loadData = async () => {
            if (!user || !db) return;
            const recentLogs = await getRecentLogs(db, user.id, 100);
            setLogs(recentLogs);
        };
        loadData();
    }, [user, db]);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">All Logs</h1>
            <div className="space-y-4">
                {logs.map((log) => (
                    <div
                        key={log.id}
                        className="card hover:bg-bg-tertiary transition-colors cursor-pointer group"
                        onClick={() => navigate(`/log/${log.id}/chat`)}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex gap-4">
                                <div className="mt-1 bg-bg-primary p-2 rounded-lg text-accent-primary">
                                    {log.log_type === 'WEIGHT' ? <span className="font-bold">Kg</span> : <Calendar className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-text-primary">
                                        {log.log_type === 'WEIGHT' ? `${log.structured_data.weight_kg} kg` :
                                            log.log_type === 'FOOD' ? 'Food Log' :
                                                log.log_type.replace('_', ' ')}
                                    </h3>
                                    <p className="text-text-secondary text-sm line-clamp-2">
                                        {log.raw_text || log.structured_data.description || 'No description'}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-text-tertiary">
                                        <span>{format(new Date(log.log_timestamp), 'PP p')}</span>
                                        <span>•</span>
                                        <span className={
                                            log.ai_status === 'COMPLETED' ? 'text-status-success' : 'text-status-warning'
                                        }>{log.ai_status}</span>
                                    </div>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-text-tertiary group-hover:text-text-primary transition-colors" />
                        </div>
                    </div>
                ))}
                {logs.length === 0 && (
                    <div className="text-center text-text-tertiary py-12">
                        No logs found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllLogs;
