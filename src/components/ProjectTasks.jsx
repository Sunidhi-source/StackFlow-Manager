import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteTask, updateTask } from '../features/workspaceSlice';
import { Bug, CalendarIcon, GitCommit, MessageSquare, Square, Trash, XIcon, Zap } from 'lucide-react';
import { TaskRowSkeleton } from './SkeletonLoader';
import api from '../utils/api';

const typeIcons = {
  BUG: { icon: Bug, color: 'text-red-600 dark:text-red-400' },
  FEATURE: { icon: Zap, color: 'text-blue-600 dark:text-blue-400' },
  TASK: { icon: Square, color: 'text-green-600 dark:text-green-400' },
  IMPROVEMENT: { icon: GitCommit, color: 'text-purple-600 dark:text-purple-400' },
  OTHER: { icon: MessageSquare, color: 'text-amber-600 dark:text-amber-400' },
};

const priorityTexts = {
  LOW: { background: 'bg-red-100 dark:bg-red-950', prioritycolor: 'text-red-600 dark:text-red-400' },
  MEDIUM: { background: 'bg-blue-100 dark:bg-blue-950', prioritycolor: 'text-blue-600 dark:text-blue-400' },
  HIGH: { background: 'bg-emerald-100 dark:bg-emerald-950', prioritycolor: 'text-emerald-600 dark:text-emerald-400' },
};

const ProjectTasks = ({ tasks, projectId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  const [filters, setFilters] = useState({ status: '', type: '', priority: '', assignee: '' });

  const assigneeList = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.assignee?.name).filter(Boolean))),
    [tasks]
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const { status, type, priority, assignee } = filters;
      return (
        (!status || task.status === status) &&
        (!type || task.type === type) &&
        (!priority || task.priority === priority) &&
        (!assignee || task.assignee?.name === assignee)
      );
    });
  }, [filters, tasks]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = async (task, newStatus) => {
    setUpdatingId(task._id);
    try {
      const updated = await api.put(`/api/tasks/${task._id}`, { ...task, status: newStatus });
      dispatch(updateTask({ ...updated, projectId }));
      toast.success('Status updated');
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm('Delete selected tasks?');
    if (!confirm) return;
    try {
      await Promise.all(
        selectedTasks.map((taskId) => api.delete(`/api/tasks/${taskId}`))
      );
      selectedTasks.forEach((taskId) => dispatch(deleteTask({ taskId, projectId })));
      setSelectedTasks([]);
      toast.success(`${selectedTasks.length} task(s) deleted`);
    } catch {
      toast.error('Failed to delete tasks');
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        {['status', 'type', 'priority', 'assignee'].map((name) => {
          const options = {
            status: [{ label: 'All Statuses', value: '' }, { label: 'To Do', value: 'TODO' }, { label: 'In Progress', value: 'IN_PROGRESS' }, { label: 'Done', value: 'DONE' }],
            type: [{ label: 'All Types', value: '' }, { label: 'Task', value: 'TASK' }, { label: 'Bug', value: 'BUG' }, { label: 'Feature', value: 'FEATURE' }, { label: 'Improvement', value: 'IMPROVEMENT' }],
            priority: [{ label: 'All Priorities', value: '' }, { label: 'Low', value: 'LOW' }, { label: 'Medium', value: 'MEDIUM' }, { label: 'High', value: 'HIGH' }],
            assignee: [{ label: 'All Assignees', value: '' }, ...assigneeList.map((n) => ({ label: n, value: n }))],
          };
          return (
            <select key={name} name={name} onChange={handleFilterChange} className="border not-dark:bg-white border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 outline-none px-3 py-1 rounded text-sm text-zinc-900 dark:text-zinc-200">
              {options[name].map((opt, idx) => <option key={idx} value={opt.value}>{opt.label}</option>)}
            </select>
          );
        })}
        {(filters.status || filters.type || filters.priority || filters.assignee) && (
          <button onClick={() => setFilters({ status: '', type: '', priority: '', assignee: '' })} className="px-3 py-1 flex items-center gap-2 rounded bg-purple-500 text-white text-sm">
            <XIcon className="size-3" /> Reset
          </button>
        )}
        {selectedTasks.length > 0 && (
          <button onClick={handleDelete} className="px-3 py-1 flex items-center gap-2 rounded bg-red-500 text-white text-sm">
            <Trash className="size-3" /> Delete ({selectedTasks.length})
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-lg lg:border border-zinc-300 dark:border-zinc-800">
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full text-sm text-left not-dark:bg-white text-zinc-900 dark:text-zinc-300">
            <thead className="text-xs uppercase dark:bg-zinc-800/70 text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="pl-2 pr-1">
                  <input type="checkbox" className="size-3" onChange={() => selectedTasks.length === tasks.length ? setSelectedTasks([]) : setSelectedTasks(tasks.map((t) => t._id))} checked={selectedTasks.length === tasks.length && tasks.length > 0} />
                </th>
                <th className="px-4 pl-0 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assignee</th>
                <th className="px-4 py-3">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length > 0 ? filteredTasks.map((task) => {
                const { icon: Icon, color } = typeIcons[task.type] || {};
                const { background, prioritycolor } = priorityTexts[task.priority] || {};
                return (
                  <tr key={task._id} onClick={() => navigate(`/taskDetails?projectId=${task.projectId}&taskId=${task._id}`)} className="border-t border-zinc-300 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all cursor-pointer">
                    <td onClick={(e) => e.stopPropagation()} className="pl-2 pr-1">
                      <input type="checkbox" className="size-3" onChange={() => selectedTasks.includes(task._id) ? setSelectedTasks(selectedTasks.filter((i) => i !== task._id)) : setSelectedTasks((prev) => [...prev, task._id])} checked={selectedTasks.includes(task._id)} />
                    </td>
                    <td className="px-4 pl-0 py-2 font-medium">{task.title}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        {Icon && <Icon className={`size-4 ${color}`} />}
                        <span className={`uppercase text-xs ${color}`}>{task.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-2 py-1 rounded ${background} ${prioritycolor}`}>{task.priority}</span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()} className="px-4 py-2">
                      <select
                        onChange={(e) => handleStatusChange(task, e.target.value)}
                        value={task.status}
                        disabled={updatingId === task._id}
                        className="outline-none px-2 pr-4 py-1 rounded text-sm cursor-pointer dark:bg-zinc-800 dark:text-zinc-200 disabled:opacity-50"
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        {task.assignee?.image && <img src={task.assignee.image} className="size-5 rounded-full" alt="avatar" />}
                        {task.assignee?.name || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      {task.due_date ? (
                        <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                          <CalendarIcon className="size-4" />
                          {format(new Date(task.due_date), 'dd MMM')}
                        </div>
                      ) : '—'}
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="7" className="text-center text-zinc-500 py-8">No tasks found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card view */}
        <div className="lg:hidden flex flex-col gap-4">
          {filteredTasks.map((task) => {
            const { icon: Icon, color } = typeIcons[task.type] || {};
            const { background, prioritycolor } = priorityTexts[task.priority] || {};
            return (
              <div key={task._id} onClick={() => navigate(`/taskDetails?projectId=${task.projectId}&taskId=${task._id}`)} className="dark:bg-zinc-800/70 border border-zinc-300 dark:border-zinc-800 rounded-lg p-4 flex flex-col gap-2 cursor-pointer">
                <div className="flex justify-between"><h3 className="text-sm font-semibold">{task.title}</h3></div>
                <div className="flex items-center gap-2 text-xs"><span className={`${background} ${prioritycolor} px-2 py-0.5 rounded`}>{task.priority}</span><span className={`uppercase ${color}`}>{task.type}</span></div>
                <select onChange={(e) => handleStatusChange(task, e.target.value)} value={task.status} onClick={(e) => e.stopPropagation()} className="w-full mt-1 bg-zinc-100 dark:bg-zinc-800 outline-none px-2 py-1 rounded text-sm">
                  <option value="TODO">To Do</option><option value="IN_PROGRESS">In Progress</option><option value="DONE">Done</option>
                </select>
                <div className="flex items-center gap-2 text-sm">
                  {task.assignee?.image && <img src={task.assignee.image} className="size-5 rounded-full" alt="avatar" />}
                  {task.assignee?.name || '—'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectTasks;
