import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '../types/schema';
import { supabase } from '../lib/supabase';
import { getUserById } from '../services/db';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log('AuthContext: Checking session...');
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log('AuthContext: Session found?', !!session);
            if (session?.user?.email && session?.user?.id) {
                handleUserSession(session.user.email, session.user.id);
            } else {
                console.log('AuthContext: No session, stopping load.');
                setIsLoading(false);
            }
        }).catch(err => {
            console.error('AuthContext: getSession error', err);
            setIsLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('AuthContext: Auth change', _event);
            if (session?.user?.email && session?.user?.id) {
                handleUserSession(session.user.email, session.user.id);
            } else {
                setUser(null);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleUserSession = async (_email: string, id: string) => {
        try {
            // Check by ID (Primary Key)
            // The DB Trigger 'on_auth_user_created' in Supabase handles the INSERT now.
            let appUser = await getUserById(id);

            // Retrying once if trigger is slightly delayed
            if (!appUser) {
                console.log("User not found yet, waiting for Trigger...");
                await new Promise(r => setTimeout(r, 1000));
                appUser = await getUserById(id);
            }

            if (appUser) {
                setUser(appUser);
            } else {
                console.error("Critical: User record missing even after trigger wait.");
                // Optional: fallback creation or error state
            }
        } catch (err: any) {
            console.error('Error syncing user:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const signIn = async (email: string, password?: string) => {
        setIsLoading(true);
        if (!password) {
            setIsLoading(false);
            throw new Error("Password is required");
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error("Supabase Login Error:", error);
            setIsLoading(false);
            throw error;
        }
    };

    const signUp = async (email: string, password?: string) => {
        setIsLoading(true);
        if (!password) {
            setIsLoading(false);
            throw new Error("Password is required");
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    registration_source: 'web_campaign',
                }
            }
        });

        if (error) {
            console.error("Supabase Signup Error:", error);
            setIsLoading(false);
            throw error;
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    const refreshUser = async () => {
        if (!user) return;
        const updatedUser = await getUserById(user.id);
        if (updatedUser) setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
