import { Hono } from 'hono';
import { dealStore } from '../db/store';
import type { Deal, DealStage } from '../db/types';

const deals = new Hono();

// GET / - List all deals
deals.get('/', (c) => {
  const allDeals = dealStore.getAll();
  return c.json({ data: allDeals, total: allDeals.length });
});

// GET /:id - Get single deal
deals.get('/:id', (c) => {
  const id = c.req.param('id');
  const deal = dealStore.getById(id);

  if (!deal) {
    return c.json({ error: 'Deal not found' }, 404);
  }

  return c.json({ data: deal });
});

// POST / - Create deal
deals.post('/', async (c) => {
  try {
    const body = await c.req.json<Omit<Deal, 'id'>>();

    // Validate required fields
    if (!body.name || !body.companyId || !body.contactId || body.value === undefined) {
      return c.json(
        { error: 'Missing required fields: name, companyId, contactId, value' },
        400
      );
    }

    const newDeal = dealStore.create(body);
    return c.json({ data: newDeal }, 201);
  } catch (error) {
    return c.json({ error: 'Invalid request body' }, 400);
  }
});

// PUT /:id - Update deal
deals.put('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const body = await c.req.json<Partial<Deal>>();
    const updatedDeal = dealStore.update(id, body);

    if (!updatedDeal) {
      return c.json({ error: 'Deal not found' }, 404);
    }

    return c.json({ data: updatedDeal });
  } catch (error) {
    return c.json({ error: 'Invalid request body' }, 400);
  }
});

// PATCH /:id/stage - Move deal to new stage
deals.patch('/:id/stage', async (c) => {
  const id = c.req.param('id');

  try {
    const body = await c.req.json<{ stage: string }>();

    if (!body.stage) {
      return c.json({ error: 'Missing required field: stage' }, 400);
    }

    // Validate stage value
    const validStages: DealStage[] = [
      'lead',
      'qualified',
      'proposal',
      'negotiation',
      'closed-won',
      'closed-lost',
    ];

    if (!validStages.includes(body.stage as DealStage)) {
      return c.json(
        { error: `Invalid stage. Must be one of: ${validStages.join(', ')}` },
        400
      );
    }

    const updatedDeal = dealStore.moveStage(id, body.stage as DealStage);

    if (!updatedDeal) {
      return c.json({ error: 'Deal not found' }, 404);
    }

    return c.json({ data: updatedDeal });
  } catch (error) {
    return c.json({ error: 'Invalid request body' }, 400);
  }
});

// DELETE /:id - Delete deal
deals.delete('/:id', (c) => {
  const id = c.req.param('id');
  const deleted = dealStore.delete(id);

  if (!deleted) {
    return c.json({ error: 'Deal not found' }, 404);
  }

  return c.json({ message: 'Deal deleted successfully' }, 200);
});

export default deals;
