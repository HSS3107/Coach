import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDb } from '../contexts/DatabaseContext';
import { updateUserProfile } from '../services/db';
import type { User } from '../types/schema';
import { User as UserIcon, Save } from 'lucide-react';

const Profile: React.FC = () => {
    const { user } = useAuth();
    const { db } = useDb();
    const [formData, setFormData] = useState<Partial<User>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                gender: user.gender,
                dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '', // Handle potential full ISODate
                height_cm: user.height_cm,
                name: user.name
            });
        }
    }, [user]);

    const handleSave = async () => {
        if (!user || !db) return;
        setIsSaving(true);
        try {
            await updateUserProfile(db, user.id, formData);
            setIsEditing(false);
            window.location.reload();
        } catch (err) {
            alert('Failed to update');
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Profile</h1>
                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className={`btn ${isEditing ? 'bg-status-success' : 'bg-bg-tertiary text-text-primary'}`}
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving...' : isEditing ? <><Save className="w-4 h-4 mr-2" /> Save</> : 'Edit Profile'}
                </button>
            </div>

            <div className="card space-y-6">
                <div className="flex items-center gap-4 border-b border-bg-tertiary pb-6">
                    <div className="w-20 h-20 bg-bg-tertiary rounded-full flex items-center justify-center text-4xl">
                        <UserIcon className="w-10 h-10 text-text-secondary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{user.email}</h2>
                        <p className="text-text-secondary text-sm">Member since {new Date(user.created_at).getFullYear()}</p>
                    </div>
                </div>

                <div className="grid gap-4">
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Display Name</label>
                        <input
                            className="input"
                            disabled={!isEditing}
                            value={formData.name || ''}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Gender</label>
                        <select
                            className="input"
                            disabled={!isEditing}
                            value={formData.gender || ''}
                            onChange={e => setFormData({ ...formData, gender: e.target.value })}
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Date of Birth</label>
                        <input
                            type="date"
                            className="input"
                            disabled={!isEditing}
                            value={formData.dob?.toString().split('T')[0] || ''}
                            onChange={e => setFormData({ ...formData, dob: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Height (cm)</label>
                        <input
                            type="number"
                            className="input"
                            disabled={!isEditing}
                            value={formData.height_cm || ''}
                            onChange={e => setFormData({ ...formData, height_cm: parseFloat(e.target.value) })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
