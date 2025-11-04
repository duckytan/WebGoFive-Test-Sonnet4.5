/**
 * Logger - 统一日志工具
 * 职责：提供分级日志输出，支持开关控制
 */
class Logger {
  static levels = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
  };

  static currentLevel = Logger.levels.INFO;

  /**
   * 设置日志级别
   * @param {string} level - 日志级别 (DEBUG/INFO/WARN/ERROR)
   */
  static setLevel(level) {
    const upperLevel = level.toUpperCase();
    if (Logger.levels[upperLevel] !== undefined) {
      Logger.currentLevel = Logger.levels[upperLevel];
    }
  }

  /**
   * Debug日志
   * @param {string} module - 模块名
   * @param {string} message - 消息
   * @param {*} [data] - 附加数据
   */
  static debug(module, message, data) {
    if (Logger.currentLevel > Logger.levels.DEBUG) return;
    console.debug(`[${module}]`, message, data !== undefined ? data : '');
  }

  /**
   * Info日志
   * @param {string} module - 模块名
   * @param {string} message - 消息
   * @param {*} [data] - 附加数据
   */
  static info(module, message, data) {
    if (Logger.currentLevel > Logger.levels.INFO) return;
    console.log(`[${module}]`, message, data !== undefined ? data : '');
  }

  /**
   * Warning日志
   * @param {string} module - 模块名
   * @param {string} message - 消息
   * @param {*} [data] - 附加数据
   */
  static warn(module, message, data) {
    if (Logger.currentLevel > Logger.levels.WARN) return;
    console.warn(`[${module}]`, message, data !== undefined ? data : '');
  }

  /**
   * Error日志
   * @param {string} module - 模块名
   * @param {string} message - 消息
   * @param {Error|*} error - 错误对象或数据
   */
  static error(module, message, error) {
    console.error(`[${module}]`, message, error);
  }
}

// 模块元信息
Logger.__moduleInfo = {
  name: 'Logger',
  version: '2.0.0',
  author: 'Project Team',
  dependencies: [],
  optionalDependencies: [],
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.Logger = Logger;

  window.dispatchEvent(
    new CustomEvent('moduleLoaded', {
      detail: Logger.__moduleInfo,
    })
  );
}

// 支持 ES Module
export default Logger;
