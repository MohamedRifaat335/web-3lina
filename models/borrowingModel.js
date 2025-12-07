const db = require('./db');

// create a borrowing (Auto-select available copy)

//Raneem
async function createBorrowing(data) {
  const [availableCopies] = await db.query(
    'SELECT Copy_Number FROM Book_Copy WHERE Book_ID = ? AND Availability_State = "Available" LIMIT 1',
    [data.Book_ID]
  );

  if (availableCopies.length === 0) {
    throw new Error('No copies available');
  }

  const selectedCopy = availableCopies[0].Copy_Number; 
  const sql = `
    INSERT INTO Borrowing (Mem_ID, Book_ID, Copy_Number, Borrow_Date, Due_Date, Fine, Fine_Paid)
    VALUES (?, ?, ?, CURDATE(), ?, 0, 0)
  `;
  
  const params = [
    data.Mem_ID,
    data.Book_ID,
    selectedCopy, 
    data.Due_Date,
  ];
  
  const [result] = await db.query(sql, params);

  await db.query(
    'UPDATE Book_Copy SET Availability_State = ? WHERE Book_ID = ? AND Copy_Number = ?',
    ['Borrowed', data.Book_ID, selectedCopy]
  );
  await db.query(
    'UPDATE Book SET Available_Copies = Available_Copies - 1 WHERE Book_ID = ?',
    [data.Book_ID]
  );

  return result.insertId;
}

// return a book (set return date and auto-calculate fine)
async function returnBorrowing(borrowId, returnDate) {
  // get borrowing + due date
  const [rows] = await db.query(
    'SELECT Book_ID, Copy_Number, Due_Date FROM Borrowing WHERE Borrow_ID = ?',
    [borrowId]
  );
  const b = rows[0];
  if (!b) return;

  const ratePerDay = 20; // fine per late day (change if needed)

  // daysLate = max(0, returnDate - Due_Date)
  const [diffRows] = await db.query(
    'SELECT GREATEST(DATEDIFF(?, ?), 0) AS daysLate',
    [returnDate, b.Due_Date]
  );
  const daysLate = diffRows[0].daysLate;
  const fine = daysLate * ratePerDay;

  // update borrowing record
  await db.query(
    'UPDATE Borrowing SET Return_Date = ?, Fine = ?, Fine_Paid = 0 WHERE Borrow_ID = ?',
    [returnDate, fine, borrowId]
  );

  // mark copy available + increase available copies
  await db.query(
    'UPDATE Book_Copy SET Availability_State = ? WHERE Book_ID = ? AND Copy_Number = ?',
    ['Available', b.Book_ID, b.Copy_Number]
  );
  await db.query(
    'UPDATE Book SET Available_Copies = Available_Copies + 1 WHERE Book_ID = ?',
    [b.Book_ID]
  );

  return { daysLate, fine };
}

// list borrowings (optionally by member)
async function getBorrowings(memberId) {
  if (memberId) {
    const [rows] = await db.query(
      'SELECT * FROM Borrowing WHERE Mem_ID = ?',
      [memberId]
    );
    return rows;
  }
  const [rows] = await db.query('SELECT * FROM Borrowing');
  return rows;
}

// fake payment: mark fine as paid
async function payFine(borrowId) {
  await db.query(
    'UPDATE Borrowing SET Fine_Paid = 1 WHERE Borrow_ID = ?',
    [borrowId]
  );
}

module.exports = {
  createBorrowing,
  returnBorrowing,
  getBorrowings,
  payFine,
};
