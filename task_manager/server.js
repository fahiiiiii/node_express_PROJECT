const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
app.use(bodyParser.json());
require('dotenv').config();

connectDB();

app.use('/users',require('./routes/api/users'));
app.use('/tasks',require('./routes/api/tasks'));

app.get('/',(req,res)=>{
    res.json({Message:"Welcome to the User app"})
})
const port = process.env.PORT;
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})