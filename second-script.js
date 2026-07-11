
/* 投影 + 路径 */
function makeProj(w,h){
  var s=Math.min(w,h)*0.42,cx=w/2,cy=h/2;
  return function(ll){
    var lo=ll[0]*Math.PI/180,la=ll[1]*Math.PI/180;
    var x=lo*(0.985+0.0025*la*la);
    var y=la*(1.0-0.0004*lo*lo);
    return [cx+x*s/1.83,cy-y*s/1.18];
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
      var d='';f.geometry.coordinates.forEach(function(p){d+=ring(p[0])});return d;
    }
    return '';
  };
}

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
  }

  function resize(){
    W=mapEl.clientWidth;H=mapEl.clientHeight;
    cv.width=W;cv.height=H;
    proj=makeProj(W,H);path=makePath(proj);
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
    var top=Object.entries(flows).map(function(k){return[C[k[0]],k[1]]}).filter(function(x){return x[0]}).sort(function(a,b){return b[1]-a[1]}).slice(0,5});

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

    document.getElementById('panelBody').innerHTML=h;
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

    document.getElementById('panelBody').innerHTML=h;
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
