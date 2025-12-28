import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getActiveGoal } from '../services/db';
import { Menu, Plus, LayoutDashboard, ScrollText, Target, User, LogOut } from 'lucide-react';
import clsx from 'clsx';

const Layout: React.FC = () => {
    const { user, isLoading: authLoading, signOut } = useAuth();
    const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    // Check onboarding status
    useEffect(() => {
        const checkOnboarding = async () => {
            if (!user) return;

            // Check if profile is complete
            const profileComplete = !!(user.gender && user.dob && user.height_cm);
            if (!profileComplete) {
                setIsOnboarded(false);
                return;
            }

            // Check if active goal exists
            try {
                const goal = await getActiveGoal(null, user.id);
                setIsOnboarded(!!goal);
            } catch (e) {
                console.error("Error checking goal:", e);
                setIsOnboarded(false);
            }
        };

        if (!authLoading && user) {
            checkOnboarding();
        }
    }, [user, authLoading]);

    if (authLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (isOnboarded === null) {
        return <div className="flex h-screen items-center justify-center">Checking Profile...</div>;
    }

    if (!isOnboarded) {
        return <Navigate to="/onboarding" replace />;
    }

    // Navigation Items
    const navItems = [
        { label: 'Progress', path: '/', icon: LayoutDashboard },
        { label: 'All Logs', path: '/logs', icon: ScrollText },
        { label: 'Goals', path: '/goals', icon: Target },
        { label: 'Profile', path: '/profile', icon: User },
    ];

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-bg-tertiary">
                <h1 className="text-xl font-bold">Coach AI</h1>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Sidebar (Desktop) / Mobile Menu */}
            <aside className={clsx(
                "fixed inset-y-0 left-0 z-20 w-64 bg-bg-secondary transform transition-transform duration-200 ease-in-out md:translate-x-0 md:relative md:block",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 md:p-8">
                    <h1 className="text-2xl font-bold hidden md:block mb-8">Coach AI</h1>
                    <nav className="space-y-4">
                        {navItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    setMobileMenuOpen(false);
                                }}
                                className={clsx(
                                    "flex items-center space-x-3 w-full p-2 rounded-md transition-colors",
                                    location.pathname === item.path ? "bg-accent-primary text-white" : "text-text-secondary hover:bg-bg-tertiary"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="pt-8 mt-8 border-t border-bg-tertiary">
                        <button
                            onClick={() => {
                                signOut();
                                setMobileMenuOpen(false);
                            }}
                            className="flex items-center space-x-3 w-full p-2 rounded-md transition-colors text-text-tertiary hover:text-red-400 hover:bg-red-400/10"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
                <div className="max-w-3xl mx-auto">
                    <Outlet />
                </div>
            </main>

            {/* FAB for Log Event (Mobile & Desktop) */}
            <div className="fixed bottom-6 right-6 md:right-12 z-30">
                <button
                    onClick={() => navigate('/log')}
                    className="flex items-center space-x-2 bg-accent-primary hover:bg-accent-hover text-white px-6 py-4 rounded-full shadow-lg transition-transform hover:scale-105"
                >
                    <Plus className="w-6 h-6" />
                    <span className="font-semibold text-lg">Log Event</span>
                </button>
            </div>

            {/* Overlay for mobile menu */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-10 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
        </div>
    );
};

export default Layout;
