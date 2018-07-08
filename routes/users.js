let express = require('express');
let router = express.Router();
let Users=require("./../models/user");
let Order=require('./../models/order');
let util = require('./../util/util');
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
     "Status":"1",
     "msg":"",
     "result":"success"
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

//修改购物车商品
router.post("/cart/edit",(req,res,next)=>{
    let userId = req.cookies.userId;
    let productId = req.body.productId;
    let productNum = req.body.productNum;
    let check = req.body.check;
    Users.update({userId:userId,"cartList.productId":productId},{
        "cartList.$.productNum":productNum,"cartList.$.checked":check
    },(err,doc)=>{
        if (err){
            res.json({
                "Status":"0",
                "msg":"fail",
                "result":"操作失败"
            });
        }else {
            res.json({
                "Status":"1",
                "msg":"success",
                "result":"操作成功"
            });
        }
    })
});
//查询用户地址
router.get("/addressList",(req,res,next)=>{
   let userId = req.cookies.userId;
   Users.findOne({userId:userId},(err,doc)=>{
       if (err){
           res.json({
               "Status":"0",
               "msg":"fail",
               "result":"操作失败"
           });
       } else {
           res.json({
               "Status":"1",
               "msg":"success",
               "result":doc.addressList
           });
       }
   })
});

//设置用户默认地址
router.post("/address/setDefault",(req,res,next)=>{
   let userId = req.cookies.userId;
   let addressId = req.body.addressId;
   if (!addressId){
       res.json({
           "Status":"0",
           "msg":"addressId不能为空",
           "result":"操作失败"
       })
   }else {
       Users.findOne({userId:userId},(err,doc)=>{
           if (err){
               res.json({
                   "Status":"0",
                   "msg":"fail",
                   "result":"操作失败"
               });
           } else {
               let addressList = doc.addressList;
               addressList.forEach((item)=>{
                   if (item.addressId===addressId){
                       item.isDefault=true;
                   }else {
                       item.isDefault=false;
                   }
               });
               doc.save((err1,doc1)=>{
                   if (err1){
                       res.json({
                           "Status":"0",
                           "msg":"fail",
                           "result":"操作失败"
                       });
                   }else {
                       res.json({
                           "Status":"1",
                           "msg":"success",
                           "result":"操作成功"
                       });
                   }
               });
           }
       })
   }
});
router.post("/delAddress",(req,res,next)=>{
    let userId = req.cookies.userId;
    let addressId1 = req.body.addressId;
    if (!userId){
        res.json({
            "Status":"0",
            "msg":"fail",
            "result":"操作失败"
        });
    } else {
        Users.findOne({userId:userId},(err,doc)=>{
            if (err){
                res.json({
                    "Status":"0",
                    "msg":"fail",
                    "result":"操作失败"
                });
            } else {
                if (doc){
                    Users.update({userId:userId},
                        {$pull:{addressList:{addressId:addressId1}}},(err,doc)=>{
                        if (err){
                            res.json({
                                "Status":"0",
                                "msg":"fail",
                                "result":"操作失败"
                            });
                        } else {
                            res.json({
                                "Status":"1",
                                "msg":"success",
                                "result":"操作成功"
                            });
                        }
                    })
                } else {
                    res.json({
                        "Status":"0",
                        "msg":"用户信息不存在",
                        "result":"操作失败"
                    });
                }
            }
        })
    }
});

//生成订单
router.post("/payMent",(req,res,next)=>{
    let userId = req.cookies.userId;
    let orderTotal = req.body.orderTotal;
    let addressId = req.body.addressId;
    let goodsList=[];
    let addressInfo={};
    Users.findOne({userId:userId},(err,doc)=>{
        if (err){
            res.json({
                "Status":"0",
                "msg":"服务器错误",
                "result":"操作失败"
            });
        } else {
            if (doc){
                //添加订单的商品信息  只添加选中状态的商品
                doc.cartList.forEach((item)=>{
                    if (item.checked==="1"){
                        goodsList.push(item);
                    }
                });
                //添加订单的用户信息
                doc.addressList.forEach((item)=>{
                    if (item.addressId===addressId) {
                        addressInfo=item;
                    }
                });

                let platform='828';
                let number1 = Math.floor(Math.random()*10);
                let number2 = Math.floor(Math.random()*10);
                let SYSDATE=new Date().Format('yyyyMMddHHmmss');
                let orderCreateDate=new Date().Format('yyyy-MM-dd HH:mm:ss');
                let orderId=platform+number1+SYSDATE+number2;
                let order = new Order({
                    "orderId" : orderId,
                    "orderTotal" : orderTotal,
                    "addressInfo" : addressInfo,
                    "goodsList" : goodsList,
                    "orderStatus" : "1",
                    "createDate" :orderCreateDate
                });
                doc.orderList.push(order);
                doc.save((err2,doc2)=>{
                    if (err2){
                        res.json({
                            "Status":"0",
                            "msg":"服务器错误",
                            "result":"操作失败"
                        });
                    } else {
                        res.json({
                            "Status":"1",
                            "msg":"创建订单成功",
                            "result":{
                                "orderId":order.orderId,
                                "orderTotal":orderTotal
                            }
                        });
                    }
                })

            } else {
                res.json({
                    "Status":"0",
                    "msg":"用户信息不存在",
                    "result":"操作失败"
                });
            }
        }
    })
});
//订单详情
router.get("/orderDetail",(req,res,next)=>{
    let userId = req.cookies.userId;
    let orderId = req.param("orderId");
    Users.findOne({userId:userId},(err,doc)=>{
        if (err){
            res.json({
                "Status":"0",
                "msg":"服务器错误",
                "result":"操作失败"
            });
        } else {
            if (doc){
                let flag='';
                doc.orderList.forEach((item)=>{
                    if (item.orderId===orderId){
                        flag=item;
                    }
                });
                if (flag){
                    res.json({
                        "Status":"1",
                        "msg":"success",
                        "result":{
                            "orderId":flag.orderId,
                            "orderTotal":flag.orderTotal
                        }
                    });
                } else {
                    res.json({
                        "Status":"3",
                        "msg":"订单信息不存在",
                        "result":"订单信息不存在"
                    });
                }
            } else {
                res.json({
                    "Status":"0",
                    "msg":"用户信息异常",
                    "result":"操作失败"
                });
            }
        }
    })
});
//查询购物车的数量
router.get('/getCartCount',(req,res,next)=>{
    if (req.cookies &&req.cookies.userId) {
        let userId = req.cookies.userId;
        Users.findOne({userId:userId},(err,doc)=>{
            if (err){
                res.json({
                    "Status":"0",
                    "msg":"用户信息异常",
                    "result":"操作失败"
                });
            } else {
                let cartList = doc.cartList;
                let cartCount=0;
                cartList.map((item)=>{
                    cartCount+=item.productNum;
                });
                res.json({
                    "Status":"1",
                    "msg":"success",
                    "result":{
                        cartCount:cartCount
                    }
                });
            }
        })
    }
});
module.exports = router;
