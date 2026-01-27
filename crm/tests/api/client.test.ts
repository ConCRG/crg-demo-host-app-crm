import { describe, it, expect, vi, beforeEach } from 'vitest';

// We test the ApiClient class by importing the module fresh
// and mocking global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Import after mocking
const { apiClient } = await import('../../src/api/client');

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('ApiClient', () => {
  describe('get', () => {
    it('sends GET request to correct URL', async () => {
      mockFetch.mockResolvedValue(jsonResponse({ data: [] }));

      await apiClient.get('/contacts');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/contacts',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('returns parsed JSON', async () => {
      mockFetch.mockResolvedValue(jsonResponse({ data: [{ id: '1' }], total: 1 }));

      const result = await apiClient.get('/contacts');
      expect(result).toEqual({ data: [{ id: '1' }], total: 1 });
    });
  });

  describe('post', () => {
    it('sends POST with JSON body', async () => {
      mockFetch.mockResolvedValue(jsonResponse({ id: '1', name: 'Test' }));

      await apiClient.post('/contacts', { firstName: 'John', lastName: 'Doe', email: 'j@d.com' });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/contacts',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ firstName: 'John', lastName: 'Doe', email: 'j@d.com' }),
        })
      );
    });
  });

  describe('put', () => {
    it('sends PUT with JSON body', async () => {
      mockFetch.mockResolvedValue(jsonResponse({ id: '1', name: 'Updated' }));

      await apiClient.put('/contacts/1', { firstName: 'Jane' });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/contacts/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ firstName: 'Jane' }),
        })
      );
    });
  });

  describe('patch', () => {
    it('sends PATCH with JSON body', async () => {
      mockFetch.mockResolvedValue(jsonResponse({ data: { stage: 'qualified' } }));

      await apiClient.patch('/deals/1/stage', { stage: 'qualified' });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/deals/1/stage',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ stage: 'qualified' }),
        })
      );
    });

    it('sends PATCH without body when none provided', async () => {
      mockFetch.mockResolvedValue(jsonResponse({ status: 'Completed' }));

      await apiClient.patch('/activities/1/complete');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/activities/1/complete',
        expect.objectContaining({ method: 'PATCH' })
      );
      // No body should be set
      const callArgs = mockFetch.mock.calls[0][1];
      expect(callArgs.body).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('sends DELETE request', async () => {
      mockFetch.mockResolvedValue(jsonResponse({ message: 'Deleted' }));

      await apiClient.delete('/contacts/1');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/contacts/1',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('error handling', () => {
    it('throws on non-OK response with error message', async () => {
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
      );

      await expect(apiClient.get('/contacts/missing')).rejects.toThrow('Not found');
    });

    it('throws on non-OK response with message field', async () => {
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify({ message: 'Validation failed' }), { status: 400 })
      );

      await expect(apiClient.post('/contacts', {})).rejects.toThrow('Validation failed');
    });

    it('throws generic error when response body is not JSON', async () => {
      mockFetch.mockResolvedValue(
        new Response('Internal Server Error', { status: 500 })
      );

      await expect(apiClient.get('/contacts')).rejects.toThrow('Unknown error');
    });
  });
});
