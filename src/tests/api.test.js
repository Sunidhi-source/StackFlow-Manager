import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
global.localStorage = {
  getItem: vi.fn(() => 'test-token'),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

// Re-import api after mocks are in place
const { default: api } = await import('../utils/api.js');

describe('api utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET requests include Authorization header', async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => ({ ok: true }) });
    await api.get('/api/health');
    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers['Authorization']).toBe('Bearer test-token');
  });

  it('POST requests send JSON body', async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => ({ _id: 'task1' }) });
    await api.post('/api/tasks', { title: 'Test Task' });
    const [, options] = mockFetch.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body).title).toBe('Test Task');
  });

  it('DELETE requests use DELETE method', async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => ({ message: 'deleted' }) });
    await api.delete('/api/tasks/123');
    const [, options] = mockFetch.mock.calls[0];
    expect(options.method).toBe('DELETE');
  });
});
