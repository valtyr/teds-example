import { zValidator } from '@hono/zod-validator';
import {
  createDispatcherProxy,
  createProducer,
  subscribe,
} from '@teds/cloudflare';
import { createBroker } from '@teds/core';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';

export type HonoBindings = {
  Bindings: Env;
};

// This is where the broker is defined
const broker = createBroker();

// Try editing me!
const newChatMessage = broker.event(
  z.object({
    id: z.string(),
    message: z.string(),
  }),
);

// Messages are organized using routers.
// Routers can include messages and other routers.
const rootRouter = broker.router({
  newChatMessage,
});

// Export the type so the frontend can access it
export type RootRouterType = typeof rootRouter;

// Here we're using Hono as our REST api, but this could
// be any other framework... or just a raw worker
const app = new Hono<HonoBindings>();

app.post(
  '/api/message/new',
  cors(),
  zValidator(
    'query',
    z.object({
      message: z.string(),
    }),
  ),
  (c) => {
    // This is a test endpoint that generates an event
    const { message } = c.req.valid('query');

    // Get a dispatcher
    const dispatcher = createDispatcherProxy(
      rootRouter,
      c.env.PRODUCER,
      'global',
    );

    // Dispatch the message
    dispatcher.newChatMessage({
      id: crypto.randomUUID(),
      message,
    });

    return c.body('OK');
  },
);

app.get('/api/events', ({ env, req }) => {
  return subscribe(env.PRODUCER, 'global', req.raw);
});

// Export the generated Durable Object
export class Producer extends createProducer() {
  router = rootRouter;
}

export default app;
