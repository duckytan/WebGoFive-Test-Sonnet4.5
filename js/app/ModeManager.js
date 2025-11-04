/**
 * ModeManager - 游戏模式管理器
 * 职责：PvP/PvE/EvE模式切换、流程控制、AI调度
 */
class ModeManager {
  constructor(gameState, aiEngine, ruleEngine, eventBus) {
    this.state = gameState;
    this.ai = aiEngine;
    this.rules = ruleEngine;
    this.eventBus = eventBus;

    this.currentMode = 'PvP';
    this.eveAutoPlay = false;
    this.isAIThinking = false;
    this.gameEnabled = true;
  }

  /**
   * 设置游戏模式
   * @param {string} mode - PvP | PvE | EvE
   */
  setMode(mode) {
    if (!['PvP', 'PvE', 'EvE'].includes(mode)) {
      throw new Error(`Invalid mode: ${mode}`);
    }

    this.currentMode = mode;
    this.state.mode = mode;

    if (this.eventBus) {
      this.eventBus.emit('mode:changed', { mode });
    }
  }

  /**
   * 开始新游戏
   */
  startNewGame() {
    this.state.reset();
    this.eveAutoPlay = false;
    this.isAIThinking = false;
    this.gameEnabled = true;

    if (this.eventBus) {
      this.eventBus.emit('game:reset', {});
      this.eventBus.emit('game:started', {
        mode: this.currentMode,
        settings: this.state.settings,
      });
    }

    if (this.currentMode === 'EvE') {
      this.startEvEMode();
    } else if (this.currentMode === 'PvE' && this.state.currentPlayer === 2) {
      this.triggerAIMove();
    }
  }

  /**
   * 处理落子
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @returns {Promise<Object>} 处理结果
   */
  async handleMove(x, y) {
    if (!this.gameEnabled) {
      return { success: false, error: 'Game is disabled' };
    }

    if (this.isAIThinking) {
      return { success: false, error: 'AI is thinking' };
    }

    if (this.state.gameStatus === 'finished') {
      return { success: false, error: 'Game already finished' };
    }

    if (this.currentMode === 'EvE' && this.eveAutoPlay) {
      return { success: false, error: 'EvE mode is in auto play' };
    }

    const player = this.state.currentPlayer;

    const validation = this.rules.validateMove(x, y, player);
    if (!validation.valid) {
      if (this.eventBus) {
        this.eventBus.emit('move:invalid', {
          x,
          y,
          error: validation.error,
          forbiddenInfo: validation.forbiddenInfo,
        });
      }
      return { success: false, error: validation.error, forbiddenInfo: validation.forbiddenInfo };
    }

    this.state.applyMove({ x, y, player });

    if (this.eventBus) {
      this.eventBus.emit('move:applied', { x, y, player });
    }

    const winCheck = this.rules.checkWin(x, y, player);
    if (winCheck.isWin) {
      this.finishGame(player, winCheck.winLine);
      return { success: true, gameOver: true, winner: player };
    }

    if (this.rules.checkDraw()) {
      this.finishGame(0, null, 'draw');
      return { success: true, gameOver: true, winner: 0 };
    }

    this.state.switchPlayer();

    if (this.eventBus) {
      this.eventBus.emit('player:switched', {
        currentPlayer: this.state.currentPlayer,
      });
    }

    if (this.shouldAIMove()) {
      await this.triggerAIMove();
    }

    return { success: true, gameOver: false };
  }

  /**
   * 触发AI落子
   */
  async triggerAIMove() {
    if (this.isAIThinking) return;

    const player = this.state.currentPlayer;
    const difficulty = player === 1 ? this.state.settings.blackAI : this.state.settings.whiteAI;

    this.isAIThinking = true;

    if (this.eventBus) {
      this.eventBus.emit('ai:thinking', {
        player,
        difficulty,
      });
    }

    try {
      const move = await this.ai.computeMove(player, difficulty);

      this.isAIThinking = false;

      if (this.eventBus) {
        this.eventBus.emit('ai:moved', {
          x: move.x,
          y: move.y,
          player,
          score: move.score,
          thinkingTime: move.thinkingTime,
        });
      }

      await this.handleMove(move.x, move.y);
    } catch (error) {
      this.isAIThinking = false;

      if (this.eventBus) {
        this.eventBus.emit('ai:error', { error: error.message });
      }

      console.error('[ModeManager] AI error:', error);
    }
  }

  /**
   * 判断是否应该AI落子
   */
  shouldAIMove() {
    if (this.state.gameStatus === 'finished') return false;

    if (this.currentMode === 'PvP') {
      return false;
    } else if (this.currentMode === 'EvE') {
      return this.eveAutoPlay;
    } else if (this.currentMode === 'PvE') {
      return this.state.currentPlayer === 2;
    }

    return false;
  }

  /**
   * 开始EvE自动对战
   */
  startEvEMode() {
    this.eveAutoPlay = true;
    this.triggerAIMove();
  }

  /**
   * 暂停EvE自动对战
   */
  pauseEvEMode() {
    this.eveAutoPlay = false;
  }

  /**
   * 结束游戏
   */
  finishGame(winner, winLine = null, reason = 'five_in_row') {
    this.state.finishGame(winner, winLine, reason);
    this.eveAutoPlay = false;
    this.isAIThinking = false;

    if (this.eventBus) {
      this.eventBus.emit('game:finished', {
        winner,
        winLine,
        reason,
        duration: this.state.getDuration(),
      });
    }
  }

  /**
   * 悔棋
   */
  undoMove() {
    if (this.currentMode === 'EvE') {
      return { success: false, error: 'Cannot undo in EvE mode' };
    }

    if (this.state.moveHistory.length === 0) {
      return { success: false, error: 'No moves to undo' };
    }

    if (this.isAIThinking) {
      return { success: false, error: 'AI is thinking' };
    }

    const lastMove = this.state.undoMove();

    if (this.currentMode === 'PvE' && this.state.moveHistory.length > 0) {
      const prevMove = this.state.undoMove();
      this.state.currentPlayer = 1;

      if (this.eventBus) {
        this.eventBus.emit('move:undone', { moves: [lastMove, prevMove] });
      }
    } else {
      this.state.currentPlayer = lastMove.player;

      if (this.eventBus) {
        this.eventBus.emit('move:undone', { moves: [lastMove] });
      }
    }

    return { success: true };
  }

  /**
   * 获取AI建议
   */
  async getHint() {
    if (this.currentMode === 'EvE' && this.eveAutoPlay) {
      return { success: false, error: 'Hints not available in EvE auto mode' };
    }

    if (this.isAIThinking) {
      return { success: false, error: 'AI is thinking' };
    }

    const player = this.state.currentPlayer;

    try {
      const move = await this.ai.computeMove(player, 'NORMAL');

      if (this.eventBus) {
        this.eventBus.emit('hint:provided', {
          x: move.x,
          y: move.y,
          player,
        });
      }

      return { success: true, x: move.x, y: move.y };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// 模块元信息
ModeManager.__moduleInfo = {
  name: 'ModeManager',
  version: '2.0.0',
  author: 'Project Team',
  dependencies: ['GameState', 'AIEngine', 'RuleEngine', 'EventBus'],
  optionalDependencies: [],
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.ModeManager = ModeManager;

  window.dispatchEvent(
    new CustomEvent('moduleLoaded', {
      detail: ModeManager.__moduleInfo,
    })
  );
}

// 支持 ES Module
export default ModeManager;
