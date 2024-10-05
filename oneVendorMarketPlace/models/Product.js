const mongoose = require("mongoose");


const productSchema = new mongoose.Schema({
    name:{
        type:String
    },
    desCription:{
        type:String
    },
    price:{
        type:Number
    },
    manufacturedBy:{
        type:String
    },
    expiresAt:{
        type:Date
    },
    fileId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"File"
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:User
    }
},{
    timestamps:true
}) 
module.exports = Product = mongoose.model('Product',productSchema);