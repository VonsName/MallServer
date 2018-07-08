let mongoose = require('mongoose');
let orderSchema = new mongoose.Schema({
    "orderId" : String,
    "orderTotal" : Number,
    "addressInfo" : {},
    "goodsList" : [],
    "orderStatus" : String,
    "createDate" :Date
});
module.exports=mongoose.model('Order',orderSchema);