// TradingEconomics 数据提取 - 2026-07-10
const econData = {
  // 大宗商品
  commodities: {
    "原油": { price: 69.12, change: 0.83, unit: "$/桶" },
    "布伦特原油": { price: 72.61, change: 0.86, unit: "$/桶" },
    "黄金": { price: 4124.56, change: -0.97, unit: "$/盎司" },
    "白银": { price: 60.61, change: -2.31, unit: "$/盎司" },
    "铜": { price: 6.14, change: -0.62, unit: "$/磅" },
    "天然气": { price: 3.22, change: -0.66, unit: "$/MMBtu" },
    "大豆": { price: 1180.71, change: -0.13, unit: "$/蒲式耳" },
    "小麦": { price: 600.16, change: -0.96, unit: "$/蒲式耳" }
  },
  // 外汇汇率
  currencies: {
    "EUR/USD": { rate: 1.143, change: -0.10 },
    "GBP/USD": { rate: 1.338, change: -0.06 },
    "USD/JPY": { rate: 161.88, change: -0.12 },
    "USD/CNY": { rate: 6.798, change: 0.06 },
    "AUD/USD": { rate: 0.694, change: -0.26 },
    "USD/CAD": { rate: 1.422, change: 0.12 },
    "USD/CHF": { rate: 0.806, change: 0.12 },
    "美元指数": { rate: 100.94, change: 0.06 }
  },
  // 股指
  indices: {
    "标普500": { value: 7515.69, change: -0.29 },
    "道琼斯": { value: 53056, change: 0.00 },
    "纳斯达克": { value: 29321, change: -1.27 },
    "日经225": { value: 68365, change: -1.97 },
    "上证综指": { value: 3980, change: -1.52 },
    "德国DAX": { value: 25743, change: -0.29 },
    "英国FTSE": { value: 10652, change: -0.26 },
    "恒生指数": { value: 24500, change: 0.45 }
  },
  // 国债收益率
  bonds: {
    "美国10Y": 4.498, "德国10Y": 2.945, "日本10Y": 2.846,
    "英国10Y": 4.800, "中国10Y": 1.734, "巴西10Y": 14.485,
    "印度10Y": 6.696, "俄罗斯10Y": 16.710, "加拿大10Y": 3.419
  },
  // 加密货币
  crypto: {
    "BTC": { price: 62953, change: -1.62 },
    "ETH": { price: 1762.20, change: -1.92 },
    "BNB": { price: 577, change: -1.55 },
    "SOL": { price: 80.56, change: -1.60 },
    "XRP": { price: 1.125, change: -1.62 }
  },
  // 主要经济体指标
  economies: {
    "美国": { gdp: 30770, gdpGrowth: 2.10, interestRate: 3.75, inflation: 4.20, unemployment: 4.20, debtGdp: 123.3, population: 342 },
    "中国": { gdp: 19498, gdpGrowth: 1.30, interestRate: 3.00, inflation: 1.20, unemployment: 5.10, debtGdp: 99.2, population: 1405 },
    "日本": { gdp: 4435, gdpGrowth: 0.50, interestRate: 1.00, inflation: 1.50, unemployment: 2.50, debtGdp: 248.7, population: 123 },
    "德国": { gdp: 5051, gdpGrowth: 0.30, interestRate: 2.40, inflation: 2.30, unemployment: 6.30, debtGdp: 63.5, population: 83.5 },
    "英国": { gdp: 4003, gdpGrowth: 0.60, interestRate: 3.75, inflation: 2.80, unemployment: 4.90, debtGdp: 94.3, population: 69.5 },
    "印度": { gdp: 3956, gdpGrowth: 1.90, interestRate: 5.25, inflation: 3.93, unemployment: 5.50, debtGdp: 81.9, population: 1421 },
    "法国": { gdp: 3366, gdpGrowth: -0.10, interestRate: 2.40, inflation: 1.80, unemployment: 8.10, debtGdp: 115.6, population: 69 },
    "俄罗斯": { gdp: 2561, gdpGrowth: -0.80, interestRate: 14.25, inflation: 5.30, unemployment: 2.10, debtGdp: 18.3, population: 146 }
  }
};

console.log('Data extracted:', Object.keys(econData).length, 'categories');
