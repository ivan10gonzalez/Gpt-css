let me=null;
const fmt=n=>Number(n||0).toLocaleString('es-AR');
async function j(u,o){const r=await fetch(u,o),d=await r.json();if(!r.ok)throw Error(d.error||'Error');return d}
async function boot(){me=(await j('/api/session')).user;if(!me||me.role!=='player')return location.href='/';playerName.textContent=me.full_name;refresh()}
async function refresh(){me=(await j('/api/session')).user;playerBalance.textContent=fmt(me.balance);const d=await j('/api/me/ledger');playerLedger.innerHTML=d.ledger.map(x=>`<div class="timeline-item"><div><b>${x.note}</b><br><small>${new Date(x.created_at+'Z').toLocaleString('es-AR')}</small></div><strong>${x.kind==='credit'?'+':'-'}${fmt(x.amount)}</strong></div>`).join('')}
async function play(bet){try{const d=await j('/api/demo/game',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({bet})});gameMsg.style.color=d.delta>=0?'#1c9b68':'#c12638';gameMsg.textContent=`${d.outcome}. Cambio: ${d.delta>=0?'+':''}${fmt(d.delta)} créditos virtuales.`;refresh()}catch(e){gameMsg.textContent=e.message}}
async function logout(){await j('/api/logout',{method:'POST'});location.href='/'}
boot().catch(()=>location.href='/');
