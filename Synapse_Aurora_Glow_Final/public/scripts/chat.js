const API_BASE = localStorage.getItem('synapse_api') || 'http://127.0.0.1:8000';
const feed = document.getElementById('feed');
const input = document.getElementById('prompt');
const send = document.getElementById('send');
const fileEl = document.getElementById('file');
const greetName = localStorage.getItem('synapse_name') || 'there';

function add(text, who='user', glow=false){
  const d=document.createElement('div'); d.className='bubble '+who; d.style.width='fit-content'; d.textContent=text;
  if(glow) d.classList.add('glow');
  feed.appendChild(d); feed.scrollTop=feed.scrollHeight;
}
function type(text){
  const d=document.createElement('div'); d.className='bubble ai glow'; d.style.width='fit-content'; feed.appendChild(d);
  let i=0; const t=setInterval(()=>{ d.textContent=text.slice(0,++i); feed.scrollTop=feed.scrollHeight; if(i>=text.length) clearInterval(t); }, 12);
}

window.addEventListener('DOMContentLoaded', ()=>{ type(`Hey ${greetName}, how about we make this the easiest part of your day? Drop a topic or upload notes.`); });

send.addEventListener('click', async ()=>{
  const q=input.value.trim(); if(!q) return; input.value=''; add(q,'user');
  const fd = new FormData(); fd.append('query', q);
  try{
    const r = await fetch(`${API_BASE}/chat`, { method:'POST', body: fd });
    const j = await r.json();
    type(j.reply || '(No reply)');
  }catch(err){
    type('(Error) '+err.message);
  }
});

fileEl.addEventListener('change', async (e)=>{
  const f=e.target.files?.[0]; if(!f) return; add('Uploaded: '+f.name,'user');
  const fd = new FormData(); fd.append('file', f);
  try{
    const r = await fetch(`${API_BASE}/analyze`, { method:'POST', body: fd });
    const j = await r.json();
    if(j.summary) type('Summary: '+j.summary);
    if(Array.isArray(j.flashcards)) type('Flashcards created: '+j.flashcards.length);
  }catch(err){
    type('(Upload error) '+err.message);
  }
});
