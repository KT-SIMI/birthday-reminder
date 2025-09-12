const admin = require("firebase-admin")
require("dotenv").config();

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

// if (serviceAccount.private_key) {
//   serviceAccount.private_key = serviceAccount.private_key.replace(/\\\\n/g, '\n');
// }

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// use admin.auth() everywhere
module.exports = admin;