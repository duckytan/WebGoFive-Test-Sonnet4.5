/**
 * EvaluationService - 局面评估服务
 * 职责：计算棋盘局面分数，识别棋型
 */
class EvaluationService {
  constructor(gameState, ruleEngine) {
    this.state = gameState;
    this.rules = ruleEngine;

    this.SCORE_TABLE = {
      FIVE: 1000000,
      OPEN_FOUR: 160000,
      CLOSED_FOUR: 42000,
      BROKEN_FOUR: 55000,
      OPEN_THREE: 12000,
      CLOSED_THREE: 2600,
      BROKEN_THREE: 6200,
      OPEN_TWO: 600,
      CLOSED_TWO: 150,
      DOUBLE_OPEN_FOUR: 420000,
      DOUBLE_BROKEN_FOUR: 200000,
      OPEN_FOUR_OPEN_THREE: 120000,
      DOUBLE_OPEN_THREE: 36000,
      OPEN_THREE_CLOSED_THREE: 18000,
    };

    this.directions = [
      { dx: 1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 1, dy: 1 },
      { dx: 1, dy: -1 },
    ];
  }

  /**
   * 评估整个局面
   * @param {number} player - 评估玩家
   * @returns {number} 局面分数
   */
  evaluate(player) {
    const opponent = player === 1 ? 2 : 1;
    const myScore = this.evaluatePlayer(player);
    const opponentScore = this.evaluatePlayer(opponent);

    return myScore - opponentScore * 1.1;
  }

  /**
   * 评估指定玩家的分数
   */
  evaluatePlayer(player) {
    let totalScore = 0;

    for (let y = 0; y < this.state.boardSize; y++) {
      for (let x = 0; x < this.state.boardSize; x++) {
        if (this.state.board[y][x] === 0) {
          totalScore += this.evaluatePosition(x, y, player);
        }
      }
    }

    return totalScore;
  }

  /**
   * 评估指定位置的分数
   */
  evaluatePosition(x, y, player) {
    const patterns = this.analyzeAllDirections(x, y, player);
    let score = 0;

    if (patterns.five > 0) {
      return this.SCORE_TABLE.FIVE;
    }

    if (patterns.openFour >= 2) {
      return this.SCORE_TABLE.DOUBLE_OPEN_FOUR;
    }

    if (patterns.openFour >= 1 && patterns.openThree >= 1) {
      return this.SCORE_TABLE.OPEN_FOUR_OPEN_THREE;
    }

    if (patterns.openFour >= 1) {
      score += this.SCORE_TABLE.OPEN_FOUR;
    }

    if (patterns.closedFour >= 2) {
      score += this.SCORE_TABLE.DOUBLE_BROKEN_FOUR;
    }

    if (patterns.openThree >= 2) {
      score += this.SCORE_TABLE.DOUBLE_OPEN_THREE;
    }

    score += patterns.closedFour * this.SCORE_TABLE.CLOSED_FOUR;
    score += patterns.brokenFour * this.SCORE_TABLE.BROKEN_FOUR;
    score += patterns.openThree * this.SCORE_TABLE.OPEN_THREE;
    score += patterns.closedThree * this.SCORE_TABLE.CLOSED_THREE;
    score += patterns.brokenThree * this.SCORE_TABLE.BROKEN_THREE;
    score += patterns.openTwo * this.SCORE_TABLE.OPEN_TWO;
    score += patterns.closedTwo * this.SCORE_TABLE.CLOSED_TWO;

    const positionalScore = this.getPositionalScore(x, y);
    score += positionalScore;

    return score;
  }

  /**
   * 分析所有方向的棋型
   */
  analyzeAllDirections(x, y, player) {
    const patterns = {
      five: 0,
      openFour: 0,
      closedFour: 0,
      brokenFour: 0,
      openThree: 0,
      closedThree: 0,
      brokenThree: 0,
      openTwo: 0,
      closedTwo: 0,
    };

    const originalPiece = this.state.board[y][x];
    this.state.board[y][x] = player;

    for (const dir of this.directions) {
      const pattern = this.analyzeDirection(x, y, dir.dx, dir.dy, player);
      this.addPattern(patterns, pattern);
    }

    this.state.board[y][x] = originalPiece;

    return patterns;
  }

  /**
   * 分析单个方向
   */
  analyzeDirection(x, y, dx, dy, player) {
    const signature = this.rules.getLineSignature(x, y, dx, dy, player, 5);
    return this.matchPattern(signature);
  }

  /**
   * 匹配棋型
   */
  matchPattern(signature) {
    const pattern = {
      five: 0,
      openFour: 0,
      closedFour: 0,
      brokenFour: 0,
      openThree: 0,
      closedThree: 0,
      brokenThree: 0,
      openTwo: 0,
      closedTwo: 0,
    };

    if (/OOOOO/.test(signature)) {
      pattern.five = 1;
      return pattern;
    }

    if (/_OOOO_/.test(signature)) {
      pattern.openFour = 1;
    } else if (/XOOOO_|_OOOOX/.test(signature)) {
      pattern.closedFour = 1;
    } else if (/_OOO_O_|_O_OOO_/.test(signature)) {
      pattern.brokenFour = 1;
    }

    if (/_OOO__/.test(signature) || /__OOO_/.test(signature)) {
      pattern.openThree = 1;
    } else if (/XOOO__|__OOOX/.test(signature)) {
      pattern.closedThree = 1;
    } else if (/_OO_O_|_O_OO_/.test(signature)) {
      pattern.brokenThree = 1;
    }

    if (/_OO___/.test(signature) || /___OO_/.test(signature)) {
      pattern.openTwo = 1;
    } else if (/XOO___|___OOX/.test(signature)) {
      pattern.closedTwo = 1;
    }

    return pattern;
  }

  /**
   * 累加棋型计数
   */
  addPattern(target, source) {
    for (const key in source) {
      target[key] += source[key];
    }
  }

  /**
   * 获取位置分数
   */
  getPositionalScore(x, y) {
    const center = Math.floor(this.state.boardSize / 2);
    const dx = Math.abs(x - center);
    const dy = Math.abs(y - center);
    return Math.max(0, 7 - dx) + Math.max(0, 7 - dy);
  }
}

// 模块元信息
EvaluationService.__moduleInfo = {
  name: 'EvaluationService',
  version: '2.0.0',
  author: 'Project Team',
  dependencies: ['GameState', 'RuleEngine'],
  optionalDependencies: [],
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.EvaluationService = EvaluationService;

  window.dispatchEvent(
    new CustomEvent('moduleLoaded', {
      detail: EvaluationService.__moduleInfo,
    })
  );
}

// 支持 ES Module
export default EvaluationService;
