import React, { useState } from 'react';
import { Language } from '../../types';
import { Eye, EyeOff, Lock, Phone, User, ArrowRight } from 'lucide-react';

interface AuthModalProps {
    onLogin: (e: React.FormEvent) => void;
    lang: Language;
    setLang: (lang: Language) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLogin, lang }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showOtp, setShowOtp] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            if (showOtp) {
                onLogin(e);
            } else {
                setShowOtp(true);
            }
        }, 1000);
    };

    return (
        <div className="w-full bg-white dark:bg-white/5 rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="px-8 py-6 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {isLogin ? (lang === 'en' ? 'Welcome Back' : 'वापसी पर स्वागत है') : (lang === 'en' ? 'Create Account' : 'खाता बनाएं')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {lang === 'en' ? 'Enter your details to access your farm dashboard' : 'अपने खेत डैशबोर्ड तक पहुंचने के लिए अपना विवरण दर्ज करें'}
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {!isLogin && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            {lang === 'en' ? 'Full Name' : 'पूरा नाम'}
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-bhoomi-green outline-none transition-all text-gray-900 dark:text-white"
                                placeholder={lang === 'en' ? 'e.g. Rajesh Kumar' : 'जैसे राजेश कुमार'}
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        {lang === 'en' ? 'Mobile Number' : 'मोबाइल नंबर'}
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-bhoomi-green outline-none transition-all text-gray-900 dark:text-white"
                            placeholder="+91 98765 43210"
                        />
                    </div>
                </div>

                {showOtp && (
                    <div className="space-y-2 animate-slide-up">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            OTP Code
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-bhoomi-green outline-none transition-all text-gray-900 dark:text-white tracking-widest font-mono"
                                placeholder="• • • • • •"
                                maxLength={6}
                            />
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-bhoomi-green hover:bg-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            {showOtp ? 'Verify & Login' : (isLogin ? 'Get OTP' : 'Create Account')}
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            {/* Footer */}
            <div className="px-8 py-4 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 text-center">
                <button
                    onClick={() => { setIsLogin(!isLogin); setShowOtp(false); }}
                    className="text-sm font-medium text-bhoomi-green hover:text-green-700 dark:text-bhoomi-gold dark:hover:text-yellow-400 transition-colors"
                >
                    {isLogin
                        ? (lang === 'en' ? "Don't have an account? Sign Up" : 'खाता नहीं है? साइन अप करें')
                        : (lang === 'en' ? "Already have an account? Login" : 'पहले से खाता है? लॉगिन करें')
                    }
                </button>
            </div>
        </div>
    );
};
