// const oracledb = require('oracledb');
// require('dotenv').config();

// oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
// oracledb.autoCommit = true;

// const dbConfig = {
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     connectString: process.env.DB_CONNECT_STRING
// };

// const path = require('path');

// async function initialize() {
//     try {
//         // Set TNS_ADMIN for Thin mode to locate wallet
//         const walletPath = path.join(__dirname, '../../wallet');
//         process.env.TNS_ADMIN = walletPath;

//         await oracledb.createPool({
//             user: dbConfig.user,
//             password: dbConfig.password,
//             connectString: dbConfig.connectString,
//             poolMin: 10,
//             poolMax: 10,
//             poolIncrement: 0,
//             configDir: walletPath,
//             walletLocation: walletPath,
//             walletPassword: process.env.DB_WALLET_PASSWORD
//         });
//         console.log('Oracle Database pool created');
//     } catch (err) {
//         console.error('Error creating database pool', err);
//         process.exit(1);
//     }
// }

// async function close() {
//     try {
//         await oracledb.getPool().close(10);
//         console.log('Oracle Database pool closed');
//     } catch (err) {
//         console.error('Error closing database pool', err);
//     }
// }

// function getPool() {
//     return oracledb.getPool();
// }

// module.exports = {
//     initialize,
//     close,
//     getPool
// };

// Redirect to Mock Database for local development
const mockDatabase = require('./mockDatabase');
module.exports = mockDatabase;
