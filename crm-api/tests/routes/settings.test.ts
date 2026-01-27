import { describe, it, expect, beforeEach } from 'vitest';
import app from '../../src/index';
import { resetStores } from '../helpers';

describe('Settings API', () => {
  beforeEach(() => {
    resetStores();
  });

  describe('GET /api/settings', () => {
    it('returns all settings', async () => {
      const res = await app.request('/api/settings');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toHaveProperty('profile');
      expect(body.data).toHaveProperty('pipelineStages');
      expect(body.data).toHaveProperty('customFields');
      expect(body.data).toHaveProperty('notifications');
      expect(body.data).toHaveProperty('timezones');
    });
  });

  describe('GET /api/settings/profile', () => {
    it('returns profile settings', async () => {
      const res = await app.request('/api/settings/profile');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data.name).toBe('Test User');
      expect(body.data.email).toBe('test@example.com');
      expect(body.data.role).toBe('Admin');
    });
  });

  describe('PUT /api/settings/profile', () => {
    it('updates profile settings', async () => {
      const res = await app.request('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated User', timezone: 'America/New_York' }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data.name).toBe('Updated User');
      expect(body.data.timezone).toBe('America/New_York');
      // preserves other fields
      expect(body.data.email).toBe('test@example.com');
    });
  });

  describe('GET /api/settings/pipeline-stages', () => {
    it('returns pipeline stages', async () => {
      const res = await app.request('/api/settings/pipeline-stages');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data).toHaveLength(2);
      expect(body.data[0].name).toBe('Lead');
    });
  });

  describe('PUT /api/settings/pipeline-stages', () => {
    it('updates pipeline stages', async () => {
      const newStages = [
        { id: 'ps-1', name: 'New Lead', probability: 5, color: '#FF0000', order: 1 },
      ];
      const res = await app.request('/api/settings/pipeline-stages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStages),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toHaveLength(1);
      expect(body.data[0].name).toBe('New Lead');
    });

    it('returns 400 when body is not an array', async () => {
      const res = await app.request('/api/settings/pipeline-stages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Not an array' }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/settings/custom-fields', () => {
    it('returns custom fields', async () => {
      const res = await app.request('/api/settings/custom-fields');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  describe('PUT /api/settings/custom-fields', () => {
    it('updates custom fields', async () => {
      const newFields = [
        { id: 'cf-1', name: 'Region', type: 'text', entity: 'company', required: false },
      ];
      const res = await app.request('/api/settings/custom-fields', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFields),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toHaveLength(1);
      expect(body.data[0].name).toBe('Region');
    });

    it('returns 400 when body is not an array', async () => {
      const res = await app.request('/api/settings/custom-fields', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Not an array' }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/settings/notifications', () => {
    it('returns notification settings', async () => {
      const res = await app.request('/api/settings/notifications');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toHaveProperty('email');
      expect(body.data).toHaveProperty('inApp');
      expect(body.data.email.newDeal).toBe(true);
    });
  });

  describe('PUT /api/settings/notifications', () => {
    it('updates notification settings', async () => {
      const res = await app.request('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: { newDeal: false, dealStageChange: false, dealWon: true, dealLost: true, newContact: true, activityReminder: true, weeklyReport: true } }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data.email.newDeal).toBe(false);
      // inApp preserved
      expect(body.data.inApp.newDeal).toBe(true);
    });
  });

  describe('GET /api/settings/timezones', () => {
    it('returns timezones', async () => {
      const res = await app.request('/api/settings/timezones');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data[0]).toHaveProperty('value');
      expect(body.data[0]).toHaveProperty('label');
    });
  });
});
