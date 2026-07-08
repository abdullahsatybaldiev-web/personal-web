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
    count: 120,
    linkDistance: 200,
    nodeSize: 2.8,
    speed: 0.12,
    hue: 210,
    bgAlpha: 0.03
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

  // Mouse forces: repulsion + curl (bending) for an interactive field
  function applyMouseForces(){
    if(mouse.x === null) return;
    for(const n of nodes){
      const dx = n.x - mouse.x, dy = n.y - mouse.y; const d = Math.sqrt(dx*dx + dy*dy) || 0.0001;
      if(d < mouse.radius){
        const pull = (1 - d / mouse.radius);
        const repel = pull * 2.2; // repulsion strength
        // push away from cursor
        n.vx += (dx / d) * repel;
        n.vy += (dy / d) * repel;
        // add perpendicular curl to bend paths
        const curl = pull * 0.9;
        n.vx += -(dy / d) * curl;
        n.vy += (dx / d) * curl;
      }
      // gentle damping
      n.vx *= 0.985; n.vy *= 0.985;
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
    }

    // apply interactive mouse forces so the network bends around the cursor
    applyMouseForces();

    // draw links and collect neighbors for triangular fills
    const neighbors = new Array(nodes.length);
    for(let i=0;i<nodes.length;i++) neighbors[i]=[];
    for(let i=0;i<nodes.length;i++){
      const a = nodes[i];
      for(let j=i+1;j<nodes.length;j++){
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y; const d = Math.sqrt(dx*dx + dy*dy);
        if(d < cfg.linkDistance){
          const alpha = (1 - d / cfg.linkDistance) * 0.85 * Math.min(a.alpha, b.alpha);
          ctx.strokeStyle = `hsla(${cfg.hue}, 10%, 95%, ${alpha})`;
          ctx.lineWidth = 0.9;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          neighbors[i].push(j);
          neighbors[j].push(i);
        }
      }
    }

    // draw faint triangular fills for nearby neighbor triplets
    for(let i=0;i<nodes.length;i++){
      const a = nodes[i];
      const nb = neighbors[i];
      if(nb.length < 2) continue;
      for(let m=0;m<nb.length;m++){
        for(let nIdx=m+1;nIdx<nb.length;nIdx++){
          const j = nb[m], k = nb[nIdx];
          const b = nodes[j], c = nodes[k];
          // check triangle compactness
          const d1 = Math.hypot(a.x-b.x,a.y-b.y), d2 = Math.hypot(a.x-c.x,a.y-c.y), d3 = Math.hypot(b.x-c.x,b.y-c.y);
          if(d1 < cfg.linkDistance*0.7 && d2 < cfg.linkDistance*0.7 && d3 < cfg.linkDistance*0.9){
            const alpha = 0.02 * Math.min(a.alpha, b.alpha, c.alpha);
            ctx.fillStyle = `hsla(${cfg.hue}, 10%, 95%, ${alpha})`;
            ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.lineTo(c.x,c.y); ctx.closePath(); ctx.fill();
          }
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
