import { Hono } from 'hono';
import { activityStore } from '../db/store';
import type { Activity, ActivityType, ActivityStatus } from '../db/types';

const activities = new Hono();

// Helper to filter by date range
function filterByDateRange(
  activities: Activity[],
  dateRange: string | undefined
): Activity[] {
  if (!dateRange) return activities;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  return activities.filter((activity) => {
    const dueDate = new Date(activity.dueDate);

    switch (dateRange) {
      case 'today':
        return dueDate >= today && dueDate <= endOfToday;
      case 'this_week':
        return dueDate >= startOfWeek && dueDate <= endOfWeek;
      case 'this_month':
        return dueDate >= startOfMonth && dueDate <= endOfMonth;
      default:
        return true;
    }
  });
}

// GET / - List activities with filters
activities.get('/', (c) => {
  const type = c.req.query('type') as ActivityType | undefined;
  const status = c.req.query('status') as ActivityStatus | undefined;
  const dateRange = c.req.query('dateRange');

  let result = activityStore.getAll();

  // Filter by type
  if (type) {
    result = result.filter((a) => a.type === type);
  }

  // Filter by status
  if (status) {
    result = result.filter((a) => a.status === status);
  }

  // Filter by date range
  result = filterByDateRange(result, dateRange);

  // Sort by due date (ascending)
  result.sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return c.json({ data: result, total: result.length });
});

// GET /:id - Get single activity
activities.get('/:id', (c) => {
  const id = c.req.param('id');
  const activity = activityStore.getById(id);

  if (!activity) {
    return c.json({ error: 'Activity not found' }, 404);
  }

  return c.json(activity);
});

// POST / - Create activity
activities.post('/', async (c) => {
  const body = await c.req.json<Omit<Activity, 'id'>>();

  // Validate required fields
  if (!body.type || !body.subject || !body.dueDate) {
    return c.json(
      { error: 'Missing required fields: type, subject, dueDate' },
      400
    );
  }

  // Set defaults
  const activityData: Omit<Activity, 'id'> = {
    type: body.type,
    subject: body.subject,
    notes: body.notes || '',
    relatedTo: body.relatedTo || '',
    relatedType: body.relatedType || 'Contact',
    relatedId: body.relatedId || '',
    dueDate: body.dueDate,
    completedDate: body.completedDate || null,
    status: body.status || 'Pending',
    assignedTo: body.assignedTo || '',
    createdAt: body.createdAt || new Date().toISOString().split('T')[0],
  };

  const newActivity = activityStore.create(activityData);
  return c.json(newActivity, 201);
});

// PUT /:id - Update activity
activities.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<Partial<Activity>>();

  const existing = activityStore.getById(id);
  if (!existing) {
    return c.json({ error: 'Activity not found' }, 404);
  }

  // Remove id from update data if present
  const { id: _, ...updateData } = body;

  const updated = activityStore.update(id, updateData);
  return c.json(updated);
});

// PATCH /:id/complete - Mark as complete
activities.patch('/:id/complete', (c) => {
  const id = c.req.param('id');

  const existing = activityStore.getById(id);
  if (!existing) {
    return c.json({ error: 'Activity not found' }, 404);
  }

  const updated = activityStore.markComplete(id);
  return c.json(updated);
});

// PATCH /:id/incomplete - Mark as incomplete
activities.patch('/:id/incomplete', (c) => {
  const id = c.req.param('id');

  const existing = activityStore.getById(id);
  if (!existing) {
    return c.json({ error: 'Activity not found' }, 404);
  }

  const updated = activityStore.markIncomplete(id);
  return c.json(updated);
});

// DELETE /:id - Delete activity
activities.delete('/:id', (c) => {
  const id = c.req.param('id');

  const existing = activityStore.getById(id);
  if (!existing) {
    return c.json({ error: 'Activity not found' }, 404);
  }

  activityStore.delete(id);
  return c.json({ message: 'Activity deleted successfully' }, 200);
});

export default activities;
