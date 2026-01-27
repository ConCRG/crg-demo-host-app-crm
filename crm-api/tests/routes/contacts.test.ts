import { describe, it, expect, beforeEach } from 'vitest';
import app from '../../src/index';
import { resetStores } from '../helpers';
import { contactStore } from '../../src/db/store';

const seedContact = (overrides = {}) => ({
  id: 'c-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '555-0100',
  company: 'Acme Corp',
  companyId: 'comp-1',
  status: 'active' as const,
  jobTitle: 'Engineer',
  lastActivity: '2024-01-15',
  createdAt: '2024-01-01',
  ...overrides,
});

describe('Contacts API', () => {
  beforeEach(() => {
    resetStores();
  });

  describe('GET /api/contacts', () => {
    it('returns paginated contacts', async () => {
      contactStore.seed([seedContact(), seedContact({ id: 'c-2', firstName: 'Jane', email: 'jane@example.com' })]);

      const res = await app.request('/api/contacts');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.data).toHaveLength(2);
      expect(body.total).toBe(2);
      expect(body.page).toBe(1);
      expect(body.pageSize).toBe(10);
    });

    it('filters by status', async () => {
      contactStore.seed([
        seedContact(),
        seedContact({ id: 'c-2', status: 'inactive', email: 'jane@example.com' }),
      ]);

      const res = await app.request('/api/contacts?status=active');
      const body = await res.json();
      expect(body.data).toHaveLength(1);
      expect(body.data[0].status).toBe('active');
    });

    it('filters by search query', async () => {
      contactStore.seed([
        seedContact(),
        seedContact({ id: 'c-2', firstName: 'Jane', lastName: 'Smith', email: 'jane@tech.com', company: 'Tech Inc' }),
      ]);

      const res = await app.request('/api/contacts?search=john');
      const body = await res.json();
      expect(body.data).toHaveLength(1);
      expect(body.data[0].firstName).toBe('John');
    });

    it('paginates results', async () => {
      const contacts = Array.from({ length: 15 }, (_, i) =>
        seedContact({ id: `c-${i}`, email: `c${i}@example.com` })
      );
      contactStore.seed(contacts);

      const res = await app.request('/api/contacts?page=2&pageSize=5');
      const body = await res.json();
      expect(body.data).toHaveLength(5);
      expect(body.page).toBe(2);
      expect(body.total).toBe(15);
      expect(body.totalPages).toBe(3);
    });
  });

  describe('GET /api/contacts/:id', () => {
    it('returns a single contact', async () => {
      contactStore.seed([seedContact()]);

      const res = await app.request('/api/contacts/c-1');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.firstName).toBe('John');
    });

    it('returns 404 for non-existent id', async () => {
      const res = await app.request('/api/contacts/missing');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/contacts', () => {
    it('creates a contact with valid data', async () => {
      const res = await app.request('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com' }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.id).toBeDefined();
      expect(body.firstName).toBe('Alice');
    });

    it('returns 400 when missing required fields', async () => {
      const res = await app.request('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: 'Alice' }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/contacts/:id', () => {
    it('updates an existing contact', async () => {
      contactStore.seed([seedContact()]);

      const res = await app.request('/api/contacts/c-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: 'Jonathan' }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.firstName).toBe('Jonathan');
      expect(body.lastName).toBe('Doe');
    });

    it('returns 404 for non-existent id', async () => {
      const res = await app.request('/api/contacts/missing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: 'Test' }),
      });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/contacts/:id', () => {
    it('deletes a contact', async () => {
      contactStore.seed([seedContact()]);

      const res = await app.request('/api/contacts/c-1', { method: 'DELETE' });
      expect(res.status).toBe(200);

      const getRes = await app.request('/api/contacts/c-1');
      expect(getRes.status).toBe(404);
    });

    it('returns 404 for non-existent id', async () => {
      const res = await app.request('/api/contacts/missing', { method: 'DELETE' });
      expect(res.status).toBe(404);
    });
  });
});
