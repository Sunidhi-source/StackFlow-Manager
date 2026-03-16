import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Trash2, Shield, User, Save } from "lucide-react";
import toast from "react-hot-toast";
import { updateWorkspace, deleteWorkspace } from "../features/workspaceSlice";
 
export default function WorkspaceSettings() {
    const dispatch = useDispatch();
    const workspace = useSelector(state => state.workspace.currentWorkspace);
    const [name, setName] = useState(workspace?.name || "");
    const base_url = import.meta.env.VITE_BASE_URL;;

    const handleSaveBranding = async () => {
        const res = await fetch(`${base_url}/api/workspaces/${workspace._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name })
        });
        if (res.ok) {
            const data = await res.json();
            dispatch(updateWorkspace(data));
            toast.success("Workspace updated!");
        }
    };

    const handleDeleteWorkspace = async () => {
        const confirm = window.prompt(`Type "DELETE ${workspace.name}" to confirm`);
        if (confirm === `DELETE ${workspace.name}`) {
            await fetch(`${base_url}/api/workspaces/${workspace._id}`, { method: "DELETE" });
            dispatch(deleteWorkspace(workspace._id));
            window.location.href = "/dashboard";
        }
    };

    if (!workspace) return null;

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-10">
            {/* 1. Branding Section */}
            <section className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Workspace Branding</h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase">Workspace Name</label>
                        <input 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            className="w-full mt-1 p-3 rounded-xl border dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                        />
                    </div>
                    <button onClick={handleSaveBranding} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium">
                        <Save size={18} /> Save Branding
                    </button>
                </div>
            </section>

            {/* 2. Members & Roles Section */}
            <section className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Workspace Members</h2>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {workspace.members?.map((m) => (
                        <div key={m.user._id} className="py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center"><User size={20}/></div>
                                <div>
                                    <p className="font-medium">{m.user.email}</p>
                                    <p className="text-xs text-zinc-500 capitalize">{m.role}</p>
                                </div>
                            </div>
                            <select 
                                defaultValue={m.role}
                                className="text-sm bg-zinc-50 dark:bg-zinc-900 border rounded-lg p-1"
                            >
                                <option value="ADMIN">Admin</option>
                                <option value="MEMBER">Member</option>
                            </select>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. Danger Zone */}
            <section className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-200 dark:border-red-900/30">
                <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Danger Zone</h2>
                <p className="text-sm text-red-500/80 mb-6">Deleting this workspace will permanently erase all projects, tasks, and member history.</p>
                <button onClick={handleDeleteWorkspace} className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-red-500/20">
                    <Trash2 size={18} /> Delete Workspace
                </button>
            </section>
        </div>
    );
}