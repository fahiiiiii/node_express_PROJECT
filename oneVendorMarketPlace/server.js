const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const multer = require("multer");
const connectDB = require("./config/db");
app.use(bodyParser.json());
require("dotenv").config();


app.use("/users", require("./routes/api/users"));
app.use("/tasks", require("./routes/api/tasks"));
app.use("/products", require("./routes/api/products"));
app.use("/orders", require("./routes/api/orders"));

app.get("/", (req, res) => {
  res.json({ Message: "Welcome to the task-manager app" });
});

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, './public/uploads/')
//     },
//     filename: function (req, file, cb) {
//       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//       const fileName  = file.originalname.split('.')[0]+'-'+file.fieldname + '-' + uniqueSuffix + '-' + file.originalname.split('.')[1]
//       //  cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname)
//        cb(null, fileName)
//     }
//   })
  
//   const upload = multer({ storage: storage })
  
  // const upload = multer({ dest: "./public/uploads/" });
// app.post("/uploads", upload.single("file"),  (req, res)=> {
//   res.json({ Message: "your file uploaded successfully" });
// });




const port = process.env.PORT;
app.listen(port, async () => {
   await connectDB();
  console.log(`Server is running on port ${port}`);
});
