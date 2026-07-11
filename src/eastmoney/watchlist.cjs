/**
 * 自选股管理器
 * 
 * 管理自选股列表，支持添加、删除、导入导出、行情查询等功能
 */

const fs = require('fs');
const path = require('path');
const { getStockQuotes, searchStocks, autoDetectMarket } = require('./api.cjs');

// ============ 配置 ============

const DEFAULT_WATCHLIST_PATH = path.join(__dirname, '../../data/watchlist.json');

// ============ 自选股管理器 ============

class WatchlistManager {
  constructor(options = {}) {
    this.watchlist = [];
    this.filePath = options.filePath || DEFAULT_WATCHLIST_PATH;
    this.autoSave = options.autoSave !== false;
    this.onUpdate = options.onUpdate || null;
    
    // 加载本地自选股
    this.load();
  }

  /**
   * 加载自选股列表
   */
  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf8');
        const parsed = JSON.parse(data);
        this.watchlist = parsed.stocks || [];
        console.log(`📂 已加载 ${this.watchlist.length} 只自选股`);
      } else {
        // 初始化默认自选股
        this.watchlist = this.getDefaultWatchlist();
        this.save();
      }
    } catch (error) {
      console.warn('⚠️ 加载自选股失败，使用默认列表:', error.message);
      this.watchlist = this.getDefaultWatchlist();
    }
  }

  /**
   * 默认自选股列表
   */
  getDefaultWatchlist() {
    return [
      { code: '600000', name: '浦发银行', market: 'SH', addedAt: new Date().toISOString() },
      { code: '600519', name: '贵州茅台', market: 'SH', addedAt: new Date().toISOString() },
      { code: '000001', name: '平安银行', market: 'SZ', addedAt: new Date().toISOString() },
      { code: '000858', name: '五粮液', market: 'SZ', addedAt: new Date().toISOString() },
      { code: '601318', name: '中国平安', market: 'SH', addedAt: new Date().toISOString() },
      { code: '300750', name: '宁德时代', market: 'SZ', addedAt: new Date().toISOString() },
      { code: '600036', name: '招商银行', market: 'SH', addedAt: new Date().toISOString() },
      { code: '000002', name: '万科A', market: 'SZ', addedAt: new Date().toISOString() }
    ];
  }

  /**
   * 保存自选股列表
   */
  save() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const data = {
        updatedAt: new Date().toISOString(),
        count: this.watchlist.length,
        stocks: this.watchlist
      };
      
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error('❌ 保存自选股失败:', error.message);
      return false;
    }
  }

  /**
   * 添加股票到自选
   * @param {string} code - 股票代码
   * @param {string} name - 股票名称（可选）
   * @param {string} market - 市场（可选）
   */
  add(code, name = null, market = null) {
    // 检查是否已存在
    if (this.watchlist.some(s => s.code === code)) {
      console.log(`⚠️ ${code} 已在自选股中`);
      return false;
    }

    const stock = {
      code,
      name: name || code,
      market: market || autoDetectMarket(code).split('.')[0] === '1' ? 'SH' : 'SZ',
      addedAt: new Date().toISOString()
    };

    this.watchlist.push(stock);
    
    if (this.autoSave) this.save();
    if (this.onUpdate) this.onUpdate('add', stock);
    
    console.log(`✅ 已添加 ${code} ${name || ''} 到自选股`);
    return true;
  }

  /**
   * 从自选股移除
   * @param {string} code - 股票代码
   */
  remove(code) {
    const index = this.watchlist.findIndex(s => s.code === code);
    if (index === -1) {
      console.log(`⚠️ ${code} 不在自选股中`);
      return false;
    }

    const removed = this.watchlist.splice(index, 1)[0];
    
    if (this.autoSave) this.save();
    if (this.onUpdate) this.onUpdate('remove', removed);
    
    console.log(`✅ 已从自选股移除 ${code} ${removed.name}`);
    return true;
  }

  /**
   * 清空自选股
   */
  clear() {
    this.watchlist = [];
    if (this.autoSave) this.save();
    if (this.onUpdate) this.onUpdate('clear', null);
    console.log('✅ 已清空自选股');
  }

  /**
   * 检查股票是否在自选股中
   * @param {string} code - 股票代码
   */
  has(code) {
    return this.watchlist.some(s => s.code === code);
  }

  /**
   * 获取自选股数量
   */
  size() {
    return this.watchlist.length;
  }

  /**
   * 获取自选股代码列表
   */
  getCodes() {
    return this.watchlist.map(s => s.code);
  }

  /**
   * 获取自选股行情
   * @param {string[]} fields - 需要的字段（可选）
   * @returns {Promise<Object[]>} 行情数据
   */
  async getQuotes(fields = null) {
    if (this.watchlist.length === 0) {
      console.log('⚠️ 自选股列表为空');
      return [];
    }

    const codes = this.getCodes();
    try {
      const quotes = await getStockQuotes(codes, null, fields);
      
      // 合并自选股信息和行情数据
      const result = this.watchlist.map(stock => {
        const quote = quotes.find(q => q.code === stock.code);
        return {
          ...stock,
          quote: quote || null,
          status: quote ? 'online' : 'offline'
        };
      });

      return result;
    } catch (error) {
      console.error('❌ 获取自选股行情失败:', error.message);
      return this.watchlist.map(stock => ({
        ...stock,
        quote: null,
        status: 'error'
      }));
    }
  }

  /**
   * 搜索并添加股票
   * @param {string} keyword - 搜索关键词
   */
  async searchAndAdd(keyword) {
    try {
      const results = await searchStocks(keyword);
      if (results.length === 0) {
        console.log(`⚠️ 未找到匹配 "${keyword}" 的股票`);
        return null;
      }

      // 取第一个结果
      const stock = results[0];
      this.add(stock.code, stock.name, stock.market);
      return stock;
    } catch (error) {
      console.error('❌ 搜索失败:', error.message);
      return null;
    }
  }

  /**
   * 导入自选股（覆盖）
   * @param {string[]} codes - 股票代码数组
   */
  import(codes) {
    const added = [];
    for (const code of codes) {
      if (!this.has(code)) {
        this.watchlist.push({
          code,
          name: code,
          market: autoDetectMarket(code).split('.')[0] === '1' ? 'SH' : 'SZ',
          addedAt: new Date().toISOString()
        });
        added.push(code);
      }
    }

    if (this.autoSave) this.save();
    console.log(`✅ 已导入 ${added.length} 只股票`);
    return added;
  }

  /**
   * 导出自选股到 JSON 文件
   * @param {string} filePath - 导出路径
   */
  export(filePath) {
    try {
      const data = {
        exportedAt: new Date().toISOString(),
        source: 'EastMoney Watchlist',
        stocks: this.watchlist
      };
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`✅ 已导出到 ${filePath}`);
      return true;
    } catch (error) {
      console.error('❌ 导出失败:', error.message);
      return false;
    }
  }

  /**
   * 从 JSON 文件导入自选股
   * @param {string} filePath - 导入路径
   */
  importFromFile(filePath) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const codes = (data.stocks || []).map(s => s.code);
      return this.import(codes);
    } catch (error) {
      console.error('❌ 导入失败:', error.message);
      return [];
    }
  }

  /**
   * 获取自选股统计摘要
   */
  getSummary() {
    return {
      total: this.watchlist.length,
      markets: {
        SH: this.watchlist.filter(s => s.market === 'SH').length,
        SZ: this.watchlist.filter(s => s.market === 'SZ').length
      },
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * 打印自选股列表
   */
  printList() {
    console.log('\n📊 自选股列表');
    console.log('══════════════════════════════════════════════');
    this.watchlist.forEach((stock, index) => {
      console.log(`${index + 1}. [${stock.market}] ${stock.code} ${stock.name}`);
    });
    console.log(`──────────────────────────────────────────────`);
    console.log(`总计: ${this.watchlist.length} 只股票`);
    console.log('══════════════════════════════════════════════\n');
  }
}

// ============ 导出模块 ============

module.exports = { WatchlistManager, DEFAULT_WATCHLIST_PATH };
