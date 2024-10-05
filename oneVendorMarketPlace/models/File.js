const mongoose = require("mongoose");


const fileSchema = new mongoose.Schema({
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
module.exports = File = mongoose.model('File',fileSchema);