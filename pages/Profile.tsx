
import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Mail, MapPin, Phone, Tractor, Save, Sprout, Layers, Droplets, ArrowLeft, Target, Sparkles, TrendingUp } from 'lucide-react';
import { User as UserType } from '../types';
import { api } from '../services/api';

interface Props {
    user: UserType | null;
    setUser: (u: UserType) => void;
    onBack: () => void;
}

export const Profile: React.FC<Props> = ({ user, setUser, onBack }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<UserType>({
        name: '',
        email: '',
        location: '',
        phone: '',
        farmSize: '',
        memberSince: '2025',
        soilType: '',
        mainCrop: '',
        irrigationSource: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                location: user.location || '',
                phone: user.phone || '',
                farmSize: user.farmSize || '',
                memberSince: user.memberSince || '2025',
                soilType: user.soilType || '',
                mainCrop: user.mainCrop || '',
                irrigationSource: user.irrigationSource || ''
            });
        }
    }, [user]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const updatedUser = await api.user.updateProfile(formData);
            setUser(updatedUser);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setLoading(false);
        }
    };

    const InputField = ({ label, icon: Icon, value, field, placeholder, disabled = false, type = "text" }: any) => (
        <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                {Icon && <Icon size={12} className="text-bhoomi-green dark:text-bhoomi-gold" />}
                {label}
            </label>
            <div className={`
                relative flex items-center
                border rounded-lg transition-all
                ${isEditing && !disabled
                    ? 'border-gray-800 dark:border-bhoomi-gold/50 bg-white dark:bg-black/20 shadow-sm'
                    : 'border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5'}
            `}>
                <input
                    type={type}
                    disabled={!isEditing || disabled}
                    value={value}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    placeholder={placeholder}
                    className={`
                        w-full py-2.5 px-3 bg-transparent outline-none text-sm font-medium
                        ${isEditing && !disabled ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}
                    `}
                />
            </div>
        </div>
    );

    const SelectField = ({ label, icon: Icon, value, field, options }: any) => (
        <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                {Icon && <Icon size={12} className="text-bhoomi-green dark:text-bhoomi-gold" />}
                {label}
            </label>
            <div className={`
                relative flex items-center
                border rounded-lg transition-all
                ${isEditing
                    ? 'border-gray-800 dark:border-bhoomi-gold/50 bg-white dark:bg-black/20 shadow-sm'
                    : 'border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5'}
            `}>
                <select
                    disabled={!isEditing}
                    value={value}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    className={`
                        w-full py-2.5 px-3 bg-transparent outline-none text-sm font-medium appearance-none
                        ${isEditing ? 'text-gray-900 dark:text-white cursor-pointer' : 'text-gray-600 dark:text-gray-300'}
                    `}
                >
                    {options.map((opt: string) => (
                        <option key={opt} value={opt} className="text-gray-900 dark:text-white bg-white dark:bg-bhoomi-dark">
                            {opt}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors mb-2 font-medium"
            >
                <ArrowLeft size={20} /> Back to Dashboard
            </button>

            <div className="glass-panel p-8 rounded-2xl relative overflow-hidden bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-green-100 to-green-50 dark:from-bhoomi-green dark:to-[#1a2e15] opacity-100 dark:opacity-50"></div>

                <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 pt-10">
                    <div className="w-32 h-32 rounded-full bg-white dark:bg-[#0F1419] border-4 border-bhoomi-green dark:border-bhoomi-gold flex items-center justify-center text-bhoomi-green dark:text-bhoomi-gold shadow-xl z-10">
                        <User size={64} />
                    </div>
                    <div className="flex-1 text-center md:text-left mb-2 z-10">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white drop-shadow-sm">{formData.name}</h2>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-gray-700 dark:text-gray-300 mt-1 font-medium">
                            <MapPin size={16} className="text-bhoomi-green dark:text-bhoomi-gold" />
                            {formData.location || 'Location not set'}
                        </div>
                    </div>
                    <button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        disabled={loading}
                        className={`
                            px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 z-10 shadow-lg
                            ${isEditing
                                ? 'bg-bhoomi-green text-white hover:bg-green-700'
                                : 'bg-gray-900 dark:bg-white text-white dark:text-bhoomi-dark hover:opacity-90'}
                        `}
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : isEditing ? <Save size={18} /> : null}
                        {isEditing ? 'Save Changes' : 'Edit Profile'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-2xl space-y-6 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-4 flex items-center gap-2">
                        <ShieldCheck className="text-bhoomi-green dark:text-bhoomi-gold" /> Personal Details
                    </h3>

                    <div className="space-y-4">
                        <InputField label="Full Name" value={formData.name} field="name" placeholder="Your Name" />
                        <InputField label="Email" icon={Mail} value={formData.email} field="email" placeholder="email@example.com" disabled />
                        <InputField label="Phone" icon={Phone} value={formData.phone} field="phone" placeholder="+91" />
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl space-y-6 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-4 flex items-center gap-2">
                        <Tractor className="text-green-600 dark:text-green-400" /> Farm Info
                    </h3>

                    <div className="space-y-4">
                        <InputField label="Location" icon={MapPin} value={formData.location} field="location" />
                        <InputField label="Farm Size (Acres)" value={formData.farmSize} field="farmSize" placeholder="0" />
                        <InputField label="Main Crop" icon={Sprout} value={formData.mainCrop} field="mainCrop" placeholder="Rice, Wheat..." />

                        <div className="grid grid-cols-2 gap-4">
                            <SelectField
                                label="Soil Type"
                                icon={Layers}
                                value={formData.soilType}
                                field="soilType"
                                options={['Loamy', 'Clay', 'Sandy', 'Black', 'Red']}
                            />
                            <SelectField
                                label="Irrigation"
                                icon={Droplets}
                                value={formData.irrigationSource}
                                field="irrigationSource"
                                options={['Rainfed', 'Canal', 'Tube Well', 'Drip']}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-200 dark:border-indigo-500/20 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Target size={120} />
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-4 mb-6 flex items-center gap-2 relative z-10">
                    <Sparkles className="text-indigo-500" />
                    Achievements & Impact
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    {/* Level Card */}
                    <div className="bg-white dark:bg-black/40 rounded-xl p-6 border border-indigo-100 dark:border-indigo-500/30 text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                        <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">Current Level</div>
                        <div className="text-5xl font-black text-gray-900 dark:text-white mb-1 group-hover:scale-110 transition-transform duration-300">5</div>
                        <div className="text-sm font-medium text-gray-500">Sustainable Farmer</div>

                        <div className="w-full bg-gray-100 dark:bg-white/10 h-2 rounded-full mt-4 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full w-[75%] rounded-full relative">
                                <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1 flex justify-between">
                            <span>2,450 XP</span>
                            <span>3,000 XP</span>
                        </div>
                    </div>

                    {/* Badge 1 */}
                    <div className="bg-white dark:bg-black/40 rounded-xl p-4 border border-emerald-100 dark:border-emerald-500/30 flex items-center gap-4 group hover:shadow-lg hover:shadow-emerald-500/10 transition-all">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Sprout size={32} />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 dark:text-white">Soil Guardian</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Uploaded 5+ Soil Tests</div>
                            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-2 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md inline-block">
                                COMPLETED
                            </div>
                        </div>
                    </div>

                    {/* Badge 2 */}
                    <div className="bg-white dark:bg-black/40 rounded-xl p-4 border border-blue-100 dark:border-blue-500/30 flex items-center gap-4 group hover:shadow-lg hover:shadow-blue-500/10 transition-all">
                        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-600 shadow-inner">
                            <TrendingUp size={32} />
                        </div>
                        <div className="opacity-60">
                            <div className="font-bold text-gray-900 dark:text-white">Market Master</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Make 10 Sales</div>
                            <div className="text-[10px] font-bold text-gray-500 mt-2 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md inline-block">
                                4/10 SOLD
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
