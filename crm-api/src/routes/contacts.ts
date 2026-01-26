import { Hono } from 'hono';
import { contactStore } from '../db/store';
import type { Contact, PaginatedResponse } from '../db/types';

const contacts = new Hono();

// GET / - List contacts with pagination and filters
contacts.get('/', (c) => {
  const page = parseInt(c.req.query('page') || '1', 10);
  const pageSize = parseInt(c.req.query('pageSize') || '10', 10);
  const status = c.req.query('status') as Contact['status'] | undefined;
  const search = c.req.query('search')?.toLowerCase();

  let allContacts = contactStore.getAll();

  // Apply status filter
  if (status) {
    allContacts = allContacts.filter((contact) => contact.status === status);
  }

  // Apply search filter (searches firstName, lastName, email, company)
  if (search) {
    allContacts = allContacts.filter(
      (contact) =>
        contact.firstName.toLowerCase().includes(search) ||
        contact.lastName.toLowerCase().includes(search) ||
        contact.email.toLowerCase().includes(search) ||
        contact.company.toLowerCase().includes(search)
    );
  }

  const total = allContacts.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const data = allContacts.slice(startIndex, startIndex + pageSize);

  const response: PaginatedResponse<Contact> = {
    data,
    total,
    page,
    pageSize,
    totalPages,
  };

  return c.json(response);
});

// GET /:id - Get single contact
contacts.get('/:id', (c) => {
  const id = c.req.param('id');
  const contact = contactStore.getById(id);

  if (!contact) {
    return c.json({ error: 'Contact not found' }, 404);
  }

  return c.json(contact);
});

// POST / - Create contact
contacts.post('/', async (c) => {
  const body = await c.req.json<Omit<Contact, 'id'>>();

  // Basic validation
  if (!body.firstName || !body.lastName || !body.email) {
    return c.json(
      { error: 'firstName, lastName, and email are required' },
      400
    );
  }

  const newContact = contactStore.create({
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    phone: body.phone || '',
    company: body.company || '',
    companyId: body.companyId || '',
    status: body.status || 'lead',
    jobTitle: body.jobTitle || '',
    lastActivity: body.lastActivity || new Date().toISOString().split('T')[0],
    createdAt: body.createdAt || new Date().toISOString().split('T')[0],
  });

  return c.json(newContact, 201);
});

// PUT /:id - Update contact
contacts.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<Partial<Contact>>();

  // Check if contact exists
  const existingContact = contactStore.getById(id);
  if (!existingContact) {
    return c.json({ error: 'Contact not found' }, 404);
  }

  // Remove id from body to prevent overwriting
  const { id: _, ...updateData } = body;

  const updatedContact = contactStore.update(id, updateData);

  return c.json(updatedContact);
});

// DELETE /:id - Delete contact
contacts.delete('/:id', (c) => {
  const id = c.req.param('id');

  // Check if contact exists
  const existingContact = contactStore.getById(id);
  if (!existingContact) {
    return c.json({ error: 'Contact not found' }, 404);
  }

  const deleted = contactStore.delete(id);

  if (deleted) {
    return c.json({ message: 'Contact deleted successfully' }, 200);
  }

  return c.json({ error: 'Failed to delete contact' }, 500);
});

export default contacts;
