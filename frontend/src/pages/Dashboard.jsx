import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setWorkspaces } from '../features/workspaceSlice';
import StatsGrid from '../components/StatsGrid';
import ProjectOverview from '../components/ProjectOverview';
import RecentActivity from '../components/RecentActivity';
import TasksSummary from '../components/TasksSummary';
import CreateProjectDialog from '../components/CreateProjectDialog';
import { StatsGridSkeleton } from '../components/SkeletonLoader';
import RealtimeIndicator from '../components/RealtimeIndicator';
import api from '../utils/api';

const Dashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id && !user?.id) return;
    const userId = user._id || user.id;

    const fetchWorkspaces = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/api/workspaces/owner/${userId}`);
        dispatch(setWorkspaces(Array.isArray(data) ? data : []));
      } catch (err) {
        console.error('Workspace fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, [user, dispatch]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">
            Welcome back, {user?.name || 'User'}
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-gray-500 dark:text-zinc-400 text-sm">
              Here&apos;s what&apos;s happening with your projects today
            </p>
            <RealtimeIndicator />
          </div>
        </div>

        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2 px-5 py-2 text-sm rounded bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:opacity-90 transition"
        >
          <Plus size={16} />
          New Project
        </button>

        <CreateProjectDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
      </div>

      {loading ? <StatsGridSkeleton /> : <StatsGrid />}

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
