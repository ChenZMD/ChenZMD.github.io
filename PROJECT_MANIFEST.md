# AI量化交易Agent · 项目执行手册

> **项目名称**: 个人私有AI量化交易系统  
> **版本**: v1.0 | **创建日期**: 2026-07-10  
> **执行策略**: 7阶段渐进式落地

---

## 📁 项目目录结构

```
e:\trae\Projects\1\
├── data-collector.cjs          # [步骤1-2] 数据源连接器（已运行）
├── data/                       # [步骤2] 数据落地目录（已创建）
│   ├── forex_latest.json       # ✅ 外汇汇率（已获取）
│   ├── crypto_latest.json      # 🪙 加密货币
│   ├── commodities_latest.json # 🛢️ 大宗商品配置
│   ├── weather_ports.json      # 🌤️ 港口天气
│   ├── macro_sources.json      # 📊 宏观指标配置
│   └── daily_report.json       # 📋 数据抓取日报
├── templates/                  # [步骤3,5,8] 模板文件
│   ├── daily_material_template.md    # 每日素材库模板
│   ├── trading_rules_template.md     # 私有交易规则手册
│   └── distillation_framework.md     # 多模型蒸馏框架
├── checklist.html              # 全流程进度追踪（可视化）
├── chart.html                  # 经济数据可视化（地图+图表）
├── server.js                   # HTTP服务器（含gzip/缓存）
└── PROJECT_MANIFEST.md         # 本文件
```

---

## 🎯 阶段执行进度

### ✅ 第一阶段：底层基建搭建（0-3天）→ 已完成
- [x] **步骤1**: 搭建数据源连接器 → `data-collector.cjs`
  - 外汇汇率: ExchangeRate-API ✅
  - 加密货币: CoinGecko API ✅
  - 大宗商品: ETF代理配置 ✅
  - 天气数据: Open-Meteo API ✅
  - 宏观指标: TradingEconomics配置 ✅
- [x] **步骤2**: 自动化数据抓取脚本 → `data-collector.cjs`
  - 并行获取5大数据源
  - 自动保存JSON格式
  - 生成日报
- [x] **步骤3**: 每日素材库模板 → `templates/daily_material_template.md`
  - 宏观数据汇总
  - 产业新闻时间线
  - 板块资金异动
  - 风险事件汇总

### 🔄 第二阶段：个人交易认知标准化（3-7天）→ 模板已创建
- [x] **步骤4**: 规则文本化 → `templates/trading_rules_template.md`
  - 资金运行规则
  - 周期判断规则
  - 逆向判断规则
  - 板块联动规则
- [x] **步骤5**: 私有交易规则手册 → `templates/trading_rules_template.md`
  - 上涨/下跌/震荡条件
  - 假突破识别
  - 真趋势启动共振
  - 止损止盈规则
  - 仓位算法
- [ ] **步骤6**: 历史案例归档 → 待填充

### 🔄 第三阶段：多模型蒸馏系统（7-15天）→ 框架已创建
- [x] **步骤7**: 模型分工架构 → `templates/distillation_framework.md`
- [x] **步骤8**: 蒸馏投喂流程 → `templates/distillation_framework.md`
- [ ] **步骤9**: 模型纠错机制 → 待运行积累
- [ ] **步骤10**: 认知AI化固化 → 待完成

### ⏳ 第四阶段：垂直板块Agent（15-25天）
- [ ] 步骤11: 外贸自贸区Agent
- [ ] 步骤12: 电力周期Agent
- [ ] 步骤13: 科技卡脖子Agent
- [ ] 步骤14: 天气周期Agent
- [ ] 步骤15: Agent输出标准化

### ⏳ 第五阶段：跨板块联动预判（25-32天）
- [ ] 步骤16: 多板块共振规则
- [ ] 步骤17: 传导逻辑链库
- [ ] 步骤18: 事件预判表
- [ ] 步骤19: 每日全景预判报告

### ⏳ 第六阶段：交易执行+风控（32-40天）
- [ ] 步骤20: 四层信号过滤
- [ ] 步骤21: 仓位算法落地
- [ ] 步骤22: 止损止盈自动化
- [ ] 步骤23: 极端行情风控

### ⏳ 第七阶段：自动复盘迭代（40天+）
- [ ] 步骤24: Trace日志系统
- [ ] 步骤25: 每日自动复盘
- [ ] 步骤26: 每周大迭代

---

## 🚀 快速启动

### 1. 启动数据收集
```bash
node data-collector.cjs
```

### 2. 启动Web服务
```bash
node server.js
```

### 3. 访问应用
- 全流程清单: http://localhost:8082/checklist.html
- 经济可视化: http://localhost:8082/chart.html

---

## 📊 数据源配置

| 数据源 | API地址 | 状态 | 备注 |
|--------|---------|------|------|
| 外汇汇率 | api.exchangerate-api.com | ✅ 正常 | 免费，无需Key |
| 加密货币 | api.coingecko.com | ✅ 正常 | 免费，CORS |
| 天气数据 | api.open-meteo.com | ✅ 正常 | 免费，CORS |
| 大宗商品 | tradingeconomics.com | ⚠️ 需Key | 免费层有限 |
| 股票数据 | 东方财富/新浪 | ⚠️ 需爬虫 | 需自建 |

---

## 🔧 待办事项

### 立即执行
1. [ ] 配置TradingEconomics API Key获取完整商品数据
2. [ ] 配置Alpha Vantage Key获取ETF实时价格
3. [ ] 设置Windows定时任务每日自动运行data-collector.cjs
4. [ ] 填充trading_rules_template.md中的个人规则

### 本周完成
5. [ ] 建立SQLite历史数据库
6. [ ] 完成至少3次多模型蒸馏实操
7. [ ] 积累10个以上历史交易案例

---

## 📈 质量标准

- 数据准确性: 与官方数据源对比误差<0.1%
- 数据时效性: 开盘前30分钟完成数据更新
- 规则覆盖率: 80%以上交易决策有规则依据
- 信号胜率: 回测胜率>55%方可实盘
- 最大回撤: 单笔<7%，总账户<15%

---

> 📌 本文件随项目推进持续更新
> 📌 每次重大变更需更新版本号
