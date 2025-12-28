import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile, createGoal } from '../services/db';
import { User, Target, ArrowLeft, LogOut, ChevronRight, Check } from 'lucide-react';
import clsx from 'clsx';

const Onboarding: React.FC = () => {
    const { user, signOut, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Form State
    const [profile, setProfile] = useState({
        gender: 'Male',
        dob: '',
        height_cm: '',
    });

    const [goal, setGoal] = useState({
        goal_type: 'WEIGHT_LOSS',
        description: '',
        start_weight_kg: '',
        target_weight_kg: '',
        target_date: '',
    });

    useEffect(() => {
        // Pre-fill profile if available
        if (user) {
            setProfile({
                gender: user.gender || 'Male',
                dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
                height_cm: user.height_cm?.toString() || '',
            });
        }
    }, [user]);

    const handleNext = () => setStep(step + 1);

    const handleComplete = async () => {
        if (!user) return;
        setIsSubmitting(true);
        setErrorMsg(null);
        try {
            // 1. Update Profile
            await updateUserProfile(null, user.id, {
                gender: profile.gender,
                dob: profile.dob,
                height_cm: parseFloat(profile.height_cm),
            });

            // 2. Create Goal
            await createGoal(null, user.id, {
                goal_type: goal.goal_type,
                description: goal.description,
                start_date: new Date().toISOString(),
                target_date: goal.target_date || undefined,
                start_weight_kg: parseFloat(goal.start_weight_kg),
                target_weight_kg: parseFloat(goal.target_weight_kg),
            });

            // Refresh local user state so Layout knows we are onboarded
            await refreshUser();

            // Redirect to Dashboard
            navigate('/', { replace: true });
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || "Failed to save profile. Please try again.");
            // Don't alert, show in UI
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return <div className="flex h-screen items-center justify-center text-text-secondary">Loading...</div>;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-bg-primary">
            <div className="card w-full max-w-lg bg-bg-secondary shadow-xl rounded-2xl overflow-hidden border border-bg-tertiary">

                {/* Header */}
                <div className="bg-bg-secondary px-6 py-5 border-b border-bg-tertiary flex items-center justify-between">
                    {step === 1 ? (
                        <button
                            onClick={signOut}
                            className="flex items-center text-text-tertiary hover:text-red-400 transition-colors text-sm font-medium"
                        >
                            <LogOut className="w-4 h-4 mr-1" />
                            Sign Out
                        </button>
                    ) : (
                        <button
                            onClick={() => setStep(1)}
                            className="flex items-center text-text-tertiary hover:text-text-primary transition-colors text-sm font-medium"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back
                        </button>
                    )}

                    <div className="flex space-x-2">
                        <div className={clsx("w-2 h-2 rounded-full", step >= 1 ? "bg-accent-primary" : "bg-bg-tertiary")} />
                        <div className={clsx("w-2 h-2 rounded-full", step >= 2 ? "bg-accent-primary" : "bg-bg-tertiary")} />
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {step === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="text-center mb-8">
                                <div className="w-12 h-12 bg-accent-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-accent-primary">
                                    <User className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-text-primary">About You</h2>
                                <p className="text-text-secondary text-sm mt-1">Let's verify your basic details.</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-text-tertiary mb-1.5 tracking-wider">Gender</label>
                                    <select
                                        className="input w-full bg-bg-primary"
                                        value={profile.gender}
                                        onChange={e => setProfile({ ...profile, gender: e.target.value })}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase text-text-tertiary mb-1.5 tracking-wider">Date of Birth</label>
                                        <input
                                            type="date"
                                            className="input w-full bg-bg-primary"
                                            value={profile.dob}
                                            onChange={e => setProfile({ ...profile, dob: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase text-text-tertiary mb-1.5 tracking-wider">Height (cm)</label>
                                        <input
                                            type="number"
                                            className="input w-full bg-bg-primary"
                                            placeholder="175"
                                            value={profile.height_cm}
                                            onChange={e => setProfile({ ...profile, height_cm: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                className="btn w-full flex items-center justify-center mt-8 py-3 text-lg"
                                onClick={handleNext}
                                disabled={!profile.dob || !profile.height_cm}
                            >
                                Next Step <ChevronRight className="w-5 h-5 ml-1" />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="text-center mb-8">
                                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                                    <Target className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-text-primary">Your Goal</h2>
                                <p className="text-text-secondary text-sm mt-1">What do you want to achieve?</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-text-tertiary mb-1.5 tracking-wider">Goal Type</label>
                                    <select
                                        className="input w-full bg-bg-primary"
                                        value={goal.goal_type}
                                        onChange={e => setGoal({ ...goal, goal_type: e.target.value })}
                                    >
                                        <option value="WEIGHT_LOSS">Weight Loss</option>
                                        <option value="MAINTENANCE">Maintenance</option>
                                        <option value="MUSCLE_GAIN">Muscle Gain</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase text-text-tertiary mb-1.5 tracking-wider">Current (kg)</label>
                                        <input
                                            type="number"
                                            className="input w-full bg-bg-primary"
                                            step="0.1"
                                            value={goal.start_weight_kg}
                                            onChange={e => setGoal({ ...goal, start_weight_kg: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase text-text-tertiary mb-1.5 tracking-wider">Target (kg)</label>
                                        <input
                                            type="number"
                                            className="input w-full bg-bg-primary"
                                            step="0.1"
                                            value={goal.target_weight_kg}
                                            onChange={e => setGoal({ ...goal, target_weight_kg: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase text-text-tertiary mb-1.5 tracking-wider">Target Date (Optional)</label>
                                    <input
                                        type="date"
                                        className="input w-full bg-bg-primary"
                                        value={goal.target_date}
                                        onChange={e => setGoal({ ...goal, target_date: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase text-text-tertiary mb-1.5 tracking-wider">Motivation</label>
                                    <textarea
                                        className="input w-full bg-bg-primary min-h-[80px]"
                                        placeholder="I want to feel healthier..."
                                        value={goal.description}
                                        onChange={e => setGoal({ ...goal, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                className="btn w-full flex items-center justify-center mt-8 py-3 text-lg"
                                onClick={handleComplete}
                                disabled={isSubmitting || !goal.start_weight_kg || !goal.target_weight_kg || !goal.description}
                            >
                                {isSubmitting ? 'Setting up...' : 'Start Your Journey'}
                                {!isSubmitting && <Check className="w-5 h-5 ml-2" />}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
