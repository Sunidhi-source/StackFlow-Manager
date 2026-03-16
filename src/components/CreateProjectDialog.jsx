import { useState } from "react";
import { XIcon } from "lucide-react";
import { useSelector, useDispatch } from "react-redux"; 
import { addProject } from "../features/workspaceSlice"; 
import toast from "react-hot-toast";
require('dotenv').config();

const base_url = process.env.BASE_URL;

const CreateProjectDialog = ({ isDialogOpen, setIsDialogOpen }) => {
    const dispatch = useDispatch(); 
    const { currentWorkspace } = useSelector((state) => state.workspace);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "PLANNING",
        priority: "MEDIUM",
        start_date: "",
        end_date: "",
        team_members: [],
        team_lead: "",
        progress: 0,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!currentWorkspace?._id) {
            return toast.error("Please select a workspace first");
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${base_url}/api/projects`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    ...formData, 
                    workspaceId: currentWorkspace._id 
                }),
            });

            const data = await response.json();

            if (response.ok) {
                dispatch(addProject(data)); 
                toast.success("Project created successfully!");
                setIsDialogOpen(false);
                setFormData({
                    name: "", description: "", status: "PLANNING",
                    priority: "MEDIUM", start_date: "", end_date: "",
                    team_members: [], team_lead: "", progress: 0
                });
            } else {
                toast.error(data.error || "Failed to create project");
            }
        } catch (err) {
            console.error("Project creation error:", err);
            toast.error("Server error. Is your backend running?");
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeTeamMember = (email) => {
        setFormData((prev) => ({ 
            ...prev, 
            team_members: prev.team_members.filter(m => m !== email) 
        }));
    };

    if (!isDialogOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-lg text-zinc-900 dark:text-zinc-200 relative shadow-2xl animate-in zoom-in duration-200">
                <button 
                    className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition" 
                    onClick={() => setIsDialogOpen(false)}
                >
                    <XIcon className="size-5" />
                </button>

                <h2 className="text-xl font-bold mb-1">Create New Project</h2>
                {currentWorkspace && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                        In workspace: <span className="text-blue-600 font-medium">{currentWorkspace.name}</span>
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Project Name */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Project Name</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter project name" className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition" required />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe your project" className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm h-24 resize-none" />
                    </div>

                    {/* Status & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm outline-none" >
                                <option value="PLANNING">Planning</option>
                                <option value="ACTIVE">Active</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="ON_HOLD">On Hold</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Priority</label>
                            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm outline-none" >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Start Date</label>
                            <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">End Date</label>
                            <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} min={formData.start_date} className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm outline-none" />
                        </div>
                    </div>

                    {/* Project Lead */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Project Lead</label>
                        <select 
                            value={formData.team_lead} 
                            onChange={(e) => setFormData({ 
                                ...formData, 
                                team_lead: e.target.value, 
                                team_members: e.target.value ? [...new Set([...formData.team_members, e.target.value])] : formData.team_members, 
                            })} 
                            className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm outline-none"
                        >
                            <option value="">Select a Lead</option>
                            {currentWorkspace?.members?.map((member) => (
                                <option key={member.user?._id || member.user?.email} value={member.user?.email}>
                                    {member.user?.name || member.user?.email}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Team Members */}
                    <div> 
                        <label className="block text-sm font-medium mb-1">Team Members</label>
                        <select 
                            className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm outline-none"
                            onChange={(e) => {
                                if (e.target.value && !formData.team_members.includes(e.target.value)) {
                                    setFormData((prev) => ({ ...prev, team_members: [...prev.team_members, e.target.value] }));
                                }
                            }}
                        >
                            <option value="">Add Members</option>
                            {currentWorkspace?.members?.filter((m) => !formData.team_members.includes(m.user?.email)).map((m) => (
                                <option key={m.user?._id} value={m.user?.email}>{m.user?.email}</option>
                            ))}
                        </select>
                        {formData.team_members.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {formData.team_members.map((email) => (
                                    <div key={email} className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded text-xs border border-blue-200 dark:border-blue-800">
                                        {email}
                                        <button type="button" onClick={() => removeTeamMember(email)} className="ml-1 hover:text-red-500">
                                            <XIcon className="size-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-6 sticky bottom-0 bg-white dark:bg-zinc-950">
                        <button type="button" onClick={() => setIsDialogOpen(false)} className="px-5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition" >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting || !currentWorkspace} 
                            className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/20 transition" 
                        >
                            {isSubmitting ? "Creating..." : "Create Project"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    ); 
};

export default CreateProjectDialog;