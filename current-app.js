const C=FUND_FLOW_DATA.countries,AF=FUND_FLOW_DATA.bilateralFlows;
function fe(n){if(C[n])return{key:n,data:C[n]};for(const[k,c]of Object.entries(C))if(c.name===n)return{key:k,data:c};return null}
let st={type:"all",time:"month",minAmount:10,flowMode:"net",selected:null,playing:false,timeIndex:2,filteredFlows:[]};
const Mc=document.getElementById("mc"),Z=d3.select("#ms");
let W=Mc.clientWidth,H=Mc.clientHeight;
const P=d3.geoNaturalEarth1().scale(Math.min(W,H)*.18).translate([W/2,H/2]);
const Ph=d3.geoPath(P);
d3.zoom().scaleExtent([1,12]).on("zoom",function(e){G.attr("transform",e.transform);nr=true}).call(Z);
const G=Z.append("g");
const cv=document.getElementById("fc"),cx=cv.getContext("2d");
function rc(){W=Mc.clientWidth;H=Mc.clientHeight;cv.width=W;cv.height=H;P.scale(Math.min(W,H)*.18).translate([W/2,H/2]);nr=true}
rc();window.addEventListener("resize",rc);
let pts=[],nr=false,aid=null;
function dfl(t){const k=t.k||1,tx=t.x||0,ty=t.y||0;cx.clearRect(0,0,cv.width,cv.height);cx.save();cx.translate(tx,ty);cx.scale(k,k);const fl=st.filteredFlows;for(let i=0;i<fl.length;i++){const f=fl[i],fc=C[f.from],tc=C[f.to];if(!fc||!tc)continue;const fp=P([fc.lng,fc.lat]),tp=P([tc.lng,tc.lat]);if(!fp||!tp)continue;const io=st.selected===f.from,ii=st.selected===f.to,ir=io||ii;if(st.selected&&!ir){cx.strokeStyle="#1a2332";cx.lineWidth=.3/k;cx.globalAlpha=.08;cx.beginPath();cx.moveTo(fp[0],fp[1]);cx.lineTo(tp[0],tp[1]);cx.stroke();continue}let cl=ii?d3.interpolateBlues(Math.min(1,f.amount/300)):io?d3.interpolateReds(Math.min(1,f.amount/300)):f.amount>200?"#f59e0b":"#f87171";cx.strokeStyle=cl;cx.lineWidth=Math.max(.5,Math.min(4,f.amount/200))/k;cx.globalAlpha=st.selected?(ir?.9:.05):.5;const mx=(fp[0]+tp[0])/2,my=(fp[1]+tp[1])/2-25*Math.min(1,150/(Math.abs(fp[0]-tp[0])||1));cx.beginPath();cx.moveTo(fp[0],fp[1]);cx.quadraticCurveTo(mx,my,tp[0],tp[1]);cx.stroke()}cx.globalAlpha=1;cx.restore()}
function up(t){const k=t.k||1;cx.save();cx.translate(t.x||0,t.y||0);cx.scale(k,k);for(let i=pts.length-1;i>=0;i--){const p=pts[i];p.t+=p.speed;if(p.t>1){pts.splice(i,1);continue}const tt=p.t,mt=1-tt;const x=mt*mt*p.fPos[0]+2*mt*tt*p.mid[0]+tt*tt*p.tPos[0];const y=mt*mt*p.fPos[1]+2*mt*tt*p.mid[1]+tt*tt*p.tPos[1];cx.beginPath();cx.arc(x,y,2.5/k,0,6.283);cx.fillStyle=p.color;cx.globalAlpha=.85;cx.fill()}cx.globalAlpha=1;cx.restore()}
function ip(){pts=[];const ln=st.filteredFlows.length;if(!ln)return;const mp=Math.min(300,ln*2);for(let i=0;i<mp;i++){const f=st.filteredFlows[Math.floor(Math.random()*ln)];if(!f)continue;const fc=C[f.from],tc=C[f.to];if(!fc||!tc)continue;const fp=P([fc.lng,fc.lat]),tp=P([tc.lng,tc.lat]);if(!fp||!tp)continue;const mx=(fp[0]+tp[0])/2,my=(fp[1]+tp[1])/2-25*Math.min(1,150/(Math.abs(fp[0]-tp[0])||1));pts.push({t:Math.random(),speed:.003+Math.random()*.008,mid:[mx,my],fPos:fp,tPos:tp,color:f.amount>200?"#f59e0b":"#60a5fa"})}}
function rl(){const t=d3.zoomTransform(Z.node());dfl(t);up(t);if(st.playing||nr){nr=false;aid=requestAnimationFrame(rl)}else aid=null}
function tr(){nr=true;if(!aid)aid=requestAnimationFrame(rl)}
function af(){st.filteredFlows=AF.filter(f=>{if(st.type!=="all"&&f.type!==st.type)return false;if(f.amount<st.minAmount)return false;return true});if(st.flowMode==="in"&&st.selected)st.filteredFlows=st.filteredFlows.filter(f=>f.to===st.selected);else if(st.flowMode==="out"&&st.selected)st.filteredFlows=st.filteredFlows.filter(f=>f.from===st.selected);ip();tr()}
const world=topojson.feature(MAP_DATA,MAP_DATA.objects.countries);
G.selectAll(".ct").data(world.features).enter().append("path").attr("class","ct").attr("d",Ph).attr("data-name",d=>d.properties.name).on("click",(e,d)=>sc(d.properties.name)).on("mouseenter",function(e){const n=d3.select(this).attr("data-name");const l=fe(n);if(l)xtt(e,l.data,l.key)}).on("mouseleave",htt);
document.getElementById("ld").style.display="none";af();
function sc(n){const l=fe(n);if(!l){sd();return}if(st.selected===l.key){sd();return}st.selected=l.key;Z.selectAll(".ct").classed("s",d=>d.properties.name===n).classed("d",d=>d.properties.name!==n);af();sdt(l.key,l.data)}
function sd(){st.selected=null;Z.selectAll(".ct").classed("s",false).classed("d",false);af();so()}
function sdt(cd,c){
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
}
function so(){
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
}
const tp=d3.select("body").append("div").attr("style","position:absolute;padding:8px 12px;background:rgba(13,17,23,.95);border:1px solid #30363d;border-radius:8px;font-size:11px;pointer-events:none;opacity:0;transition:opacity .15s;z-index:100;max-width:260px");
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
so();