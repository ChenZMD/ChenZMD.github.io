/**
 * 东方财富自选股 - 本地 Web 服务器
 * 
 * 提供 API 接口和静态文件服务
 * 
 * 启动方式: node src/eastmoney/server.cjs
 * 访问地址: http://localhost:8083
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// 导入 API 模块
const {
  getStockQuote,
  getStockQuotes,
  searchStocks,
  getStockList,
  autoDetectMarket
} = require('./api.cjs');

const PORT = 8083;
const WEB_ROOT = path.join(__dirname, '../../');

// ============ MIME 类型 ============

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// ============ 自选股数据文件 ============

const WATCHLIST_FILE = path.join(__dirname, '../../../data/web_watchlist.json');

function loadWatchlist() {
  try {
    if (fs.existsSync(WATCHLIST_FILE)) {
      const data = JSON.parse(fs.readFileSync(WATCHLIST_FILE, 'utf8'));
      return data.stocks || [];
    }
  } catch (e) {
    console.warn('加载自选股失败:', e.message);
  }
  return [
    { code: '600000', name: '浦发银行', market: 'SH' },
    { code: '600519', name: '贵州茅台', market: 'SH' },
    { code: '000001', name: '平安银行', market: 'SZ' },
    { code: '000858', name: '五粮液', market: 'SZ' },
    { code: '601318', name: '中国平安', market: 'SH' },
    { code: '300750', name: '宁德时代', market: 'SZ' }
  ];
}

function saveWatchlist(stocks) {
  try {
    const dir = path.dirname(WATCHLIST_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(WATCHLIST_FILE, JSON.stringify({ stocks }, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('保存自选股失败:', e.message);
    return false;
  }
}

// ============ API 路由 ============

const API_ROUTES = {
  // 搜索股票
  '/api/search': async (query) => {
    const keyword = query.keyword || '';
    if (!keyword) return { success: false, error: '请输入搜索关键词' };
    const results = await searchStocks(keyword);
    return { success: true, data: results };
  },

  // 获取股票行情
  '/api/quotes': async (query) => {
    const codes = query.codes ? query.codes.split(',') : [];
    if (codes.length === 0) return { success: false, error: '请选择股票' };
    const quotes = await getStockQuotes(codes);
    return { success: true, data: quotes };
  },

  // 获取单只股票行情
  '/api/quote': async (query) => {
    const code = query.code || '';
    if (!code) return { success: false, error: '请输入股票代码' };
    const quote = await getStockQuote(code);
    return { success: true, data: quote };
  },

  // 获取自选股列表
  '/api/watchlist': async () => {
    const stocks = loadWatchlist();
    return { success: true, data: stocks };
  },

  // 添加自选股
  '/api/watchlist/add': async (query) => {
    const code = query.code || '';
    const name = query.name || code;
    const market = query.market || (autoDetectMarket(code).split('.')[0] === '1' ? 'SH' : 'SZ');
    
    if (!code) return { success: false, error: '请输入股票代码' };
    
    let stocks = loadWatchlist();
    if (stocks.some(s => s.code === code)) {
      return { success: false, error: '该股票已在自选股中' };
    }
    
    stocks.push({ code, name, market, addedAt: new Date().toISOString() });
    saveWatchlist(stocks);
    return { success: true, data: { code, name, market } };
  },

  // 移除自选股
  '/api/watchlist/remove': async (query) => {
    const code = query.code || '';
    if (!code) return { success: false, error: '请输入股票代码' };
    
    let stocks = loadWatchlist();
    const index = stocks.findIndex(s => s.code === code);
    if (index === -1) {
      return { success: false, error: '该股票不在自选股中' };
    }
    
    stocks.splice(index, 1);
    saveWatchlist(stocks);
    return { success: true };
  },

  // 获取自选股行情
  '/api/watchlist/quotes': async () => {
    const stocks = loadWatchlist();
    if (stocks.length === 0) return { success: true, data: [] };
    
    const codes = stocks.map(s => s.code);
    const quotes = await getStockQuotes(codes);
    
    const result = stocks.map(stock => {
      const quote = quotes.find(q => q.code === stock.code);
      return { ...stock, quote };
    });
    
    return { success: true, data: result };
  },

  // 获取股票列表
  '/api/stocklist': async (query) => {
    const market = query.market || 'ALL';
    const pageSize = parseInt(query.pageSize) || 20;
    const pageNum = parseInt(query.pageNum) || 1;
    const result = await getStockList(market, pageSize, pageNum);
    return { success: true, data: result };
  }
};

// ============ HTTP 服务器 ============

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API 路由
  if (pathname.startsWith('/api/')) {
    const handler = API_ROUTES[pathname];
    if (handler) {
      try {
        const result = await handler(query);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
      return;
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: 'API not found' }));
      return;
    }
  }

  // 静态文件服务
  let filePath;
  if (pathname === '/' || pathname === '') {
    filePath = path.join(__dirname, 'web/index.html');
  } else {
    filePath = path.join(__dirname, 'web', pathname);
  }

  // 安全检查：防止目录遍历
  const webRoot = path.join(__dirname, 'web');
  if (!filePath.startsWith(webRoot)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><title>404</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1>404 - 文件未找到</h1>
          <p>请求的路径: ${pathname}</p>
          <a href="/">返回首页</a>
        </body>
        </html>
      `);
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('══════════════════════════════════════════════');
  console.log('  东方财富自选股 - Web 服务已启动');
  console.log('══════════════════════════════════════════════');
  console.log(`  🌐 访问地址: http://localhost:${PORT}`);
  console.log(`  📁 Web 根目录: ${path.join(__dirname, 'web')}`);
  console.log('  🔌 API 接口:');
  console.log('     - GET /api/search?keyword=宁德');
  console.log('     - GET /api/quotes?codes=600519,000001');
  console.log('     - GET /api/watchlist');
  console.log('     - POST /api/watchlist/add?code=600519&name=贵州茅台');
  console.log('     - GET /api/watchlist/quotes');
  console.log('══════════════════════════════════════════════');
  console.log('  按 Ctrl+C 停止服务');
  console.log('');
});
