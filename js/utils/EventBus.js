/**
 * EventBus - 事件总线
 * 职责：提供发布-订阅模式，解耦模块间通信
 */
class EventBus {
  constructor() {
    this.listeners = {};
  }

  /**
   * 订阅事件
   * @param {string} event - 事件名
   * @param {Function} handler - 处理函数
   * @returns {Function} 取消订阅函数
   */
  on(event, handler) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(handler);

    return () => this.off(event, handler);
  }

  /**
   * 取消订阅
   * @param {string} event - 事件名
   * @param {Function} handler - 处理函数
   */
  off(event, handler) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((h) => h !== handler);
  }

  /**
   * 发布事件
   * @param {string} event - 事件名
   * @param {*} data - 事件数据
   */
  emit(event, data) {
    if (!this.listeners[event]) return;

    this.listeners[event].forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error(`[EventBus] Error in handler for event "${event}":`, error);
      }
    });
  }

  /**
   * 订阅一次性事件
   * @param {string} event - 事件名
   * @param {Function} handler - 处理函数
   */
  once(event, handler) {
    const onceHandler = (data) => {
      handler(data);
      this.off(event, onceHandler);
    };
    this.on(event, onceHandler);
  }

  /**
   * 清除所有事件监听
   * @param {string} [event] - 事件名（可选，不传则清除所有）
   */
  clear(event) {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }
}

// 模块元信息
EventBus.__moduleInfo = {
  name: 'EventBus',
  version: '2.0.0',
  author: 'Project Team',
  dependencies: [],
  optionalDependencies: [],
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.EventBus = EventBus;

  window.dispatchEvent(
    new CustomEvent('moduleLoaded', {
      detail: EventBus.__moduleInfo,
    })
  );
}

// 支持 ES Module
export default EventBus;
