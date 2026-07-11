const fs = require('fs');
const topo = fs.readFileSync('topojson.min.js', 'utf8');
const mapData = fs.readFileSync('countries-110m.json', 'utf8');
const appData = fs.readFileSync('data.min.js', 'utf8');

// Minimal geo projection + path (~5KB vs 273KB D3)
const geo = `
// Minimal NaturalEarth-like projection
function Projector(w,h){
  var scale=Math.min(w,h)*0.18, cx=w/2, cy=h/2;
  return function(lonlat){
    var lon=lonlat[0]*Math.PI/180, lat=lonlat[1]*Math.PI/180;
    // Simplified NaturalEarth approximation
    var x = lon * (0.98 + 0.003*lat*lat);
    var y = lat * (1.0 - 0.0005*lon*lon);
    return [cx + x*scale/1.83, cy - y*scale/1.18];
  };
}
function geoPath(proj){
  return function(feature){
    function ringToPath(ring){
      var d='';
      for(var i=0;i<ring.length;i++){
        var p=proj(ring[i]);
        d += (i?'L':'M') + p[0].toFixed(2)+','+p[1].toFixed(2);
      }
      return d+'Z';
    }
    if(feature.geometry.type==='Polygon') return ringToPath(feature.geometry.coordinates[0]);
    if(feature.geometry.type==='MultiPolygon'){
      var d='';
      feature.geometry.coordinates.forEach(function(poly){ d+=ringToPath(poly[0]); });
      return d;
    }
    return '';
  };
}
`;

// Minimal zoom (~2KB)
const zoom = `
// Minimal zoom/pan
function Zoom(svg, onZoom){
  var transform={x:0,y:0,k:1};
  var dragging=false, lastX=0, lastY=0;
  
  svg.addEventListener('wheel', function(e){
    e.preventDefault();
    var delta=e.deltaY>0?0.9:1.1;
    var nk=Math.max(1,Math.min(12,transform.k*delta));
    var rect=svg.getBoundingClientRect();
    var mx=e.clientX-rect.left, my=e.clientY-rect.top;
    transform.x=mx-(mx-transform.x)*nk/transform.k;
    transform.y=my-(my-transform.y)*nk/transform.k;
    transform.k=nk;
    onZoom(transform);
  }, {passive:false});
  
  svg.addEventListener('mousedown', function(e){ dragging=true; lastX=e.clientX; lastY=e.clientY; svg.style.cursor='grabbing'; });
  window.addEventListener('mouseup', function(){ dragging=false; svg.style.cursor='grab'; });
  window.addEventListener('mousemove', function(e){
    if(!dragging) return;
    transform.x+=e.clientX-lastX;
    transform.y+=e.clientY-lastY;
    lastX=e.clientX;
    lastY=e.clientY;
    onZoom(transform);
  });
  
  return { transform: function(){ return transform; } };
}
`;

// Simplified app (~6KB vs 10KB)
const app = `
const C=FUND_FLOW_DATA.countries,AF=FUND_FLOW_DATA.bilateralFlows;
function fe(n){if(C[n])return{key:n,data:C[n]};for(const[k,c]of Object.entries(C))if(c.name===n)return{key:k,data:c};return null}
let st={selected:null,minAmount:10,filteredFlows:[]};
const Mc=document.getElementById("mc");
let W=Mc.clientWidth,H=Mc.clientHeight;
let proj=Projector(W,H),path=geoPath(proj);
const svg=document.getElementById("ms");
const cv=document.getElementById("fc"),cx=cv.getContext("2d");

let particles=[],animId=null,zoomObj;
function rc(){
  W=Mc.clientWidth;H=Mc.clientHeight;
  cv.width=W;cv.height=H;
  proj=Projector(W,H);path=geoPath(proj);
  redraw();
}
rc();
window.addEventListener("resize",rc);

function redraw(){
  var g=document.getElementById("mp");
  g.innerHTML="";
  var world=topojson.feature(MAP_DATA,MAP_DATA.objects.countries);
  world.features.forEach(function(f){
    var p=document.createElementNS("http://www.w3.org/2000/svg","path");
    p.setAttribute("d",path(f));
    p.setAttribute("class","ct");
    p.setAttribute("data-name",f.properties.name);
    p.addEventListener("click",function(){sc(f.properties.name)});
    p.addEventListener("mouseenter",function(e){showTip(e,f.properties.name)});
    p.addEventListener("mouseleave",hideTip);
    g.appendChild(p);
  });
  filterFlows();
}

function filterFlows(){
  st.filteredFlows=AF.filter(function(f){return f.amount>=st.minAmount});
  initParticles();
  draw();
  if(!animId)animId=requestAnimationFrame(animate);
}

function draw(){
  var t=zoomObj?zoomObj.transform():{x:0,y:0,k:1};
  var k=t.k,tx=t.x,ty=t.y;
  cx.clearRect(0,0,cv.width,cv.height);
  cx.save();
  cx.translate(tx,ty);
  cx.scale(k,k);
  st.filteredFlows.forEach(function(f){
    var fc=C[f.from],tc=C[f.to];
    if(!fc||!tc)return;
    var fp=proj([fc.lng,fc.lat]),tp=proj([tc.lng,tc.lat]);
    if(!fp||!tp)return;
    var sel=st.selected;
    var isIn=sel===f.to, isOut=sel===f.from, active=isIn||isOut;
    if(sel&&!active){cx.strokeStyle="#1a2332";cx.globalAlpha=0.06;}
    else{
      cx.globalAlpha=sel?(active?0.9:0.04):0.45;
      cx.strokeStyle=isIn?"#60a5fa":isOut?"#f87171":f.amount>200?"#f59e0b":"#f87171";
    }
    cx.lineWidth=Math.max(0.4,Math.min(3.5,f.amount/200))/k;
    var mx=(fp[0]+tp[0])/2,my=(fp[1]+tp[1])/2-20*Math.min(1,120/(Math.abs(fp[0]-tp[0])||1));
    cx.beginPath();cx.moveTo(fp[0],fp[1]);cx.quadraticCurveTo(mx,my,tp[0],tp[1]);cx.stroke();
  });
  cx.globalAlpha=1;cx.restore();
}

function updateParticles(){
  var t=zoomObj?zoomObj.transform():{x:0,y:0,k:1};
  var k=t.k;
  cx.save();
  cx.translate(t.x,t.y);
  cx.scale(k,k);
  for(var i=particles.length-1;i>=0;i--){
    var p=particles[i];
    p.t+=p.speed;
    if(p.t>1){particles.splice(i,1);continue;}
    var tt=p.t,mt=1-tt;
    var x=mt*mt*p.fp[0]+2*mt*tt*p.mid[0]+tt*tt*p.tp[0];
    var y=mt*mt*p.fp[1]+2*mt*tt*p.mid[1]+tt*tt*p.tp[1];
    cx.beginPath();cx.arc(x,y,2.2/k,0,6.283);
    cx.fillStyle=p.color;cx.globalAlpha=0.85;cx.fill();
  }
  cx.globalAlpha=1;cx.restore();
}

function initParticles(){
  particles=[];
  var ln=st.filteredFlows.length;
  if(!ln)return;
  var count=Math.min(250,ln*2);
  for(var i=0;i<count;i++){
    var f=st.filteredFlows[Math.floor(Math.random()*ln)];
    if(!f)continue;
    var fc=C[f.from],tc=C[f.to];
    if(!fc||!tc)continue;
    var fp=proj([fc.lng,fc.lat]),tp=proj([tc.lng,tc.lat]);
    if(!fp||!tp)continue;
    var mx=(fp[0]+tp[0])/2,my=(fp[1]+tp[1])/2-20*Math.min(1,120/(Math.abs(fp[0]-tp[0])||1));
    particles.push({t:Math.random(),speed:0.004+Math.random()*0.008,mid:[mx,my],fp:fp,tp:tp,color:f.amount>200?"#f59e0b":"#60a5fa"});
  }
}

function animate(){
  draw();
  updateParticles();
  animId=requestAnimationFrame(animate);
}

function sc(n){
  var l=fe(n);
  if(!l){sd();return}
  if(st.selected===l.key){sd();return}
  st.selected=l.key;
  document.querySelectorAll(".ct").forEach(function(p){
    p.classList.toggle("s",p.dataset.name===n);
    p.classList.toggle("d",p.dataset.name!==n);
  });
  filterFlows();
  showDetails(l.key,l.data);
}

function sd(){
  st.selected=null;
  document.querySelectorAll(".ct").forEach(function(p){p.classList.remove("s","d")});
  filterFlows();
  showOverview();
}

function showDetails(cd,c){
  var inflows=AF.filter(function(f){return f.to===cd}).sort(function(a,b){return b.amount-a.amount}).slice(0,5);
  var outflows=AF.filter(function(f){return f.from===cd}).sort(function(a,b){return b.amount-a.amount}).slice(0,5);
  var ti=inflows.reduce(function(s,f){return s+f.amount},0);
  var to=outflows.reduce(function(s,f){return s+f.amount},0);
  var net=ti-to;
  document.getElementById("dt").textContent=c.name;
  document.getElementById("ds").textContent="资金流动";
  var h='<div class=sr><span class=sl>总流入</span><span class=sv i>$'+ti+'B</span></div>';
  h+='<div class=sr><span class=sl>总流出</span><span class=sv o>$'+to+'B</span></div>';
  h+='<div class=sr><span class=sl>净流量</span><span class=sv style="color:'+(net>=0?'#60a5fa':'#f87171')+'">'+(net>=0?'+':'')+'$'+net+'B</span></div>';
  h+='<h4>主要来源</h4>';
  inflows.forEach(function(f){var s=C[f.from];h+='<div class=pr><span>'+(s?s.name:f.from)+'</span><span class=i>+$'+f.amount+'B</span></div>'});
  h+='<h4>主要去向</h4>';
  outflows.forEach(function(f){var d=C[f.to];h+='<div class=pr><span>'+(d?d.name:f.to)+'</span><span class=o>-$'+f.amount+'B</span></div>'});
  document.getElementById("db").innerHTML=h;
}

function showOverview(){
  var tf=AF.reduce(function(s,f){return s+f.amount},0);
  var flows={};
  AF.forEach(function(f){if(!flows[f.from])flows[f.from]=0;flows[f.from]+=f.amount});
  var sorted=Object.entries(flows).map(function(k){return[C[k[0]],k[1]]}).filter(function(x){return x[0]}).sort(function(a,b){return b[1]-a[1]}).slice(0,5);
  document.getElementById("dt").textContent="全球概览";
  document.getElementById("ds").textContent="资金流 2025";
  var h='<div class=sr><span class=sl>总流量</span><span class=sv>$'+(tf/1000).toFixed(1)+'T</span></div>';
  h+='<div class=sr><span class=sl>活跃路径</span><span class=sv>'+AF.length+'</span></div>';
  h+='<h4>最大资金流出国</h4>';
  sorted.forEach(function(x){h+='<div class=pr><span>'+x[0].name+'</span><span class=o>$'+x[1]+'B</span></div>'});
  document.getElementById("db").innerHTML=h;
}

// Tooltip
var tip=document.createElement("div");
tip.style.cssText="position:absolute;padding:6px 10px;background:rgba(13,17,23,.92);border:1px solid #30363d;border-radius:6px;font-size:11px;pointer-events:none;opacity:0;transition:opacity .15s;z-index:100";
document.body.appendChild(tip);

function showTip(e,n){
  var l=fe(n);
  if(!l)return;
  var key=l.key;
  var i1=AF.filter(function(f){return f.to===key}).reduce(function(s,f){return s+f.amount},0);
  var o1=AF.filter(function(f){return f.from===key}).reduce(function(s,f){return s+f.amount},0);
  tip.innerHTML='<b>'+l.data.name+'</b><br>流入: <span style="color:#60a5fa">$'+i1+'B</span><br>流出: <span style="color:#f87171">$'+o1+'B</span>';
  tip.style.opacity=1;
  var x=e.pageX+12,y=e.pageY+12;
  if(x+180>window.innerWidth)x=e.pageX-190;
  if(y+80>window.innerHeight)y=e.pageY-90;
  tip.style.left=x+"px";tip.style.top=y+"px";
}

function hideTip(){tip.style.opacity=0}

// Controls
document.getElementById("as").oninput=function(){
  st.minAmount=+this.value;
  document.getElementById("av").textContent="≥ $"+this.value+"B";
  filterFlows();
};

// Init
zoomObj=Zoom(svg,function(t){if(!animId)animate()});
document.getElementById("ld").style.display="none";
showOverview();
`;

// Simplified CSS (~1.5KB vs 3.8KB)
const css = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0d1117;color:#e6edf3;overflow:hidden;height:100vh}
#mc{position:relative;width:100vw;height:100vh;cursor:grab;overflow:hidden}
#ms{position:absolute;top:0;left:0;width:100%;height:100%}
#fc{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none}
.ct{fill:#1a2332;stroke:#30363d;stroke-width:0.5;cursor:pointer;transition:fill 0.15s}
.ct:hover{fill:#2a3a5a}
.ct.s{fill:#3b82f6;stroke:#60a5fa;stroke-width:1.5}
.ct.d{fill:#151d2b}
#panel{position:absolute;top:16px;right:16px;width:280px;max-height:calc(100vh - 32px);overflow-y:auto;background:rgba(13,17,23,0.92);border:1px solid #30363d;border-radius:12px;padding:16px;backdrop-filter:blur(12px)}
#dt{font-size:16px;font-weight:600;margin-bottom:4px}
#ds{font-size:11px;color:#8b949e;margin-bottom:12px}
#db{font-size:12px}
.sr{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #21262d}
.sl{color:#8b949e}
.sv{font-weight:600}
.sv.i{color:#60a5fa}.sv.o{color:#f87171}
.pr{display:flex;justify-content:space-between;padding:4px 0;font-size:11px}
.pr i{color:#60a5fa}.pr o{color:#f87171}
#db h4{font-size:11px;color:#f59e0b;margin:12px 0 4px;font-weight:500}
#controls{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);display:flex;gap:8px;align-items:center;background:rgba(13,17,23,0.9);padding:8px 16px;border-radius:20px;border:1px solid #30363d;font-size:12px}
#controls label{color:#8b949e;font-size:11px}
#controls input[type=range]{width:100px}
#av{font-weight:600;color:#60a5fa;min-width:50px}
#ld{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center}
`;

// Build HTML
const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>全球资金流动</title><style>${css}</style></head><body>
<div id="ld">加载中...</div>
<div id="mc">
  <svg id="ms"><g id="mp"></g></svg>
  <canvas id="fc"></canvas>
</div>
<div id="panel">
  <div id="dt">全球概览</div>
  <div id="ds">资金流 2025</div>
  <div id="db"></div>
</div>
<div id="controls">
  <label>最小金额</label>
  <input id="as" type="range" min="10" max="500" value="10" step="10">
  <span id="av">≥ $10B</span>
</div>
<script>${topo}const MAP_DATA=${mapData};${appData}</script>
<script>${geo}${zoom}${app}</script>
</body></html>`;

fs.writeFileSync('chart.html', html);
const size = fs.statSync('chart.html').size;
console.log(`Built single-file app: ${(size/1024).toFixed(1)} KB`);
console.log(`Reduction: ${((1 - size/448615)*100).toFixed(1)}% from original 438 KB`);
