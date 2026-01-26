import { Hono } from 'hono';
import { settingsStore } from '../db/store';

const settings = new Hono();

// GET / - Get all settings
settings.get('/', (c) => {
  const allSettings = settingsStore.get();

  if (!allSettings) {
    return c.json({ error: 'Settings not found' }, 404);
  }

  return c.json({ data: allSettings });
});

// GET /profile - Get profile settings
settings.get('/profile', (c) => {
  const allSettings = settingsStore.get();

  if (!allSettings) {
    return c.json({ error: 'Settings not found' }, 404);
  }

  return c.json({ data: allSettings.profile });
});

// PUT /profile - Update profile settings
settings.put('/profile', async (c) => {
  const body = await c.req.json();
  const allSettings = settingsStore.get();

  if (!allSettings) {
    return c.json({ error: 'Settings not found' }, 404);
  }

  const updatedSettings = settingsStore.update({
    profile: { ...allSettings.profile, ...body },
  });

  return c.json({ data: updatedSettings?.profile });
});

// GET /pipeline-stages - Get pipeline stages
settings.get('/pipeline-stages', (c) => {
  const allSettings = settingsStore.get();

  if (!allSettings) {
    return c.json({ error: 'Settings not found' }, 404);
  }

  return c.json({ data: allSettings.pipelineStages });
});

// PUT /pipeline-stages - Update pipeline stages
settings.put('/pipeline-stages', async (c) => {
  const body = await c.req.json();
  const allSettings = settingsStore.get();

  if (!allSettings) {
    return c.json({ error: 'Settings not found' }, 404);
  }

  if (!Array.isArray(body)) {
    return c.json({ error: 'Pipeline stages must be an array' }, 400);
  }

  const updatedSettings = settingsStore.update({
    pipelineStages: body,
  });

  return c.json({ data: updatedSettings?.pipelineStages });
});

// GET /custom-fields - Get custom fields
settings.get('/custom-fields', (c) => {
  const allSettings = settingsStore.get();

  if (!allSettings) {
    return c.json({ error: 'Settings not found' }, 404);
  }

  return c.json({ data: allSettings.customFields });
});

// PUT /custom-fields - Update custom fields
settings.put('/custom-fields', async (c) => {
  const body = await c.req.json();
  const allSettings = settingsStore.get();

  if (!allSettings) {
    return c.json({ error: 'Settings not found' }, 404);
  }

  if (!Array.isArray(body)) {
    return c.json({ error: 'Custom fields must be an array' }, 400);
  }

  const updatedSettings = settingsStore.update({
    customFields: body,
  });

  return c.json({ data: updatedSettings?.customFields });
});

// GET /notifications - Get notification settings
settings.get('/notifications', (c) => {
  const allSettings = settingsStore.get();

  if (!allSettings) {
    return c.json({ error: 'Settings not found' }, 404);
  }

  return c.json({ data: allSettings.notifications });
});

// PUT /notifications - Update notification settings
settings.put('/notifications', async (c) => {
  const body = await c.req.json();
  const allSettings = settingsStore.get();

  if (!allSettings) {
    return c.json({ error: 'Settings not found' }, 404);
  }

  const updatedSettings = settingsStore.update({
    notifications: { ...allSettings.notifications, ...body },
  });

  return c.json({ data: updatedSettings?.notifications });
});

// GET /timezones - Get available timezones
settings.get('/timezones', (c) => {
  const allSettings = settingsStore.get();

  if (!allSettings) {
    return c.json({ error: 'Settings not found' }, 404);
  }

  return c.json({ data: allSettings.timezones });
});

export default settings;
