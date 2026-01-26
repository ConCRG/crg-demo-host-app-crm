// Node.js entry point for local development
// Use this with: npm run dev:node

import { serve } from '@hono/node-server';
import app from './index';

const port = 8787;

console.log(`[API] CRM API starting on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
