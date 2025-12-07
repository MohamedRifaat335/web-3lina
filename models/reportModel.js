const db = require('./db');


// Most borrowed books (all time, top 10)
async function getMostBorrowedBooks() {
  const [rows] = await db.query(`
    SELECT 
      b.Book_ID,
      b.Title,
      b.Author,
      COUNT(br.Borrow_ID) AS borrow_count
    FROM Borrowing br
    JOIN Book b ON br.Book_ID = b.Book_ID
    GROUP BY b.Book_ID, b.Title, b.Author
    ORDER BY borrow_count DESC
    LIMIT 10
  `);
  return rows;
}

// Borrow history for one member (all time)
async function getMemberBorrowHistory(memberId) {
  const [rows] = await db.query(`
    SELECT 
      br.Borrow_ID,
      br.Borrow_Date,
      br.Due_Date,
      br.Return_Date,
      br.Fine,
      b.Title,
      b.Author
    FROM Borrowing br
    JOIN Book b ON br.Book_ID = b.Book_ID
    WHERE br.Mem_ID = ?
    ORDER BY br.Borrow_Date DESC
  `, [memberId]);
  return rows;
}


// New aggregated reports (last 30 days)

// 1) Most Borrowed Books - last 30 days
async function getMostBorrowedBooksLast30Days() {
  const [rows] = await db.query(`
    SELECT 
      b.Book_ID,
      b.Title,
      b.Author,
      COUNT(br.Borrow_ID) AS borrow_count
    FROM Borrowing br
    JOIN Book b ON br.Book_ID = b.Book_ID
    WHERE br.Borrow_Date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    GROUP BY b.Book_ID, b.Title, b.Author
    ORDER BY borrow_count DESC
  `);
  return rows;
}

// 2) Member Activity - borrow count per member, last 30 days
async function getMemberActivityLast30Days() {
  const [rows] = await db.query(`
    SELECT 
      m.Mem_ID,
      m.Name,
      COUNT(br.Borrow_ID) AS total_borrowings
    FROM Member m
    JOIN Borrowing br ON m.Mem_ID = br.Mem_ID
    WHERE br.Borrow_Date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    GROUP BY m.Mem_ID, m.Name
    ORDER BY total_borrowings DESC
  `);
  return rows;
}

// 3) Active Reservations - last 30 days (Active/Fulfilled)
async function getActiveReservationsLast30Days() {
  const [rows] = await db.query(`
    SELECT 
      r.Reservation_ID,
      r.Mem_ID,
      m.Name AS member_name,
      r.Book_ID,
      b.Title AS book_title,
      r.Status,
      r.Available_On
    FROM Reservation r
    JOIN Member m ON r.Mem_ID = m.Mem_ID
    JOIN Book b ON r.Book_ID = b.Book_ID
    WHERE r.Status IN ('Active', 'Fulfilled')
      AND r.Reservation_Date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    ORDER BY r.Available_On ASC
  `);
  return rows;
}

// 4) Collected Fines - sum per member, last 30 days
async function getCollectedFinesLast30Days() {
  const [rows] = await db.query(`
    SELECT 
      m.Mem_ID,
      m.Name,
      SUM(br.Fine) AS total_fine_collected,
      COUNT(br.Borrow_ID) AS fines_count
    FROM Member m
    JOIN Borrowing br ON m.Mem_ID = br.Mem_ID
    WHERE br.Fine_Paid = 1
      AND br.Return_Date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    GROUP BY m.Mem_ID, m.Name
    HAVING total_fine_collected IS NOT NULL
    ORDER BY total_fine_collected DESC
  `);
  return rows;
}

module.exports = {
  // old
  getMostBorrowedBooks,
  getMemberBorrowHistory,

  // new
  getMostBorrowedBooksLast30Days,
  getMemberActivityLast30Days,
  getActiveReservationsLast30Days,
  getCollectedFinesLast30Days,
};
