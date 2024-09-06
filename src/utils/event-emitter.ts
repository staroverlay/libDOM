export type EventListener = (...args: unknown[]) => unknown;

export default class EventEmitter {
  private readonly listeners: Map<string, EventListener[]>;

  constructor() {
    this.listeners = new Map();
  }

  on(eventName: string, listener: EventListener) {
    const group = this.listeners.get(eventName) || [];
    group.push(listener);
    this.listeners.set(eventName, group);
  }

  emit(eventName: string, ...args: unknown[]) {
    const group = this.listeners.get(eventName) || [];
    for (const listener of group) {
      listener(...args);
    }
  }
}
