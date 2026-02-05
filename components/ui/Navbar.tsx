import React from 'react';
import { Menu, Bell, Sun, Moon, LogOut, User as UserIcon, LayoutGrid, ShoppingBag, Sprout, ScanEye, Activity, MessageCircle } from 'lucide-react';
import { User, Language, PageView } from '../../types';

interface NavbarProps {
    user: User | null;
    currentView: PageView;
    setView: (view: PageView) => void;
    lang: Language;
    isDark: boolean;
    toggleTheme: () => void;
    logout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, currentView, setView, lang, isDark, toggleTheme, logout }) => {

    // Navigation Items
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
        { id: 'marketplace', label: 'Market', icon: ShoppingBag },
        { id: 'soil-analysis', label: 'Soil', icon: Activity },
        { id: 'crop-analysis', label: 'Crop Doctor', icon: ScanEye },
        { id: 'seedscout', label: 'SeedScout', icon: Sprout },
    ];

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-bhoomi-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">

                    {/* Logo Section */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('dashboard')}>
                        <div className="bg-bhoomi-green/10 p-2 rounded-xl">
                            <img src="/logo.png" alt="bhoomi Logo" className="h-8 w-auto object-contain" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight hidden md:block">
                            bhoomi
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentView === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setView(item.id as PageView)}
                                    className={`
                                        px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
                                        ${isActive
                                            ? 'bg-bhoomi-green text-white shadow-md transform scale-105'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-bhoomi-green dark:hover:text-bhoomi-green'}
                                    `}
                                >
                                    <Icon size={18} />
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 sm:gap-4">

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* Notifications (Mock) */}
                        <button className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-bhoomi-dark"></span>
                        </button>

                        {/* Profile Dropdown Trigger */}
                        <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>

                        <div className="flex items-center gap-3 pl-1">
                            {user && (
                                <button
                                    onClick={() => setView('profile')}
                                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                                >
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-bhoomi-green to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-sm border-2 border-white dark:border-bhoomi-dark">
                                        {user.name ? user.name.charAt(0) : 'U'}
                                    </div>
                                    <div className="hidden lg:block text-left">
                                        <p className="text-sm font-bold text-gray-800 dark:text-white leading-none">{user.name || 'Farmer'}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user.location?.split(',')[0] || 'India'}</p>
                                    </div>
                                </button>
                            )}

                            <button
                                onClick={logout}
                                className="p-2 ml-1 text-gray-400 hover:text-red-500 transition-colors"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Bar (Bottom) */}
            <div className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-bhoomi-dark border-t border-gray-200 dark:border-white/10 pb-safe z-50">
                <div className="grid grid-cols-5 px-2 py-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setView(item.id as PageView)}
                                className={`flex flex-col items-center justify-center py-3 gap-1 ${isActive ? 'text-bhoomi-green' : 'text-gray-400 dark:text-gray-500'}`}
                            >
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};
