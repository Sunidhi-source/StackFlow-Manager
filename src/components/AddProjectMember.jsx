import { useState, useMemo } from "react";
import { Mail, UserPlus, X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { updateTask } from '../features/workspaceSlice'; 
import toast from "react-hot-toast";
 
const base_url = import.meta.env.VITE_BASE_URL;;

const AddProjectMember = ({ isDialogOpen, setIsDialogOpen }) => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("id");

  // Get current workspace from Redux
  const currentWorkspace = useSelector(
    (state) => state.workspace?.currentWorkspace || null
  );

  // Find the specific project within the workspace
  const project = useMemo(() => {
    if (!currentWorkspace?.projects) return null;
    return currentWorkspace.projects.find((p) => p._id === projectId);
  }, [currentWorkspace, projectId]);

  // Extract existing project member emails
  const projectMembersEmails = useMemo(() => {
    return project?.team_members || []; 
  }, [project]);

  const [email, setEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) return toast.error("Please enter an email");
    if (!project?._id) return toast.error("Project not found");
    if (projectMembersEmails.includes(email.trim())) {
        return toast.error("Member is already in this project");
    }

    setIsAdding(true);

    try {
      const response = await fetch(
        `${base_url}/api/projects/${project._id}/add-member`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        dispatch(updateTask(data)); 
        toast.success("Member added successfully!");
        setIsDialogOpen(false);
        setEmail("");
      } else {
        toast.error(data.message || "Failed to add member");
      }
    } catch (err) {
      console.error("Connection error:", err);
      toast.error("Server connection failed. Is your backend running?");
    } finally {
      setIsAdding(false);
    }
  };

  if (!isDialogOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in zoom-in duration-200">
        
        <button 
            onClick={() => setIsDialogOpen(false)} 
            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
        >
            <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
            <UserPlus className="size-5 text-blue-500" /> Add Member to Project
          </h2>

          {project && (
            <p className="text-sm text-zinc-500 mt-1">
              Adding to: <span className="text-blue-600 font-medium">{project.name}</span>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Member Email Address
            </label>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address..."
                className="pl-10 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-zinc-900 dark:text-white"
                required
                autoFocus
              />
            </div>
            
            {currentWorkspace?.members?.length > 0 && (
                <p className="text-[10px] text-zinc-400 italic">
                    Tip: Enter an email from your "{currentWorkspace.name}" workspace.
                </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsDialogOpen(false)}
              className="flex-1 px-4 py-3 text-sm font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isAdding || !project || !email.trim()}
              className="flex-1 px-4 py-3 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition shadow-lg shadow-blue-500/20"
            >
              {isAdding ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectMember;