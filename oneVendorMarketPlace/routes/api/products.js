const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Product = require("../../models/Product");
const File = require("../../models/File");
const multer = require("multer");
const authenticateToken = require("../../middleware/auth");
const mongoose = require("mongoose");

//!api for creating a task by user
router.post(
  "/",
  authenticateToken,
  [body("name", "name is required").notEmpty()],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (req?.userPayload?.type != "admin") {
      return res.status(400).json({
        message: "You are not an admin so you can't create a product entry",
      });
    }
    try {
      const id = req.userPayload.id;
      const productObject = {
        name: req.body.name,
        // status: 'to-do',
        userId: id,
        fileId: req.body.fileId ?? " ",
        desCription: req.body.desCription ?? " ",
        price: req.body.price ?? 0,
        manufacturedBy: req.body.manufacturedBy ?? " ",
        expiresAt: new Date(),
      };
      let product = new Product(productObject);
      await product.save();

      if (product?.fileId) {
        const createProduct = await Product.findById(product._id).populate([
          "fileId",
          "userId",
        ]);
        product = createProduct;
      }
      res.json(product);
    } catch (error) {
      catchErrorMessage(error, res);
    }
  }
);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, "./public/uploads/");
    cb(null, "./public/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileName =
      file.originalname.split(".")[0] +
      "-" +
      file.fieldname +
      "-" +
      uniqueSuffix +
      "-" +
      file.originalname.split(".")[1];
    //  cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname)
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

// const upload = multer({ dest: "./public/uploads/" });
router.post("/uploads", upload.single("file"), async (req, res) => {
  const fileObject = {
    name: req.file.filename,
    path: req.file.path,
  };
  const file = new File(fileObject);
  await file.save();
  res.json(file);
  //   res.json(req.file);
});

//!api for getting all product created by an admin
router.get("/", authenticateToken, async (req, res) => {
  try {
    const requiredId = req.userPayload.id;
    const products = await Product.find({ userId: requiredId });
    if (!products) {
      errorMessageFor404(res);
    } else {
      res.json(products);
    }
  } catch (error) {
    catchErrorMessage(error, res);
  }
});
//!api for getting all products of the marketPlace
router.get("/allProducts", async (req, res) => {
  try {
    let current = req?.query?.current ?? "1";
    current = parseInt(current);
    let pageSize = req?.query?.pageSize ?? "10";
    pageSize = parseInt(pageSize);
    const aggregate = [];
    aggregate.push({
      $sort: {
        createdAt: -1,
      },
    });
    
    // aggregate.push({
    //   $match:{
    //     // price:10
    //     _id: new mongoose.Types.ObjectId("670112112c3d1066164ba84e")
    //   }
    // })

    // aggregate.push({
    //   $group:{
    //     _id:"$name",
    //     cumalitivePrice:{$sum:'$price'}
    //   }
    // })
    // aggregate.push({
    //   $group:{
    //     _id:"$name",
    //     averagePrice:{$avg:'$price'}
    //   }
    // })
    // aggregate.push({
    //   $sort: {
    //     createdAt: -1,
    //   },
    // });
    aggregate.push({
      $skip: ((current-1) * pageSize),
      
    });
    aggregate.push({
      $limit: (pageSize * 1),
    });

    aggregate.push({
      $lookup: {
        from: "files",
        localField: "fileId",
        foreignField: "_id",
        as: "File",
      },
    });
    aggregate.push({
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "productOwner",
      },
    });

    const products = await Product.aggregate(aggregate);
    if (!products) {
      errorMessageFor404(res);
    } else {
      res.json(products);
    }
  } catch (error) {
    catchErrorMessage(error, res);
  }
});

//!api for updating prouct by id
router.put("/:id", authenticateToken, async (req, res) => {
  if (req?.userPayload?.type != "admin") {
    return res.status(400).json({
      Message: "You are not an admin that you update the product details",
    });
  }
  try {
    const body = req.body;
    const requiredProductId = req.params.id;
    // const requiredUserId = req.userPayload.id;
    const requiredProduct = await Product.findByIdAndUpdate(
      { _id: requiredProductId },
      body,
      { new: true }
    );
    if (!requiredProduct) {
      errorMessageFor404(res);
    } else {
      res.json(requiredProduct);
    }
  } catch (error) {
    catchErrorMessage(error, res);
  }
});

//!API FOR delete a product  by admin accessToken
router.delete("/:id", authenticateToken, async (req, res) => {
  if (req?.userPayload?.type != "admin") {
    return res.status(400).json({
      Message: "You are not an admin that you update the product details",
    });
  }
  try {
    // const requiredUserId = req.userPayload.id;
    const requiredProductId = req.params.id;
    const requiredProduct = await Product.findOneAndDelete({
      _id: requiredProductId,
    });
    if (!requiredProduct) {
      errorMessageFor404(res);
    } else {
      res.json(requiredProduct);
    }
  } catch (error) {
    catchErrorMessage(error, res);
  }
});

module.exports = router;

function errorMessageFor404(res) {
  res.status(404).json({ Message: "Required Product not found" });
}

function catchErrorMessage(error, res) {
  console.log(`Something went wrong for the error :\n${error}`);
  res.status(500).json({ Message: "Something is wrong with the server" });
}
