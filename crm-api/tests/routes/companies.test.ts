import { describe, it, expect, beforeEach } from 'vitest';
import app from '../../src/index';
import { resetStores } from '../helpers';
import { companyStore } from '../../src/db/store';

describe('Companies API', () => {
  beforeEach(() => {
    resetStores();
  });

  describe('GET /api/companies', () => {
    it('returns paginated companies', async () => {
      companyStore.seed([
        {
          id: 'comp-1',
          name: 'Acme Corp',
          industry: 'Technology',
          size: '100-500',
          website: 'https://acme.example.com',
          address: '123 Main St',
          parentId: null,
          contactCount: 5,
          totalDealValue: 100000,
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'comp-2',
          name: 'Beta Industries',
          industry: 'Manufacturing',
          size: '50-100',
          website: 'https://beta.example.com',
          address: '456 Oak Ave',
          parentId: null,
          contactCount: 3,
          totalDealValue: 50000,
          createdAt: '2024-01-02T00:00:00Z',
        },
      ]);

      const response = await app.request('/api/companies');
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toHaveProperty('data');
      expect(json).toHaveProperty('total');
      expect(json).toHaveProperty('page');
      expect(json).toHaveProperty('pageSize');
      expect(json).toHaveProperty('totalPages');
      expect(json.data).toHaveLength(2);
      expect(json.total).toBe(2);
    });

    it('filters by industry (case-insensitive)', async () => {
      companyStore.seed([
        {
          id: 'comp-1',
          name: 'Acme Corp',
          industry: 'Technology',
          size: '100-500',
          website: 'https://acme.example.com',
          address: '123 Main St',
          parentId: null,
          contactCount: 5,
          totalDealValue: 100000,
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'comp-2',
          name: 'Beta Industries',
          industry: 'Manufacturing',
          size: '50-100',
          website: 'https://beta.example.com',
          address: '456 Oak Ave',
          parentId: null,
          contactCount: 3,
          totalDealValue: 50000,
          createdAt: '2024-01-02T00:00:00Z',
        },
      ]);

      const response = await app.request('/api/companies?industry=technology');
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data).toHaveLength(1);
      expect(json.data[0].industry).toBe('Technology');
    });

    it('handles null industry with null-safety check', async () => {
      companyStore.seed([
        {
          id: 'comp-1',
          name: 'Acme Corp',
          industry: null,
          size: '100-500',
          website: 'https://acme.example.com',
          address: '123 Main St',
          parentId: null,
          contactCount: 5,
          totalDealValue: 100000,
          createdAt: '2024-01-01T00:00:00Z',
        },
      ]);

      const response = await app.request('/api/companies?industry=technology');
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data).toHaveLength(0);
    });

    it('filters by search query (name, website, address)', async () => {
      companyStore.seed([
        {
          id: 'comp-1',
          name: 'Acme Corp',
          industry: 'Technology',
          size: '100-500',
          website: 'https://acme.example.com',
          address: '123 Main St',
          parentId: null,
          contactCount: 5,
          totalDealValue: 100000,
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'comp-2',
          name: 'Beta Industries',
          industry: 'Manufacturing',
          size: '50-100',
          website: 'https://beta.example.com',
          address: '456 Oak Ave',
          parentId: null,
          contactCount: 3,
          totalDealValue: 50000,
          createdAt: '2024-01-02T00:00:00Z',
        },
      ]);

      const response = await app.request('/api/companies?search=acme');
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data).toHaveLength(1);
      expect(json.data[0].name).toBe('Acme Corp');
    });

    it('handles null values in search with null-safety check', async () => {
      companyStore.seed([
        {
          id: 'comp-1',
          name: 'Acme Corp',
          industry: 'Technology',
          size: '100-500',
          website: null,
          address: null,
          parentId: null,
          contactCount: 5,
          totalDealValue: 100000,
          createdAt: '2024-01-01T00:00:00Z',
        },
      ]);

      const response = await app.request('/api/companies?search=example');
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data).toHaveLength(0);
    });
  });

  describe('GET /api/companies/:id', () => {
    it('returns single company', async () => {
      companyStore.seed([
        {
          id: 'comp-1',
          name: 'Acme Corp',
          industry: 'Technology',
          size: '100-500',
          website: 'https://acme.example.com',
          address: '123 Main St',
          parentId: null,
          contactCount: 5,
          totalDealValue: 100000,
          createdAt: '2024-01-01T00:00:00Z',
        },
      ]);

      const response = await app.request('/api/companies/comp-1');
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.id).toBe('comp-1');
      expect(json.name).toBe('Acme Corp');
    });

    it('returns 404 for non-existent id', async () => {
      const response = await app.request('/api/companies/non-existent');

      expect(response.status).toBe(404);
    });

    it('includes child companies when company is a parent', async () => {
      companyStore.seed([
        {
          id: 'comp-1',
          name: 'Parent Corp',
          industry: 'Technology',
          size: '100-500',
          website: 'https://parent.example.com',
          address: '123 Main St',
          parentId: null,
          contactCount: 5,
          totalDealValue: 100000,
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'comp-2',
          name: 'Child Corp',
          industry: 'Technology',
          size: '10-50',
          website: 'https://child.example.com',
          address: '456 Oak Ave',
          parentId: 'comp-1',
          contactCount: 2,
          totalDealValue: 20000,
          createdAt: '2024-01-02T00:00:00Z',
        },
      ]);

      const response = await app.request('/api/companies/comp-1');
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.id).toBe('comp-1');
      expect(json).toHaveProperty('children');
      expect(json.children).toHaveLength(1);
      expect(json.children[0].id).toBe('comp-2');
    });
  });

  describe('POST /api/companies', () => {
    it('creates company with valid data', async () => {
      const response = await app.request('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Corp',
          industry: 'Technology',
          size: '10-50',
          website: 'https://new.example.com',
          address: '789 Pine Rd',
        }),
      });
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.name).toBe('New Corp');
      expect(json).toHaveProperty('id');
      expect(json.industry).toBe('Technology');
    });

    it('returns 400 when name is missing', async () => {
      const response = await app.request('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: 'Technology',
        }),
      });

      expect(response.status).toBe(400);
    });

    it('validates parentId exists if provided', async () => {
      const response = await app.request('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Corp',
          parentId: 'non-existent',
        }),
      });

      expect(response.status).toBe(400);
    });

    it('creates company with valid parentId', async () => {
      companyStore.seed([
        {
          id: 'comp-1',
          name: 'Parent Corp',
          industry: 'Technology',
          size: '100-500',
          website: 'https://parent.example.com',
          address: '123 Main St',
          parentId: null,
          contactCount: 5,
          totalDealValue: 100000,
          createdAt: '2024-01-01T00:00:00Z',
        },
      ]);

      const response = await app.request('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Child Corp',
          parentId: 'comp-1',
        }),
      });
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.parentId).toBe('comp-1');
    });
  });

  describe('PUT /api/companies/:id', () => {
    it('updates existing company', async () => {
      companyStore.seed([
        {
          id: 'comp-1',
          name: 'Acme Corp',
          industry: 'Technology',
          size: '100-500',
          website: 'https://acme.example.com',
          address: '123 Main St',
          parentId: null,
          contactCount: 5,
          totalDealValue: 100000,
          createdAt: '2024-01-01T00:00:00Z',
        },
      ]);

      const response = await app.request('/api/companies/comp-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Updated Corp',
          industry: 'Manufacturing',
        }),
      });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.name).toBe('Updated Corp');
      expect(json.industry).toBe('Manufacturing');
    });

    it('returns 404 for non-existent id', async () => {
      const response = await app.request('/api/companies/non-existent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Updated Corp',
        }),
      });

      expect(response.status).toBe(404);
    });

    it('prevents circular parent reference (self-referencing)', async () => {
      companyStore.seed([
        {
          id: 'comp-1',
          name: 'Acme Corp',
          industry: 'Technology',
          size: '100-500',
          website: 'https://acme.example.com',
          address: '123 Main St',
          parentId: null,
          contactCount: 5,
          totalDealValue: 100000,
          createdAt: '2024-01-01T00:00:00Z',
        },
      ]);

      const response = await app.request('/api/companies/comp-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: 'comp-1',
        }),
      });

      expect(response.status).toBe(400);
    });

    it('prevents indirect circular reference', async () => {
      companyStore.seed([
        {
          id: 'comp-1',
          name: 'Parent Corp',
          industry: 'Technology',
          size: '100-500',
          website: 'https://parent.example.com',
          address: '123 Main St',
          parentId: null,
          contactCount: 5,
          totalDealValue: 100000,
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'comp-2',
          name: 'Child Corp',
          industry: 'Technology',
          size: '10-50',
          website: 'https://child.example.com',
          address: '456 Oak Ave',
          parentId: 'comp-1',
          contactCount: 2,
          totalDealValue: 20000,
          createdAt: '2024-01-02T00:00:00Z',
        },
      ]);

      const response = await app.request('/api/companies/comp-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: 'comp-2',
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/companies/:id', () => {
    it('deletes company', async () => {
      companyStore.seed([
        {
          id: 'comp-1',
          name: 'Acme Corp',
          industry: 'Technology',
          size: '100-500',
          website: 'https://acme.example.com',
          address: '123 Main St',
          parentId: null,
          contactCount: 5,
          totalDealValue: 100000,
          createdAt: '2024-01-01T00:00:00Z',
        },
      ]);

      const response = await app.request('/api/companies/comp-1', {
        method: 'DELETE',
      });

      expect(response.status).toBe(200);

      const getResponse = await app.request('/api/companies/comp-1');
      expect(getResponse.status).toBe(404);
    });

    it('returns 404 for non-existent id', async () => {
      const response = await app.request('/api/companies/non-existent', {
        method: 'DELETE',
      });

      expect(response.status).toBe(404);
    });

    it('returns 400 when company has children', async () => {
      companyStore.seed([
        {
          id: 'comp-1',
          name: 'Parent Corp',
          industry: 'Technology',
          size: '100-500',
          website: 'https://parent.example.com',
          address: '123 Main St',
          parentId: null,
          contactCount: 5,
          totalDealValue: 100000,
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'comp-2',
          name: 'Child Corp',
          industry: 'Technology',
          size: '10-50',
          website: 'https://child.example.com',
          address: '456 Oak Ave',
          parentId: 'comp-1',
          contactCount: 2,
          totalDealValue: 20000,
          createdAt: '2024-01-02T00:00:00Z',
        },
      ]);

      const response = await app.request('/api/companies/comp-1', {
        method: 'DELETE',
      });

      expect(response.status).toBe(400);
    });
  });
});
