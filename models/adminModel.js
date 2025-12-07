const db = require('./db');

// get admin by email + password (simple login – no hashing yet remember to add it :)
async function getAdminByCredentials(email, password) {
  const [rows] = await db.query(
    'SELECT * FROM Admin WHERE Email = ? AND Password = ?',
    [email, password]
  );
  return rows[0];
}

// optional: list all admins
async function getAllAdmins() {
  const [rows] = await db.query('SELECT * FROM Admin');
  return rows;
}

// optional: create new admin
async function createAdmin(admin) {
  const sql = `
    INSERT INTO Admin (Name, Email, Password)
    VALUES (?, ?, ?)
  `;
  const params = [admin.Name, admin.Email, admin.Password];
  const [result] = await db.query(sql, params);
  return result.insertId;
}

module.exports = {
  getAdminByCredentials,
  getAllAdmins,
  createAdmin,
};
