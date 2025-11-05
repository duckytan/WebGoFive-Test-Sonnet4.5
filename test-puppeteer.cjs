// 使用 Puppeteer 测试实际浏览器运行
const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 启动一个简单的静态文件服务器
const PORT = 8081;
let server;

function startServer() {
  return new Promise((resolve) => {
    const handler = require('serve-handler');
    server = http.createServer((request, response) => {
      return handler(request, response, {
        public: __dirname
      });
    });
    
    server.listen(PORT, () => {
      console.log(`✓ 测试服务器启动在 http://localhost:${PORT}`);
      resolve();
    });
  });
}

async function testInBrowser() {
  console.log('\n=== 浏览器测试 ===\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // 收集控制台日志
  const logs = [];
  page.on('console', msg => {
    const text = msg.text();
    logs.push(text);
    console.log(`  [Console] ${text}`);
  });
  
  // 收集错误
  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.message);
    console.error(`  [Error] ${error.message}`);
  });
  
  try {
    console.log('1. 加载 debug.html...\n');
    await page.goto(`http://localhost:${PORT}/debug.html`, {
      waitUntil: 'networkidle0',
      timeout: 10000
    });
    
    // 等待一下让所有脚本执行
    await page.waitForTimeout(2000);
    
    console.log('\n2. 检查 Canvas 状态...\n');
    
    const canvasInfo = await page.evaluate(() => {
      const canvas = document.getElementById('game-canvas');
      if (!canvas) {
        return { exists: false };
      }
      
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      
      // 检查是否有非白色像素（表示画了东西）
      let nonWhitePixels = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        if (r < 255 || g < 255 || b < 255) {
          nonWhitePixels++;
        }
      }
      
      return {
        exists: true,
        width: canvas.width,
        height: canvas.height,
        hasContent: nonWhitePixels > 0,
        nonWhitePixels: nonWhitePixels
      };
    });
    
    console.log('  Canvas 信息:');
    console.log(`    - 存在: ${canvasInfo.exists}`);
    if (canvasInfo.exists) {
      console.log(`    - 尺寸: ${canvasInfo.width}x${canvasInfo.height}`);
      console.log(`    - 有内容: ${canvasInfo.hasContent}`);
      console.log(`    - 非白色像素: ${canvasInfo.nonWhitePixels}`);
    }
    
    console.log('\n3. 检查错误:\n');
    if (errors.length === 0) {
      console.log('  ✓ 没有JavaScript错误');
    } else {
      console.log(`  ✗ 发现 ${errors.length} 个错误:`);
      errors.forEach(err => console.log(`    - ${err}`));
    }
    
    // 截图保存
    await page.screenshot({ path: 'test-screenshot.png' });
    console.log('\n  ✓ 截图保存到 test-screenshot.png');
    
    // 如果棋盘没有渲染，尝试主页面
    if (!canvasInfo.hasContent) {
      console.log('\n4. 测试主页面 index.html...\n');
      
      await page.goto(`http://localhost:${PORT}/index.html`, {
        waitUntil: 'networkidle0',
        timeout: 10000
      });
      
      await page.waitForTimeout(2000);
      
      const mainCanvasInfo = await page.evaluate(() => {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) {
          return { exists: false };
        }
        
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        
        let nonWhitePixels = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          if (r < 255 || g < 255 || b < 255) {
            nonWhitePixels++;
          }
        }
        
        // 检查全局对象
        return {
          exists: true,
          width: canvas.width,
          height: canvas.height,
          hasContent: nonWhitePixels > 0,
          nonWhitePixels: nonWhitePixels,
          hasApp: typeof window.gomokuApp !== 'undefined',
          hasRenderer: typeof window.CanvasRenderer !== 'undefined'
        };
      });
      
      console.log('  主页面 Canvas 信息:');
      console.log(`    - 存在: ${mainCanvasInfo.exists}`);
      if (mainCanvasInfo.exists) {
        console.log(`    - 尺寸: ${mainCanvasInfo.width}x${mainCanvasInfo.height}`);
        console.log(`    - 有内容: ${mainCanvasInfo.hasContent}`);
        console.log(`    - 非白色像素: ${mainCanvasInfo.nonWhitePixels}`);
        console.log(`    - 应用已初始化: ${mainCanvasInfo.hasApp}`);
        console.log(`    - Renderer 可用: ${mainCanvasInfo.hasRenderer}`);
      }
      
      await page.screenshot({ path: 'test-screenshot-main.png' });
      console.log('\n  ✓ 主页截图保存到 test-screenshot-main.png');
    }
    
  } catch (error) {
    console.error('\n测试失败:', error.message);
  }
  
  await browser.close();
  console.log('\n✅ 测试完成\n');
}

(async () => {
  try {
    await startServer();
    await testInBrowser();
  } catch (error) {
    console.error('测试出错:', error);
  } finally {
    if (server) {
      server.close();
    }
    process.exit(0);
  }
})();
