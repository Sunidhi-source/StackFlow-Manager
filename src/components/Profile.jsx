import React from 'react';
import { Mail, Calendar, ShieldCheck, HardDrive } from 'lucide-react';

const Profile = () => {
    // Pull the real attributes from localStorage
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) return null;
    const userRole = user?.role === 'manager' ? 'Project Manager' : 'Team Member';

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
            
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                {/* Profile Header */}
                <div className="p-8 flex flex-col md:flex-row items-center gap-6 border-b border-gray-100 dark:border-zinc-800">
                    <img 
                        src={user.image} 
                        alt={user.name} 
                        className="size-24 rounded-full border-4 border-blue-500/10"
                    />
                    <div className="text-center md:text-left space-y-1">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wider">
                            {userRole}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Profile Details (Backend Attributes) */}
                <div className="p-8 grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Contact Information</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-gray-600 dark:text-zinc-300">
                                <div className="p-2 bg-gray-50 dark:bg-zinc-800 rounded-lg"><Mail size={18} /></div>
                                <div>
                                    <p className="text-xs text-gray-400">Email Address</p>
                                    <p className="font-medium">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 dark:text-zinc-300">
                                <div className="p-2 bg-gray-50 dark:bg-zinc-800 rounded-lg"><Calendar size={18} /></div>
                                <div>
                                    <p className="text-xs text-gray-400">Member Since</p>
                                    <p className="font-medium">
                                        {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">System Info</h3>
                        <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-800">
                            <div className="flex items-center gap-3 mb-2">
                                <ShieldCheck className="text-green-500" size={20} />
                                <span className="font-bold text-gray-900 dark:text-white">Security Verified</span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">
                                Your account is encrypted with BCrypt. Only authorized managers can access project data.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;