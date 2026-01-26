import { Hono } from 'hono';
import { companyStore } from '../db/store';
import type { Company, PaginatedResponse } from '../db/types';

const companies = new Hono();

// GET / - List companies with pagination and filters
companies.get('/', (c) => {
  const page = parseInt(c.req.query('page') || '1', 10);
  const pageSize = parseInt(c.req.query('pageSize') || '10', 10);
  const industry = c.req.query('industry');
  const search = c.req.query('search');

  let allCompanies = companyStore.getAll();

  // Filter by industry
  if (industry) {
    allCompanies = allCompanies.filter(
      (company) => company.industry && company.industry.toLowerCase() === industry.toLowerCase()
    );
  }

  // Filter by search term (name, website, address)
  if (search) {
    const searchLower = search.toLowerCase();
    allCompanies = allCompanies.filter(
      (company) =>
        company.name.toLowerCase().includes(searchLower) ||
        (company.website && company.website.toLowerCase().includes(searchLower)) ||
        (company.address && company.address.toLowerCase().includes(searchLower))
    );
  }

  // Calculate pagination
  const total = allCompanies.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedCompanies = allCompanies.slice(startIndex, startIndex + pageSize);

  const response: PaginatedResponse<Company> = {
    data: paginatedCompanies,
    total,
    page,
    pageSize,
    totalPages,
  };

  return c.json(response);
});

// GET /:id - Get single company (include children if parent)
companies.get('/:id', (c) => {
  const id = c.req.param('id');
  const company = companyStore.getById(id);

  if (!company) {
    return c.json({ error: 'Company not found' }, 404);
  }

  // If this company is a parent, include its child companies
  const allCompanies = companyStore.getAll();
  const children = allCompanies.filter((comp) => comp.parentId === id);

  return c.json({
    ...company,
    children: children.length > 0 ? children : undefined,
  });
});

// POST / - Create company
companies.post('/', async (c) => {
  try {
    const body = await c.req.json<Omit<Company, 'id'>>();

    // Validate required fields
    if (!body.name) {
      return c.json({ error: 'Company name is required' }, 400);
    }

    // Validate parentId if provided
    if (body.parentId) {
      const parentCompany = companyStore.getById(body.parentId);
      if (!parentCompany) {
        return c.json({ error: 'Parent company not found' }, 400);
      }
    }

    const newCompany = companyStore.create({
      name: body.name,
      industry: body.industry || '',
      size: body.size || '',
      website: body.website || '',
      address: body.address || '',
      parentId: body.parentId || null,
      contactCount: body.contactCount || 0,
      totalDealValue: body.totalDealValue || 0,
      createdAt: body.createdAt || new Date().toISOString(),
    });

    return c.json(newCompany, 201);
  } catch {
    return c.json({ error: 'Invalid request body' }, 400);
  }
});

// PUT /:id - Update company
companies.put('/:id', async (c) => {
  const id = c.req.param('id');
  const existingCompany = companyStore.getById(id);

  if (!existingCompany) {
    return c.json({ error: 'Company not found' }, 404);
  }

  try {
    const body = await c.req.json<Partial<Company>>();

    // Prevent changing the ID
    delete body.id;

    // Validate parentId if provided
    if (body.parentId !== undefined && body.parentId !== null) {
      // Prevent circular reference
      if (body.parentId === id) {
        return c.json({ error: 'Company cannot be its own parent' }, 400);
      }

      const parentCompany = companyStore.getById(body.parentId);
      if (!parentCompany) {
        return c.json({ error: 'Parent company not found' }, 400);
      }

      // Check if the parent is already a child of this company (prevent indirect circular reference)
      if (parentCompany.parentId === id) {
        return c.json({ error: 'Circular parent reference not allowed' }, 400);
      }
    }

    const updatedCompany = companyStore.update(id, body);

    if (!updatedCompany) {
      return c.json({ error: 'Failed to update company' }, 500);
    }

    return c.json(updatedCompany);
  } catch {
    return c.json({ error: 'Invalid request body' }, 400);
  }
});

// DELETE /:id - Delete company
companies.delete('/:id', (c) => {
  const id = c.req.param('id');
  const existingCompany = companyStore.getById(id);

  if (!existingCompany) {
    return c.json({ error: 'Company not found' }, 404);
  }

  // Check if this company has children
  const allCompanies = companyStore.getAll();
  const hasChildren = allCompanies.some((comp) => comp.parentId === id);

  if (hasChildren) {
    return c.json(
      { error: 'Cannot delete company with child companies. Delete or reassign children first.' },
      400
    );
  }

  const deleted = companyStore.delete(id);

  if (!deleted) {
    return c.json({ error: 'Failed to delete company' }, 500);
  }

  return c.json({ message: 'Company deleted successfully' }, 200);
});

export default companies;
