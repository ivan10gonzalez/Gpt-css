import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
// Explicit local/review opt-in. Never modify or reset an existing database.
if(process.env.DEMO_MODE!=='true'||process.env.NODE_ENV==='production'||!process.env.DATA_DIR){
 console.error('Requiere DEMO_MODE=true, DATA_DIR explícito y NODE_ENV distinto de production. Usá una base nueva de demostración.');process.exit(1);
}
const folder=path.resolve(process.env.DATA_DIR),file=path.join(folder,'universe.db');
fs.mkdirSync(folder,{recursive:true});
try{fs.closeSync(fs.openSync(file,'wx'))}catch{console.error('La base ya existe. No se modificaron usuarios ni datos. Elegí un DATA_DIR nuevo.');process.exit(1)}
const db=new Database(file);
db.exec(`CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT,username TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('master','agent','player','cashier')),full_name TEXT NOT NULL,email TEXT DEFAULT '',balance INTEGER NOT NULL DEFAULT 0,active INTEGER NOT NULL DEFAULT 1,avatar_data TEXT DEFAULT '',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
db.exec("CREATE TABLE demo_environment(id INTEGER PRIMARY KEY CHECK(id=1),name TEXT NOT NULL);INSERT INTO demo_environment VALUES(1,'BRAVO_REVIEW_DEMO')");
const insert=db.prepare('INSERT INTO users(username,password_hash,role,full_name,balance) VALUES(?,?,?,?,?)');
insert.run('demo_admin',bcrypt.hashSync('BravoPanel!26',10),'master','Administración demo',0);
insert.run('demo_jugador',bcrypt.hashSync('BravoJuega!26',10),'player','Jugador demo',50000);
db.close();console.log('Base demo nueva preparada: demo_admin y demo_jugador. No se modificaron bases existentes.');
