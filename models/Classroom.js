// models/Classroom.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const classroomSchema = new Schema({
  building: { 
    type: String, 
    required: true 
  },  // 何号館 (例: "1号館")
  floor: { 
    type: Number, 
    required: true 
  },     // 階数 (例: 1)
  name: { 
    type: String, 
    required: true, 
    unique: true 
  }      // 教室名 (例: "11A")
  // 予約状態は別コレクションで管理するため、ここには含めない
});

// 複合ユニークインデックス
classroomSchema.index({ building: 1, floor: 1, name: 1 }, { unique: true });
module.exports = mongoose.model('Classroom', classroomSchema);
