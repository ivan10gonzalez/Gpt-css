import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import Database from 'better-sqlite3';
const root=fileURLToPath(new URL('../',import.meta.url));
export function openDatabase(){
 const dataDir=process.env.DATA_DIR||path.join(root,'data');
 fs.mkdirSync(dataDir,{recursive:true});
 const db=new Database(path.join(dataDir,'universe.db'));
 db.pragma('journal_mode = WAL');
 db.exec(`CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT,username TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('master','agent','player','cashier')),full_name TEXT NOT NULL,email TEXT DEFAULT '',balance INTEGER NOT NULL DEFAULT 0,active INTEGER NOT NULL DEFAULT 1,avatar_data TEXT DEFAULT '',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);CREATE TABLE IF NOT EXISTS ledger(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL,actor_id INTEGER,kind TEXT NOT NULL CHECK(kind IN ('credit','debit','adjustment')),amount INTEGER NOT NULL,note TEXT DEFAULT '',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(user_id) REFERENCES users(id));CREATE INDEX IF NOT EXISTS idx_ledger_user ON ledger(user_id);`);
 return db;
}
