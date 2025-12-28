import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getActiveGoal, updateGoal } from '../services/db'; // Added updateGoal
import type { Goal } from '../types/schema';
import { Target, CheckCircle, Clock, Edit2, X, Save } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';

const Goals: React.FC = () => {
    const { user } = useAuth();
    const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
    const [history, setHistory] = useState<Goal[]>([]);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Goal>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadGoals = async () => {
            if (!user) return;
            const current = await getActiveGoal(null, user.id);
            setActiveGoal(current);
            if (current) {
                setEditForm({
                    target_weight_kg: current.target_weight_kg,
                    description: current.description,
                    target_date: current.target_date
                });
            }

            const { data } = await supabase
                .from('goals')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data) {
                setHistory(data.filter(g => g.id !== current?.id));
            }
        };
        loadGoals();
    }, [user]);

    const handleComplete = async () => {
        if (!activeGoal) return;
        if (confirm('Mark this goal as completed?')) {
            await supabase.from('goals').update({ status: 'COMPLETED', updated_at: new Date().toISOString() }).eq('id', activeGoal.id);
            window.location.reload();
        }
    };

    const handleSaveEdit = async () => {
        if (!user || !activeGoal) return;
        setLoading(true);
        try {
            const updated = await updateGoal(null, user.id, activeGoal.id, editForm);
            setActiveGoal(updated);
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to update goal", err);
            alert("Failed to update goal. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <h1 className="text-2xl font-bold">Goals</h1>

            {/* Active Goal */}
            <div className="card border-l-4 border-accent-primary">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Target className="text-accent-primary" />
                        Current Goal
                    </h2>
                    <div className="flex items-center gap-2">
                        {activeGoal && !isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-2 text-text-tertiary hover:text-accent-primary transition-colors"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        )}
                        <span className="bg-accent-primary/20 text-accent-primary text-xs px-2 py-1 rounded-full font-bold">
                            ACTIVE
                        </span>
                    </div>
                </div>

                {activeGoal ? (
                    <div className="space-y-4">
                        {isEditing ? (
                            <div className="space-y-4 animate-fadeIn">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-1">
                                        <label className="text-xs text-text-secondary">Target Weight (kg)</label>
                                        <input
                                            type="number"
                                            value={editForm.target_weight_kg || ''}
                                            onChange={e => setEditForm({ ...editForm, target_weight_kg: parseFloat(e.target.value) })}
                                            className="input w-full"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-xs text-text-secondary">Target Date</label>
                                        <input
                                            type="date"
                                            value={editForm.target_date ? format(new Date(editForm.target_date), 'yyyy-MM-dd') : ''} // formatting fix
                                            onChange={e => setEditForm({ ...editForm, target_date: e.target.value })} // formatting fix
                                            className="input w-full"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-text-secondary">Motivation</label>
                                    <textarea
                                        value={editForm.description || ''}
                                        onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                        className="input w-full"
                                        rows={2}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={loading}
                                        className="btn flex-1 flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="btn bg-bg-tertiary hover:bg-bg-tertiary/80 text-text-primary"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Read Only View
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-text-secondary text-sm">Target Weight</p>
                                        <p className="text-2xl font-bold">{activeGoal.target_weight_kg} kg</p>
                                        <p className="text-xs text-text-tertiary">by {activeGoal.target_date ? format(new Date(activeGoal.target_date), 'MMM d, yyyy') : 'No date'}</p>
                                    </div>
                                    <div>
                                        <p className="text-text-secondary text-sm">Start Weight</p>
                                        <p className="text-2xl font-bold">{activeGoal.start_weight_kg} kg</p>
                                        <p className="text-xs text-text-tertiary">on {format(new Date(activeGoal.created_at), 'MMM d, yyyy')}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-text-secondary text-sm">Motivation</p>
                                    <p className="italic text-text-primary">"{activeGoal.description}"</p>
                                </div>

                                <div className="pt-4 border-t border-bg-tertiary">
                                    <button onClick={handleComplete} className="btn w-full bg-status-success hover:bg-green-600">
                                        Mark as Completed
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <p className="mb-4">No active goal.</p>
                        <button className="btn">Set New Goal</button>
                    </div>
                )}
            </div>

            {/* History */}
            <div>
                <h3 className="text-lg font-semibold mb-3">History</h3>
                <div className="space-y-3">
                    {history.map(g => (
                        <div key={g.id} className="card py-3 flex justify-between items-center opacity-70">
                            <div>
                                <p className="font-medium">{g.goal_type.replace('_', ' ')}</p>
                                <p className="text-xs text-text-secondary">
                                    {format(new Date(g.created_at), 'MMM yyyy')}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                {g.status === 'COMPLETED' ? <CheckCircle className="w-4 h-4 text-status-success" /> : <Clock className="w-4 h-4" />}
                                <span>{g.status}</span>
                            </div>
                        </div>
                    ))}
                    {history.length === 0 && <p className="text-text-tertiary text-sm">No goal history.</p>}
                </div>
            </div>
        </div>
    );
};

export default Goals;
