// Apply persisted admin edits on page load
(function(){
  try{
    const raw = window.localStorage.getItem('siteAdminData');
    if(!raw) return;
    const data = JSON.parse(raw);
    if(data.colors){ Object.entries(data.colors).forEach(([k,v])=>{ document.documentElement.style.setProperty(k, v); }); }
    if(data.intro){ const el = document.getElementById('intro-text'); if(el) el.textContent = data.intro; }
    if(data.subtext){ const el = document.getElementById('subtext'); if(el) el.textContent = data.subtext; }
    if(Array.isArray(data.skills) && data.skills.length>0){
      const container = document.getElementById('skill-highlights');
      if(container){ container.innerHTML = ''; data.skills.forEach(s=>{ const sp=document.createElement('span'); sp.textContent=s; container.appendChild(sp); }); }
    }
    if(Array.isArray(data.images)){
      for(let i=0;i<3;i++){ const id = 'hero-img-'+(i+1); const el=document.getElementById(id); if(el && data.images[i]) el.src = 'pics/'+data.images[i]; }
    }
  }catch(e){ console.warn('site-settings load failed', e); }
})();
