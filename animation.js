(() => {
  const canvas = document.getElementById('bg-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, DPR = window.devicePixelRatio || 1;

  function resize(){
    w = canvas.clientWidth; h = canvas.clientHeight; DPR = window.devicePixelRatio || 1;
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }

  const cfg = { count: 60, minR: 0.6, maxR: 3.2, speed: 0.05, hue: 200 };
  const particles = [];

  function rand(min, max){ return Math.random()*(max-min)+min }

  function make(){
    for(let i=0;i<cfg.count;i++){
      particles.push({
        x: Math.random()*w,
        y: Math.random()*h,
        r: rand(cfg.minR,cfg.maxR),
        vx: rand(-0.05,0.05),
        vy: rand(-0.02,0.02),
        alpha: rand(0.06,0.22)
      });
    }
  }

  function draw(){
    ctx.clearRect(0,0,w,h);
    // subtle vignette
    const grd = ctx.createLinearGradient(0,0,0,h);
    grd.addColorStop(0,'rgba(255,255,255,0.0)');
    grd.addColorStop(1,'rgba(0,0,0,0.06)');
    ctx.fillStyle = grd; ctx.fillRect(0,0,w,h);

    for(const p of particles){
      p.x += p.vx * (1 + Math.sin(Date.now()/6000));
      p.y += p.vy * (1 + Math.cos(Date.now()/7000));
      if(p.x < -10) p.x = w + 10; if(p.x > w + 10) p.x = -10;
      if(p.y < -10) p.y = h + 10; if(p.y > h + 10) p.y = -10;

      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*6);
      const hue = cfg.hue + Math.sin((p.x+p.y)/300)*20;
      g.addColorStop(0, `hsla(${hue}, 80%, 60%, ${p.alpha})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r*6, 0, Math.PI*2); ctx.fill();
    }
  }

  let rafId;
  function loop(){ draw(); rafId = requestAnimationFrame(loop); }

  function init(){ resize(); particles.length=0; make(); if(rafId) cancelAnimationFrame(rafId); loop(); }
  window.addEventListener('resize', resize);
  // gentle hue sync with CSS accent if available
  const acc = getComputedStyle(document.documentElement).getPropertyValue('--accent');
  if(acc){
    // try to parse rgb from #RRGGBB or rgb(...)
    const v = acc.trim();
    if(v.startsWith('#') && v.length===7){
      const r = parseInt(v.slice(1,3),16), g=parseInt(v.slice(3,5),16), b=parseInt(v.slice(5,7),16);
      const mx = Math.max(r,g,b), mn=Math.min(r,g,b);
      const hue = Math.round( Math.atan2( Math.sqrt(3)*(g-b), 2*r - g - b ) * 180/Math.PI );
      cfg.hue = (hue+360)%360;
    }
  }

  // ensure canvas fills on load
  requestAnimationFrame(()=>{ resize(); init(); });
})();
