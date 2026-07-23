import { EventEmitter } from 'node:events';

class EventBus extends EventEmitter {}

export const eventBus = new EventBus();

// Optionally, you can set max listeners if you have many services
eventBus.setMaxListeners(20);
