const fs = require('fs');
const topo = fs.readFileSync('topojson.min.js', 'utf8');
const mapData = fs.readFileSync('countries-110m.json', 'utf8');
const appData = fs.readFileSync('data.min.js', 'utf8');

// Cosmic theme CSS
const css = `
*{margin:0;padding:0;box-sizing:border-box}
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
:root{
  --bg:#030712;
  --surface:rgba(15,23,42,0.6);
  --border:rgba(251,191,36,0.15);
  --amber:#f59e0b;
  --amber-glow:rgba(245,158,11,0.4);
  --cyan:#06b6d4;
  --text:#f8fafc;
  --muted:#94a3b8;
}
body{
  font-family:'Inter',-apple-system,sans-serif;
  background:var(--bg);
  color:var(--text);
  overflow:hidden;
  height:100vh;
}
/* Star background */
#stars{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0}
.star{position:absolute;background:#fff;border-radius:50%;animation:twinkle var(--d) ease-in-out infinite alternate}
@keyframes twinkle{0%{opacity:0.2;transform:scale(0.8)}100%{opacity:1;transform:scale(1.2)}}

/* Main container */
#app{position:relative;width:100vw;height:100vh;z-index:1;display:flex;flex-direction:column}

/* Header */
header{
  display:flex;align-items:center;justify-content:space-between;
  padding:16px 24px;
  background:linear-gradient(180deg,rgba(3,7,18,0.95) 0%,transparent 100%);
  z-index:10;
}
.logo{display:flex;align-items:center;gap:12px}
.logo-icon{
  width:40px;height:40px;border-radius:10px;
  background:linear-gradient(135deg,var(--amber),#f97316);
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 0 20px var(--amber-glow);
}
.logo h1{font-size:18px;font-weight:600;letter-spacing:-0.5px}
.logo span{color:var(--amber)}
.stats-bar{display:flex;gap:24px}
.stat-item{text-align:center}
.stat-value{font-size:20px;font-weight:700;color:var(--amber)}
.stat-label{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:1px}

/* Main content */
.main{flex:1;display:flex;position:relative}
#map-container{flex:1;position:relative;overflow:hidden}
#globe{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}

/* Flow canvas */
#flowCanvas{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none}

/* Side panel */
.panel{
  width:320px;
  background:var(--surface);
  backdrop-filter:blur(20px);
  border-left:1px solid var(--border);
  padding:20px;
  overflow-y:auto;
  z-index:5;
}
.panel-header{margin-bottom:20px}
.panel-title{font-size:16px;font-weight:600;margin-bottom:4px}
.panel-subtitle{font-size:11px;color:var(--muted)}

/* Flow stats */
.flow-summary{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px}
.flow-card{
  background:rgba(245,158,11,0.05);
  border:1px solid var(--border);
  border-radius:10px;
  padding:12px;
}
.flow-card.in{background:rgba(6,182,212,0.05);border-color:rgba(6,182,212,0.2)}
.flow-card-label{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px}
.flow-card-value{font-size:18px;font-weight:700;margin-top:4px}
.flow-card.in .flow-card-value{color:var(--cyan)}
.flow-card.out .flow-card-value{color:var(--amber)}

/* Section */
.section{margin-bottom:16px}
.section-title{
  font-size:11px;font-weight:500;color:var(--muted);
  text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;
  display:flex;align-items:center;gap:6px;
}
.section-title::before{content:'';width:3px;height:12px;background:var(--amber);border-radius:2px}

/* Flow list */
.flow-list{display:flex;flex-direction:column;gap:6px}
.flow-item{
  display:flex;align-items:center;justify-content:space-between;
  padding:8px 10px;
  background:rgba(255,255,255,0.02);
  border-radius:6px;
  font-size:12px;
  transition:background 0.2s;
}
.flow-item:hover{background:rgba(255,255,255,0.05)}
.flow-route{display:flex;align-items:center;gap:8px}
.flow-dot{width:6px;height:6px;border-radius:50%}
.flow-dot.in{background:var(--cyan)}
.flow-dot.out{background:var(--amber)}
.flow-amount{font-weight:600}
.flow-amount.in{color:var(--cyan)}
.flow-amount.out{color:var(--amber)}

/* Country info */
.country-header{
  display:flex;align-items:center;gap:12px;
  padding-bottom:16px;border-bottom:1px solid var(--border);
  margin-bottom:16px;
}
.country-flag{
  width:36px;height:36px;border-radius:8px;
  background:linear-gradient(135deg,var(--amber),#f97316);
  display:flex;align-items:center;justify-content:center;font-size:16px;
}
.country-name{font-size:14px;font-weight:600}

/* Controls */
.controls{
  position:absolute;bottom:24px;left:50%;transform:translateX(-50%);
  display:flex;align-items:center;gap:16px;
  background:var(--surface);
  backdrop-filter:blur(20px);
  border:1px solid var(--border);
  border-radius:16px;
  padding:12px 20px;
  z-index:10;
}
.control-group{display:flex;align-items:center;gap:8px}
.control-label{font-size:11px;color:var(--muted)}
#amountSlider{
  width:120px;height:4px;
  -webkit-appearance:none;appearance:none;
  background:rgba(255,255,255,0.1);
  border-radius:2px;outline:none;
}
#amountSlider::-webkit-slider-thumb{
  -webkit-appearance:none;appearance:none;
  width:14px;height:14px;border-radius:50%;
  background:var(--amber);cursor:pointer;
  box-shadow:0 0 10px var(--amber-glow);
}
.slider-value{font-size:12px;font-weight:600;color:var(--amber);min-width:60px}

/* Loading */
#loading{
  position:fixed;top:0;left:0;width:100%;height:100%;
  background:var(--bg);
  display:flex;align-items:center;justify-content:center;
  z-index:100;transition:opacity 0.5s;
}
#loading.hidden{opacity:0;pointer-events:none}
.loader{
  width:48px;height:48px;
  border:3px solid var(--border);
  border-top-color:var(--amber);
  border-radius:50%;
  animation:spin 1s linear infinite;
}
@keyframes spin{to{transform:rotate(360deg)}}

/* Map country styles */
.country{fill:rgba(30,41,59,0.6);stroke:rgba(148,163,184,0.1);stroke-width:0.5;transition:all 0.2s}
.country:hover{fill:rgba(245,158,11,0.15);stroke:var(--amber);stroke-width:1}
.country.active{fill:rgba(245,158,11,0.2);stroke:var(--amber);stroke-width:1.5}
.country.dimmed{fill:rgba(15,23,42,0.3);opacity:0.4}

/* Globe glow effect */
.globe-glow{
  position:absolute;top:50%;left:50%;
  transform:translate(-50%,-50%);
  width:600px;height:600px;
  background:radial-gradient(circle,rgba(245,158,11,0.08) 0%,transparent 70%);
  pointer-events:none;border-radius:50%;
}

/* Tooltip */
.tooltip{
  position:fixed;padding:10px 14px;
  background:rgba(15,23,42,0.95);
  backdrop-filter:blur(10px);
  border:1px solid var(--border);
  border-radius:8px;
  font-size:11px;pointer-events:none;
  opacity:0;transition:opacity 0.15s;
  z-index:50;max-width:200px;
}
.tooltip-title{font-weight:600;margin-bottom:4px}
.tooltip-row{display:flex;justify-content:space-between;gap:12px;color:var(--muted)}
.tooltip-val{font-weight:500}
`;

// Minimal geo library
const geo = `
// NaturalEarth-like projection
function makeProjector(w,h){
  var s=Math.min(w,h)*0.42, cx=w/2, cy=h/2;
  return function(ll){
    var lo=ll[0]*Math.PI/180, la=ll[1]*Math.PI/180;
    var x=lo*(0.985+0.0025*la*la);
    var y=la*(1.0-0.0004*lo*lo);
    return [cx+x*s/1.83, cy-y*s/1.18];
  };
}
function makePath(proj){
  return function(f){
    function ring(r){
      var d='';
      for(var i=0;i<r.length;i++){var p=proj(r[i]);d+=(i?'L':'M')+p[0].toFixed(2)+','+p[1].toFixed(2);}
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

// Zoom/pan
const zoom = `
function enableZoom(el,cb){
  var t={x:0,y:0,k:1},drag=false,lx=0,ly=0;
  el.addEventListener('wheel',function(e){
    e.preventDefault();
    var d=e.deltaY>0?0.92:1.08;
    var nk=Math.max(1,Math.min(10,t.k*d));
    var r=el.getBoundingClientRect();
    var mx=e.clientX-r.left,my=e.clientY-r.top;
    t.x=mx-(mx-t.x)*nk/t.k;
    t.y=my-(my-t.y)*nk/t.k;
    t.k=nk;
    cb(t);
  },{passive:false});
  el.addEventListener('mousedown',function(e){drag=true;lx=e.clientX;ly=e.clientY;el.style.cursor='grabbing'});
  window.addEventListener('mouseup',function(){drag=false;el.style.cursor='grab'});
  window.addEventListener('mousemove',function(e){
    if(!drag)return;
    t.x+=e.clientX-lx;t.y+=e.clientY-ly;
    lx=e.clientX;ly=e.clientY;
    cb(t);
  });
  return {get:function(){return t}};
}
`;

// App logic
const app = `
const C=FUND_FLOW_DATA.countries,AF=FUND_FLOW_DATA.bilateralFlows,Meta=FUND_FLOW_DATA.metadata;
function findC(n){if(C[n])return{key:n,data:C[n]};for(const[k,c]of Object.entries(C))if(c.name===n)return{key:k,data:c};return null}

let state={sel:null,minAmt:5,filtered:[]};
const mapEl=document.getElementById('map-container');
let W=mapEl.clientWidth,H=mapEl.clientHeight;
let proj=makeProjector(W,H),path=makePath(proj);
const svg=document.getElementById('globe'),cF=document.getElementById('flowCanvas'),cx=cF.getContext('2d');

function resize(){
  W=mapEl.clientWidth;H=mapEl.clientHeight;
  cF.width=W;cF.height=H;
  proj=makeProjector(W,H);path=makePath(proj);
  render();
}
window.addEventListener('resize',resize);

// Particles
let parts=[],animId=null;
function initParts(){
  parts=[];
  var n=Math.min(300,state.filtered.length*3);
  for(var i=0;i<n;i++){
    var f=state.filtered[Math.floor(Math.random()*state.filtered.length)];
    if(!f)continue;
    var a=C[f.from],b=C[f.to];
    if(!a||!b)continue;
    var fp=proj([a.lng,a.lat]),tp=proj([b.lng,b.lat]);
    if(!fp||!tp)continue;
    var mx=(fp[0]+tp[0])/2,my=(fp[1]+tp[1])/2-Math.min(40,100/(Math.abs(fp[0]-tp[0])||1)*15);
    parts.push({t:Math.random(),sp:0.003+Math.random()*0.007,mid:[mx,my],fp:fp,tp:tp,big:f.amount>200});
  }
}

// Draw flows
function drawFlows(t){
  cx.clearRect(0,0,W,H);
  cx.save();
  cx.translate(t.x,t.y);
  cx.scale(t.k,t.k);
  
  // Draw flow lines
  state.filtered.forEach(function(f){
    var a=C[f.from],b=C[f.to];
    if(!a||!b)return;
    var fp=proj([a.lng,a.lat]),tp=proj([b.lng,b.lat]);
    if(!fp||!tp)return;
    var sel=state.sel;
    var active=(sel===f.from||sel===f.to);
    
    if(sel&&!active){
      cx.strokeStyle='rgba(30,41,59,0.3)';
      cx.globalAlpha=0.3;
    } else {
      cx.globalAlpha=sel?(active?0.9:0.05):0.6;
      var grad=cx.createLinearGradient(fp[0],fp[1],tp[0],tp[1]);
      if(sel===f.to){grad.addColorStop(0,'#06b6d4');grad.addColorStop(1,'#0891b2')}
      else if(sel===f.from){grad.addColorStop(0,'#f59e0b');grad.addColorStop(1,'#d97706')}
      else{grad.addColorStop(0,'rgba(245,158,11,0.6)');grad.addColorStop(1,'rgba(249,115,22,0.4)')}
      cx.strokeStyle=grad;
    }
    cx.lineWidth=Math.max(0.5,Math.min(4,f.amount/150))/t.k;
    
    var mx=(fp[0]+tp[0])/2,my=(fp[1]+tp[1])/2-Math.min(40,100/(Math.abs(fp[0]-tp[0])||1)*15);
    cx.beginPath();
    cx.moveTo(fp[0],fp[1]);
    cx.quadraticCurveTo(mx,my,tp[0],tp[1]);
    cx.stroke();
  });
  
  // Draw particles
  parts.forEach(function(p){
    p.t+=p.sp;
    if(p.t>1)p.t=0;
    var tt=p.t,mt=1-tt;
    var x=mt*mt*p.fp[0]+2*mt*tt*p.mid[0]+tt*tt*p.tp[0];
    var y=mt*mt*p.fp[1]+2*mt*tt*p.mid[1]+tt*tt*p.tp[1];
    cx.beginPath();
    cx.arc(x,y,p.big?2.5:1.5/t.k,0,6.28);
    cx.fillStyle=p.big?'#fbbf24':'#f59e0b';
    cx.shadowColor='rgba(245,158,11,0.8)';
    cx.shadowBlur=6;
    cx.fill();
    cx.shadowBlur=0;
  });
  
  cx.globalAlpha=1;
  cx.restore();
}

function animate(){
  var t=zoomObj.get();
  drawFlows(t);
  animId=requestAnimationFrame(animate);
}

// Render SVG map
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
    p.addEventListener('mouseenter',function(e){showTip(e,f.properties.name)});
    p.addEventListener('mouseleave',hideTip);
    g.appendChild(p);
  });
  filterFlows();
}

function filterFlows(){
  state.filtered=AF.filter(function(f){return f.amount>=state.minAmt});
  initParts();
  if(!animId)animId=requestAnimationFrame(animate);
  updatePanel();
}

// Country selection
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

// Panel updates
function updatePanel(){
  /* updated via showOverview/showCountryDetail */
}

function showOverview(){
  var tf=AF.reduce(function(s,f){return s+f.amount},0);
  var flows={};
  AF.forEach(function(f){if(!flows[f.from])flows[f.from]={out:0};flows[f.from].out+=f.amount});
  var top=Object.entries(flows).map(function(k){return[C[k[0]],k[1]]}).filter(function(x){return x[0]}).sort(function(a,b){return b[1]-a[1]}).slice(0,5);
  
  document.getElementById('panelTitle').textContent='全球资金流动';
  document.getElementById('panelSub').textContent=Meta.dataYear+' · Global Capital Flows';
  
  var html='<div class="flow-summary">';
  html+='<div class="flow-card in"><div class="flow-card-label">总流量</div><div class="flow-card-value">$'+(tf/1000).toFixed(1)+'T</div></div>';
  html+='<div class="flow-card out"><div class="flow-card-label">活跃路径</div><div class="flow-card-value">'+AF.length+'</div></div>';
  html+='</div>';
  
  html+='<div class="section"><div class="section-title">最大资金流出国</div><div class="flow-list">';
  top.forEach(function(x){
    html+='<div class="flow-item"><div class="flow-route"><span class="flow-dot out"></span><span>'+x[0].name+'</span></div><span class="flow-amount out">$'+x[1]+'B</span></div>';
  });
  html+='</div></div>';
  
  document.getElementById('panelBody').innerHTML=html;
}

function showCountryDetail(key,c){
  var inf=AF.filter(function(f){return f.to===key}).sort(function(a,b){return b.amount-a.amount}).slice(0,5);
  var outf=AF.filter(function(f){return f.from===key}).sort(function(a,b){return b.amount-a.amount}).slice(0,5);
  var ti=inf.reduce(function(s,f){return s+f.amount},0);
  var to=outf.reduce(function(s,f){return s+f.amount},0);
  var net=ti-to;
  
  document.getElementById('panelTitle').textContent=c.name;
  document.getElementById('panelSub').textContent='Capital Flow Details';
  
  var html='<div class="country-header"><div class="country-flag">'+c.name.charAt(0)+'</div><div><div class="country-name">'+c.name+'</div><div style="font-size:11px;color:var(--muted)">'+c.region+'</div></div></div>';
  
  html+='<div class="flow-summary">';
  html+='<div class="flow-card in"><div class="flow-card-label">总流入</div><div class="flow-card-value">$'+ti+'B</div></div>';
  html+='<div class="flow-card out"><div class="flow-card-label">总流出</div><div class="flow-card-value">$'+to+'B</div></div>';
  html+='</div>';
  
  html+='<div class="section"><div class="section-title">净流入</div>';
  html+='<div style="font-size:24px;font-weight:700;color:'+(net>=0?'var(--cyan)':'var(--amber)')+'">'+(net>=0?'+':'')+'$'+net+'B</div>';
  html+='</div>';
  
  html+='<div class="section"><div class="section-title">主要来源</div><div class="flow-list">';
  inf.forEach(function(f){var s=C[f.from];html+='<div class="flow-item"><div class="flow-route"><span class="flow-dot in"></span><span>'+(s?s.name:f.from)+'</span></div><span class="flow-amount in">+$'+f.amount+'B</span></div>'});
  html+='</div></div>';
  
  html+='<div class="section"><div class="section-title">主要去向</div><div class="flow-list">';
  outf.forEach(function(f){var d=C[f.to];html+='<div class="flow-item"><div class="flow-route"><span class="flow-dot out"></span><span>'+(d?d.name:f.to)+'</span></div><span class="flow-amount out">-$'+f.amount+'B</span></div>'});
  html+='</div></div>';
  
  document.getElementById('panelBody').innerHTML=html;
}

// Tooltip
var tip=document.getElementById('tooltip');
function showTip(e,n){
  var l=findC(n);
  if(!l)return;
  var k=l.key;
  var i1=AF.filter(function(f){return f.to===k}).reduce(function(s,f){return s+f.amount},0);
  var o1=AF.filter(function(f){return f.from===k}).reduce(function(s,f){return s+f.amount},0);
  tip.innerHTML='<div class="tooltip-title">'+l.data.name+'</div><div class="tooltip-row"><span>流入</span><span class="tooltip-val" style="color:#06b6d4">$'+i1+'B</span></div><div class="tooltip-row"><span>流出</span><span class="tooltip-val" style="color:#f59e0b">$'+o1+'B</span></div>';
  tip.style.opacity=1;
  var x=e.clientX+15,y=e.clientY+15;
  if(x+200>window.innerWidth)x=e.clientX-210;
  if(y+100>window.innerHeight)y=e.clientY-110;
  tip.style.left=x+'px';tip.style.top=y+'px';
}
function hideTip(){tip.style.opacity=0}

// Stars background
function createStars(){
  var c=document.getElementById('stars');
  for(var i=0;i<200;i++){
    var s=document.createElement('div');
    s.className='star';
    var size=Math.random()*2+1;
    s.style.cssText='width:'+size+'px;height:'+size+'px;left:'+(Math.random()*100)+'%;top:'+(Math.random()*100)+'%;--d:'+(2+Math.random()*3)+'s;animation-delay:'+(Math.random()*3)+'s';
    c.appendChild(s);
  }
}

// Controls
var zoomObj;
function initControls(){
  document.getElementById('amountSlider').oninput=function(){
    state.minAmt=+this.value;
    document.getElementById('sliderVal').textContent='≥ $'+this.value+'B';
    filterFlows();
  };
}

// Header stats
function updateHeaderStats(){
  var tf=AF.reduce(function(s,f){return s+f.amount},0);
  document.getElementById('statTotal').textContent='$'+(tf/1000).toFixed(1)+'T';
  document.getElementById('statFlows').textContent=AF.length;
  document.getElementById('statCountries').textContent=Object.keys(C).length;
}

// Init
createStars();
zoomObj=enableZoom(mapEl,function(){});
initControls();
updateHeaderStats();
resize();
showOverview();
document.getElementById('loading').classList.add('hidden');
`;

// HTML structure
const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>全球资金流动 | Global Capital Flows</title>
<style>${css}</style>
</head>
<body>
<div id="loading"><div class="loader"></div></div>
<div id="stars"></div>
<div id="app">
  <header>
    <div class="logo">
      <div class="logo-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
      </div>
      <h1>全球资金<span>流动</span></h1>
    </div>
    <div class="stats-bar">
      <div class="stat-item"><div class="stat-value" id="statTotal">-</div><div class="stat-label">总流量</div></div>
      <div class="stat-item"><div class="stat-value" id="statFlows">-</div><div class="stat-label">资金路径</div></div>
      <div class="stat-item"><div class="stat-value" id="statCountries">-</div><div class="stat-label">国家地区</div></div>
    </div>
  </header>
  <div class="main">
    <div id="map-container">
      <div class="globe-glow"></div>
      <svg id="globe"><g id="countries"></g></svg>
      <canvas id="flowCanvas"></canvas>
      <div class="controls">
        <div class="control-group">
          <span class="control-label">最小金额</span>
          <input type="range" id="amountSlider" min="5" max="500" value="5" step="5">
          <span class="slider-value" id="sliderVal">≥ $5B</span>
        </div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-header">
        <div class="panel-title" id="panelTitle">全球资金流动</div>
        <div class="panel-subtitle" id="panelSub">2025 · Global Capital Flows</div>
      </div>
      <div id="panelBody"></div>
    </div>
  </div>
</div>
<div class="tooltip" id="tooltip"></div>
<script>${topo}${geo}${zoom}</script>
<script>const MAP_DATA=${mapData};${appData}${app}</script>
</body>
</html>`;

fs.writeFileSync('chart.html', html);
const size = fs.statSync('chart.html').size;
console.log(`✅ Cosmic Theme Visualization: ${(size/1024).toFixed(1)} KB`);
console.log(`   ${(1-size/448615*100).toFixed(1)}% smaller than original 438 KB`);
