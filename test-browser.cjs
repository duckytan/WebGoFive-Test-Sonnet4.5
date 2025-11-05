// 测试脚本 - 模拟浏览器环境检测问题
const fs = require('fs');
const path = require('path');

console.log('=== 检查代码问题 ===\n');

// 检查所有JS文件是否存在
const files = [
  'js/utils/Logger.js',
  'js/utils/EventBus.js',
  'js/core/GameState.js',
  'js/core/RuleEngine.js',
  'js/core/CandidateGenerator.js',
  'js/core/EvaluationService.js',
  'js/core/AIEngine.js',
  'js/ui/CanvasRenderer.js',
  'js/ui/HudPanel.js',
  'js/services/SaveLoadService.js',
  'js/app/ModeManager.js',
  'js/main.js'
];

console.log('1. 检查文件是否存在：');
let allFilesExist = true;
files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✓ ${file}`);
  } else {
    console.log(`  ✗ ${file} [不存在]`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n⚠️  有文件缺失！');
  process.exit(1);
}

console.log('\n2. 检查关键代码问题：\n');

// 检查 CanvasRenderer 的 render 调用
const canvasRendererPath = path.join(__dirname, 'js/ui/CanvasRenderer.js');
const canvasRendererCode = fs.readFileSync(canvasRendererPath, 'utf8');

console.log('  CanvasRenderer 构造函数中是否调用 render():');
if (canvasRendererCode.includes('this.render()') && 
    canvasRendererCode.indexOf('this.render()') > canvasRendererCode.indexOf('constructor')) {
  console.log('    ✓ 在构造函数中调用了 render()');
} else {
  console.log('    ✗ 构造函数中没有调用 render()');
}

// 检查 main.js 的初始化
const mainPath = path.join(__dirname, 'js/main.js');
const mainCode = fs.readFileSync(mainPath, 'utf8');

console.log('\n  main.js 初始化流程：');
if (mainCode.includes("window.addEventListener('DOMContentLoaded'")) {
  console.log('    ✓ 使用 DOMContentLoaded 事件');
}
if (mainCode.includes('app.startNewGame()')) {
  console.log('    ✓ 调用 startNewGame()');
}
if (mainCode.includes('this.renderer.render()')) {
  console.log('    ✓ startNewGame 中调用 render()');
}

console.log('\n3. 生成调试HTML：\n');

// 创建一个带有更详细日志的测试页面
const debugHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>五子棋调试</title>
  <style>
    body { margin: 20px; font-family: monospace; }
    #game-canvas { border: 1px solid #ccc; margin: 20px 0; }
    .log { margin: 10px 0; padding: 5px; background: #f5f5f5; }
    .error { color: red; }
    .success { color: green; }
  </style>
</head>
<body>
  <h1>五子棋调试页面</h1>
  <div id="logs"></div>
  <canvas id="game-canvas"></canvas>
  
  <script>
    const logDiv = document.getElementById('logs');
    function log(msg, type = 'info') {
      const p = document.createElement('div');
      p.className = 'log ' + type;
      p.textContent = new Date().toLocaleTimeString() + ' - ' + msg;
      logDiv.appendChild(p);
      console.log(msg);
    }
    
    window.addEventListener('error', (e) => {
      log('ERROR: ' + e.message + ' at ' + e.filename + ':' + e.lineno, 'error');
    });
    
    log('页面加载开始');
  </script>
  
  <script src="js/utils/Logger.js" onload="log('✓ Logger.js 加载', 'success')" onerror="log('✗ Logger.js 失败', 'error')"></script>
  <script src="js/utils/EventBus.js" onload="log('✓ EventBus.js 加载', 'success')" onerror="log('✗ EventBus.js 失败', 'error')"></script>
  <script src="js/core/GameState.js" onload="log('✓ GameState.js 加载', 'success')" onerror="log('✗ GameState.js 失败', 'error')"></script>
  <script src="js/core/RuleEngine.js" onload="log('✓ RuleEngine.js 加载', 'success')" onerror="log('✗ RuleEngine.js 失败', 'error')"></script>
  <script src="js/core/CandidateGenerator.js" onload="log('✓ CandidateGenerator.js 加载', 'success')" onerror="log('✗ CandidateGenerator.js 失败', 'error')"></script>
  <script src="js/core/EvaluationService.js" onload="log('✓ EvaluationService.js 加载', 'success')" onerror="log('✗ EvaluationService.js 失败', 'error')"></script>
  <script src="js/core/AIEngine.js" onload="log('✓ AIEngine.js 加载', 'success')" onerror="log('✗ AIEngine.js 失败', 'error')"></script>
  <script src="js/ui/CanvasRenderer.js" onload="log('✓ CanvasRenderer.js 加载', 'success')" onerror="log('✗ CanvasRenderer.js 失败', 'error')"></script>
  <script src="js/ui/HudPanel.js" onload="log('✓ HudPanel.js 加载', 'success')" onerror="log('✗ HudPanel.js 失败', 'error')"></script>
  <script src="js/services/SaveLoadService.js" onload="log('✓ SaveLoadService.js 加载', 'success')" onerror="log('✗ SaveLoadService.js 失败', 'error')"></script>
  <script src="js/app/ModeManager.js" onload="log('✓ ModeManager.js 加载', 'success')" onerror="log('✗ ModeManager.js 失败', 'error')"></script>
  
  <script>
    window.addEventListener('DOMContentLoaded', () => {
      log('DOMContentLoaded 触发');
      
      try {
        log('开始初始化...');
        
        const eventBus = new EventBus();
        log('✓ EventBus 创建成功');
        
        const gameState = new GameState();
        log('✓ GameState 创建成功，boardSize=' + gameState.boardSize);
        
        const canvas = document.getElementById('game-canvas');
        log('Canvas 元素: ' + (canvas ? '存在' : '不存在'));
        
        if (canvas) {
          const renderer = new CanvasRenderer('game-canvas', gameState, eventBus);
          log('✓ CanvasRenderer 创建成功');
          log('Canvas 尺寸: ' + canvas.width + 'x' + canvas.height);
          
          log('调用 render()...');
          renderer.render();
          log('✓ render() 完成', 'success');
        }
        
      } catch (error) {
        log('初始化错误: ' + error.message, 'error');
        log('Stack: ' + error.stack, 'error');
      }
    });
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'debug.html'), debugHtml);
console.log('  ✓ 创建了 debug.html 文件');
console.log('  打开 http://localhost:8080/debug.html 查看详细日志');

console.log('\n✅ 检查完成\n');
