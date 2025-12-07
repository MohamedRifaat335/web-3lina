const db = require('./db');

// Create a reservation using Book_Copy
async function createReservation(data) {
  // 1) جلب أول نسخة متاحة من Book_Copy
  const [copies] = await db.query(
    `SELECT Copy_Number FROM Book_Copy 
     WHERE Book_ID = ? AND Status = 'Available' LIMIT 1`,
    [data.Book_ID]
  );

  let copyNumber;
  let status;
  let availableOn;

  if (copies.length > 0) {
    copyNumber = copies[0].Copy_Number;
    status = 'Active';
    availableOn = new Date(); // اليوم
  } else {
    // لا توجد نسخة متاحة → حجز Pending
    // هنا نضع Copy_Number = 1 مؤقتاً أو أي منطق تراه مناسب
    copyNumber = 1;
    status = 'Pending';
    availableOn = new Date(Date.now() + 7*24*60*60*1000); 
  }

  const sql = `
    INSERT INTO Reservation (Mem_ID, Book_ID, Copy_Number, Reservation_Date, Available_On, Status)
    VALUES (?, ?, ?, CURDATE(), ?, ?)
  `;
  const params = [data.Mem_ID, data.Book_ID, copyNumber, availableOn, status];
  const [result] = await db.query(sql, params);

  if (status === 'Active') {
    await db.query(
      'UPDATE Book_Copy SET Status = ? WHERE Book_ID = ? AND Copy_Number = ?',
      ['Reserved', data.Book_ID, copyNumber]
    );
  }

  return result.insertId;
}

// List reservations (optionally by member)
async function getReservations(memberId) {
  let rows;
  if (memberId) {
    [rows] = await db.query(
      `SELECT Reservation_ID, Mem_ID, Book_ID, Copy_Number, Reservation_Date, Available_On, Status 
       FROM Reservation WHERE Mem_ID = ?`,
      [memberId]
    );
  } else {
    [rows] = await db.query(
      `SELECT Reservation_ID, Mem_ID, Book_ID, Copy_Number, Reservation_Date, Available_On, Status 
       FROM Reservation`
    );
  }
  return rows;
}

// Update reservation status (e.g. Active / Pending / Completed / Cancelled)
async function updateReservationStatus(id, status) {
  await db.query(
    'UPDATE Reservation SET Status = ? WHERE Reservation_ID = ?',
    [status, id]
  );
}

module.exports = {
  createReservation,
  getReservations,
  updateReservationStatus
};
