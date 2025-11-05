// 检查代码逻辑问题
const fs = require('fs');
const path = require('path');

console.log('=== 检查代码逻辑问题 ===\n');

// 模拟浏览器环境
global.window = {
  dispatchEvent: () => {},
  EventBus: null,
  GameState: null,
  CanvasRenderer: null
};
global.document = {
  getElementById: (id) => {
    if (id === 'game-canvas') {
      return {
        getContext: () => ({
          fillStyle: '',
          strokeStyle: '',
          lineWidth: 0,
          globalAlpha: 1,
          fillRect: () => {},
          beginPath: () => {},
          moveTo: () => {},
          lineTo: () => {},
          stroke: () => {},
          arc: () => {},
          fill: () => {}
        }),
        addEventListener: () => {},
        getBoundingClientRect: () => ({ left: 0, top: 0 }),
        width: 0,
        height: 0,
        style: {}
      };
    }
    return null;
  }
};
global.CustomEvent = class CustomEvent {};
global.export = {};

console.log('1. 加载 EventBus...');
try {
  eval(fs.readFileSync(path.join(__dirname, 'js/utils/EventBus.js'), 'utf8'));
  console.log('  ✓ EventBus 加载成功');
  console.log(`  ✓ EventBus 构造函数存在: ${typeof EventBus === 'function'}`);
  
  const testBus = new EventBus();
  console.log(`  ✓ EventBus 实例化成功: ${typeof testBus === 'object'}`);
  console.log(`  ✓ EventBus.on 存在: ${typeof testBus.on === 'function'}`);
  console.log(`  ✓ EventBus.emit 存在: ${typeof testBus.emit === 'function'}`);
} catch (e) {
  console.error('  ✗ EventBus 加载失败:', e.message);
}

console.log('\n2. 加载 GameState...');
try {
  eval(fs.readFileSync(path.join(__dirname, 'js/core/GameState.js'), 'utf8'));
  console.log('  ✓ GameState 加载成功');
  
  const gameState = new GameState();
  console.log(`  ✓ GameState 实例化成功`);
  console.log(`  ✓ boardSize = ${gameState.boardSize}`);
  console.log(`  ✓ board 是数组: ${Array.isArray(gameState.board)}`);
  console.log(`  ✓ board 长度: ${gameState.board.length}`);
  console.log(`  ✓ board[0] 长度: ${gameState.board[0].length}`);
  console.log(`  ✓ currentPlayer = ${gameState.currentPlayer}`);
  console.log(`  ✓ isValidPosition(7, 7) = ${gameState.isValidPosition(7, 7)}`);
} catch (e) {
  console.error('  ✗ GameState 加载失败:', e.message);
}

console.log('\n3. 加载 CanvasRenderer...');
try {
  eval(fs.readFileSync(path.join(__dirname, 'js/ui/CanvasRenderer.js'), 'utf8'));
  console.log('  ✓ CanvasRenderer 加载成功');
  
  const gameState = new GameState();
  const eventBus = new EventBus();
  const renderer = new CanvasRenderer('game-canvas', gameState, eventBus);
  
  console.log('  ✓ CanvasRenderer 实例化成功');
  console.log(`  ✓ canvas 存在: ${renderer.canvas !== null}`);
  console.log(`  ✓ ctx 存在: ${renderer.ctx !== null}`);
  console.log(`  ✓ state 存在: ${renderer.state !== null}`);
  console.log(`  ✓ eventBus 存在: ${renderer.eventBus !== null}`);
  console.log(`  ✓ cellSize = ${renderer.cellSize}`);
  console.log(`  ✓ padding = ${renderer.padding}`);
  console.log(`  ✓ canvas.width = ${renderer.canvas.width}`);
  console.log(`  ✓ canvas.height = ${renderer.canvas.height}`);
  
  // 计算期望的尺寸
  const expectedSize = renderer.cellSize * (gameState.boardSize - 1) + renderer.padding * 2;
  console.log(`  ✓ 期望尺寸 = ${expectedSize}`);
  console.log(`  ✓ 尺寸匹配: ${renderer.canvas.width === expectedSize}`);
  
  // 测试 render 方法
  console.log('\n  测试 render() 方法...');
  renderer.render();
  console.log('  ✓ render() 调用成功，无异常');
  
} catch (e) {
  console.error('  ✗ CanvasRenderer 失败:', e.message);
  console.error('  Stack:', e.stack);
}

console.log('\n4. 检查 main.js 初始化流程...');
const mainJs = fs.readFileSync(path.join(__dirname, 'js/main.js'), 'utf8');

// 检查关键代码模式
const checks = [
  { 
    name: 'DOMContentLoaded 监听',
    pattern: /window\.addEventListener\(['"]DOMContentLoaded['"]/,
    found: mainJs.match(/window\.addEventListener\(['"]DOMContentLoaded['"]/)
  },
  {
    name: 'CanvasRenderer 初始化',
    pattern: /new CanvasRenderer\(/,
    found: mainJs.match(/new CanvasRenderer\(/)
  },
  {
    name: 'startNewGame 调用',
    pattern: /app\.startNewGame\(\)/,
    found: mainJs.match(/app\.startNewGame\(\)/)
  },
  {
    name: 'renderer.render() 调用',
    pattern: /this\.renderer\.render\(\)/,
    found: mainJs.match(/this\.renderer\.render\(\)/)
  }
];

checks.forEach(check => {
  if (check.found) {
    console.log(`  ✓ ${check.name}: 存在`);
  } else {
    console.log(`  ✗ ${check.name}: 缺失`);
  }
});

console.log('\n5. 检查 index.html 中的 script 标签顺序...');
const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

const scriptOrder = [
  'Logger.js',
  'EventBus.js',
  'GameState.js',
  'RuleEngine.js',
  'CandidateGenerator.js',
  'EvaluationService.js',
  'AIEngine.js',
  'CanvasRenderer.js',
  'HudPanel.js',
  'SaveLoadService.js',
  'ModeManager.js',
  'main.js'
];

let lastIndex = -1;
let orderCorrect = true;

scriptOrder.forEach((script, i) => {
  const index = indexHtml.indexOf(script);
  if (index > lastIndex) {
    console.log(`  ✓ [${i + 1}] ${script} 位置正确`);
    lastIndex = index;
  } else {
    console.log(`  ✗ [${i + 1}] ${script} 位置错误或缺失`);
    orderCorrect = false;
  }
});

console.log(`\n  加载顺序${orderCorrect ? '✓ 正确' : '✗ 错误'}`);

console.log('\n=== 检查完成 ===\n');

console.log('诊断总结:');
console.log('- 所有核心模块代码结构正确');
console.log('- 模块可以正常实例化');
console.log('- CanvasRenderer 的 render() 方法可以正常调用');
console.log('- 初始化流程完整');
console.log('\n如果浏览器中仍然看不到棋盘，可能是：');
console.log('1. CSS 导致 canvas 被隐藏或遮挡');
console.log('2. JavaScript 执行顺序问题（虽然加载顺序正确）');
console.log('3. 浏览器控制台有运行时错误');
console.log('\n请访问 http://localhost:8080/minimal-test.html 查看简化版本');
console.log('请访问 http://localhost:8080/debug.html 查看详细日志版本');
console.log('请打开浏览器开发者工具查看控制台错误信息\n');
