// app.js

if(process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
} 


const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const MongoStore = require('connect-mongo');

const app = express();

const dburl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/classroomDB';

const store = MongoStore.create({
  mongoUrl: dburl,
  touchAfter:24*3600
});

store.on('error',e => {
  console.log('セッションストアエラー',e);
});

//mongodb://127.0.0.1:27017/classroomDB
// ==== 1) MongoDB接続 ====
mongoose.connect(dburl ,{
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected!'))
.catch((err) => console.error(err));

// ==== 2) ミドルウェア設定 ====
app.use(express.urlencoded({ extended: true }));    // フォームデータの受け取り
app.set('view engine', 'ejs');                     // テンプレートエンジンをEJSに設定
app.set('views', path.join(__dirname, 'views'));   // viewsディレクトリのパス指定
app.use(express.static(path.join(__dirname, 'public'))); // /publicフォルダを静的に提供

// ==== 3) ルーティング ====
const classroomRoutes = require('./routes/classroomRoutes');
const { config } = require('dotenv');
app.use('/', classroomRoutes);

// ==== 4) サーバー起動 ====
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
