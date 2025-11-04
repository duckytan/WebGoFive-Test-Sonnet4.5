/**
 * GameState - 游戏状态管理
 * 职责：维护棋盘数据、历史记录、游戏配置
 */
class GameState {
  constructor(boardSize = 15) {
    this.boardSize = boardSize;
    this.board = Array(boardSize)
      .fill()
      .map(() => Array(boardSize).fill(0));
    this.currentPlayer = 1;
    this.moveHistory = [];
    this.mode = 'PvP';
    this.settings = {
      forbiddenRules: true,
      aiDifficulty: 'NORMAL',
      blackAI: 'NORMAL',
      whiteAI: 'NORMAL',
      firstPlayer: 1,
    };
    this.gameStatus = 'ready';
    this.winner = null;
    this.winLine = null;
    this.startTime = null;
    this.endTime = null;
  }

  /**
   * 重置游戏状态
   */
  reset() {
    this.board = Array(this.boardSize)
      .fill()
      .map(() => Array(this.boardSize).fill(0));
    this.currentPlayer = this.settings.firstPlayer || 1;
    this.moveHistory = [];
    this.gameStatus = 'ready';
    this.winner = null;
    this.winLine = null;
    this.startTime = null;
    this.endTime = null;
  }

  /**
   * 应用落子
   * @param {Object} move - 落子信息
   * @param {number} move.x - X坐标
   * @param {number} move.y - Y坐标
   * @param {number} [move.player] - 玩家（默认为当前玩家）
   * @param {number} [move.aiScore] - AI评分（可选）
   */
  applyMove(move) {
    const { x, y, player = this.currentPlayer, aiScore } = move;

    if (!this.isValidPosition(x, y)) {
      throw new Error(`Invalid position: (${x}, ${y})`);
    }

    if (this.board[y][x] !== 0) {
      throw new Error(`Position occupied: (${x}, ${y})`);
    }

    if (this.gameStatus === 'finished') {
      throw new Error('Game already finished');
    }

    this.board[y][x] = player;

    const moveRecord = {
      step: this.moveHistory.length + 1,
      player,
      x,
      y,
      timestamp: Date.now(),
    };

    if (aiScore !== undefined) {
      moveRecord.aiScore = aiScore;
    }

    this.moveHistory.push(moveRecord);

    if (this.gameStatus === 'ready') {
      this.gameStatus = 'playing';
      this.startTime = Date.now();
    }
  }

  /**
   * 撤回落子
   * @returns {Object|null} 被撤回的落子信息
   */
  undoMove() {
    if (this.moveHistory.length === 0) {
      return null;
    }

    const lastMove = this.moveHistory.pop();
    this.board[lastMove.y][lastMove.x] = 0;

    if (this.moveHistory.length === 0) {
      this.gameStatus = 'ready';
      this.startTime = null;
    }

    return lastMove;
  }

  /**
   * 切换当前玩家
   */
  switchPlayer() {
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
  }

  /**
   * 检查位置是否有效
   */
  isValidPosition(x, y) {
    return x >= 0 && x < this.boardSize && y >= 0 && y < this.boardSize;
  }

  /**
   * 获取指定位置的棋子
   */
  getPiece(x, y) {
    if (!this.isValidPosition(x, y)) {
      return null;
    }
    return this.board[y][x];
  }

  /**
   * 设置指定位置的棋子（仅供内部使用）
   */
  setPiece(x, y, player) {
    if (!this.isValidPosition(x, y)) {
      throw new Error(`Invalid position: (${x}, ${y})`);
    }
    this.board[y][x] = player;
  }

  /**
   * 结束游戏
   * @param {number} winner - 胜者 (1=黑, 2=白, 0=平局)
   * @param {Array} [winLine] - 五连坐标
   * @param {string} [reason] - 结束原因
   */
  finishGame(winner, winLine = null, reason = 'five_in_row') {
    this.gameStatus = 'finished';
    this.winner = winner;
    this.winLine = winLine;
    this.endTime = Date.now();
    this.finishReason = reason;
  }

  /**
   * 获取游戏时长（秒）
   */
  getDuration() {
    if (!this.startTime) return 0;
    const endTime = this.endTime || Date.now();
    return Math.floor((endTime - this.startTime) / 1000);
  }

  /**
   * 获取快照（深拷贝）
   */
  getSnapshot() {
    return JSON.parse(
      JSON.stringify({
        boardSize: this.boardSize,
        board: this.board,
        currentPlayer: this.currentPlayer,
        moveHistory: this.moveHistory,
        mode: this.mode,
        settings: this.settings,
        gameStatus: this.gameStatus,
        winner: this.winner,
        winLine: this.winLine,
        startTime: this.startTime,
        endTime: this.endTime,
        finishReason: this.finishReason,
      })
    );
  }

  /**
   * 从快照恢复状态
   */
  restoreSnapshot(snapshot) {
    const data = JSON.parse(JSON.stringify(snapshot));
    Object.assign(this, data);
  }
}

// 模块元信息
GameState.__moduleInfo = {
  name: 'GameState',
  version: '2.0.0',
  author: 'Project Team',
  dependencies: [],
  optionalDependencies: [],
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.GameState = GameState;

  window.dispatchEvent(
    new CustomEvent('moduleLoaded', {
      detail: GameState.__moduleInfo,
    })
  );
}

// 支持 ES Module
export default GameState;
