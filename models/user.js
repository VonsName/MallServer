let mongoose = require('mongoose');
let userSchema = new mongoose.Schema(
    {
        "userId":String,
        "userName":String,
        "userPwd":String,
        "orderList":[
        ],
        "cartList":[
            {
                "productId":String,
                "productName":String,
                "salePrice":String,
                "productImage":String,
                "checked":String,
                "productNum":Number
            }
        ],
        "addressList":[
            {
                "addressId" : {type:String},
                "userName" : {type:String},
                "streetName" : {type:String},
                "postCode" : {type:String},
                "tel" : {type:String},
                "isDefault" : {type:Boolean}
            }
        ]
    }
);
module.exports=mongoose.model('User',userSchema);