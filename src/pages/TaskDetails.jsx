import { format } from "date-fns";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarIcon, MessageCircle, PenIcon } from "lucide-react";
 const base_url = import.meta.env.VITE_BASE_URL;;


const TaskDetails = () => {
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get("projectId");
    const taskId = searchParams.get("taskId");

    const { user } = useSelector((state) => state.auth); 
    const { currentWorkspace } = useSelector((state) => state.workspace);

    const [task, setTask] = useState(null);
    const [project, setProject] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchComments = async () => {
        try {
            const response = await fetch(`${base_url}/api/tasks/${taskId}/comments`);
            if (response.ok) {
                const data = await response.json();
                setComments(data);
            }
        } catch (err) {
            console.error("Error loading comments:", err);
        }
    };

    const fetchTaskDetails = async () => {
        setLoading(true);
        if (!projectId || !taskId || !currentWorkspace) return;

        const proj = currentWorkspace.projects.find((p) => p._id === projectId);
        if (!proj) return;

        const tsk = proj.tasks.find((t) => t._id === taskId);
        if (!tsk) return;

        setTask(tsk);
        setProject(proj);
        setLoading(false);
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            toast.loading("Posting...");
            const response = await fetch(`${base_url}/api/tasks/${taskId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    content: newComment, 
                    userId: user?._id,
                    userName: user?.name || "User",
                    userAvatar: user?.image || ""
                }),
            });

            if (response.ok) {
                const savedComment = await response.json();
                setComments((prev) => [...prev, savedComment]); // Update UI instantly
                setNewComment("");
                toast.success("Comment added.");
            }
        } catch (error) {
            toast.error("Failed to connect to server.");
        } finally {
            toast.dismissAll();
        }
    };

    useEffect(() => { fetchTaskDetails(); }, [taskId, currentWorkspace]);

    useEffect(() => {
        if (taskId) {
            fetchComments();
            const interval = setInterval(() => { fetchComments(); }, 10000);
            return () => clearInterval(interval);
        }
    }, [taskId]);

    if (loading) return <div className="p-10 text-center text-zinc-500">Connecting to StackFlow...</div>;
    if (!task) return <div className="p-10 text-center text-red-500 font-bold">Task not found!</div>;

    return (
        <div className="flex flex-col-reverse lg:flex-row gap-6 p-4 max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Discussion Column */}
            <div className="w-full lg:w-2/3">
                <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col h-[70vh]">
                    <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                        <MessageCircle className="size-5 text-blue-500" /> Discussion ({comments.length})
                    </h2>

                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 mb-6">
                        {comments.map((comment) => (
                            <div key={comment._id} className={`flex flex-col ${comment.userId === user?._id ? "items-end" : "items-start"}`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl border ${
                                    comment.userId === user?._id 
                                    ? "bg-blue-600 text-white border-blue-500" 
                                    : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                                }`}>
                                    <div className="flex items-center gap-2 mb-2 text-[10px] opacity-70">
                                        <span className="font-bold uppercase tracking-wider">{comment.userName}</span>
                                        <span>• {format(new Date(comment.createdAt), "hh:mm a")}</span>
                                    </div>
                                    <p className="text-sm">{comment.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            rows={2}
                        />
                        <button onClick={handleAddComment} className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl font-bold transition-all self-end h-12">
                            Send
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar Column */}
            <div className="w-full lg:w-1/3 space-y-6">
                <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h1 className="text-xl font-bold mb-4">{task.title}</h1>
                    <div className="flex flex-wrap gap-2 mb-6">
                        <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-zinc-100 dark:bg-zinc-800">{task.status}</span>
                        <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600">{task.priority}</span>
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{task.description}</p>
                    <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                            <CalendarIcon size={14} className="text-zinc-400" />
                            <span>Due: {format(new Date(task.due_date), "MMM dd, yyyy")}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetails;