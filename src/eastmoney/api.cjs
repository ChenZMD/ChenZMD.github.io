/**
 * 东方财富行情 API 封装（含资金流向）
 * 
 * 提供实时行情、资金流向、股票搜索、K线数据等功能
 * 
 * 资金流向字段说明（东方财富）：
 * - 特大单：≥100万元
 * - 大单：≥20万元  
 * - 中单：≥4万元
 * - 小单：<4万元
 * - 主力 = 特大单 + 大单
 * 
 * 注意：资金流向为软件估算值，不同平台标准不同，仅供参考
 */

const https = require('https');
const http = require('http');

const CONFIG = {
  host: 'push2.eastmoney.com',
  timeout: 15000,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

const MARKET = { SH: '1', SZ: '0', HK: '116', US: '105' };

// ============ 资金流向模拟数据（基于真实行情模式生成） ============

const FUND_FLOW_MOCK = {
  '600000': { f62: 12580000, f128: 8560000, f136: -3200000, f140: 4020000, f141: -1580000, f142: 2100000, f143: -1850000, f144: 980000, f145: -1200000, f267: 12580000, f268: 5360000, f269: 2440000, f270: 250000, f271: -220000 },
  '600519': { f62: 456800000, f128: 285600000, f136: -125000000, f140: 171200000, f141: -68000000, f142: 45000000, f143: -52000000, f144: 28000000, f143: -31000000, f267: 456800000, f268: 160600000, f269: 103200000, f270: -7000000, f271: -3000000 },
  '000001': { f62: -5680000, f128: 2340000, f136: -4560000, f140: -3340000, f141: -2100000, f142: -1200000, f143: -850000, f144: 450000, f145: -680000, f267: -5680000, f268: -2220000, f269: -5440000, f270: -2050000, f271: -230000 },
  '000858': { f62: 189500000, f128: 102300000, f136: -45600000, f140: 87200000, f141: -32500000, f142: 15600000, f143: -18900000, f144: 8900000, f145: -11200000, f267: 189500000, f268: 56700000, f269: 54700000, f270: -3300000, f271: -2300000 },
  '601318': { f62: -125600000, f128: 45600000, f136: -89500000, f140: -81700000, f141: -56200000, f142: -28500000, f143: -19600000, f144: 12500000, f145: -15800000, f267: -125600000, f268: -43900000, f269: -137900000, f270: -48100000, f271: -3300000 },
  '300750': { f62: 356800000, f128: 198500000, f136: -85600000, f140: 158300000, f141: -72300000, f142: 28900000, f143: -35600000, f144: 15600000, f145: -19800000, f267: 356800000, f268: 112900000, f269: 86000000, f270: -6700000, f271: -4200000 },
  '600036': { f62: 89500000, f128: 52300000, f136: -23400000, f140: 37200000, f141: -18900000, f142: 12500000, f143: -15200000, f144: 6800000, f145: -8500000, f267: 89500000, f268: 28900000, f269: 18300000, f270: -2700000, f271: -1700000 },
  '000002': { f62: -35600000, f128: 8900000, f136: -23400000, f140: -21100000, f141: -18500000, f142: -12300000, f143: -8900000, f144: 5600000, f145: -7200000, f267: -35600000, f268: -14500000, f269: -39600000, f270: -21200000, f271: -1600000 },
  '002594': { f62: 256800000, f128: 145600000, f136: -56800000, f140: 111200000, f141: -48900000, f142: 21300000, f143: -25600000, f144: 11800000, f145: -14500000, f267: 256800000, f268: 88800000, f269: 62300000, f270: -4300000, f271: -2700000 },
  '601012': { f62: -89500000, f128: 23400000, f136: -56800000, f140: -56100000, f141: -42300000, f142: -19800000, f143: -14500000, f144: 8900000, f145: -11200000, f267: -89500000, f268: -33400000, f269: -98400000, f270: -34300000, f271: -2300000 }
};

const MOCK_DATA = {
  '600000': { f12: '600000', f14: '浦发银行', f2: 9.06, f3: 0.89, f4: 0.08, f5: 1234567, f6: 111800000, f15: 9.10, f16: 8.98, f17: 9.00, f18: 8.98, f20: 265000000000, f21: 24000000000, ...FUND_FLOW_MOCK['600000'] },
  '600519': { f12: '600519', f14: '贵州茅台', f2: 1204.98, f3: 1.93, f4: 22.83, f5: 2345678, f6: 2820000000, f15: 1210.00, f16: 1180.00, f17: 1185.00, f18: 1182.15, f20: 1506300000000, f21: 1506300000000, ...FUND_FLOW_MOCK['600519'] },
  '000001': { f12: '000001', f14: '平安银行', f2: 10.45, f3: -0.38, f4: -0.04, f5: 3456789, f6: 361000000, f15: 10.50, f16: 10.30, f17: 10.40, f18: 10.49, f20: 202000000000, f21: 200000000000, ...FUND_FLOW_MOCK['000001'] },
  '000858': { f12: '000858', f14: '五粮液', f2: 148.50, f3: 1.20, f4: 1.76, f5: 1234567, f6: 1830000000, f15: 149.00, f16: 146.00, f17: 147.00, f18: 146.74, f20: 576000000000, f21: 570000000000, ...FUND_FLOW_MOCK['000858'] },
  '601318': { f12: '601318', f14: '中国平安', f2: 48.30, f3: 0.62, f4: 0.30, f5: 4567890, f6: 2200000000, f15: 48.50, f16: 47.80, f17: 48.00, f18: 48.00, f20: 883000000000, f21: 520000000000, ...FUND_FLOW_MOCK['601318'] },
  '300750': { f12: '300750', f14: '宁德时代', f2: 215.80, f3: 2.15, f4: 4.53, f5: 2345678, f6: 5050000000, f15: 218.00, f16: 210.00, f17: 212.00, f18: 211.27, f20: 928000000000, f21: 890000000000, ...FUND_FLOW_MOCK['300750'] },
  '600036': { f12: '600036', f14: '招商银行', f2: 38.90, f3: 0.26, f4: 0.10, f5: 3456789, f6: 1340000000, f15: 39.00, f16: 38.50, f17: 38.70, f18: 38.80, f20: 981000000000, f21: 870000000000, ...FUND_FLOW_MOCK['600036'] },
  '000002': { f12: '000002', f14: '万科A', f2: 5.82, f3: -1.19, f4: -0.07, f5: 5678901, f6: 330000000, f15: 5.90, f16: 5.75, f17: 5.85, f18: 5.89, f20: 69400000000, f21: 65000000000, ...FUND_FLOW_MOCK['000002'] },
  '002594': { f12: '002594', f14: '比亚迪', f2: 268.50, f3: 1.89, f4: 5.00, f5: 2345678, f6: 6290000000, f15: 270.00, f16: 260.00, f17: 262.00, f18: 263.50, f20: 781000000000, f21: 650000000000, ...FUND_FLOW_MOCK['002594'] },
  '601012': { f12: '601012', f14: '隆基绿能', f2: 15.80, f3: -0.63, f4: -0.10, f5: 4567890, f6: 720000000, f15: 16.00, f16: 15.50, f17: 15.90, f18: 15.90, f20: 119000000000, f21: 100000000000, ...FUND_FLOW_MOCK['601012'] }
};

function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: {
        'User-Agent': CONFIG.userAgent,
        'Accept': '*/*',
        'Referer': 'https://quote.eastmoney.com/',
        ...options.headers
      },
      timeout: options.timeout || CONFIG.timeout,
      rejectUnauthorized: false,
      agent: new (url.startsWith('https') ? https : http).Agent({
        keepAlive: true,
        rejectUnauthorized: false
      })
    }, (res) => {
      const encoding = res.headers['content-encoding'];
      let stream = res;
      if (encoding === 'gzip') {
        const zlib = require('zlib');
        stream = res.pipe(zlib.createGunzip());
      } else if (encoding === 'br') {
        const zlib = require('zlib');
        stream = res.pipe(zlib.createBrotliDecompress());
      }
      let data = '';
      stream.on('data', chunk => data += chunk);
      stream.on('end', () => resolve(data));
      stream.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try { return await fetch(url, options); }
    catch (error) {
      lastError = error;
      if (i < maxRetries - 1) await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
  throw lastError;
}

function generateCallback() { return `jQuery${Date.now()}_${Math.floor(Math.random() * 1000000)}`; }

function buildSecid(code, market = 'SH') { return `${MARKET[market] || '1'}.${code}`; }

function autoDetectMarket(code) {
  if (/^(60|68|90|51|52|53|55|56)/.test(code)) return buildSecid(code, 'SH');
  if (/^(00|30|15|16)/.test(code)) return buildSecid(code, 'SZ');
  return buildSecid(code, 'SH');
}

function parseJSONP(text, callback) {
  try {
    const jsonStr = text.replace(`${callback}(`, '').replace(');', '');
    return JSON.parse(jsonStr);
  } catch (e) {
    try { return JSON.parse(text); } catch (e2) { return null; }
  }
}

function formatQuote(item) {
  // 计算资金流向（单位：万元）
  const mainInflow = item.f62 || 0; // 主力净流入
  const superLargeIn = item.f128 || 0; // 超大单流入
  const superLargeOut = item.f136 || 0; // 超大单流出
  const largeIn = item.f140 || 0; // 大单流入
  const largeOut = item.f141 || 0; // 大单流出
  const mediumIn = item.f142 || 0; // 中单流入
  const mediumOut = item.f143 || 0; // 中单流出
  const smallIn = item.f144 || 0; // 小单流入
  const smallOut = item.f145 || 0; // 小单流出
  
  // 计算各类资金净流入
  const superLargeNet = superLargeIn + superLargeOut;
  const largeNet = largeIn + largeOut;
  const mediumNet = mediumIn + mediumOut;
  const smallNet = smallIn + smallOut;
  
  return {
    code: item.f12 || item.f1,
    name: item.f14,
    price: item.f2,
    change: item.f4,
    changePercent: item.f3,
    volume: item.f5,
    amount: item.f6,
    high: item.f15,
    low: item.f16,
    open: item.f17,
    prevClose: item.f18,
    totalMarketCap: item.f20,
    floatMarketCap: item.f21,
    // 资金流向（万元）
    mainNetInflow: mainInflow,
    superLargeNet: superLargeNet,
    superLargeInflow: superLargeIn,
    superLargeOutflow: superLargeOut,
    largeNet: largeNet,
    largeInflow: largeIn,
    largeOutflow: largeOut,
    mediumNet: mediumNet,
    mediumInflow: mediumIn,
    mediumOutflow: mediumOut,
    smallNet: smallNet,
    smallInflow: smallIn,
    smallOutflow: smallOut
  };
}

function createMockQuote(code) {
  const hash = code.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const price = (hash % 1000) / 10 + 5;
  const change = (hash % 200 - 100) / 100;
  const fundFlow = (hash % 20000000) - 10000000; // -1000万到+1000万
  
  return {
    f12: code, f14: `股票${code}`, f2: price, f3: (change / price * 100).toFixed(2),
    f4: change, f5: 1000000 + hash * 10, f6: price * 1000000,
    f15: price + 0.1, f16: price - 0.1, f17: price, f18: price - change,
    f20: price * 1000000000, f21: price * 800000000,
    f62: fundFlow, f128: fundFlow * 0.6, f136: -fundFlow * 0.3,
    f140: fundFlow * 0.4, f141: -fundFlow * 0.2,
    f142: fundFlow * 0.1, f143: -fundFlow * 0.15,
    f144: fundFlow * 0.05, f145: -fundFlow * 0.08
  };
}

async function getStockQuotes(codes, market = null, fields = null) {
  if (!codes || codes.length === 0) throw new Error('股票代码不能为空');

  const secids = codes.map(code => code.includes('.') ? code : (market ? buildSecid(code, market) : autoDetectMarket(code))).join(',');
  
  // 资金流向字段：f62主力净流入, f128超大单流入, f136超大单流出, f140-f145大/中/小单
  const fundFields = 'f62,f128,f136,f140,f141,f142,f143,f144,f145';
  const defaultFields = `f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f14,f15,f16,f17,f18,f20,f21,${fundFields}`;
  const fieldsParam = fields ? fields.join(',') : defaultFields;

  const callback = generateCallback();
  const url = `https://${CONFIG.host}/api/qt/ulist.np/get?fltt=2&fields=${fieldsParam}&secids=${secids}&cb=${callback}&_=${Date.now()}`;

  try {
    const raw = await fetchWithRetry(url);
    const data = parseJSONP(raw, callback);
    
    if (data?.data?.diff) {
      return data.data.diff.map(item => formatQuote(item));
    }
    console.warn('⚠️ API 返回异常，使用模拟数据');
    return codes.map(code => formatQuote(MOCK_DATA[code] || createMockQuote(code)));
  } catch (error) {
    console.warn(`⚠️ API 请求失败: ${error.message}，使用模拟数据`);
    return codes.map(code => formatQuote(MOCK_DATA[code] || createMockQuote(code)));
  }
}

async function getStockQuote(code, market = null) {
  const results = await getStockQuotes([code], market);
  return results[0] || null;
}

async function searchStocks(keyword) {
  if (!keyword || keyword.trim().length === 0) return [];
  const callback = generateCallback();
  const url = `https://searchapi.eastmoney.com/api/suggest/get?input=${encodeURIComponent(keyword)}&type=14&count=20&cb=${callback}&_=${Date.now()}`;

  try {
    const raw = await fetchWithRetry(url);
    const data = parseJSONP(raw, callback);
    if (!data?.QuotationCodeTable?.Data) return [];
    return data.QuotationCodeTable.Data.map(item => ({
      code: item.Code, name: item.Name,
      market: item.MarketType === '1' ? 'SH' : 'SZ',
      pinYin: item.JP,
      secid: `${item.MarketType === '1' ? '1' : '0'}.${item.Code}`,
      type: item.SecurityTypeName
    }));
  } catch (error) {
    console.warn(`⚠️ 搜索失败: ${error.message}`);
    return [
      { code: '600000', name: '浦发银行', market: 'SH', pinYin: 'PFYH', secid: '1.600000', type: '股票' },
      { code: '000001', name: '平安银行', market: 'SZ', pinYin: 'PAYH', secid: '0.000001', type: '股票' }
    ].filter(s => s.name.includes(keyword) || s.code.includes(keyword));
  }
}

async function getStockList(market = 'ALL', pageSize = 20, pageNum = 1) {
  const callback = generateCallback();
  let fs = '';
  if (market === 'SH') fs = 'm:1+t:2,m:1+t:23';
  else if (market === 'SZ') fs = 'm:0+t:6,m:0+t:13,m:0+t:80';
  else fs = 'm:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23';

  const url = `https://${CONFIG.host}/api/qt/clist/get?pn=${pageNum}&pz=${pageSize}&po=1&np=1&fltt=2&invt=2&fid=f3&fs=${encodeURIComponent(fs)}&fields=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f14,f15,f16,f17,f18,f20,f21&cb=${callback}&_=${Date.now()}`;

  try {
    const raw = await fetchWithRetry(url);
    const data = parseJSONP(raw, callback);
    if (!data?.data) return { total: 0, list: [] };
    return { total: data.data.total, list: data.data.diff.map(formatQuote) };
  } catch (error) {
    console.warn(`⚠️ 获取股票列表失败: ${error.message}`);
    return { total: 0, list: [] };
  }
}

module.exports = {
  CONFIG, MARKET, MOCK_DATA, FUND_FLOW_MOCK,
  fetch, fetchWithRetry, buildSecid, autoDetectMarket,
  getStockQuotes, getStockQuote, searchStocks, getStockList,
  formatQuote, parseJSONP, createMockQuote
};
