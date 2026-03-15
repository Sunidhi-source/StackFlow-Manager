import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    ArrowLeftIcon,
    PlusIcon,
    SettingsIcon,
    BarChart3Icon,
    CalendarIcon,
    FileStackIcon,
} from "lucide-react";

import ProjectAnalytics from "../components/ProjectAnalytics";
import ProjectSettings from "../components/ProjectSettings";
import CreateTaskDialog from "../components/CreateTaskDialog";
import ProjectCalendar from "../components/ProjectCalendar";
import ProjectTasks from "../components/ProjectTasks";

export default function ProjectDetail() {

    const [searchParams, setSearchParams] = useSearchParams();
    const id = searchParams.get("id");
    const tab = searchParams.get("tab");

    const navigate = useNavigate();

    const projects = useSelector(
        (state) => state?.workspace?.currentWorkspace?.projects || []
    );

    const [showCreateTask, setShowCreateTask] = useState(false);
    const [activeTab, setActiveTab] = useState(tab || "tasks");

    const project = useMemo(() => {
        if (!id) return null;
        return projects.find(
            (p) => p._id?.toString() === id?.toString()
        ) || null;
    }, [projects, id]);

    const tasks = project?.tasks || [];

    const statusColors = {
        PLANNING: "bg-zinc-200 text-zinc-900 dark:bg-zinc-600 dark:text-zinc-200",
        ACTIVE: "bg-emerald-200 text-emerald-900 dark:bg-emerald-500 dark:text-emerald-900",
        ON_HOLD: "bg-amber-200 text-amber-900 dark:bg-amber-500 dark:text-amber-900",
        COMPLETED: "bg-blue-200 text-blue-900 dark:bg-blue-500 dark:text-blue-900",
        CANCELLED: "bg-red-200 text-red-900 dark:bg-red-500 dark:text-red-900",
    };

    if (!projects) {
        return (
            <div className="p-6 text-center">
                <p>Loading project...</p>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="p-6 text-center">
                <p className="text-3xl mt-40 mb-10">
                    Project not found
                </p>
                <button
                    onClick={() => navigate("/projects")}
                    className="px-4 py-2 rounded bg-zinc-200"
                >
                    Back to Projects
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-5 max-w-6xl mx-auto">

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate("/projects")}>
                        <ArrowLeftIcon className="w-4 h-4" />
                    </button>

                    <h1 className="text-xl font-medium">
                        {project.name}
                    </h1>

                    <span className={`px-2 py-1 rounded text-xs ${statusColors[project.status]}`}>
                        {project.status.replace("_", " ")}
                    </span>
                </div>

                <button
                    onClick={() => setShowCreateTask(true)}
                    className="flex items-center gap-2 px-5 py-2 text-sm rounded bg-blue-600 text-white"
                >
                    <PlusIcon className="size-4" />
                    New Task
                </button>
            </div>

            <div className="flex gap-2 border rounded p-1">
                {[
                    { key: "tasks", label: "Tasks", icon: FileStackIcon },
                    { key: "calendar", label: "Calendar", icon: CalendarIcon },
                    { key: "analytics", label: "Analytics", icon: BarChart3Icon },
                    { key: "settings", label: "Settings", icon: SettingsIcon },
                ].map((tabItem) => (
                    <button
                        key={tabItem.key}
                        onClick={() => {
                            setActiveTab(tabItem.key);
                            setSearchParams({ id, tab: tabItem.key });
                        }}
                        className={`px-4 py-2 text-sm ${activeTab === tabItem.key ? "bg-zinc-200" : ""}`}
                    >
                        {tabItem.label}
                    </button>
                ))}
            </div>

            <div className="mt-6">
                {activeTab === "tasks" && (
                    <ProjectTasks tasks={tasks} />
                )}
                {activeTab === "analytics" && (
                    <ProjectAnalytics tasks={tasks} project={project} />
                )}
                {activeTab === "calendar" && (
                    <ProjectCalendar tasks={tasks} />
                )}
                {activeTab === "settings" && (
                    <ProjectSettings project={project} />
                )}
            </div>

            {showCreateTask && (
                <CreateTaskDialog
                    showCreateTask={showCreateTask}
                    setShowCreateTask={setShowCreateTask}
                    projectId={id}
                />
            )}
        </div>
    );
}