import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import Database from 'better-sqlite3';
if(process.env.DEMO_MODE!=='true'||process.env.NODE_ENV==='production'||!process.env.DATA_DIR){
 console.error('Demo requiere DEMO_MODE=true, DATA_DIR explícito y NODE_ENV distinto de production.');process.exit(1);
}
const file=path.join(path.resolve(process.env.DATA_DIR),'universe.db');
if(!fs.existsSync(file)){
 const seed=spawnSync(process.execPath,[fileURLToPath(new URL('./seed-demo.mjs',import.meta.url))],{env:process.env,stdio:'inherit'});
 if(seed.status!==0)process.exit(seed.status||1);
}else{
 // Only reopen a database explicitly created for this demonstration.
 let db;try{db=new Database(file,{readonly:true});if(db.prepare('SELECT name FROM demo_environment WHERE id=1').get()?.name!=='BRAVO_REVIEW_DEMO')throw Error();}
 catch{console.error('DATA_DIR contiene una base ajena a la demo. No se modificó. Elegí otra carpeta.');process.exit(1)}finally{db?.close()}
}
await import('../server.js');
