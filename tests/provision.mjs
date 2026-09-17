import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {fileURLToPath} from 'node:url';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),data=fs.mkdtempSync(path.join(os.tmpdir(),'bravo-provision-'));
const base='http://127.0.0.1:3194';let server,logs='';
async function start(dir,extra={}){
 logs='';const env={...process.env,DATA_DIR:dir,PORT:'3194',NODE_ENV:'production'};delete env.BRAVO_DEMO_ACCOUNTS;Object.assign(env,extra);server=spawn(process.execPath,['server.js'],{cwd:root,env,stdio:['ignore','pipe','pipe']});
 server.stdout.on('data',d=>logs+=d);server.stderr.on('data',d=>logs+=d);
 for(let i=0;i<80;i++){if(server.exitCode!==null)throw Error(logs);try{if((await fetch(base+'/api/health')).ok)return}catch{}await new Promise(r=>setTimeout(r,50))}throw Error('Startup timeout '+logs);
}
async function stop(){const done=once(server,'exit');server.kill();await done;server=null}
async function login(username,password,destination){const r=await fetch(base+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});assert.equal(r.status,200);const body=await r.json();assert.equal(body.redirect,destination);const headers={Cookie:r.headers.get('set-cookie').split(';')[0]};const page=await fetch(base+destination,{headers,redirect:'manual'});assert.equal(page.status,200);assert((await page.text()).includes(destination==='/casino'?'id="lobbyContent"':'id="createForm"'));const entry=await fetch(base+'/',{headers});assert((await entry.text()).includes('id="accessForm"'));return headers}
function snapshot(dir){const db=new Database(path.join(dir,'universe.db'));const rows={users:db.prepare('SELECT * FROM users ORDER BY id').all(),ledger:db.prepare('SELECT * FROM ledger ORDER BY id').all()};db.close();return rows}
try{
 await start(data);await login('demo_jugador','BravoJuega!26','/casino');await login('demo_admin','BravoPanel!26','/admin');assert(logs.includes('creada'));await stop();
 const original=snapshot(data);assert.equal(original.users.length,2);assert.equal(original.ledger.length,1);
 // Existing state: preserve custom users and edited demo balances on restart.
 let db=new Database(path.join(data,'universe.db'));
 db.prepare('INSERT INTO users(username,password_hash,role,full_name,balance) VALUES(?,?,?,?,?)').run('cliente_existente',bcrypt.hashSync('Original!123',10),'player','Cliente existente',98765);
 db.prepare("UPDATE users SET balance=4321 WHERE username='demo_jugador'").run();
 db.prepare("INSERT INTO ledger(user_id,actor_id,kind,amount,note) VALUES(3,NULL,'credit',98765,'Historial existente')").run();db.close();
 const before=snapshot(data);await start(data);await login('demo_jugador','BravoJuega!26','/casino');await login('demo_admin','BravoPanel!26','/admin');await login('cliente_existente','Original!123','/casino');await stop();assert.deepEqual(snapshot(data),before);
 // Existing database with neither demo account: add just the missing accounts.
 const populated=fs.mkdtempSync(path.join(os.tmpdir(),'bravo-populated-'));await start(populated,{BRAVO_DEMO_ACCOUNTS:'false'});await stop();db=new Database(path.join(populated,'universe.db'));db.prepare('INSERT INTO users(username,password_hash,role,full_name,balance) VALUES(?,?,?,?,?)').run('previo',bcrypt.hashSync('Previo!123',10),'master','Personal previo',810);db.close();const preserved=snapshot(populated).users[0];await start(populated);await login('demo_jugador','BravoJuega!26','/casino');await login('demo_admin','BravoPanel!26','/admin');await stop();assert.deepEqual(snapshot(populated).users[0],preserved);assert.equal(snapshot(populated).users.length,3);
 // Conflicting password/role/block must never be reset by provisioning.
 db=new Database(path.join(data,'universe.db'));db.prepare("UPDATE users SET password_hash=?,role='cashier',active=0 WHERE username='demo_admin'").run(bcrypt.hashSync('Conservar!123',10));db.close();const conflict=snapshot(data);await start(data);assert(logs.includes('CONFLICTO'));await stop();assert.deepEqual(snapshot(data),conflict);
 console.log('PASS: production-mode normal server startup provisions empty and existing databases; both credentials log in and redirect correctly; root always login; repeat startup idempotent; balances, ledger, existing users, hashes, roles and blocked/conflicting accounts preserved; explicit opt-out supported.');
}finally{if(server)await stop()}
