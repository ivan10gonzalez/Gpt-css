import bcrypt from 'bcryptjs';

// Public test accounts, explicitly authorized for this virtual-credit model.
// Only INSERTs: never reset, unblock, re-role or refill an existing account.
export const demoAccounts = [
 {username:'demo_jugador',password:'BravoJuega!26',role:'player',name:'Jugador demo',balance:50000},
 {username:'demo_admin',password:'BravoPanel!26',role:'master',name:'Administración demo',balance:0}
];

export function provisionDemoAccounts(db, log=console.log){
 const result=db.transaction(()=>demoAccounts.map(account=>{
  const existing=db.prepare('SELECT * FROM users WHERE username=?').get(account.username);
  if(existing){
   const matches=existing.role===account.role&&existing.active===1&&bcrypt.compareSync(account.password,existing.password_hash);
   return {username:account.username,status:matches?'existing':'conflict'};
  }
  const created=db.prepare('INSERT INTO users(username,password_hash,role,full_name,balance) VALUES(?,?,?,?,?)')
   .run(account.username,bcrypt.hashSync(account.password,10),account.role,account.name,account.balance);
  if(account.balance)db.prepare('INSERT INTO ledger(user_id,actor_id,kind,amount,note) VALUES(?,NULL,?,?,?)')
   .run(created.lastInsertRowid,'credit',account.balance,'Saldo inicial de cuenta demo');
  return {username:account.username,status:'created'};
 }))();
 for(const item of result)log(`[BRAVO demo] ${item.username}: ${item.status==='created'?'creada':item.status==='existing'?'ya disponible, sin cambios':'CONFLICTO: cuenta existente conservada; no se cambió contraseña, rol, bloqueo ni saldo'}`);
 return result;
}
