import { createConsumer } from '@teds/react';
import { type RootRouterType } from 'worker/src/worker';

export const consumer = createConsumer<RootRouterType>({ verbose: true });
