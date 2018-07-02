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
router.get("/",function (req,res,next) {
    let sort=req.param('sort');
    let pageNum = parseInt(req.param('pageNum'));
    let pageSize = parseInt(req.param('pageSize'));
    let skip=(pageNum-1)*pageSize;
    let params={};
    let goodsModel = Goods.find(params).skip(skip).limit(pageSize);
    goodsModel.sort({'salePrice':sort});
    goodsModel.exec(function (err,doc) {
        if (err){
            res.json({
                status:"0",
                msg:err.message
            })
        }else {
            res.json({
                status:"1",
                result:{
                    count:doc.length,
                    list:doc
                }
            })
        }
    });
});
module.exports=router;