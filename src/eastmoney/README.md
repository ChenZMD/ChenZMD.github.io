# 东方财富自选股 API 集成

本项目提供东方财富行情 API 的 Node.js 封装，支持自选股管理、实时行情查询、股票搜索等功能。

## 📁 文件结构

```
src/eastmoney/
├── api.cjs          # 核心 API 封装（行情查询、搜索、股票列表）
├── watchlist.cjs     # 自选股管理器（添加、删除、导入导出、行情查询）
└── README.md         # 本文件
```

## 🚀 快速开始

### 1. 基础 API 调用

```javascript
const { getStockQuote, getStockQuotes, searchStocks } = require('./api.cjs');

// 获取单只股票行情
const quote = await getStockQuote('600519');
console.log(`${quote.name}: ¥${quote.price} (${quote.changePercent}%)`);

// 获取多只股票行情
const quotes = await getStockQuotes(['600000', '000001', '600519']);
quotes.forEach(q => {
  console.log(`${q.name}: ¥${q.price}`);
});

// 搜索股票
const results = await searchStocks('宁德');
results.forEach(r => {
  console.log(`${r.code} ${r.name} [${r.market}]`);
});
```

### 2. 自选股管理

```javascript
const { WatchlistManager } = require('./watchlist.cjs');

// 创建自选股管理器
const watchlist = new WatchlistManager({
  filePath: './data/my_watchlist.json',  // 自选股保存路径
  autoSave: true                          // 自动保存
});

// 添加股票
watchlist.add('002594', '比亚迪', 'SZ');
watchlist.add('601012', '隆基绿能', 'SH');

// 搜索并添加
await watchlist.searchAndAdd('中芯国际');

// 获取自选股行情
const quotes = await watchlist.getQuotes();
quotes.forEach(item => {
  if (item.quote) {
    console.log(`${item.name}: ¥${item.quote.price}`);
  }
});

// 打印自选股列表
watchlist.printList();
```

## 📚 API 文档

### `getStockQuote(code, market)`

获取单只股票行情。

**参数：**
- `code` - 股票代码（如 '600519'）
- `market` - 市场（'SH' 或 'SZ'，可选，自动检测）

**返回：**
```javascript
{
  code: '600519',
  name: '贵州茅台',
  price: 1204.98,
  change: 22.83,
  changePercent: 1.93,
  volume: 2345678,
  amount: 2820000000,
  high: 1210.00,
  low: 1180.00,
  open: 1185.00,
  prevClose: 1182.15,
  totalMarketCap: 1506300000000,
  floatMarketCap: 1506300000000,
  // ... 更多字段
}
```

### `getStockQuotes(codes, market, fields)`

获取多只股票行情。

**参数：**
- `codes` - 股票代码数组（如 ['600000', '000001']）
- `market` - 市场（可选）
- `fields` - 需要的字段数组（可选）

### `searchStocks(keyword)`

搜索股票。

**参数：**
- `keyword` - 搜索关键词（股票代码或名称）

**返回：**
```javascript
[
  {
    code: '300750',
    name: '宁德时代',
    market: 'SZ',
    pinYin: 'NDD',
    secid: '0.300750',
    type: '股票'
  }
]
```

### `getStockList(market, pageSize, pageNum)`

获取股票列表（全市场）。

**参数：**
- `market` - 市场筛选（'SH'、'SZ'、'ALL'）
- `pageSize` - 每页数量
- `pageNum` - 页码

## 📊 自选股管理器 API

### `WatchlistManager`

#### 构造函数

```javascript
const watchlist = new WatchlistManager({
  filePath: './data/watchlist.json',  // 保存路径
  autoSave: true,                      // 自动保存
  onUpdate: (action, stock) => {}     // 更新回调
});
```

#### 方法

| 方法 | 说明 | 示例 |
|------|------|------|
| `add(code, name, market)` | 添加股票 | `watchlist.add('600519', '贵州茅台', 'SH')` |
| `remove(code)` | 移除股票 | `watchlist.remove('600519')` |
| `clear()` | 清空自选股 | `watchlist.clear()` |
| `has(code)` | 检查是否存在 | `watchlist.has('600519')` |
| `size()` | 获取数量 | `watchlist.size()` |
| `getCodes()` | 获取代码列表 | `watchlist.getCodes()` |
| `getQuotes()` | 获取行情 | `await watchlist.getQuotes()` |
| `searchAndAdd(keyword)` | 搜索并添加 | `await watchlist.searchAndAdd('宁德')` |
| `printList()` | 打印列表 | `watchlist.printList()` |
| `export(filePath)` | 导出到文件 | `watchlist.export('./backup.json')` |
| `importFromFile(filePath)` | 从文件导入 | `watchlist.importFromFile('./backup.json')` |

## 🔧 配置说明

### 市场代码

| 代码 | 说明 | 股票代码前缀 |
|------|------|-------------|
| `SH` | 上海证券交易所 | 60、68、90、51 |
| `SZ` | 深圳证券交易所 | 00、30、15、16 |

### 字段映射

东方财富 API 返回的字段使用 `f` 前缀编号，已自动映射为可读格式：

| 字段 | 含义 | 字段 | 含义 |
|------|------|------|------|
| f2 | 最新价 | f12 | 股票代码 |
| f3 | 涨跌幅(%) | f14 | 股票名称 |
| f4 | 涨跌额 | f15 | 最高价 |
| f5 | 成交量 | f16 | 最低价 |
| f6 | 成交额 | f17 | 今开 |
| f20 | 总市值 | f21 | 流通市值 |

## ⚠️ 注意事项

1. **API 限制**：东方财富网页接口仅供个人学习和研究使用，高频调用可能被封 IP
2. **数据延迟**：行情数据有约 15 秒延迟
3. **网络问题**：如果 API 不可用，会自动使用模拟数据（需联网获取真实数据）
4. **合规风险**：商业用途请申请官方机构版 API

## 📖 示例文件

- `eastmoney-example.cjs` - 完整的使用示例，包含：
  - 基础 API 调用
  - 自选股管理
  - 分层采集框架集成（作为 L0 数据源）
  - 实时监控模式

运行示例：
```bash
node eastmoney-example.cjs
```

## 🔗 参考链接

- [东方财富行情中心](https://quote.eastmoney.com/)
- [东方财富官方 API（机构版）](https://quantapi.eastmoney.com/)
- [东方财富网](https://www.eastmoney.com/)
