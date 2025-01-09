// models/Reservation.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reservationSchema = new Schema({
  classroom: {
    type: Schema.Types.ObjectId,
    ref: 'Classroom'
  },
  dayOfWeek: String,    // 曜日 (例: "月")
  period: String,       // 時限 (例: "4") or NumberでもOK
  reservedBy: String,   // 予約者名
  createdAt: {
    type: Date,
    default: Date.now
  }
  // 必要があれば用途などを追加
});

module.exports = mongoose.model('Reservation', reservationSchema);
