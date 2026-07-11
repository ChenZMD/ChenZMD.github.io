/**
 * 数据源连接器 - AI量化交易Agent 第一阶段
 * 从多个公开API获取实时经济数据
 * 
 * 数据源清单：
 * 1. 央行/宏观指标 → TradingEconomics API（免费层）
 * 2. 外汇汇率 → ExchangeRate-API（免费）
 * 3. 加密货币 → CoinGecko API（免费，CORS）
 * 4. 大宗商品 → TradingEconomics/Alpha Vantage（免费层）
 * 5. 天气/气候 → Open-Meteo API（免费，CORS）
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log('📁 创建数据目录:', DATA_DIR);
}

// ====== 工具函数 ======

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          // 非HTML响应则reject
          if (data.startsWith('<')) {
            reject(new Error('返回HTML而非JSON，可能需要API Key'));
          } else {
            resolve(data);
          }
        }
      });
    }).on('error', reject);
  });
}

function save(filename, data) {
  const filepath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
  console.log('💾 已保存:', filename, '(' + fs.statSync(filepath).size + ' bytes)');
}

// ====== 数据源 1: 外汇汇率 (ExchangeRate) ======

async function fetchForex() {
  try {
    const data = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const result = {
      source: 'ExchangeRate-API',
      base: data.base,
      date: data.date,
      rates: {
        EUR: data.rates.EUR,
        GBP: data.rates.GBP,
        JPY: data.rates.JPY,
        CNY: data.rates.CNY,
        AUD: data.rates.AUD,
        CAD: data.rates.CAD,
        CHF: data.rates.CHF,
        HKD: data.rates.HKD,
        SGD: data.rates.SGD,
        KRW: data.rates.KRW,
        INR: data.rates.INR,
        RUB: data.rates.RUB,
        BRL: data.rates.BRL
      }
    };
    save('forex_latest.json', result);
    console.log('💱 外汇汇率获取成功:', result.rates.EUR, 'EUR/USD');
    return result;
  } catch (e) {
    console.error('❌ 外汇获取失败:', e.message);
    return null;
  }
}

// ====== 数据源 2: 加密货币 (CoinGecko) ======

async function fetchCrypto() {
  try {
    const ids = 'bitcoin,ethereum,tether,binancecoin,solana,ripple,cardano,dogecoin,polkadot,chainlink';
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`;
    const data = await fetch(url);
    
    const coins = ['bitcoin', 'ethereum', 'tether', 'binancecoin', 'solana', 'ripple', 'cardano', 'dogecoin', 'polkadot', 'chainlink'];
    const symbols = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT', 'LINK'];
    const names = ['Bitcoin', 'Ethereum', 'Tether', 'BNB', 'Solana', 'XRP', 'Cardano', 'Dogecoin', 'Polkadot', 'Chainlink'];
    
    const result = {
      source: 'CoinGecko',
      timestamp: new Date().toISOString(),
      coins: coins.map((id, i) => ({
        id,
        symbol: symbols[i],
        name: names[i],
        price_usd: data[id]?.usd || 0,
        change_24h: data[id]?.usd_24h_change || 0,
        volume_24h: data[id]?.usd_24h_vol || 0,
        market_cap: data[id]?.usd_market_cap || 0
      }))
    };
    save('crypto_latest.json', result);
    console.log('🪙 加密货币获取成功:', result.coins.length, '种');
    return result;
  } catch (e) {
    console.error('❌ 加密货币获取失败:', e.message);
    return null;
  }
}

// ====== 数据源 3: 大宗商品 (使用备用数据源) ======

async function fetchCommodities() {
  try {
    // 使用Frankfurter API获取部分商品数据（免费）
    const forex = await fetch('https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,JPY,CNY,AUD,CAD,CHF');
    
    // 大宗商品需要通过其他方式获取，这里用已知免费源
    // Alpha Vantage免费层 - 获取大宗商品ETF作为代理
    const result = {
      source: 'Multi-Source',
      timestamp: new Date().toISOString(),
      note: '大宗商品数据需要通过TradingEconomics或Bloomberg付费API获取完整数据，此处使用ETF代理',
      proxies: {
        '原油(WTI)': { etf: 'USO', type: 'ETF代理', note: '对照USO ETF' },
        '黄金': { etf: 'GLD', type: 'ETF代理', note: '对照GLD ETF' },
        '白银': { etf: 'SLV', type: 'ETF代理', note: '对照SLV ETF' },
        '铜': { etf: 'CPER', type: 'ETF代理', note: '对照CPER ETF' },
        '天然气': { etf: 'UNG', type: 'ETF代理', note: '对照UNG ETF' },
        '大豆': { etf: 'SOYB', type: 'ETF代理', note: '对照SOYB ETF' },
        '小麦': { etf: 'WEAT', type: 'ETF代理', note: '对照WEAT ETF' }
      },
      forex_rates: forex.rates
    };
    save('commodities_latest.json', result);
    console.log('🛢️ 大宗商品代理配置完成:', Object.keys(result.proxies).length, '种');
    return result;
  } catch (e) {
    console.error('❌ 大宗商品获取失败:', e.message);
    return null;
  }
}

// ====== 数据源 4: 天气/气候 (Open-Meteo) ======

async function fetchWeather() {
  try {
    // 获取主要城市天气（与经济活动相关）
    const cities = [
      { name: '上海', lat: 31.23, lon: 121.47, type: '港口/制造业' },
      { name: '深圳', lat: 22.54, lon: 114.06, type: '制造业/科技' },
      { name: '广州', lat: 23.13, lon: 113.26, type: '港口/制造' },
      { name: '天津', lat: 39.08, lon: 117.20, type: '港口/重工业' },
      { name: '青岛', lat: 36.07, lon: 120.38, type: '港口' },
      { name: '大连', lat: 38.91, lon: 121.61, type: '港口/造船' },
      { name: '宁波', lat: 29.87, lon: 121.54, type: '港口' },
      { name: '新加坡', lat: 1.35, lon: 103.82, type: '航运枢纽' },
      { name: '鹿特丹', lat: 51.92, lon: 4.48, type: '航运枢纽' },
      { name: '汉堡', lat: 53.55, lon: 9.99, type: '航运枢纽' }
    ];
    
    const weatherPromises = cities.map(city => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
      return fetch(url).then(data => ({
        ...city,
        current: data.current_weather,
        daily: data.daily
      })).catch(() => null);
    });
    
    const weatherResults = (await Promise.all(weatherPromises)).filter(Boolean);
    
    const result = {
      source: 'Open-Meteo',
      timestamp: new Date().toISOString(),
      cities: weatherResults
    };
    save('weather_ports.json', result);
    console.log('🌤️ 港口城市天气获取成功:', weatherResults.length, '个城市');
    return result;
  } catch (e) {
    console.error('❌ 天气获取失败:', e.message);
    return null;
  }
}

// ====== 数据源 5: 宏观指标 (TradingEconomics 免费层) ======

async function fetchMacroStats() {
  try {
    // TradingEconomics 免费API层
    const indicators = [
      { code: 'united states government bond yield', name: '美国国债收益率', category: '利率' },
      { code: 'united states inflation rate', name: '美国通胀率', category: '物价' },
      { code: 'united states unemployment rate', name: '美国失业率', category: '就业' },
      { code: 'united states gdp growth rate', name: '美国GDP增速', category: '增长' },
      { code: 'china government bond yield', name: '中国国债收益率', category: '利率' },
      { code: 'china inflation rate', name: '中国通胀率', category: '物价' },
      { code: 'china unemployment rate', name: '中国失业率', category: '就业' },
      { code: 'china gdp growth rate', name: '中国GDP增速', category: '增长' }
    ];
    
    const result = {
      source: 'TradingEconomics (Free Tier)',
      timestamp: new Date().toISOString(),
      indicators: indicators.map(ind => ({
        ...ind,
        api_endpoint: `https://api.tradingeconomics.com/markets/bond/${encodeURIComponent(ind.code)}`,
        note: '需API Key获取实时数据，此处记录数据源配置'
      })),
      alternative_sources: {
        '东方财富': 'https://data.eastmoney.com/cjsj/cpi.html',
        '国家统计局': 'http://data.stats.gov.cn/',
        '央行公开市场操作': 'http://www.pbc.gov.cn/rmyh/105145/index.html'
      }
    };
    save('macro_sources.json', result);
    console.log('📊 宏观数据源配置完成:', indicators.length, '个指标');
    return result;
  } catch (e) {
    console.error('❌ 宏观数据获取失败:', e.message);
    return null;
  }
}

// ====== 汇总报告生成 ======

async function generateDailyReport(forex, crypto, commodities, weather, macro) {
  const report = {
    date: new Date().toISOString().split('T')[0],
    generated: new Date().toISOString(),
    summary: {
      forex_status: forex ? '✅ 更新' : '❌ 失败',
      crypto_status: crypto ? '✅ 更新' : '❌ 失败',
      commodities_status: commodities ? '✅ 配置' : '❌ 失败',
      weather_status: weather ? '✅ 更新' : '❌ 失败',
      macro_status: macro ? '✅ 配置' : '❌ 失败'
    },
    data_files: [
      'forex_latest.json - 实时外汇汇率',
      'crypto_latest.json - 加密货币行情',
      'commodities_latest.json - 大宗商品ETF代理',
      'weather_ports.json - 港口城市天气',
      'macro_sources.json - 宏观指标数据源配置'
    ],
    next_steps: [
      '配置 TradingEconomics API Key 获取完整大宗商品数据',
      '配置 Alpha Vantage API Key 获取ETF实时价格',
      '设置定时任务（cron）每日自动执行数据抓取',
      '建立数据归档到SQLite/JSON历史数据库'
    ]
  };
  
  save('daily_report.json', report);
  console.log('\n📋 数据抓取日报已生成');
  return report;
}

// ====== 主执行流程 ======

async function main() {
  console.log('========================================');
  console.log('🚀 AI量化交易Agent · 数据源连接器启动');
  console.log('========================================');
  console.log('📅', new Date().toLocaleString('zh-CN'));
  console.log('');
  
  const t0 = Date.now();
  
  // 并行获取所有数据源
  const [forex, crypto, commodities, weather, macro] = await Promise.all([
    fetchForex(),
    fetchCrypto(),
    fetchCommodities(),
    fetchWeather(),
    fetchMacroStats()
  ]);
  
  console.log('');
  console.log('========================================');
  console.log('📊 生成汇总报告...');
  
  // 生成日报
  await generateDailyReport(forex, crypto, commodities, weather, macro);
  
  const elapsed = Date.now() - t0;
  console.log('');
  console.log('========================================');
  console.log(`✅ 全部完成！耗时 ${(elapsed/1000).toFixed(1)}s`);
  console.log('📂 数据目录:', DATA_DIR);
  console.log('========================================');
}

main().catch(console.error);
