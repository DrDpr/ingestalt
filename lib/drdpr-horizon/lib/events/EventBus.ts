import { EventBus, EventMap } from '@drdpr/event-bus';

/**
 * Global event bus instance for the application.
 * All modules use this to communicate.
 */
export const eventBus = new EventBus<EventMap>();
export type { EventMap };
