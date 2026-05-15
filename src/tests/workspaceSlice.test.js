import { describe, it, expect } from 'vitest';
import reducer, {
  setWorkspaces,
  addProject,
  addTask,
  updateTask,
  deleteTask,
  deleteProjectFromState,
} from '../features/workspaceSlice';

const mockWorkspace = {
  _id: 'ws1',
  name: 'Test Workspace',
  projects: [],
  members: [],
};

const mockProject = {
  _id: 'p1',
  name: 'Test Project',
  status: 'ACTIVE',
  tasks: [],
};

const mockTask = {
  _id: 't1',
  title: 'Fix login bug',
  status: 'TODO',
  priority: 'HIGH',
  projectId: 'p1',
};

describe('workspaceSlice', () => {
  it('should return initial state', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state.workspaces).toEqual([]);
    expect(state.currentWorkspace).toBeNull();
  });

  it('setWorkspaces should populate workspaces', () => {
    const state = reducer(undefined, setWorkspaces([mockWorkspace]));
    expect(state.workspaces).toHaveLength(1);
    expect(state.currentWorkspace._id).toBe('ws1');
  });

  it('addProject should add a project to currentWorkspace', () => {
    const initial = { workspaces: [mockWorkspace], currentWorkspace: { ...mockWorkspace }, loading: false };
    const state = reducer(initial, addProject(mockProject));
    expect(state.currentWorkspace.projects).toHaveLength(1);
    expect(state.currentWorkspace.projects[0]._id).toBe('p1');
  });

  it('addTask should add a task to the correct project', () => {
    const wsWithProject = { ...mockWorkspace, projects: [{ ...mockProject }] };
    const initial = { workspaces: [wsWithProject], currentWorkspace: wsWithProject, loading: false };
    const state = reducer(initial, addTask(mockTask));
    expect(state.currentWorkspace.projects[0].tasks).toHaveLength(1);
    expect(state.currentWorkspace.projects[0].tasks[0]._id).toBe('t1');
  });

  it('updateTask should update task status', () => {
    const taskInProject = { ...mockProject, tasks: [mockTask] };
    const ws = { ...mockWorkspace, projects: [taskInProject] };
    const initial = { workspaces: [ws], currentWorkspace: ws, loading: false };
    const updated = { ...mockTask, status: 'DONE' };
    const state = reducer(initial, updateTask(updated));
    expect(state.currentWorkspace.projects[0].tasks[0].status).toBe('DONE');
  });

  it('deleteTask should remove the task', () => {
    const taskInProject = { ...mockProject, tasks: [mockTask] };
    const ws = { ...mockWorkspace, projects: [taskInProject] };
    const initial = { workspaces: [ws], currentWorkspace: ws, loading: false };
    const state = reducer(initial, deleteTask({ taskId: 't1', projectId: 'p1' }));
    expect(state.currentWorkspace.projects[0].tasks).toHaveLength(0);
  });

  it('deleteProjectFromState should remove the project', () => {
    const ws = { ...mockWorkspace, projects: [mockProject] };
    const initial = { workspaces: [ws], currentWorkspace: ws, loading: false };
    const state = reducer(initial, deleteProjectFromState('p1'));
    expect(state.currentWorkspace.projects).toHaveLength(0);
  });
});
