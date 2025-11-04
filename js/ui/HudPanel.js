/**
 * HudPanel - 信息面板
 * 职责：显示游戏状态、控制按钮、提示信息
 */
class HudPanel {
  constructor(gameState, eventBus) {
    this.state = gameState;
    this.eventBus = eventBus;

    this.elements = {
      currentPlayer: document.getElementById('current-player'),
      gameMode: document.getElementById('game-mode'),
      moveCount: document.getElementById('move-count'),
      gameTime: document.getElementById('game-time'),
      message: document.getElementById('message'),
    };

    this.timerInterval = null;
    this.setupEventListeners();
  }

  /**
   * 设置事件监听
   */
  setupEventListeners() {
    if (this.eventBus) {
      this.eventBus.on('game:started', () => {
        this.startTimer();
        this.updateDisplay();
      });

      this.eventBus.on('game:reset', () => {
        this.stopTimer();
        this.updateDisplay();
        this.clearMessage();
      });

      this.eventBus.on('move:applied', () => {
        this.updateDisplay();
      });

      this.eventBus.on('player:switched', () => {
        this.updateDisplay();
      });

      this.eventBus.on('game:finished', (data) => {
        this.stopTimer();
        this.showGameResult(data);
      });

      this.eventBus.on('mode:changed', (data) => {
        this.updateGameMode(data.mode);
      });

      this.eventBus.on('ai:thinking', (data) => {
        this.showMessage(
          `${data.player === 1 ? '黑方' : '白方'} AI 思考中...`,
          'info'
        );
      });

      this.eventBus.on('ai:moved', (data) => {
        this.clearMessage();
      });

      this.eventBus.on('move:invalid', (data) => {
        if (data.forbiddenInfo) {
          this.showMessage(
            `⚠️ ${data.forbiddenInfo.type}，黑棋不能在此位置落子`,
            'warning',
            2000
          );
        } else {
          this.showMessage(`❌ ${data.error}`, 'error', 1500);
        }
      });

      this.eventBus.on('hint:provided', (data) => {
        this.showMessage(
          `💡 建议落子位置: (${data.x}, ${data.y})`,
          'success',
          3000
        );
      });
    }
  }

  /**
   * 更新显示
   */
  updateDisplay() {
    this.updateCurrentPlayer();
    this.updateMoveCount();
  }

  /**
   * 更新当前玩家显示
   */
  updateCurrentPlayer() {
    if (this.elements.currentPlayer) {
      const player = this.state.currentPlayer;
      const playerName = player === 1 ? '黑方' : '白方';
      const playerColor = player === 1 ? '⚫' : '⚪';

      this.elements.currentPlayer.textContent = `${playerColor} ${playerName}`;
      this.elements.currentPlayer.className = player === 1 ? 'player-black' : 'player-white';
    }
  }

  /**
   * 更新游戏模式显示
   */
  updateGameMode(mode) {
    if (this.elements.gameMode) {
      const modeNames = {
        PvP: '玩家对战',
        PvE: '人机对战',
        EvE: '机机对战',
      };

      this.elements.gameMode.textContent = modeNames[mode] || mode;
    }
  }

  /**
   * 更新步数显示
   */
  updateMoveCount() {
    if (this.elements.moveCount) {
      this.elements.moveCount.textContent = this.state.moveHistory.length;
    }
  }

  /**
   * 开始计时器
   */
  startTimer() {
    this.stopTimer();

    this.timerInterval = setInterval(() => {
      if (this.elements.gameTime) {
        const duration = this.state.getDuration();
        this.elements.gameTime.textContent = this.formatTime(duration);
      }
    }, 1000);
  }

  /**
   * 停止计时器
   */
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * 格式化时间
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * 显示消息
   */
  showMessage(text, type = 'info', duration = 0) {
    if (!this.elements.message) return;

    this.elements.message.textContent = text;
    this.elements.message.className = `message message-${type}`;
    this.elements.message.style.display = 'block';

    if (duration > 0) {
      setTimeout(() => {
        this.clearMessage();
      }, duration);
    }
  }

  /**
   * 清除消息
   */
  clearMessage() {
    if (this.elements.message) {
      this.elements.message.style.display = 'none';
      this.elements.message.textContent = '';
    }
  }

  /**
   * 显示游戏结果
   */
  showGameResult(data) {
    let message = '';

    if (data.winner === 0) {
      message = '🤝 平局！';
    } else {
      const winnerName = data.winner === 1 ? '⚫ 黑方' : '⚪ 白方';
      message = `🎉 ${winnerName} 获胜！`;
    }

    this.showMessage(message, 'success');
  }
}

// 模块元信息
HudPanel.__moduleInfo = {
  name: 'HudPanel',
  version: '2.0.0',
  author: 'Project Team',
  dependencies: ['GameState', 'EventBus'],
  optionalDependencies: [],
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.HudPanel = HudPanel;

  window.dispatchEvent(
    new CustomEvent('moduleLoaded', {
      detail: HudPanel.__moduleInfo,
    })
  );
}

// 支持 ES Module
export default HudPanel;
