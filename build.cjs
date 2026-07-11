const fs = require('fs');
const d3 = fs.readFileSync('d3.min.js', 'utf8');
const topo = fs.readFileSync('topojson.min.js', 'utf8');
const mapData = fs.readFileSync('countries-110m.json', 'utf8');
const appData = fs.readFileSync('data.min.js', 'utf8');

const css = `*{margin:0;padding:0;box-sizing:border-box}body{background:#0d1117;color:#e6edf3;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Microsoft YaHei,sans-serif;overflow:hidden;height:100vh}.app{display:flex;height:100vh}.pl{width:20%;min-width:220px;max-width:280px;background:#161b22;border-right:1px solid #30363d;overflow-y:auto;content-visibility:auto;contain-intrinsic-size:0 800px}.pc{flex:1;position:relative;overflow:hidden;background:#0d1117}.pr{width:20%;min-width:220px;max-width:280px;background:#161b22;border-left:1px solid #30363d;overflow-y:auto;padding:16px;content-visibility:auto;contain-intrinsic-size:0 800px}.ph{padding:16px;border-bottom:1px solid #30363d}.ph h2{font-size:13px;font-weight:700}.ph p{font-size:10px;color:#8b949e;margin-top:2px}.fs{padding:14px 16px;border-bottom:1px solid #30363d}.fs h3{font-size:11px;font-weight:600;color:#8b949e;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px}.fg{margin-bottom:12px}.fl{font-size:10px;color:#8b949e;margin-bottom:4px;display:block}input[type=range]{width:100%;background:#0d1117;color:#e6edf3;border:1px solid #30363d;border-radius:6px;padding:6px 10px;font-size:11px}.bg{display:flex;gap:4px;flex-wrap:wrap}.btn{flex:1;background:#0d1117;color:#8b949e;border:1px solid #30363d;border-radius:6px;padding:6px 4px;font-size:10px;cursor:pointer;transition:all .15s;text-align:center}.btn:hover{border-color:#e6edf3;color:#e6edf3}.btn.a{background:#1A365D;border-color:#2563eb;color:#fff}.rv{font-size:10px;color:#f59e0b;text-align:right;margin-top:4px}#mc{width:100%;height:100%;position:relative}#ms{width:100%;height:100%}#fc{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;will-change:transform}.ct{fill:#1a2332;stroke:#2a3a4f;stroke-width:.5;cursor:pointer;transition:fill .2s}.ct:hover{fill:#2a3a5f;stroke:#2563eb;stroke-width:1}.ct.s{fill:#1A365D;stroke:#60a5fa;stroke-width:1.5}.ct.d{opacity:.15}.dt{font-size:16px;font-weight:800;margin-bottom:4px}.ds{font-size:11px;color:#8b949e;margin-bottom:16px}.sr{display:flex;justify-content:space-between;align-items:baseline;padding:8px 0;border-bottom:1px solid #30363d}.sl{font-size:11px;color:#8b949e}.sv{font-size:14px;font-weight:700}.prw{display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:11px;border-bottom:1px solid #30363d}.pn{color:#8b949e}.pv{font-weight:700}.i{color:#60a5fa}.o{color:#f87171}.lg{margin-top:16px;padding-top:16px;border-top:1px solid #30363d}.lg h4{font-size:11px;color:#8b949e;margin-bottom:8px}.li{display:flex;align-items:center;gap:6px;margin-bottom:4px;font-size:10px;color:#8b949e}.ls{width:12px;height:12px;border-radius:3px}.tl{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);background:#161b22;border:1px solid #30363d;border-radius:12px;padding:10px 16px;display:flex;align-items:center;gap:10px;z-index:10}.tb{background:0 0;border:1px solid #30363d;color:#8b949e;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:12px}.tk{flex:1;height:4px;background:#0d1117;border-radius:2px;position:relative;cursor:pointer;min-width:200px}.fi{height:100%;background:#2563eb;border-radius:2px}.hd{position:absolute;top:50%;transform:translate(-50%,-50%);width:12px;height:12px;background:#60a5fa;border-radius:50%;border:2px solid #161b22;cursor:grab}.td{display:flex;justify-content:space-between;font-size:9px;color:#8b949e;margin-top:4px}#ld{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:14px;color:#8b949e;z-index:50;display:flex;flex-direction:column;align-items:center;gap:12px}.sp{width:32px;height:32px;border:3px solid #30363d;border-top-color:#2563eb;border-radius:50%;animation:sk .8s linear infinite}@keyframes sk{to{transform:rotate(360deg)}}@media(max-width:768px){.app{flex-direction:column}.pl,.pr{width:100%;max-width:none;max-height:200px}.pc{height:50vh}}`;

const js = [
'const C=FUND_FLOW_DATA.countries,AF=FUND_FLOW_DATA.bilateralFlows;',
'function fe(n){if(C[n])return{key:n,data:C[n]};for(const[k,c]of Object.entries(C))if(c.name===n)return{key:k,data:c};return null}',
'let st={type:"all",time:"month",minAmount:10,flowMode:"net",selected:null,playing:false,timeIndex:2,filteredFlows:[]};',
'const Mc=document.getElementById("mc"),Z=d3.select("#ms");',
'let W=Mc.clientWidth,H=Mc.clientHeight;',
'const P=d3.geoNaturalEarth1().scale(Math.min(W,H)*.18).translate([W/2,H/2]);',
'const Ph=d3.geoPath(P);',
'd3.zoom().scaleExtent([1,12]).on("zoom",function(e){G.attr("transform",e.transform);nr=true}).call(Z);',
'const G=Z.append("g");',
'const cv=document.getElementById("fc"),cx=cv.getContext("2d");',
'function rc(){W=Mc.clientWidth;H=Mc.clientHeight;cv.width=W;cv.height=H;P.scale(Math.min(W,H)*.18).translate([W/2,H/2]);nr=true}',
'rc();window.addEventListener("resize",rc);',
'let pts=[],nr=false,aid=null;',
'function dfl(t){const k=t.k||1,tx=t.x||0,ty=t.y||0;cx.clearRect(0,0,cv.width,cv.height);cx.save();cx.translate(tx,ty);cx.scale(k,k);const fl=st.filteredFlows;for(let i=0;i<fl.length;i++){const f=fl[i],fc=C[f.from],tc=C[f.to];if(!fc||!tc)continue;const fp=P([fc.lng,fc.lat]),tp=P([tc.lng,tc.lat]);if(!fp||!tp)continue;const io=st.selected===f.from,ii=st.selected===f.to,ir=io||ii;if(st.selected&&!ir){cx.strokeStyle="#1a2332";cx.lineWidth=.3/k;cx.globalAlpha=.08;cx.beginPath();cx.moveTo(fp[0],fp[1]);cx.lineTo(tp[0],tp[1]);cx.stroke();continue}let cl=ii?d3.interpolateBlues(Math.min(1,f.amount/300)):io?d3.interpolateReds(Math.min(1,f.amount/300)):f.amount>200?"#f59e0b":"#f87171";cx.strokeStyle=cl;cx.lineWidth=Math.max(.5,Math.min(4,f.amount/200))/k;cx.globalAlpha=st.selected?(ir?.9:.05):.5;const mx=(fp[0]+tp[0])/2,my=(fp[1]+tp[1])/2-25*Math.min(1,150/(Math.abs(fp[0]-tp[0])||1));cx.beginPath();cx.moveTo(fp[0],fp[1]);cx.quadraticCurveTo(mx,my,tp[0],tp[1]);cx.stroke()}cx.globalAlpha=1;cx.restore()}',
'function up(t){const k=t.k||1;cx.save();cx.translate(t.x||0,t.y||0);cx.scale(k,k);for(let i=pts.length-1;i>=0;i--){const p=pts[i];p.t+=p.speed;if(p.t>1){pts.splice(i,1);continue}const tt=p.t,mt=1-tt;const x=mt*mt*p.fPos[0]+2*mt*tt*p.mid[0]+tt*tt*p.tPos[0];const y=mt*mt*p.fPos[1]+2*mt*tt*p.mid[1]+tt*tt*p.tPos[1];cx.beginPath();cx.arc(x,y,2.5/k,0,6.283);cx.fillStyle=p.color;cx.globalAlpha=.85;cx.fill()}cx.globalAlpha=1;cx.restore()}',
'function ip(){pts=[];const ln=st.filteredFlows.length;if(!ln)return;const mp=Math.min(300,ln*2);for(let i=0;i<mp;i++){const f=st.filteredFlows[Math.floor(Math.random()*ln)];if(!f)continue;const fc=C[f.from],tc=C[f.to];if(!fc||!tc)continue;const fp=P([fc.lng,fc.lat]),tp=P([tc.lng,tc.lat]);if(!fp||!tp)continue;const mx=(fp[0]+tp[0])/2,my=(fp[1]+tp[1])/2-25*Math.min(1,150/(Math.abs(fp[0]-tp[0])||1));pts.push({t:Math.random(),speed:.003+Math.random()*.008,mid:[mx,my],fPos:fp,tPos:tp,color:f.amount>200?"#f59e0b":"#60a5fa"})}}',
'function rl(){const t=d3.zoomTransform(Z.node());dfl(t);up(t);if(st.playing||nr){nr=false;aid=requestAnimationFrame(rl)}else aid=null}',
'function tr(){nr=true;if(!aid)aid=requestAnimationFrame(rl)}',
'function af(){st.filteredFlows=AF.filter(f=>{if(st.type!=="all"&&f.type!==st.type)return false;if(f.amount<st.minAmount)return false;return true});if(st.flowMode==="in"&&st.selected)st.filteredFlows=st.filteredFlows.filter(f=>f.to===st.selected);else if(st.flowMode==="out"&&st.selected)st.filteredFlows=st.filteredFlows.filter(f=>f.from===st.selected);ip();tr()}',
'const world=topojson.feature(MAP_DATA,MAP_DATA.objects.countries);',
'G.selectAll(".ct").data(world.features).enter().append("path").attr("class","ct").attr("d",Ph).attr("data-name",d=>d.properties.name).on("click",(e,d)=>sc(d.properties.name)).on("mouseenter",function(e){const n=d3.select(this).attr("data-name");const l=fe(n);if(l)xtt(e,l.data,l.key)}).on("mouseleave",htt);',
'document.getElementById("ld").style.display="none";af();',
'function sc(n){const l=fe(n);if(!l){sd();return}if(st.selected===l.key){sd();return}st.selected=l.key;Z.selectAll(".ct").classed("s",d=>d.properties.name===n).classed("d",d=>d.properties.name!==n);af();sdt(l.key,l.data)}',
'function sd(){st.selected=null;Z.selectAll(".ct").classed("s",false).classed("d",false);af();so()}',
].join('\n');

const js2 = `function sdt(cd,c){
const i1=AF.filter(f=>f.to===cd).sort((a,b)=>b.amount-a.amount).slice(0,5);
const o1=AF.filter(f=>f.from===cd).sort((a,b)=>b.amount-a.amount).slice(0,5);
const ti=i1.reduce((s,f)=>s+f.amount,0);
const too=o1.reduce((s,f)=>s+f.amount,0);
const net=ti-too;
const tti={fdi:0,portfolio:0,lending:0};
const tto={fdi:0,portfolio:0,lending:0};
AF.filter(f=>f.to===cd).forEach(f=>{if(tti[f.type]!==undefined)tti[f.type]+=f.amount});
AF.filter(f=>f.from===cd).forEach(f=>{if(tto[f.type]!==undefined)tto[f.type]+=f.amount});
document.getElementById("dt").textContent=c.name;
document.getElementById("ds").textContent="资金流动 · 股票 · 债券";
let h='<div class=sr><span class=sl>总流入</span><span class=sv i>$'+ti+'B</span></div>';
h+='<div class=sr><span class=sl>总流出</span><span class=sv o>$'+too+'B</span></div>';
h+='<div class=sr><span class=sl>净流量</span><span class=sv style="color:'+(net>=0?'#60a5fa':'#f87171')+'">'+(net>=0?'+':'')+'$'+net+'B</span></div>';
h+='<h4 style="font-size:11px;color:#8b949e;margin:14px 0 6px">流入</h4>';
h+='<div class=prw><span class=pn>FDI</span><span class=sv i>$'+tti.fdi+'B</span></div>';
h+='<div class=prw><span class=pn>证券</span><span class=sv i>$'+tti.portfolio+'B</span></div>';
h+='<div class=prw><span class=pn>贷款</span><span class=sv i>$'+tti.lending+'B</span></div>';
h+='<h4 style="font-size:11px;color:#8b949e;margin:14px 0 6px">流出</h4>';
h+='<div class=prw><span class=pn>FDI</span><span class=sv o>$'+tto.fdi+'B</span></div>';
h+='<div class=prw><span class=pn>证券</span><span class=sv o>$'+tto.portfolio+'B</span></div>';
h+='<div class=prw><span class=pn>贷款</span><span class=sv o>$'+tto.lending+'B</span></div>';
h+='<h4 style="font-size:11px;color:#8b949e;margin:14px 0 6px">主要来源</h4>';
i1.forEach(f=>{const s=C[f.from];h+='<div class=prw><span class=pn>'+(s?s.name:f.from)+'</span><span class=sv i>+$'+f.amount+'B</span></div>'});
h+='<h4 style="font-size:11px;color:#8b949e;margin:14px 0 6px">主要去向</h4>';
o1.forEach(f=>{const d=C[f.to];h+='<div class=prw><span class=pn>'+(d?d.name:f.to)+'</span><span class=sv o>-$'+f.amount+'B</span></div>'});
if(c.stockMarket){
h+='<h4 style="font-size:11px;color:#f59e0b;margin:14px 0 6px">📈 股票</h4>';
h+='<div class=prw><span class=pn>市值</span><span class=sv>$'+(c.stockMarket.totalMarketCap/1000).toFixed(1)+'T</span></div>';
h+='<div class=prw><span class=pn>公司数</span><span class=sv>'+c.stockMarket.listedCompanies+'</span></div>';
}
if(c.bondMarket){
h+='<h4 style="font-size:11px;color:#f59e0b;margin:14px 0 6px">📊 债券</h4>';
h+='<div class=prw><span class=pn>10Y国债</span><span class=sv>'+c.bondMarket.governmentBondYield10Y+'%</span></div>';
h+='<div class=prw><span class=pn>余额</span><span class=sv>$'+(c.bondMarket.totalBondOutstanding/1000).toFixed(1)+'T</span></div>';
}
if(c.gold){
h+='<h4 style="font-size:11px;color:#f59e0b;margin:14px 0 6px">🥇 黄金</h4>';
h+='<div class=prw><span class=pn>储备</span><span class=sv>'+c.gold.officialReserves+'吨</span></div>';
h+='<div class=prw><span class=pn>价值</span><span class=sv>$'+c.gold.goldReserveValue+'B</span></div>';
}
if(c.commodities){
h+='<h4 style="font-size:11px;color:#f59e0b;margin:14px 0 6px">⛽ 商品</h4>';
if(c.commodities.oilProduction)h+='<div class=prw><span class=pn>原油产量</span><span class=sv>'+c.commodities.oilProduction+'mb/d</span></div>';
if(c.commodities.oilImports)h+='<div class=prw><span class=pn>原油进口</span><span class=sv>'+c.commodities.oilImports+'mb/d</span></div>';
}
document.getElementById("db").innerHTML=h
}`;

const js3 = `function so(){
const tf=AF.reduce((s,f)=>s+f.amount,0);
const meta=FUND_FLOW_DATA.metadata;
const fa={};
AF.forEach(f=>{if(!fa[f.from])fa[f.from]={out:0,inn:0};if(!fa[f.to])fa[f.to]={out:0,inn:0};fa[f.from].out+=f.amount;fa[f.to].inn+=f.amount});
const ts=Object.entries(fa).map(([k,v])=>({...C[k],out:v.out})).filter(c=>c.name).sort((a,b)=>b.out-a.out).slice(0,5);
const tt=Object.entries(fa).map(([k,v])=>({...C[k],inn:v.inn})).filter(c=>c.name).sort((a,b)=>b.inn-a.inn).slice(0,5);
document.getElementById("dt").textContent="全球概览";
document.getElementById("ds").textContent="资金流 2025";
let h='<div class=sr><span class=sl>总流量</span><span class=sv>$'+(tf/1000).toFixed(1)+'T</span></div>';
h+='<div class=sr><span class=sl>活跃路径</span><span class=sv>'+AF.length+'</span></div>';
h+='<div class=sr><span class=sl>组合投资</span><span class=sv>$'+(meta.totalGlobalPortfolioAssets/1000).toFixed(1)+'T</span></div>';
h+='<h4 style="font-size:11px;color:#f59e0b;margin:14px 0 6px">📈 全球股票</h4>';
h+='<div class=sr><span class=sl>市值</span><span class=sv>$'+(meta.totalGlobalStockMarketCap/1000).toFixed(0)+'T</span></div>';
if(FUND_FLOW_DATA.stockMarket)FUND_FLOW_DATA.stockMarket.topMarkets.slice(0,4).forEach(m=>{h+='<div class=prw><span class=pn>'+m.name+'</span><span class=sv>'+m.share+'%</span></div>'});
h+='<h4 style="font-size:11px;color:#f59e0b;margin:14px 0 6px">🥇 黄金</h4>';
h+='<div class=sr><span class=sl>需求</span><span class=sv>'+meta.globalGoldDemand2025+'吨</span></div>';
h+='<div class=prw><span class=pn>均价</span><span class=sv>$'+meta.goldPriceAvg2025+'/oz</span></div>';
h+='<h4 style="font-size:11px;color:#f59e0b;margin:14px 0 6px">⛽ 原油</h4>';
h+='<div class=sr><span class=sl>需求</span><span class=sv>'+meta.globalOilDemand2025+'mb/d</span></div>';
h+='<h4 style="font-size:11px;color:#f59e0b;margin:14px 0 6px">📊 国债</h4>';
[["United States","美国"],["Japan","日本"],["Germany","德国"],["China","中国"]].forEach(([k,lb])=>{if(C[k]&&C[k].bondMarket)h+='<div class=prw><span class=pn>'+lb+'10Y</span><span class=sv>'+C[k].bondMarket.governmentBondYield10Y+'%</span></div>'});
h+='<h4 style="font-size:11px;color:#8b949e;margin:14px 0 6px">最大资金来源</h4>';
ts.forEach(c=>{h+='<div class=prw><span class=pn>'+c.name+'</span><span class=sv o>$'+c.out+'B</span></div>'});
h+='<h4 style="font-size:11px;color:#8b949e;margin:14px 0 6px">最大资金目的地</h4>';
tt.forEach(c=>{h+='<div class=prw><span class=pn>'+c.name+'</span><span class=sv i>$'+c.inn+'B</span></div>'});
document.getElementById("db").innerHTML=h
}`;

const js4 = `const tp=d3.select("body").append("div").attr("style","position:absolute;padding:8px 12px;background:rgba(13,17,23,.95);border:1px solid #30363d;border-radius:8px;font-size:11px;pointer-events:none;opacity:0;transition:opacity .15s;z-index:100;max-width:260px");
function xtt(e,c,key){
const i1=AF.filter(f=>f.to===key).reduce((s,f)=>s+f.amount,0);
const o1=AF.filter(f=>f.from===key).reduce((s,f)=>s+f.amount,0);
let t='<strong>'+c.name+'</strong><br>流入:<span style=color:#60a5fa>$'+i1+'B</span> 流出:<span style=color:#f87171>$'+o1+'B</span>';
if(c.stockMarket)t+='<br><span style=color:#f59e0b>📈 $'+(c.stockMarket.totalMarketCap/1000).toFixed(1)+'T</span>';
if(c.bondMarket)t+='<br><span style=color:#8b949e>📊 10Y:'+c.bondMarket.governmentBondYield10Y+'%</span>';
let l=e.pageX+12,t2=e.pageY+12;
if(l+220>window.innerWidth)l=e.pageX-232;
if(t2+120>window.innerHeight)t2=e.pageY-132;
tp.html(t).style("opacity",1).style("left",l+"px").style("top",t2+"px")
}
function htt(){tp.style("opacity",0)}
function sb(id,ds,sk){document.querySelectorAll("#"+id+" .btn").forEach(b=>{b.onclick=()=>{document.querySelectorAll("#"+id+" .btn").forEach(x=>x.classList.remove("a"));b.classList.add("a");st[sk]=b.dataset[ds];af()}})}
sb("tn","t","type");sb("tm","m","time");sb("fb","f","flowMode");
document.getElementById("as").oninput=function(){st.minAmount=+this.value;document.getElementById("av").textContent="≥ $"+this.value+"B";af()};
document.getElementById("pb").onclick=function(){st.playing=!st.playing;this.textContent=st.playing?"⏸":"▶";if(st.playing){ap();at()}};
function at(){if(!st.playing)return;st.timeIndex=(st.timeIndex+1)%5;const p=((st.timeIndex+1)*20);document.querySelector(".fi").style.width=p+"%";document.querySelector(".hd").style.left=p+"%";setTimeout(at,2000)}
function ap(){if(!st.playing)return;nr=true;if(!aid)aid=requestAnimationFrame(rl);setTimeout(()=>{if(st.playing)ap()},50)}
so();`;

const allJs = js + '\n' + js2 + '\n' + js3 + '\n' + js4;

const html = `<!DOCTYPE html><html lang=zh-CN><head><meta charset=UTF-8><meta name=viewport content="width=device-width,initial-scale=1"><title>全球资金流可视化</title><style>${css}</style></head><body><div class=app><div class=pl><div class=ph><h2>全球资金流与经济金融</h2><p>Global Fund Flow</p><p style=font-size:9px;color:#f59e0b;margin-top:4px>数据来源:IMF/BIS/WB/WFE/WGC/OPEC 2024-2025</p></div><div class=fs><h3>资金类型</h3><div class=bg id=tn><button class=btn a data-t=all>全部</button><button class=btn data-t=fdi>直接投资</button><button class=btn data-t=portfolio>证券投资</button><button class=btn data-t=lending>跨境贷款</button></div></div><div class=fs><h3>时间维度</h3><div class=bg id=tm><button class=btn a data-m=month>月度</button><button class=btn data-m=quarter>季度</button><button class=btn data-m=year>年度</button></div></div><div class=fs><h3>金额阈值</h3><div class=fg><label class=fl>最小金额(十亿美元)</label><input type=range id=as min=0 max=500 value=10 step=10><div class=rv id=av>≥ $10B</div></div></div><div class=fs><h3>视图模式</h3><div class=bg id=fb><button class=btn a data-f=net>净流量</button><button class=btn data-f=in>仅流入</button><button class=btn data-f=out>仅流出</button></div></div><div class=fs><div class=lg><h4>图例</h4><div class=li><span class=ls style=background:#60a5fa></span>资金流入</div><div class=li><span class=ls style=background:#f87171></span>资金流出</div></div></div></div><div class=pc><div id=mc><svg id=ms></svg><canvas id=fc></canvas><div id=ld><div class=sp></div><span>加载中...</span></div></div><div class=tl><button class=tb id=pb>▶</button><div><div class=tk id=tt><div class=fi style=width:50%><div class=hd style=left:50%></div></div></div><div class=td><span>2025-Q1</span><span>2025-Q2</span><span>2025-Q3</span><span>2025-Q4</span><span>2026-Q1</span></div></div></div></div><div class=pr><div class=dt id=dt>全球概览</div><div class=ds id=ds>点击国家查看详情</div><div id=db></div></div></div><script>${d3}${topo}const MAP_DATA=${mapData};${appData}</script><script>${allJs}</script></body></html>`;

fs.writeFileSync('chart.html', html);
console.log('Done: ' + (fs.statSync('chart.html').size/1024).toFixed(1) + ' KB single-file app');
