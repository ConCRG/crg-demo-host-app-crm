import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

// Routes
import contacts from './routes/contacts';
import companies from './routes/companies';
import deals from './routes/deals';
import activities from './routes/activities';
import settings from './routes/settings';
import dashboard from './routes/dashboard';

// Data store and seed data
import {
  contactStore,
  companyStore,
  dealStore,
  activityStore,
  settingsStore,
  isSeeded,
} from './db/store';
import {
  seedContacts,
  seedCompanies,
  seedDeals,
  seedActivities,
  seedSettings,
} from './db/seed-data';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Seed data middleware - runs once on first request
app.use('*', async (c, next) => {
  if (!isSeeded()) {
    console.log('[API] Seeding database...');
    contactStore.seed(seedContacts);
    companyStore.seed(seedCompanies);
    dealStore.seed(seedDeals);
    activityStore.seed(seedActivities);
    settingsStore.seed(seedSettings);
    console.log('[API] Database seeded successfully');
  }
  await next();
});

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'CRM API',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.route('/api/contacts', contacts);
app.route('/api/companies', companies);
app.route('/api/deals', deals);
app.route('/api/activities', activities);
app.route('/api/settings', settings);
app.route('/api/dashboard', dashboard);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('[API] Error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

// Export for Cloudflare Workers
export default app;
