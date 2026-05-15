import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Trash2, Save, UserPlus, Crown, Shield, User, Mail, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
import { updateWorkspace, deleteWorkspace } from "../features/workspaceSlice";
import api from "../utils/api";

const base_url = import.meta.env.VITE_BASE_URL;

export default function WorkspaceSettings() {
    const dispatch = useDispatch();
    const workspace = useSelector((state) => state.workspace.currentWorkspace);
    const currentUser = useSelector((state) => state.auth.user);

    const [name, setName] = useState(workspace?.name || "");
    const [primaryColor, setPrimaryColor] = useState(workspace?.branding?.primaryColor || "#2563eb");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("MEMBER");
    const [inviting, setInviting] = useState(false);
    const [copiedSlug, setCopiedSlug] = useState(false);

    if (!workspace) {
        return (
            <div className="max-w-4xl mx-auto p-8 text-center">
                <p className="text-zinc-500 dark:text-zinc-400 text-lg mt-20">
                    No workspace selected. Please select or create a workspace first.
                </p>
            </div>
        );
    }

    const isOwner = workspace.ownerId === (currentUser?._id || currentUser?.id) ||
        workspace.ownerId?._id === (currentUser?._id || currentUser?.id);

    const stats = {
        projects: workspace.projects?.length || 0,
        members: workspace.members?.length || 0,
        tasks: workspace.projects?.reduce((acc, p) => acc + (p.tasks?.length || 0), 0) || 0,
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const data = await api.put(`/api/workspaces/${workspace._id}`, {
                name,
                branding: { ...workspace.branding, primaryColor },
            });
            dispatch(updateWorkspace(data));
            toast.success("Workspace updated!");
        } catch {
            toast.error("Failed to update workspace");
        } finally {
            setSaving(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;
        setInviting(true);
        try {
            const res = await fetch(`${base_url}/api/workspaces/invite`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    email: inviteEmail,
                    role: inviteRole,
                    workspaceId: workspace._id,
                    workspaceName: workspace.name,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`Invite sent to ${inviteEmail}`);
                setInviteEmail("");
                setShowInvite(false);
            } else {
                toast.error(data.message || "Failed to send invite");
            }
        } catch {
            toast.error("Server error");
        } finally {
            setInviting(false);
        }
    };

    const handleCopySlug = () => {
        navigator.clipboard.writeText(workspace.slug || workspace.name);
        setCopiedSlug(true);
        setTimeout(() => setCopiedSlug(false), 2000);
    };

    const handleDelete = async () => {
        const input = window.prompt(`Type "DELETE ${workspace.name}" to confirm permanent deletion`);
        if (input !== `DELETE ${workspace.name}`) {
            if (input !== null) toast.error("Confirmation text didn't match");
            return;
        }
        setDeleting(true);
        try {
            await api.delete(`/api/workspaces/${workspace._id}`);
            dispatch(deleteWorkspace(workspace._id));
            toast.success("Workspace deleted");
            window.location.href = "/";
        } catch {
            toast.error("Failed to delete workspace");
        } finally {
            setDeleting(false);
        }
    };

    const inputClass = "w-full mt-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Workspace Settings</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Manage settings, members, and preferences for <span className="font-medium text-zinc-700 dark:text-zinc-300">{workspace.name}</span>
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Projects", value: stats.projects },
                    { label: "Members", value: stats.members },
                    { label: "Total Tasks", value: stats.tasks },
                ].map(({ label, value }) => (
                    <div key={label} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
                        <p className="text-xs text-zinc-500 mt-1">{label}</p>
                    </div>
                ))}
            </div>

            {/* General Settings */}
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">General</h2>

                <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Workspace Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="e.g. Team Alpha" />
                </div>

                <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Workspace Slug</label>
                    <div className="relative">
                        <input readOnly value={workspace.slug || ""} className={inputClass + " pr-10 cursor-default opacity-70"} />
                        <button onClick={handleCopySlug} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition mt-0.5">
                            {copiedSlug ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
                        </button>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">Used in URLs. Auto-generated from workspace name.</p>
                </div>

                <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Brand Color</label>
                    <div className="flex items-center gap-3 mt-1">
                        <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-9 w-14 rounded cursor-pointer border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-1" />
                        <span className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">{primaryColor}</span>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50"
                >
                    <Save size={15} />
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </section>

            {/* Members */}
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        Members <span className="text-sm font-normal text-zinc-500 ml-1">({stats.members})</span>
                    </h2>
                    {isOwner && (
                        <button
                            onClick={() => setShowInvite((v) => !v)}
                            className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                        >
                            <UserPlus size={14} />
                            Invite Member
                        </button>
                    )}
                </div>

                {/* Invite form */}
                {showInvite && (
                    <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <div className="relative flex-1">
                            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="colleague@email.com"
                                required
                                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="py-2 px-3 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 focus:outline-none">
                            <option value="MEMBER">Member</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                        <button type="submit" disabled={inviting} className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 font-medium">
                            {inviting ? "Sending..." : "Send Invite"}
                        </button>
                    </form>
                )}

                {/* Member list */}
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {workspace.members?.length > 0 ? (
                        workspace.members.map((m, i) => {
                            // Handle both populated (object) and unpopulated (string) user references
                            const user = typeof m.user === "object" ? m.user : null;
                            const displayName = user?.name || user?.email || "Unknown Member";
                            const displayEmail = user?.email || "";
                            const avatar = user?.image;
                            const isCurrentUser =
                                user?._id === (currentUser?._id || currentUser?.id);

                            return (
                                <div key={user?._id || i} className="py-3.5 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        {avatar ? (
                                            <img src={avatar} alt={displayName} className="size-9 rounded-full object-cover" />
                                        ) : (
                                            <div className="size-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                                                <User size={16} />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                                {displayName}
                                                {isCurrentUser && (
                                                    <span className="ml-2 text-xs text-blue-500">(you)</span>
                                                )}
                                            </p>
                                            {displayEmail && (
                                                <p className="text-xs text-zinc-500">{displayEmail}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {m.role === "ADMIN" ? (
                                            <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                                                <Crown size={11} /> Admin
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                                <Shield size={11} /> Member
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-sm text-zinc-500 py-4 text-center">No members yet. Invite someone to get started.</p>
                    )}
                </div>
            </section>

            {/* Danger Zone */}
            {isOwner && (
                <section className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-1">Danger Zone</h2>
                    <p className="text-sm text-red-500/80 mb-5">
                        Permanently deletes this workspace including all projects, tasks, and member history. This cannot be undone.
                    </p>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50"
                    >
                        <Trash2 size={15} />
                        {deleting ? "Deleting..." : "Delete Workspace"}
                    </button>
                </section>
            )}
        </div>
    );
}
