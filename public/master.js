let users=[];let me=null;
const fmt=n=>Number(n||0).toLocaleString('es-AR');
async function j(u,o){const r=await fetch(u,o),d=await r.json();if(!r.ok)throw Error(d.error||'Error');return d}
async function boot(){me=(await j('/api/session')).user;if(!me||!['master','agent','cashier'].includes(me.role))return location.href='/';who.textContent=`${me.full_name} · ${me.role}`;show('dashboard');await Promise.all([loadStats(),loadUsers(),loadLedger()])}
function show(id){document.querySelectorAll('.view').forEach(x=>x.classList.toggle('hidden',x.id!==id));document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.view===id))}
document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>{show(b.dataset.view);if(b.dataset.view==='users')loadUsers();if(b.dataset.view==='wallet')populateWallet();if(b.dataset.view==='ledger')loadLedger();if(b.dataset.view==='media')renderMedia()});
async function loadStats(){const s=await j('/api/stats');stats.innerHTML=[['Jugadores',s.players],['Agentes',s.agents],['Activos',s.active],['Volumen ledger',fmt(s.ledgerVolume)]].map(x=>`<div class="stat"><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join('');activityChart.innerHTML=Array.from({length:10},(_,i)=>`<div class="bar" style="height:${30+(i%5)*18}px"></div>`).join('')}
async function loadUsers(){users=(await j('/api/users')).users;renderUsers();populateWallet();renderMedia()}
function renderUsers(){const q=(search?.value||'').toLowerCase();userRows.innerHTML=users.filter(u=>`${u.username} ${u.full_name}`.toLowerCase().includes(q)).map(u=>`<tr><td><b>${u.username}</b></td><td><span class="badge">${u.role}</span></td><td>${u.full_name}</td><td>${fmt(u.balance)}</td><td>${u.active?'Activo':'Bloqueado'}</td><td><button class="ghost" onclick="toggleUser(${u.id},${u.active})">${u.active?'Bloquear':'Activar'}</button></td></tr>`).join('')}
async function toggleUser(id,active){await j(`/api/users/${id}`,{method:'PATCH',body:new URLSearchParams({active:String(!active)})});await loadUsers()}
function populateWallet(){walletUser.innerHTML=users.map(u=>`<option value="${u.id}">${u.username} — ${u.full_name}</option>`).join('');updateWalletBalance()}
walletUser.onchange=updateWalletBalance;
function updateWalletBalance(){const u=users.find(x=>x.id===Number(walletUser.value));selectedBalance.textContent=u?fmt(u.balance):'—'}
async function moveWallet(){try{const d=await j('/api/wallet/transfer',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId:Number(walletUser.value),action:walletAction.value,amount:Number(walletAmount.value),note:walletNote.value})});walletMsg.style.color='#1c9b68';walletMsg.textContent=`Movimiento realizado. Nuevo saldo: ${fmt(d.balance)}`;await loadUsers();await loadLedger()}catch(e){walletMsg.textContent=e.message}}
async function loadLedger(){const d=await j('/api/ledger');ledgerRows.innerHTML=d.ledger.map(x=>`<tr><td>${new Date(x.created_at+'Z').toLocaleString('es-AR')}</td><td>${x.username}</td><td>${x.kind}</td><td>${fmt(x.amount)}</td><td>${x.note}</td></tr>`).join('')}
function renderMedia(){mediaGrid.innerHTML=users.map(u=>`<div class="media-card">${u.avatar_data?`<img src="${u.avatar_data}" alt="">`:`<div class="media-ph">Sin imagen</div>`}<div class="media-name">${u.full_name}</div><small>${u.username} · ${u.role}</small></div>`).join('')}
function openCreate(){createModal.showModal()}
createForm.onsubmit=async e=>{e.preventDefault();try{await j('/api/users',{method:'POST',body:new FormData(e.target)});createModal.close();e.target.reset();createErr.textContent='';await loadUsers();show('users')}catch(err){createErr.textContent=err.message}}
async function logout(){await j('/api/logout',{method:'POST'});location.href='/'}
boot().catch(()=>location.href='/');
