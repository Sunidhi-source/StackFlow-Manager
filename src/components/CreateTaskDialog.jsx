import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { addTask } from "../features/workspaceSlice"; 

export default function CreateTaskDialog({ showCreateTask, setShowCreateTask, projectId }) {
    const dispatch = useDispatch();
    
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);
    const project = currentWorkspace?.projects.find((p) => p._id === projectId);
    
    const teamMembers = project?.team_members || [];

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "TASK",
        status: "TODO",
        priority: "MEDIUM",
        assignee: "",
        due_date: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title.trim()) return toast.error("Title is required");

        setIsSubmitting(true);
        try {
            const response = await fetch(`http://localhost:5000/api/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    projectId: projectId 
                }),
            });

            const data = await response.json();

            if (response.ok) {
                dispatch(addTask(data)); 
                
                toast.success("Task created successfully!");
                setShowCreateTask(false);
                
                setFormData({
                    title: "",
                    description: "",
                    type: "TASK",
                    status: "TODO",
                    priority: "MEDIUM",
                    assignee: "",
                    due_date: "",
                });
            } else {
                toast.error(data.error || "Failed to create task");
            }
        } catch (err) {
            toast.error("Server connection error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!showCreateTask) return null;

    const inputClasses = "w-full rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-zinc-900 dark:text-zinc-200 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden animate-in zoom-in-95 duration-200">
                <h2 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white">Create New Task</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Title</label>
                        <input 
                            value={formData.title} 
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                            placeholder="e.g., Fix Navigation Bug" 
                            className={inputClasses} 
                            required 
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Description</label>
                        <textarea 
                            value={formData.description} 
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                            placeholder="Briefly describe the objective..." 
                            className={inputClasses + " h-20 resize-none"} 
                        />
                    </div>

                    {/* Type & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Type</label>
                            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className={inputClasses}>
                                <option value="TASK">Task</option>
                                <option value="BUG">Bug</option>
                                <option value="FEATURE">Feature</option>
                                <option value="IMPROVEMENT">Improvement</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Priority</label>
                            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className={inputClasses}>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>

                    {/* Assignee and Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Assignee</label>
                            <select value={formData.assignee} onChange={(e) => setFormData({ ...formData, assignee: e.target.value })} className={inputClasses}>
                                <option value="">Unassigned</option>
                                {teamMembers.map((email, idx) => (
                                    <option key={idx} value={email}>{email}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputClasses}>
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="DONE">Done</option>
                            </select>
                        </div>
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Due Date</label>
                        <div className="relative">
                            <input 
                                type="date" 
                                value={formData.due_date} 
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} 
                                min={new Date().toISOString().split('T')[0]} 
                                className={inputClasses} 
                            />
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button 
                            type="button" 
                            onClick={() => setShowCreateTask(false)} 
                            className="px-5 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="px-6 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? "Creating..." : "Create Task"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}