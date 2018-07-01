let mongoose = require('mongoose');
let schema = new mongoose.Schema(
    {
        productId:{type:String},
        productName:{type:String},
        salePrice:{type:Number},
        productImage:{type:String},
        productUrl:{type:String}
    }
);
let Good = mongoose.model('Good',schema);
module.exports=Good;