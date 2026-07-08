(() => {
  const canvas = document.getElementById('bg-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, DPR = window.devicePixelRatio || 1;

  function resize(){
    w = canvas.clientWidth || window.innerWidth; h = canvas.clientHeight || window.innerHeight; DPR = window.devicePixelRatio || 1;
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }

  // configuration for a constellation/network effect
  const cfg = {
    count: 80,
    linkDistance: 140,
    nodeSize: 2.2,
    speed: 0.3,
    hue: 210,
    bgAlpha: 0.06
  };

  const nodes = [];
  const mouse = { x: null, y: null, radius: 140 };

  function rand(min, max){ return Math.random()*(max-min)+min }

  function createNodes(){
    nodes.length = 0;
    for(let i=0;i<cfg.count;i++){
      nodes.push({
        x: Math.random()*w,
        y: Math.random()*h,
        vx: rand(-cfg.speed,cfg.speed),
        vy: rand(-cfg.speed,cfg.speed),
        r: cfg.nodeSize * rand(0.7,1.6),
        alpha: rand(0.35,0.9)
      });
    }
  }

  function step(){
    // subtle background overlay to create motion trails
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = `rgba(2,6,12,${cfg.bgAlpha})`;
    ctx.fillRect(0,0,w,h);

    // update nodes
    for(const n of nodes){
      n.x += n.vx; n.y += n.vy;
      if(n.x < -20) n.x = w + 20; if(n.x > w + 20) n.x = -20;
      if(n.y < -20) n.y = h + 20; if(n.y > h + 20) n.y = -20;

      // mouse interaction - mild attraction
      if(mouse.x !== null){
        const dx = mouse.x - n.x; const dy = mouse.y - n.y; const d = Math.sqrt(dx*dx + dy*dy);
        if(d < mouse.radius){
          const f = (1 - d / mouse.radius) * 0.6;
          n.vx += (dx / d) * f * 0.08;
          n.vy += (dy / d) * f * 0.08;
        }
      }
    }

    // draw links
    ctx.beginPath();
    for(let i=0;i<nodes.length;i++){
      const a = nodes[i];
      for(let j=i+1;j<nodes.length;j++){
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y; const d = Math.sqrt(dx*dx + dy*dy);
        if(d < cfg.linkDistance){
          const alpha = (1 - d / cfg.linkDistance) * 0.6 * Math.min(a.alpha, b.alpha);
          ctx.strokeStyle = `hsla(${cfg.hue}, 20%, 80%, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }

    // draw nodes
    for(const n of nodes){
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r*6);
      g.addColorStop(0, `hsla(${cfg.hue}, 80%, 60%, ${n.alpha})`);
      g.addColorStop(0.6, `hsla(${cfg.hue}, 60%, 50%, ${n.alpha*0.25})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r*6, 0, Math.PI*2); ctx.fill();
      // small core
      ctx.fillStyle = `hsla(${cfg.hue}, 60%, 85%, ${n.alpha})`;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI*2); ctx.fill();
    }
  }

  let raf;
  function loop(){ step(); raf = requestAnimationFrame(loop); }

  function init(){ resize(); createNodes(); if(raf) cancelAnimationFrame(raf); loop(); }

  window.addEventListener('resize', ()=>{ resize(); createNodes(); });
  canvas.addEventListener('pointermove', (e)=>{ const rect = canvas.getBoundingClientRect(); mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top; });
  canvas.addEventListener('pointerout', ()=>{ mouse.x = null; mouse.y = null; });

  // optional: sync hue with CSS accent for consistency
  const acc = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  if(acc.startsWith('#') && acc.length===7){
    const r = parseInt(acc.slice(1,3),16), g = parseInt(acc.slice(3,5),16), b = parseInt(acc.slice(5,7),16);
    // convert RGB to H (approx)
    const mx = Math.max(r,g,b), mn = Math.min(r,g,b);
    if(mx !== mn){
      let h;
      if(mx===r) h = (g - b) / (mx - mn);
      else if(mx===g) h = 2 + (b - r) / (mx - mn);
      else h = 4 + (r - g) / (mx - mn);
      h = Math.round((h * 60 + 360) % 360);
      cfg.hue = h;
    }
  }

  // initialize
  requestAnimationFrame(()=>{ init(); });
})();
