import { describe, it, expect, beforeEach } from 'vitest';
import reducer, { loginSuccess, loginFailure, logout, updateUser } from '../features/authSlice';

const mockUserPayload = {
  user: { _id: 'u1', name: 'Sunidhi', email: 'sunidhi@test.com' },
  token: 'mock.jwt.token',
};

describe('authSlice', () => {
  it('should return default initial state', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('loginSuccess should set user and token', () => {
    const state = reducer(undefined, loginSuccess(mockUserPayload));
    expect(state.user._id).toBe('u1');
    expect(state.token).toBe('mock.jwt.token');
    expect(state.loading).toBe(false);
  });

  it('loginFailure should set error message', () => {
    const state = reducer(undefined, loginFailure('Invalid credentials'));
    expect(state.error).toBe('Invalid credentials');
    expect(state.loading).toBe(false);
  });

  it('logout should clear user and token', () => {
    const loggedIn = reducer(undefined, loginSuccess(mockUserPayload));
    const state = reducer(loggedIn, logout());
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('updateUser should merge user fields', () => {
    const loggedIn = reducer(undefined, loginSuccess(mockUserPayload));
    const state = reducer(loggedIn, updateUser({ name: 'Sunidhi Sharma' }));
    expect(state.user.name).toBe('Sunidhi Sharma');
    expect(state.user._id).toBe('u1');
  });
});
