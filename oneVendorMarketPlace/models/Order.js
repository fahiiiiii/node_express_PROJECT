const mongoose = require("mongoose");


const orderSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:Product
    },
    purchaseDate:{
        type:Date
    },
    quantity:{
        type:Number
    },
    total:{
        type:Number
    },
    location:{
        type:String
    },
    status:{
        type:String,
        enum:['in-progress','delivered'],
        default:'in-progress'
    },
    expectedDeliveryDate:{
        type:Date
    },
    
},{
    timestamps:true
}) 
module.exports = Order = mongoose.model('Order',orderSchema);