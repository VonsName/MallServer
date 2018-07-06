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
    let params={};
    let priceLevel = req.param('priceLevel');
    let priceGt='',priceLte='';

    let skip=(pageNum-1)*pageSize;
    if (priceLevel!=='all'){
        switch (priceLevel) {
            case '0':
                priceGt=0;
                priceLte=100;
                break;
            case '1':
                priceGt=100;
                priceLte=500;
                break;
            case '2':
                priceGt=500;
                priceLte=1000;
                break;
            case '3':
                priceGt=1000;
                priceLte=5000;
                break;
        }
        params={
            salePrice:{
                $gt:priceGt,
                $lte:priceLte
            }
        };
    }

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

//加入购物车
router.post("/addCart",(req,res,next)=>{
    let userId="100000077";
    let productId=req.body.productId;
    let Users=require('../models/user');
    Users.findOne({
        userId:userId
    },(err,userDoc)=>{
        if (!err){
            if (userDoc){
                let productItem='';
                //判断购物车商品是否存在
                userDoc.cartList.forEach((item)=>{
                   if (item.productId===productId) {
                       productItem = item;
                       productItem.productNum++;
                   }
                });
                if (productItem){
                    userDoc.save((err3,data)=>{
                        if (!err3){
                            res.send({
                                "Status" :"1",
                                "msg":"操作成功",
                                "result":"success edit"
                            });
                        }else {
                            res.send({
                                Status:"0",
                                msg:err3.message,
                                result:"fail"
                            });
                        }
                    });
                }else {
                    Goods.findOne({
                        productId:productId
                    },(err1,pdoc)=>{
                        if (!err1){
                            if (pdoc){
                                pdoc.productNum=1;
                                pdoc.checked=1;
                                userDoc.cartList.push(pdoc);
                                userDoc.save((err2,data)=>{
                                    if (!err2){
                                        res.json({
                                            "Status":"1",
                                            "msg":"操作成功",
                                            "result":"success"
                                        });
                                    }else {
                                        res.json({
                                            Status:"0",
                                            msg:err2.message,
                                            result:"fail"
                                        });
                                    }
                                });
                            } else {
                                res.json({
                                    Status:"0",
                                    msg:"商品信息不存在",
                                    result:"fail"
                                });
                            }
                        }else {
                            res.json({
                                Status:"0",
                                msg:err1.message,
                                result:"fail"
                            })
                        }
                    })
                }
            }else {
                res.json({
                    Status:"0",
                    msg:"对不起,用户信息错误",
                    result:"fail"
                })
            }
        } else {
            res.json({
                Status:"0",
                msg:err.message,
                result:"fail"
            })
        }
    })
});
module.exports=router;