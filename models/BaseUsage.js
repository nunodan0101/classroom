// models/BaseUsage.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const baseUsageSchema = new Schema({
  classroom: {
    type: Schema.Types.ObjectId,
    ref: 'Classroom',
    required: true
  },
  dayOfWeek: {
    type: String,
    enum: ['月', '火', '水', '木', '金', '土'],
    required: true
  },
  period: {
    type: String,
    enum: ['1', '2', '3', '4', '5'],
    required: true
  },
  used: {
    type: Boolean,
    default: false
  },
  // 追加情報が必要ならここにフィールドを追加
  // 例: subjectName: String,
  //      teacher: String,
});

module.exports = mongoose.model('BaseUsage', baseUsageSchema);
