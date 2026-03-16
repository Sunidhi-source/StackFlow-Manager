import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addWorkspace } from "../features/workspaceSlice";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
 
const base_url = import.meta.env.VITE_BASE_URL;;


export default function CreateWorkspaceModal({ isOpen, onClose }) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    
    // Attempt to get user from Redux first
    const reduxUser = useSelector((state) => state?.auth?.user);
    const dispatch = useDispatch();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Get User Data from localStorage as requested
        const localUser = JSON.parse(localStorage.getItem("user"));
        const user = reduxUser || localUser;

        // 2. Safety Check: Ensure we have a valid ID for the ownerId
        if (!user?._id && !user?.id) {
            toast.error("Session expired. Please log in again.");
            return;
        }

        if (!name.trim()) return;

        setLoading(true);
        try {
            const response = await fetch(`${base_url}/api/workspaces`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    name: name.trim(), 
                    ownerId: user._id || user.id // Matches your backend req.body
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // 3. Update Redux using the slice action
                dispatch(addWorkspace(data)); 
                toast.success(`Workspace "${name}" created!`);
                setName("");
                onClose(); 
            } else {
                toast.error(data.error || "Could not create workspace");
            }
        } catch (err) {
            console.error("Network Error:", err);
            toast.error("Server is offline. Check your backend terminal.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 animate-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Workspace</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                                Workspace Name
                            </label>
                            <input 
                                autoFocus
                                type="text"
                                placeholder="e.g. Engineering Team"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                required
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button 
                                type="button" 
                                onClick={onClose}
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 font-semibold hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={loading || !name.trim()}
                                className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="size-4 animate-spin" />}
                                {loading ? "Creating..." : "Create"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}