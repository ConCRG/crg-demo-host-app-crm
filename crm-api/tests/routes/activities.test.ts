import { describe, it, expect, beforeEach } from 'vitest';
import app from '../../src/index';
import { resetStores } from '../helpers';
import { activityStore } from '../../src/db/store';

const seedActivity = (overrides = {}) => ({
  id: 'act-1',
  type: 'Call' as const,
  subject: 'Follow-up call',
  notes: 'Discuss proposal',
  relatedTo: 'John Doe',
  relatedType: 'Contact' as const,
  relatedId: 'c-1',
  dueDate: '2024-02-01',
  completedDate: null,
  status: 'Pending' as const,
  assignedTo: 'admin',
  createdAt: '2024-01-15',
  ...overrides,
});

describe('Activities API', () => {
  beforeEach(() => {
    resetStores();
  });

  describe('GET /api/activities', () => {
    it('returns all activities', async () => {
      activityStore.seed([
        seedActivity(),
        seedActivity({ id: 'act-2', subject: 'Send email', type: 'Email' as const }),
      ]);

      const res = await app.request('/api/activities');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toHaveLength(2);
      expect(body.total).toBe(2);
    });

    it('filters by type', async () => {
      activityStore.seed([
        seedActivity(),
        seedActivity({ id: 'act-2', type: 'Email' as const }),
      ]);

      const res = await app.request('/api/activities?type=Call');
      const body = await res.json();
      expect(body.data).toHaveLength(1);
      expect(body.data[0].type).toBe('Call');
    });

    it('filters by status', async () => {
      activityStore.seed([
        seedActivity(),
        seedActivity({ id: 'act-2', status: 'Completed' as const }),
      ]);

      const res = await app.request('/api/activities?status=Pending');
      const body = await res.json();
      expect(body.data).toHaveLength(1);
      expect(body.data[0].status).toBe('Pending');
    });
  });

  describe('GET /api/activities/:id', () => {
    it('returns a single activity', async () => {
      activityStore.seed([seedActivity()]);

      const res = await app.request('/api/activities/act-1');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.subject).toBe('Follow-up call');
    });

    it('returns 404 for non-existent id', async () => {
      const res = await app.request('/api/activities/missing');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/activities', () => {
    it('creates an activity with valid data', async () => {
      const res = await app.request('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'Meeting', subject: 'Quarterly review', dueDate: '2024-03-01' }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.id).toBeDefined();
      expect(body.type).toBe('Meeting');
    });

    it('returns 400 when missing required fields', async () => {
      const res = await app.request('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'Call' }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/activities/:id', () => {
    it('updates an existing activity', async () => {
      activityStore.seed([seedActivity()]);

      const res = await app.request('/api/activities/act-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: 'Updated call' }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.subject).toBe('Updated call');
    });

    it('returns 404 for non-existent id', async () => {
      const res = await app.request('/api/activities/missing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: 'Test' }),
      });
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/activities/:id/complete', () => {
    it('marks activity as complete', async () => {
      activityStore.seed([seedActivity()]);

      const res = await app.request('/api/activities/act-1/complete', { method: 'PATCH' });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.status).toBe('Completed');
      expect(body.completedDate).toBeDefined();
    });

    it('returns 404 for non-existent id', async () => {
      const res = await app.request('/api/activities/missing/complete', { method: 'PATCH' });
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/activities/:id/incomplete', () => {
    it('marks activity as incomplete', async () => {
      activityStore.seed([seedActivity({ status: 'Completed' as const, completedDate: '2024-02-01' })]);

      const res = await app.request('/api/activities/act-1/incomplete', { method: 'PATCH' });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.status).not.toBe('Completed');
      expect(body.completedDate).toBeNull();
    });

    it('returns 404 for non-existent id', async () => {
      const res = await app.request('/api/activities/missing/incomplete', { method: 'PATCH' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/activities/:id', () => {
    it('deletes an activity', async () => {
      activityStore.seed([seedActivity()]);

      const res = await app.request('/api/activities/act-1', { method: 'DELETE' });
      expect(res.status).toBe(200);
    });

    it('returns 404 for non-existent id', async () => {
      const res = await app.request('/api/activities/missing', { method: 'DELETE' });
      expect(res.status).toBe(404);
    });
  });
});
