/* Configure the admin password here */
const ADMIN_PASSWORD = 'admin123';

const qs = sel => document.querySelector(sel);

function showAdmin() {
  qs('#login-view').classList.add('hidden');
  qs('#admin-view').classList.remove('hidden');
}

function logout(){
  qs('#login-view').classList.remove('hidden');
  qs('#admin-view').classList.add('hidden');
  qs('#password').value='';
}

async function loadPics() {
  try {
    const res = await fetch('pics/index.json');
    const pics = await res.json();
    [1,2,3].forEach(i=>{
      const sel = qs('#hero-'+i);
      sel.innerHTML = '';
      pics.forEach(p=>{
        const opt = document.createElement('option'); opt.value = p; opt.textContent = p; sel.appendChild(opt);
      });
    });
  } catch (e) {
    console.warn('Could not load pics/index.json', e);
  }
}

function applyFromForm() {
  const data = {
    intro: qs('#admin-intro').value,
    subtext: qs('#admin-subtext').value,
    skills: qs('#admin-skills').value.split(',').map(s=>s.trim()).filter(Boolean),
    images: [qs('#hero-1').value, qs('#hero-2').value, qs('#hero-3').value],
    colors: {
      '--bg': qs('#color-bg').value,
      '--surface': qs('#color-surface').value,
      '--accent': qs('#color-accent').value,
      '--accent-2': qs('#color-accent-2').value,
      '--text': qs('#color-text').value,
    }
  };
  // apply to current page
  window.localStorage.setItem('siteAdminData', JSON.stringify(data));
  window.location.reload();
}

function fillFormFromStorage(){
  const raw = window.localStorage.getItem('siteAdminData');
  if(!raw) return;
  const data = JSON.parse(raw);
  qs('#admin-intro').value = data.intro || '';
  qs('#admin-subtext').value = data.subtext || '';
  qs('#admin-skills').value = (data.skills||[]).join(', ');
  if(data.images){ qs('#hero-1').value = data.images[0] || ''; qs('#hero-2').value = data.images[1] || ''; qs('#hero-3').value = data.images[2] || ''; }
  if(data.colors){ Object.entries(data.colors).forEach(([k,v])=>{ try{ const id = k==='--bg'?'#color-bg':k==='--surface'?'#color-surface':k==='--accent'?'#color-accent':k==='--accent-2'?'#color-accent-2':'#color-text'; qs(id).value=v }catch(e){} }); }
}

document.addEventListener('DOMContentLoaded', async ()=>{
  qs('#login').addEventListener('click', ()=>{
    const val = qs('#password').value;
    if(val === ADMIN_PASSWORD){ showAdmin(); loadPics().then(fillFormFromStorage); } else { alert('Incorrect password'); }
  });
  qs('#logout').addEventListener('click', ()=>{ logout(); });
  qs('#apply').addEventListener('click', ()=>{ applyFromForm(); });
  qs('#save').addEventListener('click', ()=>{ applyFromForm(); alert('Saved to localStorage'); });
  await loadPics(); fillFormFromStorage();
});
