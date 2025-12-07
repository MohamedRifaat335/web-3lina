const db = require('./db');

// Get all members
async function getAllMembers() {
  const [rows] = await db.query('SELECT * FROM Member');
  return rows;
}

// Get one member by ID
async function getMemberById(id) {
  const [rows] = await db.query('SELECT * FROM Member WHERE Mem_ID = ?', [id]);
  return rows[0];
}

// Create new member
async function createMember(member) {
  const sql = `
    INSERT INTO Member (Name, Email, Password, Phone, Address)
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [
    member.Name,
    member.Email,
    member.Password,
    member.Phone || null,
    member.Address || null,
  ];
  const [result] = await db.query(sql, params);
  return result.insertId;
}

// Update member
async function updateMember(id, member) {
  const sql = `
    UPDATE Member
    SET Name = ?, Email = ?, Password = ?, Phone = ?, Address = ?
    WHERE Mem_ID = ?
  `;
  const params = [
    member.Name,
    member.Email,
    member.Password,
    member.Phone || null,
    member.Address || null,
    id,
  ];
  await db.query(sql, params);
}

// Delete member
async function deleteMember(id) {
  await db.query('DELETE FROM Member WHERE Mem_ID = ?', [id]);
}

module.exports = {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
};
