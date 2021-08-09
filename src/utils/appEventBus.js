import EventEmitter from 'es6-event-emitter';

class AppEventBus extends EventEmitter {}

const appEventBus = new AppEventBus();

/*
 * **[`on`](#on)**
 * **[`off`](#off)**
 * **[`once`](#once)**
 * **[`trigger`](#trigger)**
 * **[`destroy`](#destroy)**
 */

export default appEventBus;
