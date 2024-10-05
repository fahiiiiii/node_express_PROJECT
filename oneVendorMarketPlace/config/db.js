const mongoose = require('mongoose');

const connectDB=async()=>{
    try {
        const uri = process.env.MONGODB_URI;
        await mongoose.connect(uri,{useNewUrlParser:true});
        console.log("Mongoose connection is open ");
    } catch (error) {
        console.log(`Mongoose connection is lost for the error : \n${error}`);
    }
}
module.exports = connectDB;
