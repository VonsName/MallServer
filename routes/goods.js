let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let Goods=require('../models/goods');
mongoose.connect('mongodb://47.106.13.245:27017/mall');
mongoose.connection.on("connected",function () {
    console.log("数据库连接成功");
});
mongoose.connection.on("error",function () {
    console.log("数据库连接失败");
});