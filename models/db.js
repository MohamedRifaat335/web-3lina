// models/db.js
const mysql = require('mysql2/promise');

// إعدادات الاتصال بقاعدة البيانات
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'gtav2018#', // غيّرها إذا مختلفة عندك
  database: 'library_db',  // تأكد أن اسم قاعدة البيانات صحيح
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool; // نصدر الـ pool ليتم استخدامه في باقي الملفات
