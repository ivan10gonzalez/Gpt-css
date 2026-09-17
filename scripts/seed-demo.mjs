import {openDatabase} from '../lib/database.mjs';
import {provisionDemoAccounts} from '../lib/demo-accounts.mjs';
// Uses the same DATA_DIR and additive provisioning as npm start.
const db=openDatabase();
try{provisionDemoAccounts(db)}finally{db.close()}
