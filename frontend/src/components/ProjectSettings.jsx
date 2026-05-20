import { format } from "date-fns";
import { Plus, Save, Trash2, AlertOctagon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import AddProjectMember from "./AddProjectMember";
import { deleteProjectFromState } from "../features/workspaceSlice"; 
import toast from "react-hot-toast";
  const base_url = import.meta.env.VITE_BASE_URL;

export default function ProjectSettings({ project }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "PLANNING",
        priority: "MEDIUM",
        start_date: null,
        end_date: null,
        progress: 0,
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || "",
                description: project.description || "",
                status: project.status || "PLANNING",
                priority: project.priority || "MEDIUM",
                start_date: project.start_date ? new Date(project.start_date) : null,
                end_date: project.end_date ? new Date(project.end_date) : null,
                progress: project.progress || 0,
            });
        }
    }, [project]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch(`${base_url}/api/projects/${project._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success("Project updated successfully!");
            } else {
                toast.error("Failed to update project.");
            }
        } catch (err) {
            toast.error("Server connection error.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 🔹 Professional Delete Logic
    const handleDeleteProject = async () => {
        const confirmName = window.prompt(`To delete, type the project name: "${project.name}"`);

        if (confirmName === project.name) {
            setIsDeleting(true);
            try {
                const response = await fetch(`${base_url}/api/projects/${project._id}`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    dispatch(deleteProjectFromState(project._id)); 
                    toast.success("Project permanently deleted");
                    navigate("/dashboard"); 
                } else {
                    toast.error("Failed to delete project");
                }
            } catch (err) {
                toast.error("Connection error");
            } finally {
                setIsDeleting(false);
            }
        } else if (confirmName !== null) {
            toast.error("Project name mismatch. Deletion cancelled.");
        }
    };

    if (!project) return null;

    const inputClasses = "w-full px-3 py-2 rounded mt-2 border text-sm dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-300 outline-none focus:border-blue-500";
    const cardClasses = "rounded-xl border p-6 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm";
    const labelClasses = "text-xs font-bold text-zinc-500 uppercase tracking-wider";

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Project Details Form */}
                <div className={cardClasses}>
                    <h2 className="text-lg font-bold mb-6 text-zinc-900 dark:text-white">Project Details</h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className={labelClasses}>Project Name</label>
                            <input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={inputClasses}
                            />
                        </div>

                        <div>
                            <label className={labelClasses}>Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className={inputClasses + " h-24 resize-none"}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className={inputClasses}
                                >
                                    <option value="PLANNING">Planning</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="ON_HOLD">On Hold</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Priority</label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className={inputClasses}
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-50"
                            >
                                <Save size={18} />
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Team Members List */}
                <div className={cardClasses}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                            Team Members ({project?.team_members?.length || 0})
                        </h2>
                        <button
                            type="button"
                            onClick={() => setIsDialogOpen(true)}
                            className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    <div className="space-y-3 h-[320px] overflow-y-auto no-scrollbar">
                        {project?.team_members?.length > 0 ? (
                            project.team_members.map((email, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white font-bold">
                                            {email.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                            {email}
                                        </span>
                                    </div>
                                    {project.team_lead === email && (
                                        <span className="text-[10px] font-bold uppercase px-2 py-1 bg-amber-100 text-amber-700 rounded-md border border-amber-200">
                                            Lead
                                        </span>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-zinc-400 text-center py-4 italic">No members added yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* 🛑 DANGER ZONE */}
            <div className="rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/10 p-6 overflow-hidden relative">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex gap-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-full h-fit">
                            <AlertOctagon className="text-red-600 dark:text-red-400 size-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Danger Zone</h3>
                            <p className="text-sm text-red-600/80 dark:text-zinc-400 max-w-md">
                                Deleting this project will permanently remove all tasks, team assignments, and associated data. This action cannot be undone.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleDeleteProject}
                        disabled={isDeleting}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition shadow-lg shadow-red-500/20 disabled:opacity-50"
                    >
                        <Trash2 size={18} />
                        {isDeleting ? "Deleting..." : "Delete Project"}
                    </button>
                </div>
            </div>

            <AddProjectMember
                isDialogOpen={isDialogOpen}
                setIsDialogOpen={setIsDialogOpen}
            />
        </div>
    );
}