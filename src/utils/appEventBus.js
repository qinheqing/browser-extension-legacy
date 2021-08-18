import EventEmitter from 'events';

class AppEventBus extends EventEmitter {}

const appEventBus = new AppEventBus();

// https://nodejs.org/dist/v11.13.0/docs/api/events.html
/*
 * **[`on`](#on)**
 * **[`off`](#off)**
 * **[`once`](#once)**
 * **[`emit`](#emit)**
 * **[`removeAllListeners`](#removeAllListeners)**
 */

export default appEventBus;
