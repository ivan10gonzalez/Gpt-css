const $=id=>document.getElementById(id),fmt=n=>Number(n||0).toLocaleString('es-AR');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function api(u,o){const r=await fetch(u,o),d=await r.json();if(r.status===401){location.replace('/');throw Error('Ingresá para continuar.')}if(!r.ok)throw Error(d.error||'No se pudo completar la solicitud.');return d}
let current='all',site,me,bannerIndex=0;
const groups={casino:'Tragamonedas',live:'Casino en vivo',sports:'Deportes'};
const cards=[['casino','Clásicos','Los favoritos de siempre','classic'],['casino','Aventura','Descubrí nuevos mundos','adventure'],['casino','Frutas','Mucho más color','fruit'],['casino','Fantasía','Dejá volar tu imaginación','fantasy'],['casino','Tesoros','Historias por descubrir','treasure'],['casino','Espacio','Más allá de lo imaginable','space'],['live','Ruleta','El encanto de cada giro','roulette'],['live','Blackjack','Tu lugar en la mesa','blackjack'],['live','Baccarat','Un clásico con estilo','baccarat'],['live','Game shows','Un mundo de sorpresas','shows'],['sports','Fútbol','La pasión que nos une','football'],['sports','Básquet','Viví cada punto','basketball'],['sports','Tenis','Cada set, una historia','tennis'],['sports','Más deportes','Mucho más por vivir','sports']];
function toast(m){$('toast').textContent=m;$('toast').classList.remove('hidden');setTimeout(()=>$('toast').classList.add('hidden'),4000)}
function setCategory(c){if(!site||c!=='all'&&!site.settings.categories[c])return;current=c;bannerIndex=0;$('catalogSearch').value='';render();$('catalog').scrollIntoView({behavior:'smooth',block:'start'})}
const descriptions={casino:['▦','Universo slots','Elegí un mundo. Descubrí tu próxima experiencia.'],live:['♠','El salón en vivo','Los clásicos de las mesas, con otra perspectiva.'],sports:['◎','Pasión por el deporte','Cada cancha tiene su historia. Encontrá la tuya.']};
function render(){
 document.querySelectorAll('[data-category]').forEach(b=>{const c=b.dataset.category;b.classList.toggle('active',c===current);b.setAttribute('aria-pressed',String(c===current));b.hidden=c!=='all'&&!site.settings.categories[c]});
 $('catalogTitle').textContent=current==='all'?'Todo por descubrir':groups[current];
 const q=$('catalogSearch').value.trim().toLocaleLowerCase('es');let count=0;
 $('categoryStage').innerHTML=Object.entries(groups).filter(([key])=>site.settings.categories[key]&&(current==='all'||current===key)).map(([key,title])=>{
 const list=cards.filter(c=>c[0]===key&&c.slice(1,3).join(' ').toLocaleLowerCase('es').includes(q));count+=list.length;if(!list.length)return '';
 const d=descriptions[key];return `<section class="catalog-group ${key}-group"><div class="group-title"><div><h3><span>${d[0]}</span>${d[1]}</h3><p>${d[2]}</p></div>${current==='all'?`<button data-jump="${key}">Ver sección ↗</button>`:''}</div><div class="nx-cards">${list.map(c=>`<button class="nx-card" data-coming="${esc(c[1])}" aria-label="${esc(c[1])}, próximamente"><div class="nx-cover"><img src="/art/${c[3]}.svg" alt="" loading="lazy"><span>PRÓXIMAMENTE</span></div><div class="nx-card-copy"><div><h4>${esc(c[1])}</h4><small>${esc(c[2])}</small></div><b aria-hidden="true">↗</b></div></button>`).join('')}</div></section>`}).join('');
 $('catalogCount').textContent=count+' categorías · Próximamente';$('noResults').classList.toggle('hidden',count>0);renderBanner();
}
const editorial=[{category:'casino',title:'Subí el nivel.<br><em>Cambiá el juego.</em>',tag:'EL UNIVERSO BRAVO',color:'#f7612c',image:'orbit-hero',cta:'Explorar casino'}, {category:'live',title:'La mesa está lista.<br><em>El momento es tuyo.</em>',tag:'EL SALÓN BRAVO',color:'#485ca4',image:'live-hero',cta:'Explorar mesas'}, {category:'sports',title:'Viví tu pasión.<br><em>En otra dimensión.</em>',tag:'BRAVO DEPORTES',color:'#16745e',image:'sport-hero',cta:'Explorar deportes'}];
let heroCategory='casino';
function renderBanner(){
 const banners=site.banners.filter(b=>b.category==='all'||b.category===current);
 const slides=banners.length?banners:editorial.filter(b=>site.settings.categories[b.category]&&(current==='all'||b.category===current));
 const b=slides[bannerIndex%slides.length],custom=banners.length>0;
 $('hero').classList.toggle('custom-banner',custom);$('hero').style.backgroundImage=custom?`linear-gradient(90deg,rgba(12,18,30,.92),rgba(12,18,30,.15)),url("${b.image}")`:'';
 $('hero').style.backgroundColor=custom?'#192337':b?.color||'#f7612c';
 document.querySelector('.bravo-hero-art').style.backgroundImage=custom?'none':`url('/art/${b?.image||'orbit-hero'}.svg')`;
 $('heroTitle').innerHTML=custom?esc(b.title):b?.title||'Todo por descubrir.';
 $('heroSubtitle').textContent=custom?b.subtitle:site.settings.tagline;
 $('heroTag').textContent=custom?'DESTACADO':(b?.tag||'BIENVENIDO').replace('BRAVO',site.settings.name);
 heroCategory=b?.category==='all'?'all':b?.category||'all';
 $('explore').innerHTML=(custom?'Explorar categoría':b?.cta||'Explorar')+' <span>↗</span>';
 document.querySelector('.hero-edition').textContent=slides.length?String(bannerIndex%slides.length+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0'):'';
 $('bannerControls').innerHTML=slides.length>1?'<button id="previousBanner" aria-label="Banner anterior">←</button><button id="nextBanner" aria-label="Banner siguiente">→</button>':'';
 if($('nextBanner')){$('nextBanner').onclick=()=>{bannerIndex++;renderBanner()};$('previousBanner').onclick=()=>{bannerIndex=(bannerIndex+slides.length-1)%slides.length;renderBanner()}}
}
async function refresh(){site=await api('/api/site');document.querySelectorAll('[data-brand]').forEach(x=>x.textContent=site.settings.name);document.title=site.settings.name+' · Casino virtual';document.body.style.setProperty('--accent',site.settings.accent);$('announcement').textContent=site.settings.announcement;$('maintenance').classList.toggle('hidden',!site.settings.maintenance);$('lobbyContent').classList.toggle('hidden',site.settings.maintenance);if(current!=='all'&&!site.settings.categories[current])current='all';render()}
async function account(){me=(await api('/api/session')).user;if(!me?.active){location.replace('/');return false}$('accountActions').innerHTML=`<div class="balance"><small>FICHAS VIRTUALES</small><b>${fmt(me.balance)}</b></div><button class="account-button account-name" id="accountName" title="${esc(me.username)}">${esc(me.username)}</button><button class="account-button logout-button" id="logout">Salir</button>`;$('accountName').onclick=history;$('greeting').textContent=me.full_name||me.username;$('previewNotice').hidden=me.role==='player';$('adminLink').hidden=me.role==='player';$('logout').onclick=async()=>{try{await api('/api/logout',{method:'POST'});location.assign('/')}catch(e){toast(e.message)}};return true}
async function history(){try{const d=await api('/api/me/ledger');$('playerLedger').innerHTML=d.ledger.length?d.ledger.map(x=>`<div class="timeline-item"><div><b>${esc(x.note)}</b><br><small>${new Date(x.created_at+'Z').toLocaleString('es-AR')}</small></div><strong>${x.kind==='credit'?'+':'−'}${fmt(x.amount)}</strong></div>`).join(''):'<p class="muted">Todavía no tenés movimientos.</p>';$('historyDialog').showModal()}catch(e){toast(e.message)}}
document.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>setCategory(b.dataset.category));document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());$('explore').onclick=()=>setCategory(heroCategory);$('historyOpen').onclick=history;$('catalogSearch').oninput=()=>site&&render();$('clearSearch').onclick=()=>{$('catalogSearch').value='';render()};$('categoryStage').onclick=e=>{const jump=e.target.closest('[data-jump]');if(jump)return setCategory(jump.dataset.jump);const b=e.target.closest('[data-coming]');if(b){$('comingTitle').textContent=b.dataset.coming;$('categoryDialog').showModal()}};
async function sync(){if(await account())await refresh()}
sync().catch(e=>toast(e.message));setInterval(()=>sync().catch(()=>{}),30000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync().catch(()=>{})});

window.addEventListener('pageshow',e=>{if(e.persisted)location.reload()});
