const express = require('express');
const path = require('path');
const cors = require('cors');

// استدعاء Routes
const bookRoutes = require('./routes/bookRoutes');
const memberRoutes = require('./routes/memberRoutes');
const borrowingRoutes = require('./routes/borrowingRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const adminRoutes = require('./routes/adminRoutes');
//const reportRoutes = require('./routes/reportRoutes'); // إذا حبيت تستخدم Excel
const authRoutes = require('./routes/authRoutes');

// استدعاء قاعدة البيانات
const pool = require('./models/db'); // يجب أن يكون هذا مسار صحيح

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// تقديم ملفات Frontend من مجلد Public
app.use(express.static(path.join(__dirname, 'Public')));

// رسالة اختبار السيرفر
app.get('/', (req, res) => {
  res.json({ message: 'Library API running' });
});

// اختبار الاتصال بقاعدة البيانات (اختياري)
async function testDB() {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM Member'); 
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح! Total members:', rows[0].total);
  } catch (err) {
    console.error('❌ فشل الاتصال بقاعدة البيانات:', err.message);
  }
}
testDB();

// ربط الـ Routes
app.use('/api/books', bookRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/borrowings', borrowingRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/admin', adminRoutes);
//app.use('/api/reports', reportRoutes); // إذا حبيت تستخدم Excel لاحقًا
app.use('/api/auth', authRoutes);

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
