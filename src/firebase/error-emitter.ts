import { EventEmitter } from 'events';

// Since we're in a browser environment that might not have EventEmitter,
// we can use a simple polyfill or a library. For simplicity, a basic implementation:

class SimpleEventEmitter {
  private listeners: { [event: string]: Function[] } = {};

  on(event: string, listener: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  emit(event: string, ...args: any[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(listener => listener(...args));
    }
  }
}


export const errorEmitter = new SimpleEventEmitter();
