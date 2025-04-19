const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// 设置中间件
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MongoDB连接
const uri = 'mongodb+srv://cs120:xnLoXaqNxer3kMbl@cluster0.yprfvyf.mongodb.net/cs120_assignment10';

// 定义Schema和Model
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

// 连接数据库
mongoose.connect(uri);

// 首页路由
app.get('/', (req, res) => {
    res.render('home');
});

// 处理表单提交的路由
app.post('/process', async (req, res) => {
    try {
        const query = req.body.query.trim();

        // 判断输入是地点还是邮编（通过检查第一个字符是否为数字）
        const isZipCode = /^\d/.test(query);

        let result;

        if (isZipCode) {
            // 如果是邮编，查找包含该邮编的地点
            result = await Place.findOne({ zips: query });
            console.log('1:',result);


            if (!result) {
                return res.render('process', {
                    error: `未找到邮编 "${query}" 对应的地点信息`
                });
            }
        } else {
            // 如果是地点名称，直接查找
            result = await Place.findOne({ place: query });
            console.log('2:',result);

            if (!result) {
                return res.render('process', {
                    error: `未找到名为 "${query}" 的地点信息`
                });
            }
        }

        // 将结果传递给模板
        res.render('process', {
            place: result.place,
            zips: result.zips,
            query: query,
            isZipCode: isZipCode
        });

    } catch (error) {
        console.error('查询错误:', error);
        res.render('process', { error: '查询处理过程中发生错误' });
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
});