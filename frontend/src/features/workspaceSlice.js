import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    workspaces: [],
    currentWorkspace: null,
    loading: false,
};

const workspaceSlice = createSlice({
    name: "workspace",
    initialState,
    reducers: {
        setWorkspaces: (state, action) => {
            state.workspaces = action.payload;
            const savedId = localStorage.getItem("currentWorkspaceId");
            if (savedId && action.payload.length > 0) {
                const found = action.payload.find((w) => w._id === savedId);
                state.currentWorkspace = found || action.payload[0];
            } else if (action.payload.length > 0) {
                state.currentWorkspace = action.payload[0];
            }
        },

        setCurrentWorkspace: (state, action) => {
            state.currentWorkspace = state.workspaces.find(
                (w) => w._id === action.payload
            );
            localStorage.setItem("currentWorkspaceId", action.payload);
        },

        addWorkspace: (state, action) => {
            state.workspaces.push(action.payload);
            state.currentWorkspace = action.payload;
            localStorage.setItem("currentWorkspaceId", action.payload._id);
        },

        updateWorkspace: (state, action) => {
            state.workspaces = state.workspaces.map((w) =>
                w._id === action.payload._id ? action.payload : w
            );
            if (state.currentWorkspace?._id === action.payload._id) {
                state.currentWorkspace = action.payload;
            }
        },

        deleteWorkspace: (state, action) => {
            state.workspaces = state.workspaces.filter(
                (w) => w._id !== action.payload
            );
            if (state.currentWorkspace?._id === action.payload) {
                state.currentWorkspace = state.workspaces[0] || null;
            }
        },

        addProject: (state, action) => {
            if (!state.currentWorkspace) return;
            state.currentWorkspace.projects.push(action.payload);
            state.workspaces = state.workspaces.map((w) =>
                w._id === state.currentWorkspace._id
                    ? { ...w, projects: [...w.projects, action.payload] }
                    : w
            );
        },

        updateProject: (state, action) => {
            const updatedProject = action.payload;
            if (!state.currentWorkspace) return;

            state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) =>
                p._id === updatedProject._id ? updatedProject : p
            );

            state.workspaces = state.workspaces.map((w) =>
                w._id === state.currentWorkspace._id
                    ? {
                          ...w,
                          projects: w.projects.map((p) =>
                              p._id === updatedProject._id ? updatedProject : p
                          ),
                      }
                    : w
            );
        },

        deleteProjectFromState: (state, action) => {
            const projectId = action.payload;
            if (!state.currentWorkspace) return;

            state.currentWorkspace.projects = state.currentWorkspace.projects.filter(
                (p) => p._id !== projectId
            );

            state.workspaces = state.workspaces.map((w) =>
                w._id === state.currentWorkspace._id
                    ? {
                          ...w,
                          projects: w.projects.filter((p) => p._id !== projectId),
                      }
                    : w
            );
        },

        addTask: (state, action) => {
                if (!state.currentWorkspace) return;

                const newTask = action.payload;
                const { projectId } = newTask;

                const project = state.currentWorkspace.projects.find((p) => p._id === projectId);

                if (project) {
                    if (!project.tasks) {
                        project.tasks = [];
                    }
                    
                    project.tasks.push(newTask);

                    state.workspaces = state.workspaces.map((w) =>
                        w._id === state.currentWorkspace._id ? state.currentWorkspace : w
                    );
                }
            },

        updateTask: (state, action) => {
            if (!state.currentWorkspace) return;
            const { projectId, _id } = action.payload;
            const updateProjects = (projects) =>
                projects.map((p) =>
                    p._id === projectId
                        ? {
                              ...p,
                              tasks: p.tasks.map((t) =>
                                  t._id === _id ? action.payload : t
                              ),
                          }
                        : p
                );
            state.currentWorkspace.projects = updateProjects(state.currentWorkspace.projects);
            state.workspaces = state.workspaces.map((w) =>
                w._id === state.currentWorkspace._id
                    ? { ...w, projects: updateProjects(w.projects) }
                    : w
            );
        },

        deleteTask: (state, action) => {
            if (!state.currentWorkspace) return;
            const { projectId, taskId } = action.payload;
            const updateProjects = (projects) =>
                projects.map((p) =>
                    p._id === projectId
                        ? {
                              ...p,
                              tasks: p.tasks.filter((t) => t._id !== taskId),
                          }
                        : p
                );
            state.currentWorkspace.projects = updateProjects(state.currentWorkspace.projects);
            state.workspaces = state.workspaces.map((w) =>
                w._id === state.currentWorkspace._id
                    ? { ...w, projects: updateProjects(w.projects) }
                    : w
            );
        },
    },
});

export const {
    setWorkspaces,
    setCurrentWorkspace,
    addWorkspace,
    updateWorkspace,
    deleteWorkspace,
    addProject,
    updateProject, 
    deleteProjectFromState, 
    addTask,
    updateTask,
    deleteTask,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;