// seedClassroom.js
const mongoose = require('mongoose');
const Classroom = require('./models/Classroom');

mongoose.connect('mongodb://127.0.0.1:27017/classroomDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('DB connected'))
  .catch(err => console.error(err));

(async () => {
  try {
    // 1) 既存データを全消し(必要に応じて)
    await Classroom.deleteMany({});

    // 例：seedClassroom.js

    const basementRooms = [
      "1BA", "1BB", "1BC", "1BD", "1BE", "1BF", "1BG", "1BH",
      "1BJ", "1BK", "1BL", "1BM", "1BN", "1BP"
    ];

    const floor1Rooms = [
      "11A", "11B", "11C", "11D", "11E", "11F"
    ];

    const floor2Rooms = [
      "12A", "12B", "12C", "12D", "12E", "12F", "12G", "12H",
      "12J", "12K", "12L", "12M", "12N", "12P"
    ];

    const floor3Rooms = [
      "13A", "13B", "13C", "13D", "13E", "13F", "13G", "13H",
      "13J", "13K", "13L", "13M", "13N", "13P", "13Q"
    ];

    // 1B階（地下一階）の教室登録
    for (let name of basementRooms) {
      await Classroom.create({
        building: "1号館",
        floor: -1,   // 地下一階を -1 と表現
        name: name
      });
    }

    // 1階の教室登録
    for (let name of floor1Rooms) {
      await Classroom.create({
        building: "1号館",
        floor: 1,
        name: name
      });
    }

    // 2階の教室登録
    for (let name of floor2Rooms) {
      await Classroom.create({
        building: "1号館",
        floor: 2,
        name: name
      });
    }

    // 3階の教室登録
    for (let name of floor3Rooms) {
      await Classroom.create({
        building: "1号館",
        floor: 3,
        name: name
      });
    }

    console.log('Classroom seeding done!');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
})();
