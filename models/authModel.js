const db = require('./db');

// member login by email + password
async function getMemberByCredentials(email, password) {
  const [rows] = await db.query(
    'SELECT * FROM Member WHERE Email = ? AND Password = ?',
    [email, password]
  );
  return rows[0];
}

module.exports = { getMemberByCredentials };
