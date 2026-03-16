import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./pages/Layout";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import ProjectDetails from "./pages/ProjectDetails";
import TaskDetails from "./pages/TaskDetails";
import Auth from "./pages/Auth"; 
import Profile from "./components/Profile"; 
import Settings from "./components/Settings";
import { setWorkspaces, setCurrentWorkspace } from "./features/workspaceSlice";
import JoinWorkspace from "./components/JoinWorkspace";
import WorkspaceSettings from "./pages/WSettings";
 
const App = () => {
    const dispatch = useDispatch();
     const base_url = import.meta.env.VITE_BASE_URL;
        const user = JSON.parse(localStorage.getItem("user"));
useEffect(() => {
    if (user) {
        const fetchOwnedWorkspaces = async () => {
            try {
                const response = await fetch(`${base_url}/api/workspaces/owner/${user.id || user._id}`);
                const data = await response.json();
                
                dispatch(setWorkspaces(data));
                
                if (data.length > 0) {
                    dispatch(setCurrentWorkspace(data[0]));
                }
            } catch (error) {
                console.error("Error fetching owned workspaces:", error);
            }
        };
        fetchOwnedWorkspaces();
    }
}, [dispatch, user]);

    return (
        <>
            <Toaster />
            <Routes>
                <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" />} />

                <Route path="/" element={user ? <Layout /> : <Navigate to="/auth" />} >
                    <Route index element={<Dashboard />} />
                    <Route path="team" element={<Team />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="projectsDetail" element={<ProjectDetails />} />
                    <Route path="taskDetails" element={<TaskDetails />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="join-workspace" element={<JoinWorkspace />} />
                    <Route path="/settings/workspace" element={<WorkspaceSettings />} />
                </Route>
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </>
    );
};

export default App;