/**
 * Export et test de la connexion à la base de données MySQL
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

function readDatabaseUserPassword(secretFile) {

    try {
        const secretPath = path.join(secretFile);
        return fs.readFileSync(secretPath, 'utf8').trim();
    } catch{
        throw new Error('Impossible de se connecter à la base de données. Merci de ré-essayer plus tard.');
    }
}

const dsn = {
    host: process.env.MYSQL_HOST,
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: readDatabaseUserPassword(process.env.MYSQL_ROOT_PASSWORD_FILE),
    waitForConnections: true,
    connectionLimit: 5, 
    queueLimit: 0,
};


//On ouvre un pool de connexion réutilisable
const connexion = mysql.createPool(dsn);

/**
 * Une simple fonction test de la connexion à MySQL
 */
// async function testConnexion() {
//     const [res] = await connexion.execute('SELECT ? + ? AS solution', [1, 2]);
//     console.log(res);
// }
// testConnexion();

module.exports = { connexion };
