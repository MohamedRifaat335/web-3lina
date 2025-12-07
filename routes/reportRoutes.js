// routes/reportRoutes.js
const express = require('express');
//const ExcelJS = require('exceljs');
const router = express.Router();

const reportModel = require('../models/reportModel');

// Helper: إرسال Workbook مباشرة كملف للتحميل
async function sendWorkbook(res, workbook, filename) {
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${filename}"`
  );
  await workbook.xlsx.write(res);
  res.end();
}

// Helper: إنشاء Worksheet
function createSheet(workbook, sheetName, headers, rows) {
  const ws = workbook.addWorksheet(sheetName);
  ws.columns = headers.map(h => ({
    header: h,
    key: h,
    width: 20
  }));
  rows.forEach(r => ws.addRow(r));
  ws.getRow(1).font = { bold: true };
  return ws;
}

// ====== Excel Reports ====== //

// 1) Most Borrowed Books
router.get('/most-borrowed', async (req, res) => {
  try {
    const data = await reportModel.getMostBorrowedBooksLast30Days();
    const workbook = new ExcelJS.Workbook();
    createSheet(
      workbook,
      'Most Borrowed Books',
      ['Book_ID', 'Title', 'Author', 'Borrow_Count'],
      data.map(row => ({
        Book_ID: row.Book_ID,
        Title: row.Title,
        Author: row.Author,
        Borrow_Count: row.borrow_count
      }))
    );
    await sendWorkbook(res, workbook, 'MostBorrowedBooks_Last30Days.xlsx');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// 2) Member Activity
router.get('/member-activity', async (req, res) => {
  try {
    const data = await reportModel.getMemberActivityLast30Days();
    const workbook = new ExcelJS.Workbook();
    createSheet(
      workbook,
      'Member Activity',
      ['Mem_ID', 'Name', 'Total_Borrowings'],
      data.map(row => ({
        Mem_ID: row.Mem_ID,
        Name: row.Name,
        Total_Borrowings: row.total_borrowings
      }))
    );
    await sendWorkbook(res, workbook, 'MemberActivity_Last30Days.xlsx');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// 3) Active Reservations
router.get('/active-reservations', async (req, res) => {
  try {
    const data = await reportModel.getActiveReservationsLast30Days();
    const workbook = new ExcelJS.Workbook();
    createSheet(
      workbook,
      'Active Reservations',
      ['Reservation_ID', 'Mem_ID', 'Member_Name', 'Book_ID', 'Book_Title', 'Status', 'Available_On'],
      data.map(row => ({
        Reservation_ID: row.Reservation_ID,
        Mem_ID: row.Mem_ID,
        Member_Name: row.member_name,
        Book_ID: row.Book_ID,
        Book_Title: row.book_title,
        Status: row.Status,
        Available_On: row.Available_On
      }))
    );
    await sendWorkbook(res, workbook, 'ActiveReservations_Last30Days.xlsx');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// 4) Collected Fines
router.get('/collected-fines', async (req, res) => {
  try {
    const data = await reportModel.getCollectedFinesLast30Days();
    const workbook = new ExcelJS.Workbook();
    createSheet(
      workbook,
      'Collected Fines',
      ['Mem_ID', 'Name', 'Total_Fine_Collected', 'Fines_Count'],
      data.map(row => ({
        Mem_ID: row.Mem_ID,
        Name: row.Name,
        Total_Fine_Collected: row.total_fine_collected,
        Fines_Count: row.fines_count
      }))
    );
    await sendWorkbook(res, workbook, 'CollectedFines_Last30Days.xlsx');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});


/////////////////////////////////////////

/* // routes/reportRoutes.js
const express = require('express');
const router = express.Router();

// 💡 يجب التأكد أن هذا المسار صحيح في بيئة التشغيل لديك
const reportModel = require('../models/reportModel'); 

// Helper: تحويل مصفوفة البيانات إلى نص CSV
function convertToCsv(data, headers) {
    if (!data || data.length === 0) {
        // إذا كانت البيانات فارغة، أرسل سطر الرؤوس فقط
        return headers.join(',') + '\n';
    }

    // 1. إنشاء سطر الرؤوس (Headers)
    const headerLine = headers.join(',');
    
    // 2. إنشاء سطور البيانات
    const dataLines = data.map(row => {
        const values = headers.map(header => {
            // الوصول للقيمة باستخدام الـ Key (اسم العمود في قاعدة البيانات)
            let value = row[header] !== undefined ? row[header] : '';

            // معالجة القيم النصية التي قد تكسر تنسيق CSV (فواصل، أسطر جديدة، علامات تنصيص)
            if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
                // وضع علامات تنصيص حول القيمة والهروب من علامات التنصيص المزدوجة داخل القيمة
                value = `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        return values.join(',');
    });

    return headerLine + '\n' + dataLines.join('\n');
}

// Helper: إرسال محتوى CSV مباشرة كملف للتحميل
function sendCsv(res, csvContent, filename) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
}

// ====== CSV Reports ====== //

// 1) Most Borrowed Books
router.get('/most-borrowed', async (req, res) => {
  try {
    const data = await reportModel.getMostBorrowedBooksLast30Days();
    // يجب أن تتطابق أسماء الأعمدة هنا مع الـ Keys التي تعيدها استعلامات SQL
    const headers = ['Book_ID', 'Title', 'Author', 'borrow_count']; 
    const csvContent = convertToCsv(data, headers);
    sendCsv(res, csvContent, 'MostBorrowedBooks_Last30Days.csv');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// 2) Member Activity
router.get('/member-activity', async (req, res) => {
  try {
    const data = await reportModel.getMemberActivityLast30Days();
    const headers = ['Mem_ID', 'Name', 'total_borrowings'];
    const csvContent = convertToCsv(data, headers);
    sendCsv(res, csvContent, 'MemberActivity_Last30Days.csv');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// 3) Active Reservations
router.get('/active-reservations', async (req, res) => {
  try {
    const data = await reportModel.getActiveReservationsLast30Days();
    const headers = ['Reservation_ID', 'Mem_ID', 'member_name', 'Book_ID', 'book_title', 'Status', 'Available_On'];
    const csvContent = convertToCsv(data, headers);
    sendCsv(res, csvContent, 'ActiveReservations_Last30Days.csv');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// 4) Collected Fines
router.get('/collected-fines', async (req, res) => {
  try {
    const data = await reportModel.getCollectedFinesLast30Days();
    const headers = ['Mem_ID', 'Name', 'total_fine_collected', 'fines_count'];
    const csvContent = convertToCsv(data, headers);
    sendCsv(res, csvContent, 'CollectedFines_Last30Days.csv');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// ====== Dashboard Stats (هذا القسم يبقى كما هو) ======
router.get('/dashboard/stats', async (req, res) => {
  try {
    const mostBorrowed = await reportModel.getMostBorrowedBooksLast30Days();
    const activeMembers = await reportModel.getMemberActivityLast30Days();
    const activeReservations = await reportModel.getActiveReservationsLast30Days();
    const collectedFines = await reportModel.getCollectedFinesLast30Days();

    res.json({
      mostBorrowedBook: mostBorrowed[0] || { Title: '-', borrow_count: 0 },
      activeMembers: activeMembers.length,
      activeReservations: activeReservations.length,
      collectedFines: collectedFines.reduce((sum, f) => sum + (f.total_fine_collected || 0), 0)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router;*/
