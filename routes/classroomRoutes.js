// routes/classroomRoutes.js

const express = require('express');
const router = express.Router(); // Router の初期化
const path = require('path'); // パス操作用
const fs = require('fs'); // ファイルシステム操作用
const Classroom = require('../models/Classroom');
const Reservation = require('../models/Reservation');
const BaseUsage = require('../models/BaseUsage');

// ============ 1) トップページ(検索フォーム表示) ============
router.get('/', (req, res) => {
  res.render('index');
});

// ============ 2) 検索結果 ============
router.get('/search', async (req, res) => {
  const { building, floor, dayOfWeek, period } = req.query;

  // バリデーション
  const validFloors = ['-1', '1', '2', '3'];
  const validBuildings = ['1号館', '2号館', '3号館', '4号館', '5号館', '6号館', '7号館'];
  const validDays = ['月', '火', '水', '木', '金', '土'];
  const validPeriods = ['1', '2', '3', '4', '5'];

  if (
    !validBuildings.includes(building) ||
    !validFloors.includes(floor) ||
    !validDays.includes(dayOfWeek) ||
    !validPeriods.includes(period)
  ) {
    return res.status(400).send('無効な入力です。');
  }

  // 数値に変換
  const floorNumber = parseInt(floor, 10);
  let displayFloor;

  if (floorNumber === -1) {
    displayFloor = 'B1階';
  } else {
    displayFloor = `${floorNumber}階`;
  }

  try {
    // Classroomコレクションから該当階数の教室を取得
    const classrooms = await Classroom.find({ building, floor: floorNumber });

    // 各教室について "公式使用" または "予約" があれば埋まり
    const classroomData = await Promise.all(
      classrooms.map(async (room) => {
        // BaseUsageチェック
        const baseUsageExists = await BaseUsage.exists({
          classroom: room._id,
          dayOfWeek: dayOfWeek,
          period: period,
          used: true
        });

        // Reservationチェック
        const reservationExists = await Reservation.exists({
          classroom: room._id,
          dayOfWeek: dayOfWeek,
          period: period
        });

        // どちらかがtrueなら使用中
        const isReserved = baseUsageExists || reservationExists;

        // room.floor を displayFloor に変換
        let roomDisplayFloor;
        if (room.floor === -1) {
          roomDisplayFloor = 'B1階';
        } else {
          roomDisplayFloor = `${room.floor}階`;
        }

        return {
          ...room.toObject(),
          reserved: isReserved,
          displayFloor: roomDisplayFloor
        };
      })
    );

    res.render('search', {
      classroomData,
      building,
      floor: displayFloor, // 概要部分に渡す階数表示
      dayOfWeek,
      period
    });
  } catch (error) {
    console.error('Error during search:', error);
    res.status(500).send('サーバーエラーが発生しました。');
  }
});

// ============ 3) 予約フォーム表示 ============
router.get('/reservation/:classroomId', async (req, res) => {
  const { classroomId } = req.params;
  const { dayOfWeek, period } = req.query;

  try {
    // 教室情報の取得
    const classroom = await Classroom.findById(classroomId);

    if (!classroom) {
      return res.status(404).send('教室が見つかりません。');
    }

    // displayFloorの設定
    let displayFloor;
    if (classroom.floor === -1) {
      displayFloor = 'B1階';
    } else {
      displayFloor = `${classroom.floor}階`;
    }

    res.render('reservation', { 
      classroom, 
      building: classroom.building, 
      floor: displayFloor, 
      floorNumber: classroom.floor, // 追加
      dayOfWeek, 
      period 
    });
  } catch (error) {
    console.error('Error fetching reservation form:', error);
    res.status(500).send('サーバーエラーが発生しました。');
  }
});


// ============ 4) 予約処理(POST) ============
router.post('/reservation', async (req, res) => {
  const { classroomId, dayOfWeek, period, reservedBy, building, floor } = req.body;

  try {
    // 1) BaseUsage で "used: true" かどうか
    const baseUsed = await BaseUsage.exists({
      classroom: classroomId,
      dayOfWeek,
      period,
      used: true
    });

    // 2) Reservation に既に予約があるかどうか
    const userReserved = await Reservation.exists({
      classroom: classroomId,
      dayOfWeek,
      period
    });

    // 埋まっているなら予約不可
    if (baseUsed || userReserved) {
      return res.send('このコマは既に使用中（公式 or 予約済み）です。');
    }

    // 空いているなら Reservation作成
    await Reservation.create({
      classroom: classroomId,
      dayOfWeek,
      period,
      reservedBy
    });

    // 教室情報を取得して building と floor を取得
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).send('教室が見つかりません。');
    }

    const buildingName = classroom.building;
    const floorNumber = classroom.floor;

    // リダイレクト先の階数を数値として設定
    res.redirect(`/search?building=${encodeURIComponent(buildingName)}&floor=${encodeURIComponent(floorNumber)}&dayOfWeek=${dayOfWeek}&period=${period}`);
  } catch (error) {
    console.error('Error processing reservation:', error);
    res.status(500).send('サーバーエラーが発生しました。');
  }
});

// ============ 新) 図面表示ルート ============
router.get('/floorplan/:building/:floor', (req, res) => {
  const { building, floor } = req.params;

  // フロアパラメータが '2階' のような文字列の場合、数字を抽出
  const floorNumber = parseInt(floor, 10);

  // 数字が抽出できない場合はエラーとして扱う
  if (isNaN(floorNumber)) {
    return res.render('floorplan', { exists: false });
  }

  // 図面画像のパスを構築
  const imagePath = path.join(__dirname, '..', 'public', 'floorplans', `${building}-${floorNumber}F.png`);

  // ファイルが存在するか確認
  fs.access(imagePath, fs.constants.F_OK, (err) => {
    if (err) {
      // 画像が存在しない場合
      return res.render('floorplan', { exists: false });
    } else {
      // 画像が存在する場合
      const imageURL = `/floorplans/${building}-${floorNumber}F.png`;
      return res.render('floorplan', { exists: true, imageURL });
    }
  });
});

// ============ 5) 予約リセットルート ============
const RESET_SECRET_KEY = 'sdpbl'; // シークレットキーを設定（必ず変更してください）

router.get('/admin/reset-reservations/:key', async (req, res) => {
    const { key } = req.params;

    // シークレットキーの検証
    if (key !== RESET_SECRET_KEY) {
        return res.status(403).send('アクセスが拒否されました。');
    }

    try {
        // リセット前の予約データを取得
        const currentReservations = await Reservation.find({}).populate('classroom');

        // 予約データを全削除
        const result = await Reservation.deleteMany({});

        // リセット後の予約データを取得（空になっているはず）
        const remainingReservations = await Reservation.find({}).populate('classroom');

        // リセット結果を表示するテンプレートにデータを渡す
        res.render('admin/reset-reservations', {
            deletedCount: result.deletedCount,
            currentReservations,
            remainingReservations
        });
    } catch (error) {
        console.error('Error resetting reservations:', error);
        res.status(500).send('サーバーエラーが発生しました。');
    }
});


module.exports = router; // ルーターをエクスポート
