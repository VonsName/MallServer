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
     "result":"fail"
  });
});
module.exports = router;
