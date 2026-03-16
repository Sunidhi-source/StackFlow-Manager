import React, { useState } from 'react';
import { User, Lock, Trash2, Save, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
 const base_url = import.meta.env.VITE_BASE_URL;;

const Settings = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        newPassword: ''
    });

    // --- SECTION 1: EDIT PROFILE ---
    const handleUpdateProfile = async (e) => {
        e.preventDefault(); // Prevents page reload
        try {
            const res = await fetch(`${base_url}/api/users/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: user.id || user._id, 
                    name: formData.name, 
                    email: formData.email 
                })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem("user", JSON.stringify(data));
                toast.success("Profile updated successfully!");
            } else {
                toast.error(data.message || "Update failed");
            }
        } catch { 
            toast.error("Server error"); 
        }
    };

    // --- SECTION 2: SECURITY (Password) ---
    const handleUpdatePassword = async (e) => {
        e.preventDefault(); // Prevents page reload
        if (!formData.newPassword) return toast.error("Enter a new password");
        
        try {
            const res = await fetch(`${base_url}/api/auth/update-password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: user.id || user._id, 
                    newPassword: formData.newPassword 
                })
            });
            const data = await res.json();
            if (res.ok) {
                setFormData({...formData, newPassword: ''}); // Clear input
                toast.success("Password secured with BCrypt!");
            } else {
                toast.error(data.message || "Password update failed");
            }
        } catch { 
            toast.error("Connection failed"); 
        }
    };

    // --- SECTION 3: DANGER ZONE ---
    const handleDeleteAccount = async () => {
        if (window.confirm("WARNING: This will permanently delete your account and all data.")) {
            try {
                const res = await fetch(`${base_url}/api/users/${user.id || user._id}`, { 
                    method: 'DELETE' 
                });
                if (res.ok) {
                    localStorage.removeItem("user");
                    window.location.href = "/auth";
                }
            } catch {
                toast.error("Could not delete account");
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>

            {/* EDIT PROFILE FORM */}
            <section className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                        <User size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">General Information</h2>
                        <p className="text-sm text-gray-500">Update your public identity</p>
                    </div>
                </div>
                <form onSubmit={handleUpdateProfile} className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase">Full Name</label>
                        <input 
                            className="w-full p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase">Email Address</label>
                        <input 
                            className="w-full p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div className="md:col-span-2 pt-2">
                        <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2">
                            <Save size={18} /> Update Profile
                        </button>
                    </div>
                </form>
            </section>

            {/* SECURITY FORM */}
            <section className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600">
                        <Lock size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Security & Password</h2>
                </div>
                <form onSubmit={handleUpdatePassword} className="max-w-md space-y-4">
                    <input 
                        type="password"
                        placeholder="Enter new password"
                        className="w-full p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                    />
                    <button type="submit" className="w-full bg-zinc-900 dark:bg-white dark:text-black text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all">
                        Change Password
                    </button>
                </form>
            </section>

            {/* DANGER ZONE */}
            <section className="bg-red-50 dark:bg-red-950/20 p-8 rounded-2xl border border-red-100 dark:border-red-900/30">
                <div className="flex items-center gap-3 mb-4 text-red-600">
                    <ShieldAlert size={24} />
                    <h2 className="text-xl font-bold">Danger Zone</h2>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-red-600/80 max-w-md">
                        Permanently delete your project manager account. This action cannot be undone.
                    </p>
                    <button 
                        type="button"
                        onClick={handleDeleteAccount}
                        className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all flex items-center gap-2"
                    >
                        <Trash2 size={18} /> Delete Account
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Settings;