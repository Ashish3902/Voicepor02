// Mobile menu
const burger = document.getElementById('hamburger');
const menu = document.getElementById('menu');
burger?.addEventListener('click', ()=> menu.classList.toggle('show'));

// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const target = document.querySelector(a.getAttribute('href'));
    if(target){
      e.preventDefault();
      target.scrollIntoView({behavior:'smooth'});
      menu.classList.remove('show');
    }
  });
});

// Local storage helpers
const KEY='ankit_voice_demos_v1';
const getDemos=()=>{ try{return JSON.parse(localStorage.getItem(KEY))||[]}catch{return[]} };
const setDemos=(d)=>localStorage.setItem(KEY,JSON.stringify(d));

// Render cards
function render(filter='all'){
  const list = getDemos();
  const data = filter==='all' ? list : list.filter(x=>x.category===filter);
  const grid = document.getElementById('demoGrid');
  grid.innerHTML = data.map(x=>`
    <article class="demo glass">
      <div class="demo-head">
        <div>
          <div class="title">${x.title}</div>
          <div class="meta">${new Date(x.createdAt).toLocaleDateString()} • <span class="badge">${x.category}</span></div>
        </div>
        <div class="controls">
          <button class="icon-btn" onclick="playDemo('${x.id}')"><i class="fa-solid fa-play"></i></button>
          <button class="icon-btn" onclick="downloadDemo('${x.id}')"><i class="fa-solid fa-download"></i></button>
          <button class="icon-btn" onclick="deleteDemo('${x.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
      <audio id="aud-${x.id}" src="${x.url}" controls preload="metadata"></audio>
      <div class="meta">${x.desc||''}</div>
      <div class="meta">${x.tags?.join(', ')||''}</div>
    </article>
  `).join('');
}

// Upload flow
document.getElementById('uploadBtn')?.addEventListener('click', ()=>{
  const files = document.getElementById('fileInput').files;
  const title = document.getElementById('demoTitle').value.trim() || 'Untitled Demo';
  const category = document.getElementById('demoCategory').value;
  const tags = document.getElementById('demoTags').value.split(',').map(s=>s.trim()).filter(Boolean);
  const desc = document.getElementById('demoDesc').value.trim();
  if(!files.length){ alert('Choose at least one audio file.'); return; }

  const demos = getDemos();
  [...files].forEach(f=>{
    const id = crypto.randomUUID();
    const url = URL.createObjectURL(f);
    demos.unshift({id,title,category,tags,desc,url,createdAt:Date.now(),name:f.name,size:f.size,type:f.type});
  });
  setDemos(demos);
  document.getElementById('fileInput').value='';
  document.getElementById('demoTitle').value='';
  document.getElementById('demoTags').value='';
  document.getElementById('demoDesc').value='';
  render(document.querySelector('.chip.active')?.dataset.filter||'all');
});

// Controls
window.playDemo = (id)=>{
  const audio = document.getElementById(`aud-${id}`);
  if(!audio) return;
  document.querySelectorAll('audio').forEach(a=>{ if(a!==audio) a.pause(); });
  audio.play();
};
window.downloadDemo = (id)=>{
  const item = getDemos().find(x=>x.id===id);
  if(!item) return;
  const a = document.createElement('a');
  a.href = item.url; a.download = item.name||'demo';
  document.body.appendChild(a); a.click(); a.remove();
};
window.deleteDemo = (id)=>{
  if(!confirm('Delete this demo?')) return;
  setDemos(getDemos().filter(x=>x.id!==id));
  render(document.querySelector('.chip.active')?.dataset.filter||'all');
};

// Filters
document.querySelectorAll('.chip').forEach(ch=>{
  ch.addEventListener('click', ()=>{
    document.querySelector('.chip.active')?.classList.remove('active');
    ch.classList.add('active');
    render(ch.dataset.filter);
  });
});

// Contact form (demo)
document.getElementById('contactForm')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  alert('Thanks! Message captured locally. Connect backend email service for real delivery.');
});

// On load
document.addEventListener('DOMContentLoaded', ()=> render('all'));
