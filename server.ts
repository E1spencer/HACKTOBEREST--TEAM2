/**
 * CampusHelp Server Entry Point
 * Express server mounting API routes and Vite dev middleware on Port 3000
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes.ts';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parsing with 10mb limit for documents
app.use(express.json({ limit: '10mb' }));

// Health check endpoint (Prompt 01)
app.get('/health/live', (req, res) => {
  res.json({ status: 'ok', service: 'CampusHelp API', uptime: process.uptime() });
});

// Allow iFrame embedding in AI Studio preview
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Do NOT set X-Frame-Options so AI Studio iframe preview works smoothly
  next();
});

// API Routes
app.use('/api/v1', apiRouter);

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CampusHelp] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[CampusHelp] Failed to start server:', err);
  process.exit(1);
});
