import { describe, it, expect, beforeEach } from 'vitest';
import app from '../../src/index';
import { resetStores } from '../helpers';
import { dealStore } from '../../src/db/store';

describe('Deals API', () => {
  beforeEach(() => {
    resetStores();
  });

  describe('GET /api/deals', () => {
    it('returns all deals wrapped in { data, total }', async () => {
      dealStore.seed([
        {
          id: 'deal-1',
          name: 'Enterprise Deal',
          companyId: 'comp-1',
          companyName: 'Acme Corp',
          contactId: 'c-1',
          contactName: 'John Doe',
          value: 50000,
          stage: 'lead' as const,
          probability: 10,
          expectedCloseDate: '2024-06-01',
          createdAt: '2024-01-01T00:00:00Z',
          stageHistory: [{ stage: 'lead' as const, date: '2024-01-01' }],
        },
        {
          id: 'deal-2',
          name: 'Small Deal',
          companyId: 'comp-2',
          companyName: 'Beta Inc',
          contactId: 'c-2',
          contactName: 'Jane Smith',
          value: 10000,
          stage: 'qualified' as const,
          probability: 25,
          expectedCloseDate: '2024-05-15',
          createdAt: '2024-01-02T00:00:00Z',
          stageHistory: [{ stage: 'qualified' as const, date: '2024-01-02' }],
        },
      ]);

      const res = await app.request('/api/deals');
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json).toHaveProperty('data');
      expect(json).toHaveProperty('total');
      expect(json.data).toHaveLength(2);
      expect(json.total).toBe(2);
      expect(json.data[0].name).toBe('Enterprise Deal');
      expect(json.data[1].name).toBe('Small Deal');
    });
  });

  describe('GET /api/deals/:id', () => {
    it('returns single deal wrapped in { data: deal }', async () => {
      dealStore.seed([
        {
          id: 'deal-1',
          name: 'Enterprise Deal',
          companyId: 'comp-1',
          companyName: 'Acme Corp',
          contactId: 'c-1',
          contactName: 'John Doe',
          value: 50000,
          stage: 'lead' as const,
          probability: 10,
          expectedCloseDate: '2024-06-01',
          createdAt: '2024-01-01T00:00:00Z',
          stageHistory: [{ stage: 'lead' as const, date: '2024-01-01' }],
        },
      ]);

      const res = await app.request('/api/deals/deal-1');
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json).toHaveProperty('data');
      expect(json.data.id).toBe('deal-1');
      expect(json.data.name).toBe('Enterprise Deal');
      expect(json.data.value).toBe(50000);
    });

    it('returns 404 for non-existent id', async () => {
      const res = await app.request('/api/deals/non-existent');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/deals', () => {
    it('creates deal with valid data (returns 201 with { data: deal })', async () => {
      const newDeal = {
        name: 'New Enterprise Deal',
        companyId: 'comp-1',
        companyName: 'Acme Corp',
        contactId: 'c-1',
        contactName: 'John Doe',
        value: 75000,
        stage: 'lead',
        probability: 10,
        expectedCloseDate: '2024-07-01',
        createdAt: new Date().toISOString(),
        stageHistory: [{ stage: 'lead', date: '2024-01-01' }],
      };

      const res = await app.request('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDeal),
      });

      expect(res.status).toBe(201);

      const json = await res.json();
      expect(json).toHaveProperty('data');
      expect(json.data.name).toBe('New Enterprise Deal');
      expect(json.data.value).toBe(75000);
      expect(json.data).toHaveProperty('id');
    });

    it('returns 400 when missing name', async () => {
      const res = await app.request('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: 'comp-1',
          contactId: 'c-1',
          value: 50000,
        }),
      });

      expect(res.status).toBe(400);
    });

    it('returns 400 when missing companyId', async () => {
      const res = await app.request('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Deal',
          contactId: 'c-1',
          value: 50000,
        }),
      });

      expect(res.status).toBe(400);
    });

    it('returns 400 when missing contactId', async () => {
      const res = await app.request('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Deal',
          companyId: 'comp-1',
          value: 50000,
        }),
      });

      expect(res.status).toBe(400);
    });

    it('returns 400 when missing value', async () => {
      const res = await app.request('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Deal',
          companyId: 'comp-1',
          contactId: 'c-1',
        }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/deals/:id', () => {
    it('updates existing deal (returns { data: deal })', async () => {
      dealStore.seed([
        {
          id: 'deal-1',
          name: 'Enterprise Deal',
          companyId: 'comp-1',
          companyName: 'Acme Corp',
          contactId: 'c-1',
          contactName: 'John Doe',
          value: 50000,
          stage: 'lead' as const,
          probability: 10,
          expectedCloseDate: '2024-06-01',
          createdAt: '2024-01-01T00:00:00Z',
          stageHistory: [{ stage: 'lead' as const, date: '2024-01-01' }],
        },
      ]);

      const res = await app.request('/api/deals/deal-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Updated Enterprise Deal',
          value: 60000,
        }),
      });

      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json).toHaveProperty('data');
      expect(json.data.name).toBe('Updated Enterprise Deal');
      expect(json.data.value).toBe(60000);
    });

    it('returns 404 for non-existent id', async () => {
      const res = await app.request('/api/deals/non-existent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated Deal' }),
      });

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/deals/:id/stage', () => {
    it('moves deal to new stage (returns { data: deal })', async () => {
      dealStore.seed([
        {
          id: 'deal-1',
          name: 'Enterprise Deal',
          companyId: 'comp-1',
          companyName: 'Acme Corp',
          contactId: 'c-1',
          contactName: 'John Doe',
          value: 50000,
          stage: 'lead' as const,
          probability: 10,
          expectedCloseDate: '2024-06-01',
          createdAt: '2024-01-01T00:00:00Z',
          stageHistory: [{ stage: 'lead' as const, date: '2024-01-01' }],
        },
      ]);

      const res = await app.request('/api/deals/deal-1/stage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'qualified' }),
      });

      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json).toHaveProperty('data');
      expect(json.data.stage).toBe('qualified');
    });

    it('updates probability to 10 for lead stage', async () => {
      dealStore.seed([
        {
          id: 'deal-1',
          name: 'Test Deal',
          companyId: 'comp-1',
          companyName: 'Acme Corp',
          contactId: 'c-1',
          contactName: 'John Doe',
          value: 50000,
          stage: 'qualified' as const,
          probability: 25,
          expectedCloseDate: '2024-06-01',
          createdAt: '2024-01-01T00:00:00Z',
          stageHistory: [{ stage: 'qualified' as const, date: '2024-01-01' }],
        },
      ]);

      const res = await app.request('/api/deals/deal-1/stage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'lead' }),
      });

      const json = await res.json();
      expect(json.data.probability).toBe(10);
    });

    it('updates probability to 25 for qualified stage', async () => {
      dealStore.seed([
        {
          id: 'deal-1',
          name: 'Test Deal',
          companyId: 'comp-1',
          companyName: 'Acme Corp',
          contactId: 'c-1',
          contactName: 'John Doe',
          value: 50000,
          stage: 'lead' as const,
          probability: 10,
          expectedCloseDate: '2024-06-01',
          createdAt: '2024-01-01T00:00:00Z',
          stageHistory: [{ stage: 'lead' as const, date: '2024-01-01' }],
        },
      ]);

      const res = await app.request('/api/deals/deal-1/stage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'qualified' }),
      });

      const json = await res.json();
      expect(json.data.probability).toBe(25);
    });

    it('updates probability to 50 for proposal stage', async () => {
      dealStore.seed([
        {
          id: 'deal-1',
          name: 'Test Deal',
          companyId: 'comp-1',
          companyName: 'Acme Corp',
          contactId: 'c-1',
          contactName: 'John Doe',
          value: 50000,
          stage: 'qualified' as const,
          probability: 25,
          expectedCloseDate: '2024-06-01',
          createdAt: '2024-01-01T00:00:00Z',
          stageHistory: [{ stage: 'qualified' as const, date: '2024-01-01' }],
        },
      ]);

      const res = await app.request('/api/deals/deal-1/stage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'proposal' }),
      });

      const json = await res.json();
      expect(json.data.probability).toBe(50);
    });

    it('updates probability to 75 for negotiation stage', async () => {
      dealStore.seed([
        {
          id: 'deal-1',
          name: 'Test Deal',
          companyId: 'comp-1',
          companyName: 'Acme Corp',
          contactId: 'c-1',
          contactName: 'John Doe',
          value: 50000,
          stage: 'proposal' as const,
          probability: 50,
          expectedCloseDate: '2024-06-01',
          createdAt: '2024-01-01T00:00:00Z',
          stageHistory: [{ stage: 'proposal' as const, date: '2024-01-01' }],
        },
      ]);

      const res = await app.request('/api/deals/deal-1/stage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'negotiation' }),
      });

      const json = await res.json();
      expect(json.data.probability).toBe(75);
    });

    it('updates probability to 100 for closed-won stage', async () => {
      dealStore.seed([
        {
          id: 'deal-1',
          name: 'Test Deal',
          companyId: 'comp-1',
          companyName: 'Acme Corp',
          contactId: 'c-1',
          contactName: 'John Doe',
          value: 50000,
          stage: 'negotiation' as const,
          probability: 75,
          expectedCloseDate: '2024-06-01',
          createdAt: '2024-01-01T00:00:00Z',
          stageHistory: [{ stage: 'negotiation' as const, date: '2024-01-01' }],
        },
      ]);

      const res = await app.request('/api/deals/deal-1/stage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'closed-won' }),
      });

      const json = await res.json();
      expect(json.data.probability).toBe(100);
    });

    it('updates probability to 0 for closed-lost stage', async () => {
      dealStore.seed([
        {
          id: 'deal-1',
          name: 'Test Deal',
          companyId: 'comp-1',
          companyName: 'Acme Corp',
          contactId: 'c-1',
          contactName: 'John Doe',
          value: 50000,
          stage: 'negotiation' as const,
          probability: 75,
          expectedCloseDate: '2024-06-01',
          createdAt: '2024-01-01T00:00:00Z',
          stageHistory: [{ stage: 'negotiation' as const, date: '2024-01-01' }],
        },
      ]);

      const res = await app.request('/api/deals/deal-1/stage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'closed-lost' }),
      });

      const json = await res.json();
      expect(json.data.probability).toBe(0);
    });

    it('adds entry to stageHistory', async () => {
      dealStore.seed([
        {
          id: 'deal-1',
          name: 'Enterprise Deal',
          companyId: 'comp-1',
          companyName: 'Acme Corp',
          contactId: 'c-1',
          contactName: 'John Doe',
          value: 50000,
          stage: 'lead' as const,
          probability: 10,
          expectedCloseDate: '2024-06-01',
          createdAt: '2024-01-01T00:00:00Z',
          stageHistory: [{ stage: 'lead' as const, date: '2024-01-01' }],
        },
      ]);

      const res = await app.request('/api/deals/deal-1/stage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'qualified' }),
      });

      const json = await res.json();
      expect(json.data.stageHistory).toHaveLength(2);
      expect(json.data.stageHistory[0].stage).toBe('lead');
      expect(json.data.stageHistory[1].stage).toBe('qualified');
    });

    it('returns 400 for invalid stage', async () => {
      dealStore.seed([
        {
          id: 'deal-1',
          name: 'Enterprise Deal',
          companyId: 'comp-1',
          companyName: 'Acme Corp',
          contactId: 'c-1',
          contactName: 'John Doe',
          value: 50000,
          stage: 'lead' as const,
          probability: 10,
          expectedCloseDate: '2024-06-01',
          createdAt: '2024-01-01T00:00:00Z',
          stageHistory: [{ stage: 'lead' as const, date: '2024-01-01' }],
        },
      ]);

      const res = await app.request('/api/deals/deal-1/stage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'invalid-stage' }),
      });

      expect(res.status).toBe(400);
    });

    it('returns 400 when stage is missing', async () => {
      dealStore.seed([
        {
          id: 'deal-1',
          name: 'Enterprise Deal',
          companyId: 'comp-1',
          companyName: 'Acme Corp',
          contactId: 'c-1',
          contactName: 'John Doe',
          value: 50000,
          stage: 'lead' as const,
          probability: 10,
          expectedCloseDate: '2024-06-01',
          createdAt: '2024-01-01T00:00:00Z',
          stageHistory: [{ stage: 'lead' as const, date: '2024-01-01' }],
        },
      ]);

      const res = await app.request('/api/deals/deal-1/stage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
    });

    it('returns 404 for non-existent deal', async () => {
      const res = await app.request('/api/deals/non-existent/stage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'qualified' }),
      });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/deals/:id', () => {
    it('deletes deal (returns 200)', async () => {
      dealStore.seed([
        {
          id: 'deal-1',
          name: 'Enterprise Deal',
          companyId: 'comp-1',
          companyName: 'Acme Corp',
          contactId: 'c-1',
          contactName: 'John Doe',
          value: 50000,
          stage: 'lead' as const,
          probability: 10,
          expectedCloseDate: '2024-06-01',
          createdAt: '2024-01-01T00:00:00Z',
          stageHistory: [{ stage: 'lead' as const, date: '2024-01-01' }],
        },
      ]);

      const res = await app.request('/api/deals/deal-1', {
        method: 'DELETE',
      });

      expect(res.status).toBe(200);

      // Verify it's deleted
      const getRes = await app.request('/api/deals/deal-1');
      expect(getRes.status).toBe(404);
    });

    it('returns 404 for non-existent id', async () => {
      const res = await app.request('/api/deals/non-existent', {
        method: 'DELETE',
      });

      expect(res.status).toBe(404);
    });
  });
});
