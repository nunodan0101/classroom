// seedBaseUsage.js
const mongoose = require('mongoose');
const Classroom = require('./models/Classroom');
const BaseUsage = require('./models/BaseUsage');

// MongoDB接続設定
const dburl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/classroomDB';

mongoose.connect(dburl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  tls: true,
  tlsAllowInvalidCertificates: false, // セキュリティのためfalseを推奨
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// 公式使用データの定義
// ここで各教室の曜日・時限の使用状況を設定します。
// 必要に応じて以下のデータを編集してください。

const officialUsages = [
  // 1B階 (地下一階)
  { classroomName: '1BB', dayOfWeek: '月', period: '3' },
  { classroomName: '1BC', dayOfWeek: '月', period: '3' },
  { classroomName: '1BG', dayOfWeek: '月', period: '3' },
  { classroomName: '1BL', dayOfWeek: '月', period: '3' },
  { classroomName: '1BM', dayOfWeek: '月', period: '3' },
  { classroomName: '1BN', dayOfWeek: '月', period: '3' },

  { classroomName: '1BB', dayOfWeek: '月', period: '4' },
  { classroomName: '1BC', dayOfWeek: '月', period: '4' },
  { classroomName: '1BG', dayOfWeek: '月', period: '4' },
  { classroomName: '1BK', dayOfWeek: '月', period: '4' },
  { classroomName: '1BL', dayOfWeek: '月', period: '4' },
  { classroomName: '1BM', dayOfWeek: '月', period: '4' },
  { classroomName: '1BN', dayOfWeek: '月', period: '4' },
  
  // 1階
  { classroomName: '11A', dayOfWeek: '月', period: '3' },
  { classroomName: '11B', dayOfWeek: '月', period: '3' },
  { classroomName: '11D', dayOfWeek: '月', period: '3' },
  { classroomName: '11E', dayOfWeek: '月', period: '3' },
  { classroomName: '11F', dayOfWeek: '月', period: '3' },

  { classroomName: '11B', dayOfWeek: '月', period: '4' },
  { classroomName: '11D', dayOfWeek: '月', period: '4' },
  { classroomName: '11E', dayOfWeek: '月', period: '4' },
  { classroomName: '11F', dayOfWeek: '月', period: '4' },

  // 2階
  { classroomName: '12A', dayOfWeek: '月', period: '3' },
  { classroomName: '12C', dayOfWeek: '月', period: '3' },
  { classroomName: '12F', dayOfWeek: '月', period: '3' },
  { classroomName: '12G', dayOfWeek: '月', period: '3' },
  { classroomName: '12H', dayOfWeek: '月', period: '3' },
  { classroomName: '12J', dayOfWeek: '月', period: '3' },
  { classroomName: '12L', dayOfWeek: '月', period: '3' },
  { classroomName: '12M', dayOfWeek: '月', period: '3' },
  { classroomName: '12N', dayOfWeek: '月', period: '3' },

  { classroomName: '12A', dayOfWeek: '月', period: '4' },
  { classroomName: '12B', dayOfWeek: '月', period: '4' },
  { classroomName: '12C', dayOfWeek: '月', period: '4' },
  { classroomName: '12E', dayOfWeek: '月', period: '4' },
  { classroomName: '12F', dayOfWeek: '月', period: '4' },
  { classroomName: '12G', dayOfWeek: '月', period: '4' },
  { classroomName: '12J', dayOfWeek: '月', period: '4' },
  { classroomName: '12K', dayOfWeek: '月', period: '4' },
  { classroomName: '12L', dayOfWeek: '月', period: '4' },
  { classroomName: '12M', dayOfWeek: '月', period: '4' },

  // 3階
  { classroomName: '13J', dayOfWeek: '月', period: '3' },
  { classroomName: '13K', dayOfWeek: '月', period: '3' },
  { classroomName: '13L', dayOfWeek: '月', period: '3' },
  { classroomName: '13M', dayOfWeek: '月', period: '3' },
  { classroomName: '13N', dayOfWeek: '月', period: '3' },
  { classroomName: '13P', dayOfWeek: '月', period: '3' },
  { classroomName: '13Q', dayOfWeek: '月', period: '3' },

  { classroomName: '13M', dayOfWeek: '月', period: '4' },

  
  // 必要に応じて他の教室も追加
];

// シード処理
const seedBaseUsage = async () => {
  try {
    // 既存の BaseUsage データを削除（必要に応じて）
    await BaseUsage.deleteMany({});
    console.log('Existing BaseUsage data cleared.');

    for (let usage of officialUsages) {
      // 教室名から Classroom ドキュメントを取得
      const classroom = await Classroom.findOne({
        building: '1号館',
        floor: usage.classroomName.startsWith('1B') ? -1 : 
               usage.classroomName.startsWith('11') ? 1 :
               usage.classroomName.startsWith('12') ? 2 :
               usage.classroomName.startsWith('13') ? 3 : null,
        name: usage.classroomName
      });

      if (!classroom) {
        console.log(`教室 ${usage.classroomName} が見つかりません。`);
        continue; // 次のループへ
      }

      // BaseUsage ドキュメントの作成
      await BaseUsage.create({
        classroom: classroom._id,
        dayOfWeek: usage.dayOfWeek,
        period: usage.period,
        used: true
      });

      console.log(`BaseUsage created for ${usage.classroomName} on ${usage.dayOfWeek} ${usage.period}限.`);
    }

    console.log('All BaseUsage seeding done!');
  } catch (err) {
    console.error('Error seeding BaseUsage:', err);
  } finally {
    mongoose.connection.close();
  }
};

// スクリプト実行
seedBaseUsage();
