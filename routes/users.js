var express = require('express');
var router = express.Router();
let Users=require("./../models/user");
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post("/login",(req,res,next)=>{
  let param={
    userName:req.body.userName,
    userPwd:req.body.userPwd
  };
  Users.findOne(param,(err,doc)=>{
    if (err){
      res.json({
          "Status":"0",
          "msg":err.message
      })
    }else {
      if (doc){
          res.cookie("userId",doc.userId,{
            path:"/",
            maxAge:1000*60*60
          });
          res.cookie("userName",doc.userName,{
              path:"/",
              maxAge:1000*60*60
          });
          //res.session.user=doc;
          res.json({
              "Status":"1",
              "msg":"1",
              "result":{
                userName:doc.userName,
                success:"success"
              }
          })
      } else {
          res.json({
              "Status":"0",
              "msg":"账号密码错误",
              "result":"fail"
          })
      }
    }
  })
});
router.get("/logout",(req,res)=>{
  res.cookie("userId","",{
    path:"/",
    maxAge:-1
  });
  res.json({
     "Status":"0",
     "msg":"",
     "result":"fail"
  });
});

router.get('/checkLogin',(req,res,next)=>{
    if (req.cookies.userId){
        res.json({
            "Status":"1",
            "msg":"success",
            "result":req.cookies.userName
        })
    }else {
        res.json({
            "Status":"0",
            "msg":"fail 未登录",
            "result":""
        })
    }
});

//查询我的购物车
router.get("/cartList",(req,res,next)=>{
    let userId = req.cookies.userId;
   Users.findOne({userId:userId},(err,doc)=>{
       if (err){
           res.json({
               "Status":"0",
               "msg":"",
               "result":"fail"
           });
       } else {
           if (doc){
               res.json({
                   "Status":"1",
                   "msg":"success",
                   "result":doc.cartList
               });
           } else {
               res.json({
                   "Status":"1",
                   "msg":"success",
                   "result":"您的购物车还没有数据,前往商品列表购物吧!"
               });
           }
       }
   })
});
//删除购物车商品
router.post("/cart/del",(req,res,next)=>{
   let userId = req.cookies.userId;
   let productId = req.body.productId;
   console.log(productId);
   Users.update({userId:userId},{$pull:{cartList:{productId:productId}}},(err,data)=>{
        if (err){
            res.json({
                "Status":"0",
                "msg":"fail",
                "result":"删除失败"
            });
        } else {
            console.log(data);
            res.json({
                "Status":"1",
                "msg":"success",
                "result":"删除成功"
            });
        }
   })
});
module.exports = router;
