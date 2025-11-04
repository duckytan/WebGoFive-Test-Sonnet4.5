import { describe, it, expect, beforeEach } from 'vitest';
import GameState from '../js/core/GameState.js';
import RuleEngine from '../js/core/RuleEngine.js';

describe('RuleEngine', () => {
  let state;
  let rules;

  beforeEach(() => {
    state = new GameState();
    rules = new RuleEngine(state);
  });

  describe('落子验证', () => {
    it('应验证有效落子', () => {
      const result = rules.validateMove(7, 7, 1);
      expect(result.valid).toBe(true);
    });

    it('应拒绝已占位置', () => {
      state.board[7][7] = 1;
      const result = rules.validateMove(7, 7, 2);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Position occupied');
    });

    it('应拒绝无效坐标', () => {
      const result1 = rules.validateMove(-1, 7, 1);
      expect(result1.valid).toBe(false);

      const result2 = rules.validateMove(15, 7, 1);
      expect(result2.valid).toBe(false);
    });
  });

  describe('胜负判定', () => {
    it('应检测横向五连', () => {
      for (let i = 0; i < 5; i++) {
        state.board[7][7 + i] = 1;
      }

      const result = rules.checkWin(7, 7, 1);
      expect(result.isWin).toBe(true);
      expect(result.direction).toBe('horizontal');
      expect(result.winLine.length).toBe(5);
    });

    it('应检测纵向五连', () => {
      for (let i = 0; i < 5; i++) {
        state.board[7 + i][7] = 1;
      }

      const result = rules.checkWin(7, 7, 1);
      expect(result.isWin).toBe(true);
      expect(result.direction).toBe('vertical');
    });

    it('应检测主对角线五连', () => {
      for (let i = 0; i < 5; i++) {
        state.board[7 + i][7 + i] = 1;
      }

      const result = rules.checkWin(7, 7, 1);
      expect(result.isWin).toBe(true);
      expect(result.direction).toBe('diagDown');
    });

    it('应检测副对角线五连', () => {
      for (let i = 0; i < 5; i++) {
        state.board[7 + i][11 - i] = 1;
      }

      const result = rules.checkWin(7, 11, 1);
      expect(result.isWin).toBe(true);
      expect(result.direction).toBe('diagUp');
    });

    it('不应将四连判定为获胜', () => {
      for (let i = 0; i < 4; i++) {
        state.board[7][7 + i] = 1;
      }

      const result = rules.checkWin(7, 7, 1);
      expect(result.isWin).toBe(false);
    });
  });

  describe('禁手检测 - 长连', () => {
    it('应检测长连禁手', () => {
      for (let i = 1; i < 6; i++) {
        state.board[7][7 + i] = 1;
      }

      const result = rules.detectForbidden(7, 7, 1);
      expect(result.isForbidden).toBe(true);
      expect(result.type).toBe('长连禁手');
    });

    it('白棋不受长连限制', () => {
      for (let i = 0; i < 5; i++) {
        state.board[7][7 + i] = 2;
      }

      const result = rules.detectForbidden(7, 12, 2);
      expect(result.isForbidden).toBe(false);
    });
  });

  describe('禁手检测 - 三三', () => {
    it('应检测三三禁手', () => {
      state.board[6][7] = 1;
      state.board[8][7] = 1;
      state.board[7][6] = 1;
      state.board[7][8] = 1;

      const result = rules.detectForbidden(7, 7, 1);
      expect(result.isForbidden).toBe(true);
      expect(result.type).toBe('三三禁手');
    });
  });

  describe('禁手检测 - 四四', () => {
    it('应检测四四禁手', () => {
      for (let i = 1; i < 4; i++) {
        state.board[7][7 - i] = 1;
        state.board[7 - i][7] = 1;
      }

      const result = rules.detectForbidden(7, 7, 1);
      expect(result.isForbidden).toBe(true);
      expect(result.type).toBe('四四禁手');
    });
  });

  describe('平局检测', () => {
    it('应检测棋盘填满', () => {
      for (let y = 0; y < state.boardSize; y++) {
        for (let x = 0; x < state.boardSize; x++) {
          state.board[y][x] = (x + y) % 2 + 1;
        }
      }

      const result = rules.checkDraw();
      expect(result).toBe(true);
    });

    it('有空位时不应判定平局', () => {
      state.board[7][7] = 1;
      const result = rules.checkDraw();
      expect(result).toBe(false);
    });
  });
});
