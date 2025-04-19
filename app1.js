const mongoose = require('mongoose');
const fs = require('fs');

// 1. 定义 Schema 和 Model
const placeSchema = new mongoose.Schema({
  place: {
    type: String,
    required: true,
    unique: true
  },
  zips: {
    type: [String],
    required: true
  }
});

const Place = mongoose.model('Place', placeSchema, 'places');

// 2. 连接 Atlas 数据库
const uri = 'mongodb+srv://cs120:xnLoXaqNxer3kMbl@cluster0.yprfvyf.mongodb.net/cs120_assignment10';

async function main() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas');

    // 3. 读取并处理 CSV
    const data = fs.readFileSync('zips.csv', 'utf-8');
    const lines = data.trim().split('\n');

    // 4. 处理每行数据
    for (const line of lines) {
      const [place, zip] = line.trim().split(',');
      if (!place || !zip) continue;

      // 5. 先检查地点是否存在
      const existingPlace = await Place.findOne({ place: place });

      if (existingPlace) {
        // 地点存在，更新 zip 列表
        const updated = await Place.updateOne(
          { place: place },
          { $addToSet: { zips: zip } }
        );

        if (updated.modifiedCount > 0) {
          console.log(`Updated existing place: ${place} (Added zip: ${zip})`);
        } else {
          console.log(`Place exists but zip ${zip} was already in the list for: ${place}`);
        }
      } else {
        // 地点不存在，创建新记录
        const newPlace = new Place({
          place: place,
          zips: [zip]
        });

        await newPlace.save();
        console.log(`Created new place: ${place} (Initial zip: ${zip})`);
      }
    }

    console.log('Data import completed');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

// 执行主函数
main();