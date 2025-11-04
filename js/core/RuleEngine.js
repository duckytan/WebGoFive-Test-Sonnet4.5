/**
 * RuleEngine - 五子棋规则引擎
 * 职责：胜负判定、禁手检测、棋型分析
 */
class RuleEngine {
  constructor(gameState) {
    this.state = gameState;
    this.directions = [
      { dx: 1, dy: 0, name: 'horizontal' },
      { dx: 0, dy: 1, name: 'vertical' },
      { dx: 1, dy: 1, name: 'diagDown' },
      { dx: 1, dy: -1, name: 'diagUp' },
    ];
  }

  /**
   * 验证落子是否合法
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} [player] - 玩家（默认为当前玩家）
   * @returns {Object} { valid: boolean, error?: string, forbiddenInfo?: object }
   */
  validateMove(x, y, player = this.state.currentPlayer) {
    if (!this.state.isValidPosition(x, y)) {
      return { valid: false, error: 'Invalid position' };
    }

    if (this.state.board[y][x] !== 0) {
      return { valid: false, error: 'Position occupied' };
    }

    if (this.state.gameStatus === 'finished') {
      return { valid: false, error: 'Game already finished' };
    }

    if (this.state.settings.forbiddenRules && player === 1) {
      const forbiddenInfo = this.detectForbidden(x, y, player);
      if (forbiddenInfo.isForbidden) {
        return { valid: false, error: 'Forbidden move', forbiddenInfo };
      }
    }

    return { valid: true };
  }

  /**
   * 检查是否获胜
   * @param {number} x - 最后落子X坐标
   * @param {number} y - 最后落子Y坐标
   * @param {number} player - 玩家
   * @returns {Object} { isWin: boolean, winLine?: Array, direction?: string }
   */
  checkWin(x, y, player) {
    for (const dir of this.directions) {
      const line = this.getLine(x, y, dir.dx, dir.dy, player);
      if (line.length >= 5) {
        return {
          isWin: true,
          winLine: line.slice(0, 5),
          direction: dir.name,
        };
      }
    }
    return { isWin: false };
  }

  /**
   * 获取指定方向的连子
   * @returns {Array} 连续棋子的坐标数组
   */
  getLine(x, y, dx, dy, player) {
    const line = [{ x, y }];

    for (let i = 1; i < this.state.boardSize; i++) {
      const nx = x + dx * i;
      const ny = y + dy * i;
      if (!this.state.isValidPosition(nx, ny)) break;
      if (this.state.board[ny][nx] !== player) break;
      line.push({ x: nx, y: ny });
    }

    for (let i = 1; i < this.state.boardSize; i++) {
      const nx = x - dx * i;
      const ny = y - dy * i;
      if (!this.state.isValidPosition(nx, ny)) break;
      if (this.state.board[ny][nx] !== player) break;
      line.unshift({ x: nx, y: ny });
    }

    return line;
  }

  /**
   * 禁手检测（仅黑棋）
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} player - 玩家
   * @returns {Object} { isForbidden: boolean, type?: string, details?: object }
   */
  detectForbidden(x, y, player = 1) {
    if (player !== 1) {
      return { isForbidden: false };
    }

    this.state.board[y][x] = player;

    const longLine = this.checkLongLine(x, y, player);
    if (longLine.hasLongLine) {
      this.state.board[y][x] = 0;
      return {
        isForbidden: true,
        type: '长连禁手',
        details: { longLine },
      };
    }

    const openThrees = this.countOpenThrees(x, y, player);
    const fours = this.countFours(x, y, player);

    this.state.board[y][x] = 0;

    if (openThrees.total >= 2) {
      return {
        isForbidden: true,
        type: '三三禁手',
        details: { openThrees, fours },
      };
    }

    if (fours.total >= 2) {
      return {
        isForbidden: true,
        type: '四四禁手',
        details: { openThrees, fours },
      };
    }

    return { isForbidden: false, details: { openThrees, fours } };
  }

  /**
   * 检查长连
   */
  checkLongLine(x, y, player) {
    for (const dir of this.directions) {
      const line = this.getLine(x, y, dir.dx, dir.dy, player);
      if (line.length >= 6) {
        return {
          hasLongLine: true,
          direction: dir.name,
          length: line.length,
          line: line,
        };
      }
    }
    return { hasLongLine: false };
  }

  /**
   * 统计活三数量
   */
  countOpenThrees(x, y, player) {
    const openThrees = {
      total: 0,
      directions: [],
    };

    for (const dir of this.directions) {
      const pattern = this.analyzePattern(x, y, dir.dx, dir.dy, player);
      if (pattern.isOpenThree) {
        openThrees.total++;
        openThrees.directions.push({
          direction: dir.name,
          pattern: pattern.signature,
        });
      }
    }

    return openThrees;
  }

  /**
   * 统计四的数量（活四+冲四）
   */
  countFours(x, y, player) {
    const fours = {
      total: 0,
      openFours: 0,
      closedFours: 0,
      directions: [],
    };

    for (const dir of this.directions) {
      const pattern = this.analyzePattern(x, y, dir.dx, dir.dy, player);
      if (pattern.isOpenFour) {
        fours.total++;
        fours.openFours++;
        fours.directions.push({
          direction: dir.name,
          type: 'open',
          pattern: pattern.signature,
        });
      } else if (pattern.isClosedFour) {
        fours.total++;
        fours.closedFours++;
        fours.directions.push({
          direction: dir.name,
          type: 'closed',
          pattern: pattern.signature,
        });
      }
    }

    return fours;
  }

  /**
   * 分析指定方向的棋型
   */
  analyzePattern(x, y, dx, dy, player) {
    const signature = this.getLineSignature(x, y, dx, dy, player, 5);
    const result = {
      signature,
      isOpenFour: false,
      isClosedFour: false,
      isOpenThree: false,
    };

    if (/_OOOO_/.test(signature)) {
      result.isOpenFour = true;
    } else if (/XOOOO_|_OOOOX/.test(signature) || /OOOO_/.test(signature) || /_OOOO/.test(signature)) {
      result.isClosedFour = true;
    } else if (/OOO_O|O_OOO/.test(signature)) {
      result.isClosedFour = true;
    }

    if (/_OOO__/.test(signature) || /__OOO_/.test(signature)) {
      const hasSpace = signature.includes('__');
      if (hasSpace) {
        result.isOpenThree = true;
      }
    } else if (/_OO_O_|_O_OO_/.test(signature)) {
      result.isOpenThree = true;
    }

    return result;
  }

  /**
   * 生成线性签名
   * @param {number} range - 检测范围
   * @returns {string} 签名字符串（O=己方，X=对方，_=空）
   */
  getLineSignature(x, y, dx, dy, player, range = 5) {
    let signature = '';
    const opponent = player === 1 ? 2 : 1;

    for (let i = -range; i <= range; i++) {
      const nx = x + dx * i;
      const ny = y + dy * i;

      if (!this.state.isValidPosition(nx, ny)) {
        signature += 'X';
      } else {
        const piece = this.state.board[ny][nx];
        if (piece === player) {
          signature += 'O';
        } else if (piece === opponent) {
          signature += 'X';
        } else {
          signature += '_';
        }
      }
    }

    return signature;
  }

  /**
   * 检查是否平局
   */
  checkDraw() {
    for (let y = 0; y < this.state.boardSize; y++) {
      for (let x = 0; x < this.state.boardSize; x++) {
        if (this.state.board[y][x] === 0) {
          return false;
        }
      }
    }
    return true;
  }
}

// 模块元信息
RuleEngine.__moduleInfo = {
  name: 'RuleEngine',
  version: '2.0.0',
  author: 'Project Team',
  dependencies: ['GameState'],
  optionalDependencies: [],
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.RuleEngine = RuleEngine;

  window.dispatchEvent(
    new CustomEvent('moduleLoaded', {
      detail: RuleEngine.__moduleInfo,
    })
  );
}

// 支持 ES Module
export default RuleEngine;
