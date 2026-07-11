const fs = require('fs');
const topo = fs.readFileSync('topojson.min.js', 'utf8');
const mapData = fs.readFileSync('countries-110m.json', 'utf8');
const appData = fs.readFileSync('data.min.js', 'utf8');

// ============================================
// 完整重新设计 - 清晰布局 + 响应式适配 + 经济数据可视化
// ============================================

const css = `
/* ========== 设计系统 ========== */
:root{
  --bg-primary:#020617;
  --bg-secondary:#0f172a;
  --bg-tertiary:#1e293b;
  --surface:rgba(15,23,42,0.75);
  --surface-hover:rgba(30,41,59,0.6);
  --border:rgba(148,163,184,0.08);
  --border-active:rgba(59,130,246,0.4);
  --accent:#3b82f6;
  --accent-glow:rgba(59,130,246,0.3);
  --inflow:#06b6d4;
  --outflow:#f59e0b;
  --positive:#10b981;
  --negative:#ef4444;
  --text-primary:#f1f5f9;
  --text-secondary:#94a3b8;
  --text-muted:#64748b;
  --radius-sm:6px;
  --radius-md:10px;
  --radius-lg:14px;
  --radius-xl:20px;
  --shadow:0 4px 24px rgba(0,0,0,0.4);
  --transition:0.2s cubic-bezier(0.4,0,0.2,1);
}

/* ========== 基础重置 ========== */
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html,body{height:100%;overflow:hidden}
body{
  font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  background:var(--bg-primary);
  color:var(--text-primary);
  line-height:1.5;
  -webkit-font-smoothing:antialiased;
}

/* ========== 星空背景 ========== */
#stars{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
.star{position:absolute;background:#fff;border-radius:50%;animation:twinkle var(--d,3s) ease-in-out infinite alternate}
@keyframes twinkle{0%{opacity:0.15;transform:scale(0.8)}100%{opacity:0.9;transform:scale(1.3)}}

/* ========== 应用容器 ========== */
#app{
  position:relative;z-index:1;
  display:grid;
  grid-template-rows:auto 1fr;
  height:100vh;
}

/* ========== 顶部导航栏 ========== */
.navbar{
  display:flex;align-items:center;justify-content:space-between;
  padding:12px 20px;
  background:linear-gradient(180deg,rgba(2,6,23,0.98) 0%,rgba(2,6,23,0.85) 100%);
  border-bottom:1px solid var(--border);
  backdrop-filter:blur(12px);
  z-index:100;
}
.nav-brand{display:flex;align-items:center;gap:10px}
.brand-icon{
  width:36px;height:36px;border-radius:var(--radius-md);
  background:linear-gradient(135deg,var(--accent),#8b5cf6);
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 0 20px var(--accent-glow);
}
.brand-text{font-size:16px;font-weight:600;letter-spacing:-0.3px}
.brand-text span{color:var(--accent)}

.nav-stats{display:flex;gap:20px;align-items:center}
.stat{display:flex;flex-direction:column;align-items:center;min-width:60px}
.stat-val{font-size:16px;font-weight:700;color:var(--accent)}
.stat-lbl{font-size:9px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.8px}

.nav-actions{display:flex;gap:8px;align-items:center}
.nav-btn{
  padding:6px 12px;border-radius:var(--radius-sm);
  background:var(--bg-tertiary);border:1px solid var(--border);
  color:var(--text-secondary);font-size:11px;cursor:pointer;
  transition:var(--transition);
}
.nav-btn:hover{background:var(--surface-hover);color:var(--text-primary);border-color:var(--border-active)}

.refresh-timer{
  display:flex;align-items:center;gap:5px;
  padding:5px 10px;border-radius:var(--radius-sm);
  background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.15);
  font-size:10px;color:var(--positive);
  cursor:pointer;
}
.refresh-timer:hover{background:rgba(16,185,129,0.15)}
.data-status{
  display:flex;align-items:center;gap:6px;
  padding:8px 12px;margin:12px 16px 0;
  background:rgba(15,23,42,0.6);border:1px solid var(--border);
  border-radius:var(--radius-sm);font-size:10px;
}
.live-dot{
  width:6px;height:6px;border-radius:50%;
  background:#f59e0b;animation:pulse 2s infinite;
}
.live-dot.active{background:#10b981}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
.data-status-info{color:var(--text-muted);flex:1}
.data-status-time{color:var(--accent);font-weight:500}
.refresh-dot{
  width:6px;height:6px;border-radius:50%;
  background:var(--positive);animation:pulse 1.5s ease-in-out infinite;
}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}

/* ========== 主内容区 ========== */
.main-content{
  display:grid;
  grid-template-columns:1fr 300px;
  overflow:hidden;
  position:relative;
}

/* ========== 地图区域 ========== */
.map-section{position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}

/* 地图光晕 */
.map-glow{
  position:absolute;
  width:min(80vh,80vw);height:min(80vh,80vw);
  background:radial-gradient(circle,rgba(59,130,246,0.06) 0%,transparent 70%);
  border-radius:50%;pointer-events:none;
}

/* SVG地图 */
.map-svg{position:absolute;cursor:grab;will-change:transform;shape-rendering:geometricPrecision}
.map-svg:active{cursor:grabbing}

/* 国家样式 */
.country{
  fill:#0f172a;
  stroke:rgba(100,116,139,0.35);
  stroke-width:0.8px;
  stroke-linejoin:round;
  stroke-linecap:round;
  vector-effect:non-scaling-stroke;
  paint-order:stroke fill;
  transition:fill 0.15s,stroke 0.15s,opacity 0.15s;
  cursor:pointer;
}
.country:hover{
  fill:rgba(59,130,246,0.18);
  stroke:rgba(96,165,250,0.7);
  stroke-width:1.5px;
}
.country.active{
  fill:rgba(59,130,246,0.28);
  stroke:rgba(96,165,250,0.9);
  stroke-width:2px;
}
.country.dimmed{
  fill:rgba(15,23,42,0.5);
  opacity:0.4;
}

/* 流动画布 */
.flow-canvas{position:absolute;inset:0;pointer-events:none}

/* 地图工具提示 */
.map-tooltip{
  position:fixed;padding:10px 14px;
  background:var(--surface);
  backdrop-filter:blur(16px);
  border:1px solid var(--border-active);
  border-radius:var(--radius-md);
  font-size:11px;pointer-events:none;
  opacity:0;transition:opacity 0.15s;
  z-index:50;min-width:160px;
  box-shadow:var(--shadow);
}
.map-tooltip.visible{opacity:1}
.tt-title{font-weight:600;margin-bottom:6px;font-size:12px}
.tt-row{display:flex;justify-content:space-between;align-items:center;padding:2px 0}
.tt-lbl{color:var(--text-muted)}
.tt-val{font-weight:600}
.tt-val.in{color:var(--inflow)}
.tt-val.out{color:var(--outflow)}

/* ========== 底部控制栏 ========== */
.map-controls{
  position:absolute;bottom:20px;left:50%;transform:translateX(-50%);
  display:flex;align-items:center;gap:16px;
  padding:10px 20px;
  background:var(--surface);
  backdrop-filter:blur(16px);
  border:1px solid var(--border);
  border-radius:var(--radius-xl);
  box-shadow:var(--shadow);
  z-index:30;
}
.ctrl-group{display:flex;align-items:center;gap:8px}
.ctrl-label{font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px}
.ctrl-slider{
  width:100px;height:4px;
  -webkit-appearance:none;appearance:none;
  background:var(--bg-tertiary);
  border-radius:2px;outline:none;
}
.ctrl-slider::-webkit-slider-thumb{
  -webkit-appearance:none;appearance:none;
  width:14px;height:14px;border-radius:50%;
  background:var(--accent);cursor:pointer;
  box-shadow:0 0 8px var(--accent-glow);
  transition:transform 0.15s;
}
.ctrl-slider::-webkit-slider-thumb:hover{transform:scale(1.2)}
.ctrl-val{font-size:11px;font-weight:600;color:var(--accent);min-width:55px}

/* ========== 右侧面板 ========== */
.side-panel{
  background:var(--surface);
  backdrop-filter:blur(16px);
  border-left:1px solid var(--border);
  display:flex;flex-direction:column;
  overflow:hidden;
}

/* 面板头部 */
.panel-head{padding:12px 16px 0;border-bottom:1px solid var(--border)}
.panel-title{font-size:14px;font-weight:600;margin-bottom:2px}
.panel-sub{font-size:10px;color:var(--text-muted);margin-bottom:12px}

/* 统计卡片 */
.stats-grid{
  display:grid;grid-template-columns:1fr 1fr;gap:8px;
  padding:12px 16px;
  border-bottom:1px solid rgba(148,163,184,0.06);
}
.stat-card{
  padding:14px 12px;
  background:rgba(15,23,42,0.4);
  border-radius:var(--radius-md);
  text-align:center;
}
.stat-card.in{border:1px solid rgba(6,182,212,0.12)}
.stat-card.out{border:1px solid rgba(245,158,11,0.12)}
.stat-card.positive{border:1px solid rgba(16,185,129,0.12)}
.stat-card.negative{border:1px solid rgba(239,68,68,0.12)}
.stat-card-lbl{font-size:9px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px}
.stat-card-val{font-size:16px;font-weight:700;margin-top:4px;letter-spacing:-0.5px}
.stat-card.in .stat-card-val{color:var(--inflow)}
.stat-card.out .stat-card-val{color:var(--outflow)}
.stat-card.positive .stat-card-val{color:var(--positive)}
.stat-card.negative .stat-card-val{color:var(--negative)}

/* ========== 标签导航 ========== */
.tab-nav{
  display:flex;
  padding:0 12px;
  border-bottom:1px solid var(--border);
  background:rgba(2,6,23,0.3);
}
.tab-btn{
  flex:1;
  padding:10px 4px;
  background:transparent;
  border:none;
  border-bottom:2px solid transparent;
  color:var(--text-muted);
  font-size:11px;
  font-weight:500;
  cursor:pointer;
  transition:var(--transition);
  white-space:nowrap;
}
.tab-btn:hover{color:var(--text-secondary)}
.tab-btn.active{
  color:var(--accent);
  border-bottom-color:var(--accent);
}

/* ========== 面板内容区 ========== */
.panel-body{flex:1;overflow-y:auto;padding:16px}
.tab-panel{display:none;animation:fadeIn 0.2s ease}
.tab-panel.active{display:block}
@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}

/* 分组标题 */
.section-hd{
  display:flex;align-items:center;gap:8px;
  font-size:10px;font-weight:500;color:var(--text-muted);
  text-transform:uppercase;letter-spacing:0.8px;
  padding:12px 0 8px;
  margin-bottom:6px;
  border-top:1px solid rgba(148,163,184,0.06);
}
.section-hd:first-of-type{border-top:none;padding-top:0}
.section-hd::before{
  content:'';width:3px;height:12px;
  background:var(--accent);border-radius:2px;
  opacity:0.7;
}

/* 资金列表 */
.flow-items{display:flex;flex-direction:column;margin-bottom:18px}
.flow-row{
  display:flex;align-items:center;justify-content:space-between;
  padding:10px 4px;
  border-bottom:1px solid rgba(148,163,184,0.06);
  font-size:11px;
  transition:background 0.15s;
}
.flow-row:last-child{border-bottom:none}
.flow-row:hover{background:rgba(59,130,246,0.04)}
.flow-route{display:flex;align-items:center;gap:8px}
.flow-pip{width:5px;height:5px;border-radius:50%;flex-shrink:0}
.flow-pip.in{background:var(--inflow)}
.flow-pip.out{background:var(--outflow)}
.flow-country{color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:120px}
.flow-amt{font-weight:600;font-variant-numeric:tabular-nums}
.flow-amt.in{color:var(--inflow)}
.flow-amt.out{color:var(--outflow)}

/* ========== 图表容器 ========== */
.chart-container{
  position:relative;
  margin:8px 0 16px;
  background:rgba(2,6,23,0.3);
  border-radius:var(--radius-md);
  border:1px solid var(--border);
  overflow:hidden;
}
.chart-container canvas{
  display:block;
  width:100%;
}
.chart-title{
  font-size:11px;
  font-weight:600;
  color:var(--text-secondary);
  padding:10px 12px 4px;
  display:flex;
  justify-content:space-between;
  align-items:center;
}
.chart-badge{
  font-size:9px;
  padding:2px 6px;
  border-radius:10px;
  background:rgba(59,130,246,0.1);
  color:var(--accent);
}

/* ========== 数据行 ========== */
.data-row{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:8px 10px;
  margin:3px 0;
  border-radius:var(--radius-sm);
  font-size:11px;
  background:rgba(2,6,23,0.2);
  border:1px solid transparent;
  transition:var(--transition);
}
.data-row:hover{
  background:rgba(59,130,246,0.04);
  border-color:rgba(59,130,246,0.1);
}
.data-name{color:var(--text-secondary);font-weight:500}
.data-values{display:flex;align-items:center;gap:10px}
.data-price{font-weight:600;color:var(--text-primary);font-variant-numeric:tabular-nums}
.data-change{font-weight:600;font-variant-numeric:tabular-nums;font-size:10px;padding:2px 6px;border-radius:4px}
.data-change.positive{color:var(--positive);background:rgba(16,185,129,0.08)}
.data-change.negative{color:var(--negative);background:rgba(239,68,68,0.08)}

/* ========== 经济对比表格 ========== */
.econ-table{width:100%;border-collapse:collapse;font-size:10px}
.econ-table th{
  text-align:left;
  padding:6px 8px;
  color:var(--text-muted);
  font-weight:500;
  border-bottom:1px solid var(--border);
  text-transform:uppercase;
  letter-spacing:0.5px;
  font-size:9px;
}
.econ-table td{
  padding:7px 8px;
  border-bottom:1px solid rgba(148,163,184,0.04);
  font-variant-numeric:tabular-nums;
}
.econ-table tr:hover td{background:rgba(59,130,246,0.03)}
.econ-country{color:var(--text-primary);font-weight:500}
.econ-val{color:var(--text-secondary)}
.econ-val.pos{color:var(--positive)}
.econ-val.neg{color:var(--negative)}

/* ========== 加载动画 ========== */
.loader-overlay{
  position:fixed;inset:0;
  background:var(--bg-primary);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  z-index:1000;transition:opacity 0.4s;
}
.loader-overlay.hidden{opacity:0;pointer-events:none}
.loader-ring{
  width:40px;height:40px;
  border:3px solid var(--border);
  border-top-color:var(--accent);
  border-radius:50%;
  animation:spin 0.8s linear infinite;
}
.loader-text{margin-top:12px;font-size:12px;color:var(--text-muted)}
@keyframes spin{to{transform:rotate(360deg)}}

/* ========== 响应式适配 ========== */
@media(max-width:1024px){
  .main-content{grid-template-columns:1fr 260px}
  .nav-stats{display:none}
}
@media(max-width:768px){
  .main-content{grid-template-columns:1fr;grid-template-rows:1fr auto}
  .side-panel{
    border-left:none;border-top:1px solid var(--border);
    max-height:50vh;
  }
  .navbar{padding:10px 14px}
  .brand-text{font-size:14px}
  .map-controls{bottom:12px;padding:8px 14px}
  .ctrl-slider{width:70px}
  .tab-btn{font-size:10px;padding:8px 2px}
}
@media(max-width:480px){
  .nav-brand .brand-text span{display:none}
  .map-controls{gap:10px}
  .ctrl-label{display:none}
  .stats-grid{grid-template-columns:1fr 1fr;gap:6px}
  .stat-card{padding:8px}
  .stat-card-val{font-size:13px}
  .tab-btn{font-size:9px}
}

/* ========== 滚动条 ========== */
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--bg-tertiary);border-radius:2px}
::-webkit-scrollbar-thumb:hover{background:var(--text-muted)}
`;

// 经济数据 - 支持实时API获取
const econDataScript = `
// 基础数据（作为初始值和API失败时的回退）
const ECON_DATA = {
  commodities: {
    "原油": { price: 69.12, change: 0.83 },
    "布伦特原油": { price: 72.61, change: 0.86 },
    "黄金": { price: 4124.56, change: -0.97 },
    "白银": { price: 60.61, change: -2.31 },
    "铜": { price: 6.14, change: -0.62 },
    "天然气": { price: 3.22, change: -0.66 },
    "大豆": { price: 1180.71, change: -0.13 },
    "小麦": { price: 600.16, change: -0.96 }
  },
  currencies: {
    "EUR/USD": { rate: 1.143, change: -0.10 },
    "GBP/USD": { rate: 1.338, change: -0.06 },
    "USD/JPY": { rate: 161.88, change: -0.12 },
    "USD/CNY": { rate: 6.798, change: 0.06 },
    "AUD/USD": { rate: 0.694, change: -0.26 },
    "USD/CAD": { rate: 1.422, change: 0.12 },
    "美元指数": { rate: 100.94, change: 0.06 }
  },
  indices: {
    "标普500": { value: 7515.69, change: -0.29 },
    "纳斯达克": { value: 29321, change: -1.27 },
    "道琼斯": { value: 53056, change: 0.00 },
    "日经225": { value: 68365, change: -1.97 },
    "上证综指": { value: 3980, change: -1.52 },
    "德国DAX": { value: 25743, change: -0.29 },
    "英国FTSE": { value: 10652, change: -0.26 }
  },
  bonds: {
    "美国10Y": 4.498, "德国10Y": 2.945, "日本10Y": 2.846,
    "英国10Y": 4.800, "中国10Y": 1.734, "巴西10Y": 14.485,
    "印度10Y": 6.696, "俄罗斯10Y": 16.710
  },
  crypto: {
    "BTC": { price: 62953, change: -1.62 },
    "ETH": { price: 1762.20, change: -1.92 }
  },
  economies: {
    "美国": { gdp: 30770, growth: 2.10, interest: 3.75, inflation: 4.20, unemployment: 4.20 },
    "中国": { gdp: 19498, growth: 1.30, interest: 3.00, inflation: 1.20, unemployment: 5.10 },
    "日本": { gdp: 4435, growth: 0.50, interest: 1.00, inflation: 1.50, unemployment: 2.50 },
    "德国": { gdp: 5051, growth: 0.30, interest: 2.40, inflation: 2.30, unemployment: 6.30 },
    "英国": { gdp: 4003, growth: 0.60, interest: 3.75, inflation: 2.80, unemployment: 4.90 },
    "印度": { gdp: 3956, growth: 1.90, interest: 5.25, inflation: 3.93, unemployment: 5.50 },
    "法国": { gdp: 3366, growth: -0.10, interest: 2.40, inflation: 1.80, unemployment: 8.10 },
    "俄罗斯": { gdp: 2561, growth: -0.80, interest: 14.25, inflation: 5.30, unemployment: 2.10 }
  }
};

// 数据状态
var DATA_STATUS = {
  lastUpdate: new Date().toLocaleString('zh-CN'),
  source: '初始化中...',
  isLive: false
};

// 实时汇率 API - ExchangeRate (免费, CORS)
function fetchLiveForex() {
  fetch('https://api.exchangerate-api.com/v4/latest/USD')
    .then(function(r){ return r.json(); })
    .then(function(data){
      var rates = data.rates;
      if(rates){
        ECON_DATA.currencies['EUR/USD'].rate = +(rates.EUR).toFixed(4);
        ECON_DATA.currencies['GBP/USD'].rate = +(rates.GBP).toFixed(4);
        ECON_DATA.currencies['USD/JPY'].rate = +(rates.JPY).toFixed(2);
        ECON_DATA.currencies['USD/CNY'].rate = +(rates.CNY).toFixed(4);
        ECON_DATA.currencies['AUD/USD'].rate = +(rates.AUD).toFixed(4);
        ECON_DATA.currencies['USD/CAD'].rate = +(rates.CAD).toFixed(4);
        ECON_DATA.currencies['USD/CHF'].rate = +(rates.CHF).toFixed(4);
        // 美元指数估算
        ECON_DATA.currencies['美元指数'].rate = +((rates.EUR/1.143 + rates.GBP/1.338 + 100/rates.JPY * 161.88) / 3 * 33.33).toFixed(2);
        DATA_STATUS.source = 'ExchangeRate-API (实时)';
        DATA_STATUS.isLive = true;
        updateLastSync();
      }
    })
    .catch(function(e){
      DATA_STATUS.source = 'ExchangeRate-API 连接失败';
      console.warn('Forex API error:', e.message);
    });
}

// 实时加密货币 API - CoinGecko (免费, CORS)
function fetchLiveCrypto() {
  fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,ripple&vs_currencies=usd&include_24hr_change=true')
    .then(function(r){ return r.json(); })
    .then(function(data){
      if(bitcoin = data.bitcoin){
        ECON_DATA.crypto.BTC.price = +bitcoin.usd.toFixed(0);
        ECON_DATA.crypto.BTC.change = +(bitcoin.usd_24h_change || 0).toFixed(2);
      }
      if(ethereum = data.ethereum){
        ECON_DATA.crypto.ETH.price = +ethereum.usd.toFixed(2);
        ECON_DATA.crypto.ETH.change = +(ethereum.usd_24h_change || 0).toFixed(2);
      }
      DATA_STATUS.source += ' + CoinGecko';
      updateLastSync();
    })
    .catch(function(e){
      console.warn('Crypto API error:', e.message);
    });
}

// 更新最后同步时间
function updateLastSync() {
  DATA_STATUS.lastUpdate = new Date().toLocaleString('zh-CN');
  var el = document.getElementById('dataLastUpdate');
  if(el) el.textContent = DATA_STATUS.lastUpdate;
  var src = document.getElementById('dataSource');
  if(src) src.textContent = DATA_STATUS.source;
  var dot = document.getElementById('liveDot');
  if(dot) dot.style.background = DATA_STATUS.isLive ? '#10b981' : '#f59e0b';
}

// 首次获取实时数据
fetchLiveForex();
fetchLiveCrypto();
`;

// 轻量地图库 - 等距圆柱投影 (Equirectangular)
const geoLib = `
function makeProj(w,h){
  // 等距圆柱投影：经度[-180,180]→x[0,w]，纬度[90,-90]→y[0,h]
  return function(ll){
    var lo=ll[0],la=ll[1];
    var x=((lo+180)/360)*w;
    var y=((90-la)/180)*h;
    return [x,y];
  };
}
// 生成SVG路径
function makePath(proj,w){
  return function(f){
    function ring(r){
      var d='',prevX=null,threshold=w*0.5;
      for(var i=0;i<r.length;i++){
        var p=proj(r[i]);
        // 日期变更线检测：水平位移超阈值时断开连线
        if(prevX!==null&&Math.abs(p[0]-prevX)>threshold){
          d+='M'+p[0].toFixed(2)+','+p[1].toFixed(2);
        }else{
          d+=(i&&d.slice(-1)!=='M'?'L':'M')+p[0].toFixed(2)+','+p[1].toFixed(2);
        }
        prevX=p[0];
      }
      return d+'Z';
    }
    if(f.geometry.type==='Polygon')return ring(f.geometry.coordinates[0]);
    if(f.geometry.type==='MultiPolygon'){
      var d='';
      f.geometry.coordinates.forEach(function(p){d+=ring(p[0])});
      return d;
    }
    return '';
  };
}
`;

// 缩放交互
const zoomLib = `
function initZoom(el){
  var t={x:0,y:0,k:1},active=false,lx=0,ly=0;
  el.addEventListener('wheel',function(e){
    e.preventDefault();
    var d=e.deltaY>0?0.92:1.08;
    var nk=Math.max(1,Math.min(10,t.k*d));
    var r=el.getBoundingClientRect();
    var mx=e.clientX-r.left,my=e.clientY-r.top;
    t.x=mx-(mx-t.x)*nk/t.k;
    t.y=my-(my-t.y)*nk/t.k;
    t.k=nk;
  },{passive:false});
  el.addEventListener('mousedown',function(e){active=true;lx=e.clientX;ly=e.clientY});
  window.addEventListener('mouseup',function(){active=false});
  window.addEventListener('mousemove',function(e){
    if(!active)return;
    t.x+=e.clientX-lx;t.y+=e.clientY-ly;
    lx=e.clientX;ly=e.clientY;
  });
  return {get:function(){return t}};
}
`;

// 经济数据图表渲染
const econChartsScript = `
/* ========== Canvas 图表渲染 ========== */

// 垂直柱状图（商品/指数涨跌）
function drawBarChart(canvasId, data, labels, valueFormatter) {
  var canvas = document.getElementById(canvasId);
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  var W = rect.width, H = rect.height;
  var padding = { top: 20, right: 10, bottom: 30, left: 10 };
  var chartW = W - padding.left - padding.right;
  var chartH = H - padding.top - padding.bottom;

  ctx.clearRect(0, 0, W, H);

  var values = Object.values(data);
  var maxVal = Math.max.apply(null, values.map(function(v){ return Math.abs(v); }));
  if (maxVal === 0) maxVal = 1;

  var barW = Math.min(24, (chartW / values.length) * 0.6);
  var gap = (chartW - barW * values.length) / (values.length + 1);
  var zeroY = padding.top + chartH / 2;

  // 中轴线
  ctx.strokeStyle = 'rgba(148,163,184,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding.left, zeroY);
  ctx.lineTo(W - padding.right, zeroY);
  ctx.stroke();

  values.forEach(function(v, i) {
    var x = padding.left + gap + i * (barW + gap);
    var barH = (Math.abs(v) / maxVal) * (chartH / 2 - 4);
    var y = v >= 0 ? zeroY - barH : zeroY;

    // 渐变色
    var grad = ctx.createLinearGradient(x, y, x, y + barH);
    if (v >= 0) {
      grad.addColorStop(0, '#10b981');
      grad.addColorStop(1, 'rgba(16,185,129,0.3)');
    } else {
      grad.addColorStop(0, 'rgba(239,68,68,0.3)');
      grad.addColorStop(1, '#ef4444');
    }
    ctx.fillStyle = grad;
    
    // 圆角矩形
    var r = Math.min(3, barW / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + barW - r, y);
    ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
    ctx.lineTo(x + barW, y + barH - r);
    ctx.quadraticCurveTo(x + barW, y + barH, x + barW - r, y + barH);
    ctx.lineTo(x + r, y + barH);
    ctx.quadraticCurveTo(x, y + barH, x, y + barH - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.fill();

    // 标签
    ctx.fillStyle = '#64748b';
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labels[i], x + barW / 2, H - 8);

    // 数值
    ctx.fillStyle = v >= 0 ? '#10b981' : '#ef4444';
    ctx.font = 'bold 8px Inter, sans-serif';
    var txt = (v >= 0 ? '+' : '') + v.toFixed(2) + '%';
    ctx.fillText(txt, x + barW / 2, y - (v >= 0 ? 4 : -12));
  });
}

// 水平柱状图（外汇变化）
function drawHBarChart(canvasId, data, labels) {
  var canvas = document.getElementById(canvasId);
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  var W = rect.width, H = rect.height;
  var padding = { top: 10, right: 50, bottom: 10, left: 60 };
  var chartH = H - padding.top - padding.bottom;

  ctx.clearRect(0, 0, W, H);

  var values = Object.values(data);
  var maxVal = Math.max.apply(null, values.map(function(v){ return Math.abs(v); }));
  if (maxVal === 0) maxVal = 1;

  var barH = Math.min(16, (chartH / values.length) * 0.6);
  var gap = (chartH - barH * values.length) / (values.length + 1);
  var zeroX = padding.left + (W - padding.left - padding.right) / 2;
  var chartW = W - padding.left - padding.right;

  values.forEach(function(v, i) {
    var y = padding.top + gap + i * (barH + gap);
    var barW = (Math.abs(v) / maxVal) * (chartW / 2 - 4);
    var x = v >= 0 ? zeroX : zeroX - barW;

    // 渐变
    var grad = ctx.createLinearGradient(x, y, x + barW, y);
    if (v >= 0) {
      grad.addColorStop(0, 'rgba(16,185,129,0.3)');
      grad.addColorStop(1, '#10b981');
    } else {
      grad.addColorStop(0, '#ef4444');
      grad.addColorStop(1, 'rgba(239,68,68,0.3)');
    }
    ctx.fillStyle = grad;
    
    var r = Math.min(3, barH / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + barW - r, y);
    ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
    ctx.lineTo(x + barW, y + barH - r);
    ctx.quadraticCurveTo(x + barW, y + barH, x + barW - r, y + barH);
    ctx.lineTo(x + r, y + barH);
    ctx.quadraticCurveTo(x, y + barH, x, y + barH - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.fill();

    // 标签
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(labels[i], padding.left - 6, y + barH / 2 + 3);

    // 数值
    ctx.fillStyle = v >= 0 ? '#10b981' : '#ef4444';
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = v >= 0 ? 'left' : 'right';
    var txt = (v >= 0 ? '+' : '') + v.toFixed(2) + '%';
    var txtX = v >= 0 ? zeroX + barW + 4 : zeroX - barW - 4;
    ctx.fillText(txt, txtX, y + barH / 2 + 3);
  });

  // 中轴
  ctx.strokeStyle = 'rgba(148,163,184,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(zeroX, padding.top - 2);
  ctx.lineTo(zeroX, H - padding.bottom + 2);
  ctx.stroke();
}

// 渲染商品列表
function renderCommodities() {
  var container = document.getElementById('commoditiesList');
  var data = ECON_DATA.commodities;
  var html = '';
  Object.entries(data).forEach(function(entry) {
    var name = entry[0], item = entry[1];
    var cls = item.change >= 0 ? 'positive' : 'negative';
    var sign = item.change >= 0 ? '+' : '';
    html += '<div class="data-row">';
    html += '<span class="data-name">' + name + '</span>';
    html += '<div class="data-values"><span class="data-price">' + item.price.toLocaleString() + '</span>';
    html += '<span class="data-change ' + cls + '">' + sign + item.change.toFixed(2) + '%</span></div></div>';
  });
  container.innerHTML = html;
}

// 渲染外汇列表
function renderCurrencies() {
  var container = document.getElementById('currenciesList');
  var data = ECON_DATA.currencies;
  var html = '';
  Object.entries(data).forEach(function(entry) {
    var name = entry[0], item = entry[1];
    var cls = item.change >= 0 ? 'positive' : 'negative';
    var sign = item.change >= 0 ? '+' : '';
    html += '<div class="data-row">';
    html += '<span class="data-name">' + name + '</span>';
    html += '<div class="data-values"><span class="data-price">' + item.rate.toFixed(3) + '</span>';
    html += '<span class="data-change ' + cls + '">' + sign + item.change.toFixed(2) + '%</span></div></div>';
  });
  container.innerHTML = html;
}

// 渲染指数列表
function renderIndices() {
  var container = document.getElementById('indicesList');
  var data = ECON_DATA.indices;
  var html = '';
  Object.entries(data).forEach(function(entry) {
    var name = entry[0], item = entry[1];
    var cls = item.change >= 0 ? 'positive' : 'negative';
    var sign = item.change >= 0 ? '+' : '';
    html += '<div class="data-row">';
    html += '<span class="data-name">' + name + '</span>';
    html += '<div class="data-values"><span class="data-price">' + item.value.toLocaleString() + '</span>';
    html += '<span class="data-change ' + cls + '">' + sign + item.change.toFixed(2) + '%</span></div></div>';
  });
  container.innerHTML = html;
}

// 渲染收益率
function renderBonds() {
  var container = document.getElementById('bondsList');
  var data = ECON_DATA.bonds;
  var html = '';
  Object.entries(data).forEach(function(entry) {
    var name = entry[0], val = entry[1];
    html += '<div class="data-row">';
    html += '<span class="data-name">' + name + '</span>';
    html += '<div class="data-values"><span class="data-price">' + val.toFixed(3) + '%</span></div></div>';
  });
  container.innerHTML = html;
}

// 渲染加密货币
function renderCrypto() {
  var container = document.getElementById('cryptoList');
  var data = ECON_DATA.crypto;
  var html = '';
  Object.entries(data).forEach(function(entry) {
    var name = entry[0], item = entry[1];
    var cls = item.change >= 0 ? 'positive' : 'negative';
    var sign = item.change >= 0 ? '+' : '';
    html += '<div class="data-row">';
    html += '<span class="data-name">' + name + '</span>';
    html += '<div class="data-values"><span class="data-price">$' + item.price.toLocaleString() + '</span>';
    html += '<span class="data-change ' + cls + '">' + sign + item.change.toFixed(2) + '%</span></div></div>';
  });
  container.innerHTML = html;
}

// 渲染经济对比表格
function renderEconomies() {
  var container = document.getElementById('economiesList');
  var data = ECON_DATA.economies;
  var html = '<table class="econ-table"><thead><tr>';
  html += '<th>国家</th><th>GDP(B)</th><th>增长%</th><th>利率%</th><th>通胀%</th><th>失业%</th>';
  html += '</tr></thead><tbody>';
  Object.entries(data).forEach(function(entry) {
    var name = entry[0], e = entry[1];
    var gCls = e.growth >= 0 ? 'pos' : 'neg';
    html += '<tr>';
    html += '<td class="econ-country">' + name + '</td>';
    html += '<td class="econ-val">$' + e.gdp.toLocaleString() + '</td>';
    html += '<td class="econ-val ' + gCls + '">' + (e.growth >= 0 ? '+' : '') + e.growth.toFixed(2) + '%</td>';
    html += '<td class="econ-val">' + e.interest.toFixed(2) + '%</td>';
    html += '<td class="econ-val">' + e.inflation.toFixed(2) + '%</td>';
    html += '<td class="econ-val">' + e.unemployment.toFixed(2) + '%</td>';
    html += '</tr>';
  });
  html += '</tbody></table>';
  container.innerHTML = html;
}

// 绘制图表
function drawCharts() {
  // 商品柱状图
  var commChanges = {};
  var commLabels = [];
  Object.entries(ECON_DATA.commodities).forEach(function(e) {
    commLabels.push(e[0]);
    commChanges[e[0]] = e[1].change;
  });
  drawBarChart('commoditiesChart', commChanges, commLabels);

  // 指数柱状图
  var idxChanges = {};
  var idxLabels = [];
  Object.entries(ECON_DATA.indices).forEach(function(e) {
    idxLabels.push(e[0]);
    idxChanges[e[0]] = e[1].change;
  });
  drawBarChart('indicesChart', idxChanges, idxLabels);

  // 外汇水平柱状图
  var curChanges = {};
  var curLabels = [];
  Object.entries(ECON_DATA.currencies).forEach(function(e) {
    curLabels.push(e[0]);
    curChanges[e[0]] = e[1].change;
  });
  drawHBarChart('currenciesChart', curChanges, curLabels);

  // GDP增长对比图
  var gdpChanges = {};
  var gdpLabels = [];
  Object.entries(ECON_DATA.economies).forEach(function(e) {
    gdpLabels.push(e[0]);
    gdpChanges[e[0]] = e[1].growth;
  });
  drawHBarChart('gdpChart', gdpChanges, gdpLabels);

  // 渲染各列表
  renderCommodities();
  renderCurrencies();
  renderIndices();
  renderBonds();
  renderCrypto();
  renderEconomies();
}

// 数据波动模拟（随机微调）
function simulateDataFluctuation() {
  Object.keys(ECON_DATA.commodities).forEach(function(k) {
    var v = ECON_DATA.commodities[k];
    v.change += (Math.random() - 0.5) * 0.04;
    v.price *= (1 + (Math.random() - 0.5) * 0.002);
  });
  Object.keys(ECON_DATA.currencies).forEach(function(k) {
    var v = ECON_DATA.currencies[k];
    v.change += (Math.random() - 0.5) * 0.02;
    v.rate *= (1 + (Math.random() - 0.5) * 0.001);
  });
  Object.keys(ECON_DATA.indices).forEach(function(k) {
    var v = ECON_DATA.indices[k];
    v.change += (Math.random() - 0.5) * 0.03;
    v.value *= (1 + (Math.random() - 0.5) * 0.001);
  });
  Object.keys(ECON_DATA.crypto).forEach(function(k) {
    var v = ECON_DATA.crypto[k];
    v.change += (Math.random() - 0.5) * 0.05;
    v.price *= (1 + (Math.random() - 0.5) * 0.003);
  });
}

// 自动刷新 - 从真实API获取数据
var refreshCountdown = 30;
var refreshInterval = null;

function fetchAllLiveData() {
  fetchLiveForex();
  fetchLiveCrypto();
  setTimeout(function(){
    drawCharts();
    updateEconStats();
  }, 800);
}

function startAutoRefresh() {
  refreshInterval = setInterval(function() {
    refreshCountdown--;
    if (refreshCountdown <= 0) {
      fetchAllLiveData();
      refreshCountdown = 30;
    }
    var el = document.getElementById('refreshCountdown');
    if (el) el.textContent = refreshCountdown + 's';
  }, 1000);
}

// 更新经济统计卡片
function updateEconStats() {
  // 商品上涨数量
  var commUp = Object.values(ECON_DATA.commodities).filter(function(v){ return v.change >= 0; }).length;
  var commTotal = Object.keys(ECON_DATA.commodities).length;
  document.getElementById('econCommUp').textContent = commUp + '/' + commTotal;

  // 外汇上涨数量
  var curUp = Object.values(ECON_DATA.currencies).filter(function(v){ return v.change >= 0; }).length;
  var curTotal = Object.keys(ECON_DATA.currencies).length;
  document.getElementById('econCurUp').textContent = curUp + '/' + curTotal;

  // 指数上涨数量
  var idxUp = Object.values(ECON_DATA.indices).filter(function(v){ return v.change > 0; }).length;
  var idxTotal = Object.keys(ECON_DATA.indices).length;
  document.getElementById('econIdxUp').textContent = idxUp + '/' + idxTotal;

  // 全球GDP
  var totalGDP = Object.values(ECON_DATA.economies).reduce(function(s, e){ return s + e.gdp; }, 0);
  document.getElementById('econGDP').textContent = '$' + (totalGDP / 1000).toFixed(1) + 'T';
}

// Tab 切换
function switchTab(tabId) {
  document.querySelectorAll('.tab-panel').forEach(function(p) {
    p.classList.remove('active');
  });
  document.querySelectorAll('.tab-btn').forEach(function(b) {
    b.classList.remove('active');
  });
  document.getElementById('tab-' + tabId).classList.add('active');
  document.getElementById('btn-' + tabId).classList.add('active');

  // 切换后重绘图表以确保尺寸正确
  setTimeout(drawCharts, 10);
}

// 初始化经济数据面板
function initEconPanel() {
  updateEconStats();
  drawCharts();
  startAutoRefresh();
}
`;

// 应用逻辑
const appLogic = `
(function(){
  const C=FUND_FLOW_DATA.countries,AF=FUND_FLOW_DATA.bilateralFlows;
  function findC(n){if(C[n])return{key:n,data:C[n]};for(const[k,c]of Object.entries(C))if(c.name===n)return{key:k,data:c};return null}

  var state={sel:null,minAmt:10,filtered:[]};
  var mapEl=document.querySelector('.map-section');
  var W,H,proj,path;
  var svg=document.querySelector('.map-svg'),cv=document.querySelector('.flow-canvas'),cx=cv.getContext('2d');
  var parts=[],animId=null,zoomObj;

  /* 初始化 */
  function init(){
    resize();
    window.addEventListener('resize',resize);
    createStars();
    zoomObj=initZoom(mapEl);
    initControls();
    updateHeaderStats();
    render();
    showOverview();
    document.querySelector('.loader-overlay').classList.add('hidden');
    animate();
    initEconPanel();
  }

  function resize(){
    W=mapEl.clientWidth;H=mapEl.clientHeight;
    cv.width=W;cv.height=H;
    svg.setAttribute('width',W);
    svg.setAttribute('height',H);
    svg.setAttribute('viewBox','0 0 '+W+' '+H);
    proj=makeProj(W,H);path=makePath(proj,W);
  }

  /* 星空 */
  function createStars(){
    var c=document.getElementById('stars');
    for(var i=0;i<150;i++){
      var s=document.createElement('div');
      s.className='star';
      var sz=Math.random()*1.5+0.5;
      s.style.cssText='width:'+sz+'px;height:'+sz+'px;left:'+(Math.random()*100)+'%;top:'+(Math.random()*100)+'%;--d:'+(2+Math.random()*3)+'s;animation-delay:'+(Math.random()*3)+'s';
      c.appendChild(s);
    }
  }

  /* 渲染地图 */
  function render(){
    var g=document.getElementById('countries');
    g.innerHTML='';
    var world=topojson.feature(MAP_DATA,MAP_DATA.objects.countries);
    world.features.forEach(function(f){
      var p=document.createElementNS('http://www.w3.org/2000/svg','path');
      p.setAttribute('d',path(f));
      p.setAttribute('class','country');
      p.dataset.name=f.properties.name;
      p.addEventListener('click',function(){selectCountry(f.properties.name)});
      p.addEventListener('mouseenter',function(e){showTooltip(e,f.properties.name)});
      p.addEventListener('mouseleave',hideTooltip);
      g.appendChild(p);
    });
    filterFlows();
  }

  /* 过滤 */
  function filterFlows(){
    state.filtered=AF.filter(function(f){return f.amount>=state.minAmt});
    initParticles();
  }

  /* 粒子 */
  function initParticles(){
    parts=[];
    var n=Math.min(200,state.filtered.length*2);
    for(var i=0;i<n;i++){
      var f=state.filtered[Math.floor(Math.random()*state.filtered.length)];
      if(!f)continue;
      var a=C[f.from],b=C[f.to];
      if(!a||!b)continue;
      var fp=proj([a.lng,a.lat]),tp=proj([b.lng,b.lat]);
      if(!fp||!tp)continue;
      var mx=(fp[0]+tp[0])/2,my=(fp[1]+tp[1])/2-Math.min(35,80/(Math.abs(fp[0]-tp[0])||1)*12);
      parts.push({t:Math.random(),sp:0.003+Math.random()*0.006,mid:[mx,my],fp:fp,tp:tp,big:f.amount>200});
    }
  }

  /* 绘制 */
  function draw(t){
    // 同步变换 SVG 和 Canvas
    svg.style.transform='translate('+t.x+'px,'+t.y+'px) scale('+t.k+')';
    svg.style.transformOrigin='center center';
    cx.clearRect(0,0,W,H);
    cx.save();
    cx.translate(t.x,t.y);
    cx.scale(t.k,t.k);

    state.filtered.forEach(function(f){
      var a=C[f.from],b=C[f.to];
      if(!a||!b)return;
      var fp=proj([a.lng,a.lat]),tp=proj([b.lng,b.lat]);
      if(!fp||!tp)return;
      var sel=state.sel,active=(sel===f.from||sel===f.to);

      if(sel&&!active){
        cx.strokeStyle='rgba(30,41,59,0.25)';cx.globalAlpha=0.25;
      }else{
        cx.globalAlpha=sel?(active?0.85:0.04):0.5;
        var g=cx.createLinearGradient(fp[0],fp[1],tp[0],tp[1]);
        if(sel===f.to){g.addColorStop(0,'#06b6d4');g.addColorStop(1,'#0891b2')}
        else if(sel===f.from){g.addColorStop(0,'#f59e0b');g.addColorStop(1,'#d97706')}
        else{g.addColorStop(0,'rgba(59,130,246,0.5)');g.addColorStop(1,'rgba(139,92,246,0.3)')}
        cx.strokeStyle=g;
      }
      cx.lineWidth=Math.max(0.4,Math.min(3,f.amount/180))/t.k;
      var mx=(fp[0]+tp[0])/2,my=(fp[1]+tp[1])/2-Math.min(35,80/(Math.abs(fp[0]-tp[0])||1)*12);
      cx.beginPath();cx.moveTo(fp[0],fp[1]);cx.quadraticCurveTo(mx,my,tp[0],tp[1]);cx.stroke();
    });

    /* 粒子 */
    parts.forEach(function(p){
      p.t+=p.sp;if(p.t>1)p.t=0;
      var tt=p.t,mt=1-tt;
      var x=mt*mt*p.fp[0]+2*mt*tt*p.mid[0]+tt*tt*p.tp[0];
      var y=mt*mt*p.fp[1]+2*mt*tt*p.mid[1]+tt*tt*p.tp[1];
      cx.beginPath();cx.arc(x,y,p.big?2:1.2/t.k,0,6.28);
      cx.fillStyle=p.big?'#fbbf24':'#3b82f6';
      cx.shadowColor='rgba(59,130,246,0.6)';cx.shadowBlur=5;
      cx.fill();cx.shadowBlur=0;
    });

    cx.globalAlpha=1;cx.restore();
  }

  function animate(){
    draw(zoomObj.get());
    animId=requestAnimationFrame(animate);
  }

  /* 国家选择 */
  function selectCountry(n){
    var l=findC(n);
    if(!l){deselect();return}
    if(state.sel===l.key){deselect();return}
    state.sel=l.key;
    document.querySelectorAll('.country').forEach(function(p){
      p.classList.toggle('active',p.dataset.name===n);
      p.classList.toggle('dimmed',p.dataset.name!==n);
    });
    filterFlows();
    showCountryDetail(l.key,l.data);
  }

  function deselect(){
    state.sel=null;
    document.querySelectorAll('.country').forEach(function(p){p.classList.remove('active','dimmed')});
    filterFlows();
    showOverview();
  }

  /* 面板 */
  function showOverview(){
    var tf=AF.reduce(function(s,f){return s+f.amount},0);
    var flows={};
    AF.forEach(function(f){if(!flows[f.from])flows[f.from]={out:0};flows[f.from].out+=f.amount});
    var top=Object.entries(flows).map(function(k){return[C[k[0]],k[1]]}).filter(function(x){return x[0]}).sort(function(a,b){return b[1]-a[1]}).slice(0,5);

    document.querySelectorAll('.tab-btn').forEach(function(b){b.classList.remove('active')});
    document.getElementById('btn-overview').classList.add('active');
    document.getElementById('panelTitle').textContent='全球资金流动';
    document.getElementById('panelSub').textContent='2025 · Capital Flows';

    var h='<div class="stats-grid">';
    h+='<div class="stat-card in"><div class="stat-card-lbl">总流量</div><div class="stat-card-val">$'+(tf/1000).toFixed(1)+'T</div></div>';
    h+='<div class="stat-card out"><div class="stat-card-lbl">活跃路径</div><div class="stat-card-val">'+AF.length+'</div></div>';
    h+='</div>';

    h+='<div class="section-hd">最大资金流出国</div><div class="flow-items">';
    top.forEach(function(x){
      h+='<div class="flow-row"><div class="flow-route"><span class="flow-pip out"></span><span class="flow-country">'+x[0].name+'</span></div><span class="flow-amt out">$'+x[1]+'B</span></div>';
    });
    h+='</div>';

    document.getElementById('overviewContent').innerHTML=h;
  }

  function showCountryDetail(key,c){
    var inf=AF.filter(function(f){return f.to===key}).sort(function(a,b){return b.amount-a.amount}).slice(0,5);
    var outf=AF.filter(function(f){return f.from===key}).sort(function(a,b){return b.amount-a.amount}).slice(0,5);
    var ti=inf.reduce(function(s,f){return s+f.amount},0);
    var to=outf.reduce(function(s,f){return s+f.amount},0);
    var net=ti-to;

    document.getElementById('panelTitle').textContent=c.name;
    document.getElementById('panelSub').textContent=c.region||'资金流动详情';

    var h='<div class="stats-grid">';
    h+='<div class="stat-card in"><div class="stat-card-lbl">总流入</div><div class="stat-card-val">$'+ti+'B</div></div>';
    h+='<div class="stat-card out"><div class="stat-card-lbl">总流出</div><div class="stat-card-val">$'+to+'B</div></div>';
    h+='</div>';

    h+='<div class="section-hd">净流入</div>';
    h+='<div style="font-size:20px;font-weight:700;color:'+(net>=0?'var(--inflow)':'var(--outflow)')+';margin-bottom:16px">'+(net>=0?'+':'')+'$'+net+'B</div>';

    h+='<div class="section-hd">主要来源</div><div class="flow-items">';
    inf.forEach(function(f){var s=C[f.from];h+='<div class="flow-row"><div class="flow-route"><span class="flow-pip in"></span><span class="flow-country">'+(s?s.name:f.from)+'</span></div><span class="flow-amt in">+$'+f.amount+'B</span></div>'});
    h+='</div>';

    h+='<div class="section-hd">主要去向</div><div class="flow-items">';
    outf.forEach(function(f){var d=C[f.to];h+='<div class="flow-row"><div class="flow-route"><span class="flow-pip out"></span><span class="flow-country">'+(d?d.name:f.to)+'</span></div><span class="flow-amt out">-$'+f.amount+'B</span></div>'});
    h+='</div>';

    document.getElementById('overviewContent').innerHTML=h;
  }

  /* 工具提示 */
  var tip=document.querySelector('.map-tooltip');
  function showTooltip(e,n){
    var l=findC(n);if(!l)return;
    var k=l.key;
    var i1=AF.filter(function(f){return f.to===k}).reduce(function(s,f){return s+f.amount},0);
    var o1=AF.filter(function(f){return f.from===k}).reduce(function(s,f){return s+f.amount},0);
    tip.innerHTML='<div class="tt-title">'+l.data.name+'</div><div class="tt-row"><span class="tt-lbl">流入</span><span class="tt-val in">$'+i1+'B</span></div><div class="tt-row"><span class="tt-lbl">流出</span><span class="tt-val out">$'+o1+'B</span></div>';
    tip.classList.add('visible');
    var x=e.clientX+12,y=e.clientY+12;
    if(x+170>window.innerWidth)x=e.clientX-180;
    if(y+90>window.innerHeight)y=e.clientY-100;
    tip.style.left=x+'px';tip.style.top=y+'px';
  }
  function hideTooltip(){tip.classList.remove('visible')}

  /* 控制 */
  function initControls(){
    var slider=document.getElementById('amountSlider');
    slider.oninput=function(){
      state.minAmt=+this.value;
      document.getElementById('sliderVal').textContent='≥ $'+this.value+'B';
      filterFlows();
    };
  }

  /* 头部统计 */
  function updateHeaderStats(){
    var tf=AF.reduce(function(s,f){return s+f.amount},0);
    document.getElementById('statTotal').textContent='$'+(tf/1000).toFixed(1)+'T';
    document.getElementById('statFlows').textContent=AF.length;
    document.getElementById('statCountries').textContent=Object.keys(C).length;
  }

  /* 启动 */
  init();
})();
`;

// HTML 结构
const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>全球资金流动与经济数据 | Capital Flows & Economics</title>
<style>${css}</style>
</head>
<body>
<div class="loader-overlay"><div class="loader-ring"></div><div class="loader-text">加载中...</div></div>
<div id="stars"></div>
<div id="app">
  <nav class="navbar">
    <div class="nav-brand">
      <div class="brand-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
      </div>
      <div class="brand-text">全球资金<span>流动</span></div>
    </div>
    <div class="nav-stats">
      <div class="stat"><div class="stat-val" id="statTotal">-</div><div class="stat-lbl">总流量</div></div>
      <div class="stat"><div class="stat-val" id="statFlows">-</div><div class="stat-lbl">资金路径</div></div>
      <div class="stat"><div class="stat-val" id="statCountries">-</div><div class="stat-lbl">国家地区</div></div>
    </div>
    <div class="nav-actions">
      <div class="refresh-timer" onclick="fetchAllLiveData()"><span class="refresh-dot" id="liveDot"></span><span>刷新</span><span id="refreshCountdown">30s</span></div>
      <button class="nav-btn" onclick="location.reload()">重载</button>
    </div>
  </nav>
  <main class="main-content">
    <section class="map-section">
      <div class="map-glow"></div>
      <svg class="map-svg"><g id="countries"></g></svg>
      <canvas class="flow-canvas"></canvas>
      <div class="map-controls">
        <div class="ctrl-group">
          <span class="ctrl-label">最小金额</span>
          <input type="range" class="ctrl-slider" id="amountSlider" min="10" max="500" value="10" step="10">
          <span class="ctrl-val" id="sliderVal">≥ $10B</span>
        </div>
      </div>
    </section>
    <aside class="side-panel">
      <div class="panel-head">
        <div class="panel-title" id="panelTitle">全球资金流动</div>
        <div class="panel-sub" id="panelSub">2025 · Capital Flows & Economics</div>
      </div>
      <div class="data-status">
        <span class="live-dot" id="liveDot"></span>
        <span class="data-status-info" id="dataSource">连接中...</span>
        <span class="data-status-time" id="dataLastUpdate">--:--:--</span>
      </div>
      <nav class="tab-nav">
        <button class="tab-btn active" id="btn-overview" onclick="switchTab('overview')">概览</button>
        <button class="tab-btn" id="btn-commodities" onclick="switchTab('commodities')">商品</button>
        <button class="tab-btn" id="btn-currencies" onclick="switchTab('currencies')">外汇</button>
        <button class="tab-btn" id="btn-indices" onclick="switchTab('indices')">指数</button>
        <button class="tab-btn" id="btn-economies" onclick="switchTab('economies')">经济</button>
      </nav>
      <div class="panel-body" id="panelBody">
        <!-- 概览面板 -->
        <div class="tab-panel active" id="tab-overview">
          <div id="overviewContent"></div>
        </div>
        <!-- 商品面板 -->
        <div class="tab-panel" id="tab-commodities">
          <div class="stats-grid">
            <div class="stat-card positive"><div class="stat-card-lbl">上涨</div><div class="stat-card-val" id="econCommUp">-</div></div>
            <div class="stat-card negative"><div class="stat-card-lbl">总数</div><div class="stat-card-val">8</div></div>
          </div>
          <div class="chart-container">
            <div class="chart-title"><span>商品表现</div>
            <canvas id="commoditiesChart" height="160"></canvas>
          </div>
          <div class="section-hd">实时行情</div>
          <div id="commoditiesList"></div>
          <div class="section-hd">债券收益率</div>
          <div id="bondsList"></div>
        </div>
        <!-- 外汇面板 -->
        <div class="tab-panel" id="tab-currencies">
          <div class="stats-grid">
            <div class="stat-card positive"><div class="stat-card-lbl">强势</div><div class="stat-card-val" id="econCurUp">-</div></div>
            <div class="stat-card"><div class="stat-card-lbl">对数</div><div class="stat-card-val">7</div></div>
          </div>
          <div class="chart-container">
            <div class="chart-title"><span>汇率日涨跌</div>
            <canvas id="currenciesChart" height="180"></canvas>
          </div>
          <div class="section-hd">实时汇率</div>
          <div id="currenciesList"></div>
          <div class="section-hd">加密货币</div>
          <div id="cryptoList"></div>
        </div>
        <!-- 指数面板 -->
        <div class="tab-panel" id="tab-indices">
          <div class="stats-grid">
            <div class="stat-card negative"><div class="stat-card-lbl">上涨</div><div class="stat-card-val" id="econIdxUp">-</div></div>
            <div class="stat-card"><div class="stat-card-lbl">市场数</div><div class="stat-card-val">7</div></div>
          </div>
          <div class="chart-container">
            <div class="chart-title"><span>股指表现</div>
            <canvas id="indicesChart" height="180"></canvas>
          </div>
          <div class="section-hd">实时行情</div>
          <div id="indicesList"></div>
        </div>
        <!-- 经济面板 -->
        <div class="tab-panel" id="tab-economies">
          <div class="stats-grid">
            <div class="stat-card in"><div class="stat-card-lbl">全球GDP</div><div class="stat-card-val" id="econGDP">-</div></div>
            <div class="stat-card"><div class="stat-card-lbl">经济体</div><div class="stat-card-val">8</div></div>
          </div>
          <div class="chart-container">
            <div class="chart-title"><span>GDP增长对比</div>
            <canvas id="gdpChart" height="180"></canvas>
          </div>
          <div class="section-hd">经济指标</div>
          <div id="economiesList"></div>
        </div>
      </div>
    </aside>
  </main>
</div>
<div class="map-tooltip"></div>
<script>${topo}const MAP_DATA=${mapData};${appData}${econDataScript}</script>
<script>${geoLib}${zoomLib}${econChartsScript}${appLogic}</script>
</body>
</html>`;

fs.writeFileSync('chart.html', html);
const size = fs.statSync('chart.html').size;
console.log(`✅ 经济数据集成完成: ${(size/1024).toFixed(1)} KB`);
console.log(`   - ECON_DATA: 商品/外汇/指数/债券/加密货币/经济体`);
console.log(`   - Canvas图表: 垂直柱状图/水平柱状图/渐变渲染`);
console.log(`   - 标签面板: 概览|商品|外汇|指数|经济`);
console.log(`   - 自动刷新: 30秒倒计时 + 数据波动模拟`);
console.log(`   - 颜色编码: 绿(#10b981)涨 / 红(#ef4444)跌`);
