import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { addTask, updateTask, deleteTask, addProject, updateProject, deleteProjectFromState } from '../features/workspaceSlice';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const dispatch = useDispatch();
  const currentWorkspace = useSelector((state) => state.workspace.currentWorkspace);
  const user = useSelector((state) => state.auth.user);

  const base_url = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!user) return;

    const socket = io(base_url, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('🔌 Socket connected');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Task events
    socket.on('task:created', (task) => {
      dispatch(addTask(task));
      toast.success(`New task: "${task.title}"`, { icon: '📋' });
    });

    socket.on('task:updated', (task) => {
      dispatch(updateTask(task));
    });

    socket.on('task:deleted', ({ taskId, projectId }) => {
      dispatch(deleteTask({ taskId, projectId }));
    });

    // Project events
    socket.on('project:created', (project) => {
      dispatch(addProject(project));
      toast.success(`New project: "${project.name}"`, { icon: '🚀' });
    });

    socket.on('project:updated', (project) => {
      dispatch(updateProject(project));
    });

    socket.on('project:deleted', (projectId) => {
      dispatch(deleteProjectFromState(projectId));
    });

    return () => {
      socket.disconnect();
    };
  }, [user, dispatch, base_url]);

  // Auto-join workspace room when workspace changes
  useEffect(() => {
    if (socketRef.current && currentWorkspace?._id) {
      socketRef.current.emit('join_workspace', currentWorkspace._id);
    }
  }, [currentWorkspace?._id]);

  const joinProjectRoom = (projectId) => {
    socketRef.current?.emit('join_project', projectId);
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected, joinProjectRoom }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
