/**
 * SaveLoadService - 存档加载服务
 * 职责：本地存储、JSON导入导出
 */
class SaveLoadService {
  constructor(gameState) {
    this.state = gameState;
    this.storagePrefix = 'gomoku:';
  }

  /**
   * 保存到LocalStorage
   * @param {string} [key='lastGameState'] - 存储键
   * @returns {boolean} 是否成功
   */
  save(key = 'lastGameState') {
    try {
      const snapshot = this.state.getSnapshot();
      const data = {
        version: '2.0.0',
        timestamp: Date.now(),
        snapshot,
      };

      localStorage.setItem(this.storagePrefix + key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('[SaveLoad] Save failed:', error);
      return false;
    }
  }

  /**
   * 从LocalStorage加载
   * @param {string} [key='lastGameState'] - 存储键
   * @returns {boolean} 是否成功
   */
  load(key = 'lastGameState') {
    try {
      const dataStr = localStorage.getItem(this.storagePrefix + key);
      if (!dataStr) {
        return false;
      }

      const data = JSON.parse(dataStr);
      this.state.restoreSnapshot(data.snapshot);
      return true;
    } catch (error) {
      console.error('[SaveLoad] Load failed:', error);
      return false;
    }
  }

  /**
   * 导出为JSON文件
   * @param {string} [filename] - 文件名
   */
  exportJSON(filename) {
    const snapshot = this.state.getSnapshot();
    const data = {
      version: '2.0.0',
      exportTime: new Date().toISOString(),
      game: snapshot,
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const defaultFilename = `gomoku_${Date.now()}.json`;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || defaultFilename;
    link.click();

    URL.revokeObjectURL(url);
  }

  /**
   * 从JSON文件导入
   * @param {File} file - 文件对象
   * @returns {Promise<boolean>} 是否成功
   */
  async importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);

          if (!data.game) {
            throw new Error('Invalid file format');
          }

          this.state.restoreSnapshot(data.game);
          resolve(true);
        } catch (error) {
          console.error('[SaveLoad] Import failed:', error);
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('File read error'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * 清除存储
   * @param {string} [key] - 存储键（可选，不传则清除所有）
   */
  clear(key) {
    if (key) {
      localStorage.removeItem(this.storagePrefix + key);
    } else {
      const keys = Object.keys(localStorage);
      keys.forEach((k) => {
        if (k.startsWith(this.storagePrefix)) {
          localStorage.removeItem(k);
        }
      });
    }
  }

  /**
   * 获取存储列表
   * @returns {Array} 存储键列表
   */
  listSaves() {
    const saves = [];
    const keys = Object.keys(localStorage);

    keys.forEach((key) => {
      if (key.startsWith(this.storagePrefix)) {
        try {
          const dataStr = localStorage.getItem(key);
          const data = JSON.parse(dataStr);
          saves.push({
            key: key.replace(this.storagePrefix, ''),
            timestamp: data.timestamp,
            version: data.version,
          });
        } catch (error) {
          console.error('[SaveLoad] Error reading save:', key, error);
        }
      }
    });

    return saves.sort((a, b) => b.timestamp - a.timestamp);
  }
}

// 模块元信息
SaveLoadService.__moduleInfo = {
  name: 'SaveLoadService',
  version: '2.0.0',
  author: 'Project Team',
  dependencies: ['GameState'],
  optionalDependencies: [],
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.SaveLoadService = SaveLoadService;

  window.dispatchEvent(
    new CustomEvent('moduleLoaded', {
      detail: SaveLoadService.__moduleInfo,
    })
  );
}

// 支持 ES Module
export default SaveLoadService;
