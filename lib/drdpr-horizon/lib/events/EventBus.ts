/**
 * EventMap - Defines all available events in the application.
 */
export type EventMap = {
  'node:updated': { nodeId: string };
  'node:created': { nodeId: string };
  'node:selected': { nodeId: string | null };
  'canvas:ready': { graphId: string };
};

type Handler<T> = (data: T) => void;

/**
 * EventBus - A simple, type-safe Pub/Sub implementation.
 */
export class EventBus<T extends Record<string, any>> {
  private handlers: { [K in keyof T]?: Handler<T[K]>[] } = {};

  /**
   * Register an event listener.
   */
  on<K extends keyof T>(event: K, handler: Handler<T[K]>) {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event]?.push(handler);
  }

  /**
   * Remove an event listener.
   */
  off<K extends keyof T>(event: K, handler: Handler<T[K]>) {
    this.handlers[event] = this.handlers[event]?.filter(h => h !== handler);
  }

  /**
   * Trigger an event.
   */
  emit<K extends keyof T>(event: K, data: T[K]) {
    this.handlers[event]?.forEach(handler => handler(data));
  }
}

// Export a singleton instance for use across the app
export const eventBus = new EventBus<EventMap>();
