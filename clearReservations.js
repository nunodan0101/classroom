// clearReservations.js
const mongoose = require('mongoose');
const Reservation = require('./models/Reservation'); // Reservationモデルのパスを確認

// MongoDB接続設定
mongoose.connect('mongodb://127.0.0.1:27017/classroomDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected for clearing Reservations'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const clearReservations = async () => {
  try {
    const result = await Reservation.deleteMany({});
    console.log(`Reservations cleared. Deleted ${result.deletedCount} documents.`);
  } catch (err) {
    console.error('Error clearing Reservations:', err);
  } finally {
    mongoose.connection.close();
  }
};

// スクリプト実行
clearReservations();
