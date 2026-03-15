import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setWorkspaces } from "../features/workspaceSlice";

import StatsGrid from "../components/StatsGrid";
import ProjectOverview from "../components/ProjectOverview";
import RecentActivity from "../components/RecentActivity";
import TasksSummary from "../components/TasksSummary";
import CreateProjectDialog from "../components/CreateProjectDialog";

const Dashboard = () => {
  const dispatch = useDispatch();

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        if (!user?._id) return;

        const res = await fetch(
          `http://localhost:5000/api/workspaces/owner/${user._id}`
        );

        const data = await res.json();

        console.log("Workspace API Response:", data);

        dispatch(setWorkspaces(data));
      } catch (err) {
        console.error("Workspace fetch error:", err);
      }
    };

    fetchWorkspaces();
  }, [user, dispatch]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">
            Welcome back, {user?.name || "User"}
          </h1>
          <p className="text-gray-500 dark:text-zinc-400 text-sm">
            Here's what's happening with your projects today
          </p>
        </div>

        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2 px-5 py-2 text-sm rounded bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:opacity-90 transition"
        >
          <Plus size={16} />
          New Project
        </button>

        <CreateProjectDialog
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
        />
      </div>

      <StatsGrid />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <ProjectOverview />
          <RecentActivity />
        </div>
        <div>
          <TasksSummary />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;