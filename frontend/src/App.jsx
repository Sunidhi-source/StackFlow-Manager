import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { setWorkspaces, setCurrentWorkspace } from './features/workspaceSlice';
import { SocketProvider } from './context/SocketContext';
import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Team from './pages/Team';
import ProjectDetails from './pages/ProjectDetails';
import TaskDetails from './pages/TaskDetails';
import Auth from './pages/Auth';
import Profile from './components/Profile';
import Settings from './components/Settings';
import JoinWorkspace from './components/JoinWorkspace';
import WorkspaceSettings from './pages/WSettings';
import api from './utils/api';

const App = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (!user || !token) return;
    const userId = user._id || user.id;
    api.get(`/api/workspaces/owner/${userId}`)
      .then((data) => {
        if (Array.isArray(data)) {
          dispatch(setWorkspaces(data));
          if (data.length > 0) dispatch(setCurrentWorkspace(data[0]._id));
        }
      })
      .catch(console.error);
  }, [dispatch, user, token]);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <SocketProvider><Layout /></SocketProvider> : <Navigate to="/auth" />}>
          <Route index element={<Dashboard />} />
          <Route path="team" element={<Team />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projectsDetail" element={<ProjectDetails />} />
          <Route path="taskDetails" element={<TaskDetails />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="join-workspace" element={<JoinWorkspace />} />
          <Route path="settings/workspace" element={<WorkspaceSettings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

export default App;
