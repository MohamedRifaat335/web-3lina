const db = require('./db');

// 1. get all books (العرض: يحسب الحالة والعدد ديناميكياً) -> يحل مشكلة الهوم
async function getAllBooks() {
  const sql = `
    SELECT 
        b.*,
        (SELECT COUNT(*) FROM Book_Copy bc 
         WHERE bc.Book_ID = b.Book_ID 
         AND bc.Availability_State = 'Available') AS Available_Copies,

        IF(
            (SELECT COUNT(*) FROM Book_Copy bc 
             WHERE bc.Book_ID = b.Book_ID 
             AND bc.Availability_State = 'Available') > 0,
            'Available',
            'Unavailable'
        ) AS Availability_State
    FROM Book b
  `;
  const [rows] = await db.query(sql);
  return rows;
}

// 2. get by id (العرض: يحسب الحالة والعدد للكتاب الواحد) -> يحل مشكلة التفاصيل
async function getBookById(id) {
  const sql = `
    SELECT 
        b.*,
        (SELECT COUNT(*) FROM Book_Copy bc 
         WHERE bc.Book_ID = b.Book_ID 
         AND bc.Availability_State = 'Available') AS Available_Copies,

        IF(
            (SELECT COUNT(*) FROM Book_Copy bc 
             WHERE bc.Book_ID = b.Book_ID 
             AND bc.Availability_State = 'Available') > 0,
            'Available',
            'Unavailable'
        ) AS Availability_State
    FROM Book b
    WHERE b.Book_ID = ?
  `;
  const [rows] = await db.query(sql, [id]);
  return rows[0];
}

// 3. create new book (الإضافة: ينشئ الكتاب + يولد النسخ تلقائياً) -> يحل مشكلة الكتب الجديدة تطلع unavailable
async function createBook(book) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // أ. إضافة الكتاب
    const sqlBook = `
      INSERT INTO Book (Title, Author, ISBN, Year_of_Publication, Category, Admin_ID, Total_Copies, Description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    // ملاحظة: لا نرسل Available_Copies هنا لأننا لا نخزنه، بل نحسبه
    const paramsBook = [
      book.Title, book.Author, book.ISBN, book.Year_of_Publication || null,
      book.Category, book.Admin_ID || null, book.Total_Copies, book.Description || null
    ];
    const [result] = await connection.query(sqlBook, paramsBook);
    const newBookId = result.insertId;

    // ب. توليد النسخ في جدول Book_Copy
    for (let i = 1; i <= book.Total_Copies; i++) {
        await connection.query(
            'INSERT INTO Book_Copy (Book_ID, Copy_Number, Availability_State) VALUES (?, ?, ?)',
            [newBookId, i, 'Available']
        );
    }

    await connection.commit();
    return newBookId;

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// 4. update book (تحديث البيانات الأساسية)
async function updateBook(id, book) {
  const sql = `
    UPDATE Book
    SET Title = ?, Author = ?, ISBN = ?, Year_of_Publication = ?, Category = ?, Total_Copies = ?, Description = ?
    WHERE Book_ID = ?
  `;
  const params = [
    book.Title, book.Author, book.ISBN, book.Year_of_Publication,
    book.Category, book.Total_Copies, book.Description || null, id
  ];
  await db.query(sql, params);
}

// 5. delete book (الحذف: يحذف النسخ أولاً لتجنب الأخطاء) -> يحل مشكلة الـ Foreign Key Error
async function deleteBook(id) {
  // حذف الاستعارات المرتبطة (إن وجدت)
  await db.query('DELETE FROM Borrowing WHERE Book_ID = ?', [id]);
  // حذف النسخ
  await db.query('DELETE FROM Book_Copy WHERE Book_ID = ?', [id]);
  // حذف الكتاب
  await db.query('DELETE FROM Book WHERE Book_ID = ?', [id]);
}

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};