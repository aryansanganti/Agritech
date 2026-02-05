
import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Mail, MapPin, Phone, Tractor, Save, Sprout, Layers, Droplets, ArrowLeft } from 'lucide-react';
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
        <div className="space-y-2">
            <label className="text-xs font-bold text-bhumi-mutedFg dark:text-bhumi-darkMutedFg uppercase tracking-wider flex items-center gap-2">
                {Icon && <Icon size={12} className="text-bhumi-primary dark:text-bhumi-darkPrimary" />}
                {label}
            </label>
            <div className={`
                relative flex items-center
                border-2 transition-all
                ${isEditing && !disabled
                    ? 'border-bhumi-primary dark:border-bhumi-darkPrimary bg-bhumi-input dark:bg-bhumi-darkInput shadow-sm' 
                    : 'border-bhumi-border dark:border-bhumi-darkBorder bg-bhumi-muted dark:bg-bhumi-darkMuted'}
            `}>
                <input 
                    type={type}
                    disabled={!isEditing || disabled}
                    value={value}
                    onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                    placeholder={placeholder}
                    className={`
                        w-full py-3 px-4 bg-transparent outline-none text-sm font-medium
                        ${isEditing && !disabled ? 'text-bhumi-fg dark:text-bhumi-darkFg' : 'text-bhumi-mutedFg dark:text-bhumi-darkMutedFg'}
                    `}
                />
            </div>
        </div>
    );

    const SelectField = ({ label, icon: Icon, value, field, options }: any) => (
        <div className="space-y-2">
            <label className="text-xs font-bold text-bhumi-mutedFg dark:text-bhumi-darkMutedFg uppercase tracking-wider flex items-center gap-2">
                {Icon && <Icon size={12} className="text-bhumi-primary dark:text-bhumi-darkPrimary" />}
                {label}
            </label>
            <div className={`
                relative flex items-center
                border-2 transition-all
                ${isEditing 
                    ? 'border-bhumi-primary dark:border-bhumi-darkPrimary bg-bhumi-input dark:bg-bhumi-darkInput shadow-sm' 
                    : 'border-bhumi-border dark:border-bhumi-darkBorder bg-bhumi-muted dark:bg-bhumi-darkMuted'}
            `}>
                <select 
                    disabled={!isEditing}
                    value={value}
                    onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                    className={`
                        w-full py-3 px-4 bg-transparent outline-none text-sm font-medium appearance-none
                        ${isEditing ? 'text-bhumi-fg dark:text-bhumi-darkFg cursor-pointer' : 'text-bhumi-mutedFg dark:text-bhumi-darkMutedFg'}
                    `}
                >
                    {options.map((opt: string) => (
                        <option key={opt} value={opt} className="text-bhumi-fg dark:text-bhumi-darkFg bg-bhumi-card dark:bg-bhumi-darkCard">
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
                className="flex items-center gap-2 text-bhumi-mutedFg dark:text-bhumi-darkMutedFg hover:text-bhumi-fg dark:hover:text-bhumi-darkFg transition-colors mb-2 font-medium"
            >
                <ArrowLeft size={20} /> Back to Dashboard
            </button>

            <div className="bg-bhumi-card dark:bg-bhumi-darkCard border-2 border-bhumi-border dark:border-bhumi-darkBorder p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-36 bg-bhumi-accent dark:bg-bhumi-darkAccent opacity-100"></div>
                
                <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 pt-12">
                    <div className="w-32 h-32 bg-bhumi-card dark:bg-bhumi-darkCard border-4 border-bhumi-primary dark:border-bhumi-darkPrimary flex items-center justify-center text-bhumi-primary dark:text-bhumi-darkPrimary shadow-xl z-10">
                        <User size={64} />
                    </div>
                    <div className="flex-1 text-center md:text-left mb-2 z-10">
                        <h2 className="text-3xl font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg drop-shadow-sm">{formData.name}</h2>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-bhumi-mutedFg dark:text-bhumi-darkMutedFg mt-1 font-medium">
                            <MapPin size={16} className="text-bhumi-primary dark:text-bhumi-darkPrimary" /> 
                            {formData.location || 'Location not set'}
                        </div>
                    </div>
                    <button 
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        disabled={loading}
                        className={`
                            px-6 py-3 font-bold transition-all flex items-center gap-2 z-10 shadow-lg border-2
                            ${isEditing 
                            ? 'bg-bhumi-primary text-bhumi-primaryFg dark:bg-bhumi-darkPrimary dark:text-bhumi-darkPrimaryFg border-bhumi-primary dark:border-bhumi-darkPrimary hover:bg-bhumi-primaryHover dark:hover:bg-bhumi-darkPrimaryHover' 
                            : 'bg-bhumi-fg dark:bg-bhumi-darkFg text-bhumi-bg dark:text-bhumi-darkBg border-bhumi-fg dark:border-bhumi-darkFg hover:opacity-90'}
                        `}
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin"></div> : isEditing ? <Save size={18} /> : null}
                        {isEditing ? 'Save Changes' : 'Edit Profile'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-bhumi-card dark:bg-bhumi-darkCard border-2 border-bhumi-border dark:border-bhumi-darkBorder p-6 space-y-6">
                    <h3 className="text-xl font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg border-b border-bhumi-border dark:border-bhumi-darkBorder pb-4 flex items-center gap-2">
                        <ShieldCheck className="text-bhumi-primary dark:text-bhumi-darkPrimary" /> Personal Details
                    </h3>
                    
                    <div className="space-y-4">
                        <InputField label="Full Name" value={formData.name} field="name" placeholder="Your Name" />
                        <InputField label="Email" icon={Mail} value={formData.email} field="email" placeholder="email@example.com" disabled />
                        <InputField label="Phone" icon={Phone} value={formData.phone} field="phone" placeholder="+91" />
                    </div>
                </div>

                <div className="bg-bhumi-card dark:bg-bhumi-darkCard border-2 border-bhumi-border dark:border-bhumi-darkBorder p-6 space-y-6">
                    <h3 className="text-xl font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg border-b border-bhumi-border dark:border-bhumi-darkBorder pb-4 flex items-center gap-2">
                        <Tractor className="text-bhumi-primary dark:text-bhumi-darkPrimary" /> Farm Info
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
        </div>
    );
};
