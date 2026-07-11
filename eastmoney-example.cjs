/**
 * 东方财富自选股 API 集成示例
 * 
 * 演示如何将东方财富自选股行情接入分层采集框架
 * 作为 L0 数据源使用
 */

const { WatchlistManager } = require('./src/eastmoney/watchlist.cjs');
const { getStockQuotes, searchStocks, getStockQuote } = require('./src/eastmoney/api.cjs');
const path = require('path');

// ============ 示例 1: 基础 API 调用 ============

async function demoBasicAPI() {
  console.log('══════════════════════════════════════════════');
  console.log('  示例 1: 基础 API 调用');
  console.log('══════════════════════════════════════════════\n');
  
  // 获取单只股票行情
  console.log('📈 获取贵州茅台行情:');
  const moutai = await getStockQuote('600519');
  console.log(`   名称: ${moutai.name}`);
  console.log(`   最新价: ¥${moutai.price}`);
  console.log(`   涨跌幅: ${moutai.changePercent}%`);
  console.log(`   总市值: ¥${(moutai.totalMarketCap / 100000000).toFixed(2)}亿\n`);
  
  // 获取多只股票行情
  console.log('📈 获取多只股票行情:');
  const quotes = await getStockQuotes(['600000', '000001', '600519']);
  quotes.forEach(q => {
    console.log(`   ${q.code} ${q.name}: ¥${q.price} (${q.changePercent > 0 ? '+' : ''}${q.changePercent}%)`);
  });
  
  // 搜索股票
  console.log('\n🔍 搜索"宁德":');
  const searchResults = await searchStocks('宁德');
  searchResults.slice(0, 3).forEach(r => {
    console.log(`   ${r.code} ${r.name} [${r.market}]`);
  });
  
  console.log('\n');
}

// ============ 示例 2: 自选股管理 ============

async function demoWatchlist() {
  console.log('══════════════════════════════════════════════');
  console.log('  示例 2: 自选股管理');
  console.log('══════════════════════════════════════════════\n');
  
  // 创建自选股管理器
  const watchlist = new WatchlistManager({
    filePath: path.join(__dirname, 'data/my_watchlist.json')
  });
  
  // 打印当前自选股
  watchlist.printList();
  
  // 添加股票
  console.log('➕ 添加股票:');
  watchlist.add('002594', '比亚迪', 'SZ');
  watchlist.add('601012', '隆基绿能', 'SH');
  
  // 搜索并添加
  console.log('🔍 搜索并添加:');
  await watchlist.searchAndAdd('中芯国际');
  
  // 获取自选股行情
  console.log('\n📊 自选股实时行情:');
  const quotes = await watchlist.getQuotes();
  
  console.log('══════════════════════════════════════════════');
  console.log('  代码    名称      最新价     涨跌幅    市值(亿)');
  console.log('──────────────────────────────────────────────');
  
  quotes.forEach(item => {
    if (item.quote) {
      const cap = (item.quote.totalMarketCap / 100000000).toFixed(0);
      const changeStr = item.quote.changePercent > 0 
        ? `+${item.quote.changePercent}%` 
        : `${item.quote.changePercent}%`;
      console.log(`  ${item.code}  ${item.name.padEnd(6)}  ¥${item.quote.price.toFixed(2).padEnd(8)}  ${changeStr.padEnd(8)}  ${cap}`);
    } else {
      console.log(`  ${item.code}  ${item.name.padEnd(6)}  --暂无数据--`);
    }
  });
  
  console.log('══════════════════════════════════════════════\n');
  
  // 移除股票
  console.log('➖ 移除股票:');
  watchlist.remove('000002');
  
  return watchlist;
}

// ============ 示例 3: 接入分层采集框架 (L0 数据源) ============

async function demoLayeredIntegration() {
  console.log('══════════════════════════════════════════════');
  console.log('  示例 3: 分层采集框架集成 (L0 数据源)');
  console.log('══════════════════════════════════════════════\n');
  
  // 模拟分层采集框架的 L0 数据获取
  const watchlist = new WatchlistManager();
  
  // 构建 L0 数据源配置
  const l0Source = {
    name: '东方财富自选股行情',
    url: 'push2.eastmoney.com/api/qt/ulist.np/get',
    type: 'realtime',
    category: 'stock-quotes',
    fetcher: async () => {
      const quotes = await watchlist.getQuotes();
      
      // 提取核心事实
      const coreFacts = quotes
        .filter(item => item.quote)
        .map(item => {
          const q = item.quote;
          return `${item.name}(${item.code}): ¥${q.price} ${q.changePercent > 0 ? '📈' : '📉'}${q.changePercent}%`;
        });
      
      // 计算市场概况
      const rising = quotes.filter(item => item.quote && item.quote.changePercent > 0).length;
      const falling = quotes.filter(item => item.quote && item.quote.changePercent < 0).length;
      const avgChange = quotes
        .filter(item => item.quote)
        .reduce((sum, item) => sum + item.quote.changePercent, 0) / quotes.filter(item => item.quote).length;
      
      return {
        content: {
          timestamp: new Date().toISOString(),
          totalStocks: quotes.length,
          rising,
          falling,
          avgChange: avgChange.toFixed(2)
        },
        coreFacts: [
          `自选股共 ${quotes.length} 只`,
          `上涨 ${rising} 只，下跌 ${falling} 只`,
          `平均涨跌幅: ${avgChange.toFixed(2)}%`,
          ...coreFacts.slice(0, 5)
        ],
        conditions: ['数据来自东方财富公开接口', '延迟约15秒', '仅含沪深A股'],
        uncertainties: ['网络延迟可能导致数据滞后', '接口稳定性取决于东方财富'],
        publishDate: new Date().toISOString(),
        publisher: 'EastMoney API'
      };
    }
  };
  
  // 执行数据获取
  console.log('📡 正在获取自选股行情数据...');
  try {
    const data = await l0Source.fetcher();
    
    console.log('\n📊 L0 数据源采集结果:');
    console.log('──────────────────────────────────────────────');
    console.log(`数据来源: ${l0Source.name}`);
    console.log(`发布时间: ${data.publishDate}`);
    console.log(`发布机构: ${data.publisher}`);
    console.log('\n核心事实:');
    data.coreFacts.forEach((fact, i) => {
      console.log(`  ${i + 1}. ${fact}`);
    });
    console.log('\n限定条件:');
    data.conditions.forEach(c => console.log(`  • ${c}`));
    console.log('\n不确定性:');
    data.uncertainties.forEach(u => console.log(`  ⚠️ ${u}`));
    console.log('──────────────────────────────────────────────');
    
    return data;
  } catch (error) {
    console.error('❌ 数据获取失败:', error.message);
    return null;
  }
}

// ============ 示例 4: 实时监控模式 ============

async function demoRealtimeMonitoring() {
  console.log('\n══════════════════════════════════════════════');
  console.log('  示例 4: 实时监控模式 (5秒刷新)');
  console.log('══════════════════════════════════════════════\n');
  
  const watchlist = new WatchlistManager();
  
  // 只监控前3只股票
  const codes = watchlist.getCodes().slice(0, 3);
  
  console.log(`🔴 开始监控: ${codes.join(', ')}\n`);
  
  // 模拟3轮监控
  for (let i = 1; i <= 3; i++) {
    console.log(`\n📡 第 ${i} 轮监控 (${new Date().toLocaleTimeString()})`);
    console.log('──────────────────────────────────────────────');
    
    try {
      const quotes = await getStockQuotes(codes);
      quotes.forEach(q => {
        const changeStr = q.changePercent > 0 ? `📈+${q.changePercent}%` : `📉${q.changePercent}%`;
        console.log(`  ${q.name.padEnd(6)} ¥${q.price.toFixed(2).padEnd(8)} ${changeStr}`);
      });
    } catch (error) {
      console.error('  ❌ 获取失败:', error.message);
    }
    
    // 等待5秒
    if (i < 3) {
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  console.log('\n✅ 监控结束');
}

// ============ 主执行入口 ============

async function main() {
  console.log('══════════════════════════════════════════════');
  console.log('  东方财富自选股 API 集成演示');
  console.log('══════════════════════════════════════════════\n');
  
  try {
    // 示例 1: 基础 API
    await demoBasicAPI();
    
    // 示例 2: 自选股管理
    const watchlist = await demoWatchlist();
    
    // 示例 3: 分层采集框架集成
    await demoLayeredIntegration();
    
    // 示例 4: 实时监控 (注释掉以加快演示)
    // await demoRealtimeMonitoring();
    
    console.log('\n══════════════════════════════════════════════');
    console.log('  所有示例执行完毕！');
    console.log('══════════════════════════════════════════════');
    
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
  }
}

// 执行
main();
