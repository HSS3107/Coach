import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createLog, createResource, getActiveGoal, createChat, addMessage } from '../services/db';
import type { LogType } from '../types/schema';
import { Camera, Scale, Utensils, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';

const LogEvent: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [activeType, setActiveType] = useState<LogType>('WEIGHT');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form Fields
    const [weight, setWeight] = useState('');
    const [note, setNote] = useState('');
    const [files, setFiles] = useState<FileList | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        try {
            const activeGoal = await getActiveGoal(null, user.id);

            const structuredData: any = {};
            const resourceIds: string[] = [];

            // 1. Handle File Uploads
            const uploadedImages: { base64: string, mimeType: string }[] = [];

            if (files && files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const base64 = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target?.result as string);
                        reader.readAsDataURL(file);
                    });

                    const res = await createResource(null, {
                        user_id: user.id,
                        resource_type: file.type.includes('pdf') ? 'PDF' : 'IMAGE',
                        mime_type: file.type,
                        storage_path: base64, // Storing CONTENT for local demo
                        category: activeType
                    });
                    resourceIds.push(res.id);

                    // Collect for AI
                    if (file.type.startsWith('image/')) {
                        uploadedImages.push({ base64, mimeType: file.type });
                    }
                }
            }

            // 2. Prepare Data
            if (activeType === 'WEIGHT') {
                structuredData.weight_kg = parseFloat(weight);
            } else if (activeType === 'NOTE') {
                structuredData.text = note;
            } else if (activeType === 'FOOD') {
                structuredData.description = note;
            }

            // 3. Create Log
            const log = await createLog(null, {
                user_id: user.id,
                goal_id: activeGoal?.id,
                log_timestamp: new Date().toISOString(),
                log_type: activeType,
                raw_text: note,
                structured_data: structuredData,
                resource_ids: resourceIds
            });

            // 4. Create Chat
            const chat = await createChat(null, user.id, log.id);

            // 5. Add User Message to Chat
            const userMessageContent = "I just logged a " + activeType + ": " + (note || weight + 'kg') + ".";
            await addMessage(null, chat.id, user.id, 'USER', userMessageContent);

            // Fetch Context for AI
            const history = [
                { role: 'user' as const, content: userMessageContent }
            ];

            // 6. Generate & Save AI Response
            const { generateAIResponse } = await import('../services/ai');
            const aiReply = await generateAIResponse(user, activeGoal, [], history, uploadedImages);

            await addMessage(null, chat.id, user.id, 'AI', aiReply);

            // Mark log as completed
            await supabase.from('master_logs').update({ ai_status: 'COMPLETED' }).eq('id', log.id);

            // Navigate to the new chat
            navigate("/log/" + log.id + "/chat");

        } catch (err) {
            console.error(err);
            alert('Failed to save log');
        } finally {
            setIsSubmitting(false);
        }
    };

    const types: { type: LogType, icon: any, label: string }[] = [
        { type: 'WEIGHT', icon: Scale, label: 'Weight' },
        { type: 'FOOD', icon: Utensils, label: 'Food' },
        { type: 'BODY_PHOTO', icon: Camera, label: 'Photo' },
        { type: 'NOTE', icon: FileText, label: 'Note' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-bg-secondary rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold">Log Event</h1>
            </div>

            {/* Type Selector */}
            <div className="grid grid-cols-4 gap-2">
                {types.map((t) => (
                    <button
                        key={t.type}
                        onClick={() => setActiveType(t.type)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl gap-2 transition-colors ${activeType === t.type
                            ? 'bg-accent-primary text-white shadow-lg scale-105'
                            : 'bg-bg-secondary text-text-tertiary hover:bg-bg-tertiary'
                            }`}
                    >
                        <t.icon className="w-6 h-6" />
                        <span className="text-xs font-medium">{t.label}</span>
                    </button>
                ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="card space-y-6">
                <div className="flex items-center gap-2 text-accent-primary font-semibold">
                    <span className="uppercase tracking-wider text-sm">{activeType}</span>
                    <span className="text-text-tertiary">•</span>
                    <span className="text-text-secondary font-normal text-sm">{format(new Date(), 'PP p')}</span>
                </div>

                {activeType === 'WEIGHT' && (
                    <div>
                        <label className="block text-sm text-text-secondary mb-2">Weight (kg)</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.01"
                                autoFocus
                                required
                                className="input text-3xl font-bold text-center py-6"
                                placeholder="0.0"
                                value={weight}
                                onChange={e => setWeight(e.target.value)}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary">kg</span>
                        </div>
                    </div>
                )}

                {(activeType === 'FOOD' || activeType === 'BODY_PHOTO') && (
                    <div>
                        <label className="block text-sm text-text-secondary mb-2">Photo</label>
                        <div className="border-2 border-dashed border-bg-tertiary rounded-lg p-8 text-center hover:border-accent-primary transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={e => setFiles(e.target.files)}
                                required
                            />
                            <Camera className="w-8 h-8 mx-auto mb-2 text-text-tertiary" />
                            <p className="text-sm text-text-secondary">
                                {files && files.length > 0 ? `${files.length} file(s) selected` : 'Tap to capture or upload'}
                            </p>
                        </div>
                    </div>
                )}

                {(activeType !== 'WEIGHT') && (
                    <div>
                        <label className="block text-sm text-text-secondary mb-2">
                            {activeType === 'FOOD' ? 'Description' : 'Note'}
                        </label>
                        <textarea
                            className="input min-h-[120px]"
                            placeholder={activeType === 'FOOD' ? "Grilled chicken with rice..." : "Feeling great today..."}
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            required={activeType === 'NOTE' || activeType === 'FOOD'}
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn w-full py-4 text-lg shadow-lg flex items-center justify-center gap-2"
                >
                    {isSubmitting && <Loader2 className="animate-spin w-5 h-5" />}
                    <span>Save Log</span>
                </button>
            </form>
        </div>
    );
};

export default LogEvent;
