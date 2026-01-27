import { describe, it, expect, beforeEach } from 'vitest';
import app from '../../src/index';
import { resetStores } from '../helpers';
import { contactStore, companyStore, dealStore, activityStore } from '../../src/db/store';

describe('Dashboard API', () => {
  beforeEach(() => {
    resetStores();
  });

  describe('GET /api/dashboard/stats', () => {
    it('returns correct counts and pipeline value', async () => {
      contactStore.seed([
        { id: 'c-1', firstName: 'A', lastName: 'B', email: 'a@b.com', phone: '', company: '', companyId: '', status: 'active', jobTitle: '', lastActivity: '', createdAt: '' },
        { id: 'c-2', firstName: 'C', lastName: 'D', email: 'c@d.com', phone: '', company: '', companyId: '', status: 'active', jobTitle: '', lastActivity: '', createdAt: '' },
      ]);
      companyStore.seed([
        { id: 'comp-1', name: 'A', industry: '', size: '', website: '', address: '', parentId: null, contactCount: 0, totalDealValue: 0, createdAt: '' },
      ]);
      dealStore.seed([
        { id: 'd-1', name: 'D1', companyId: '', companyName: '', contactId: '', contactName: '', value: 30000, stage: 'lead', probability: 10, expectedCloseDate: '', createdAt: '', stageHistory: [] },
        { id: 'd-2', name: 'D2', companyId: '', companyName: '', contactId: '', contactName: '', value: 50000, stage: 'proposal', probability: 50, expectedCloseDate: '', createdAt: '', stageHistory: [] },
        { id: 'd-3', name: 'D3', companyId: '', companyName: '', contactId: '', contactName: '', value: 20000, stage: 'closed-won', probability: 100, expectedCloseDate: '', createdAt: '', stageHistory: [] },
      ]);

      const res = await app.request('/api/dashboard/stats');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.totalContacts).toBe(2);
      expect(body.totalCompanies).toBe(1);
      expect(body.activeDeals).toBe(2); // excludes closed-won
      expect(body.pipelineValue).toBe(80000); // 30000 + 50000
    });
  });

  describe('GET /api/dashboard/pipeline', () => {
    it('returns breakdown by stage', async () => {
      dealStore.seed([
        { id: 'd-1', name: 'D1', companyId: '', companyName: '', contactId: '', contactName: '', value: 30000, stage: 'lead', probability: 10, expectedCloseDate: '', createdAt: '', stageHistory: [] },
        { id: 'd-2', name: 'D2', companyId: '', companyName: '', contactId: '', contactName: '', value: 50000, stage: 'lead', probability: 10, expectedCloseDate: '', createdAt: '', stageHistory: [] },
      ]);

      const res = await app.request('/api/dashboard/pipeline');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
      const leadStage = body.find((s: { stage: string }) => s.stage === 'lead');
      expect(leadStage.count).toBe(2);
      expect(leadStage.value).toBe(80000);
    });
  });

  describe('GET /api/dashboard/win-rate', () => {
    it('calculates win rate correctly', async () => {
      dealStore.seed([
        { id: 'd-1', name: 'Won', companyId: '', companyName: '', contactId: '', contactName: '', value: 50000, stage: 'closed-won', probability: 100, expectedCloseDate: '', createdAt: '', stageHistory: [] },
        { id: 'd-2', name: 'Won2', companyId: '', companyName: '', contactId: '', contactName: '', value: 30000, stage: 'closed-won', probability: 100, expectedCloseDate: '', createdAt: '', stageHistory: [] },
        { id: 'd-3', name: 'Lost', companyId: '', companyName: '', contactId: '', contactName: '', value: 20000, stage: 'closed-lost', probability: 0, expectedCloseDate: '', createdAt: '', stageHistory: [] },
      ]);

      const res = await app.request('/api/dashboard/win-rate');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.winRate).toBe(67); // 2/3 = 66.7 -> rounded to 67
      expect(body.wonDeals).toBe(2);
      expect(body.lostDeals).toBe(1);
      expect(body.wonValue).toBe(80000);
      expect(body.lostValue).toBe(20000);
    });

    it('returns 0 win rate when no closed deals', async () => {
      dealStore.seed([
        { id: 'd-1', name: 'Open', companyId: '', companyName: '', contactId: '', contactName: '', value: 50000, stage: 'lead', probability: 10, expectedCloseDate: '', createdAt: '', stageHistory: [] },
      ]);

      const res = await app.request('/api/dashboard/win-rate');
      const body = await res.json();
      expect(body.winRate).toBe(0);
    });
  });

  describe('GET /api/dashboard/recent-deals', () => {
    it('returns recent deals with default limit', async () => {
      dealStore.seed([
        { id: 'd-1', name: 'Old', companyId: '', companyName: 'A', contactId: '', contactName: '', value: 10000, stage: 'lead', probability: 10, expectedCloseDate: '', createdAt: '2024-01-01T00:00:00Z', stageHistory: [] },
        { id: 'd-2', name: 'New', companyId: '', companyName: 'B', contactId: '', contactName: '', value: 20000, stage: 'lead', probability: 10, expectedCloseDate: '', createdAt: '2024-02-01T00:00:00Z', stageHistory: [] },
      ]);

      const res = await app.request('/api/dashboard/recent-deals');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body[0].name).toBe('New'); // sorted by most recent
    });

    it('respects limit parameter', async () => {
      dealStore.seed(
        Array.from({ length: 10 }, (_, i) => ({
          id: `d-${i}`, name: `Deal ${i}`, companyId: '', companyName: '', contactId: '', contactName: '',
          value: 10000, stage: 'lead' as const, probability: 10, expectedCloseDate: '',
          createdAt: `2024-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`, stageHistory: [],
        }))
      );

      const res = await app.request('/api/dashboard/recent-deals?limit=3');
      const body = await res.json();
      expect(body).toHaveLength(3);
    });
  });

  describe('GET /api/dashboard/upcoming-activities', () => {
    it('returns non-completed activities sorted by due date', async () => {
      activityStore.seed([
        { id: 'a-1', type: 'Call', subject: 'Later', notes: '', relatedTo: '', relatedType: 'Contact', relatedId: '', dueDate: '2024-03-01', completedDate: null, status: 'Pending', assignedTo: '', createdAt: '' },
        { id: 'a-2', type: 'Email', subject: 'Sooner', notes: '', relatedTo: '', relatedType: 'Contact', relatedId: '', dueDate: '2024-02-01', completedDate: null, status: 'Pending', assignedTo: '', createdAt: '' },
        { id: 'a-3', type: 'Task', subject: 'Done', notes: '', relatedTo: '', relatedType: 'Contact', relatedId: '', dueDate: '2024-01-01', completedDate: '2024-01-01', status: 'Completed', assignedTo: '', createdAt: '' },
      ]);

      const res = await app.request('/api/dashboard/upcoming-activities');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveLength(2); // excludes completed
      expect(body[0].subject).toBe('Sooner'); // earlier due date first
    });
  });
});
