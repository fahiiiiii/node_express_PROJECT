const express = require('express');
const router = express.Router();
const { body, validationResult } = require("express-validator"); 
const Order = require('../../models/Order');
const Product = require('../../models/Product');
const authenticateToken  = require('../../middleware/auth')

//!api for creating an order by user 
router.post('/', authenticateToken,
    [body("productId", "productId name is required").notEmpty()],

    async (req, res) => {

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const id = req.userPayload.id;
            const product = await Product.findById(req?.body?.productId)
            if(!product){
                res.json({message:"Product not found"});
            }
            
            const orderObject = {
                
                productId: product._id,
                userId: id,
                purchaseDate:new Date(),
                quantity:req?.body?.quantity?? 1,
        // <!-- paymentIntentId: -->
                location:req.body.location ?? "",
                status:'in-progress',
                // expectedDeliveryDate:
            }
            orderObject.total = product.price * orderObject.quantity;
            const orders = new Order(orderObject);
            await orders.save();
            res.json(orders);
        } catch (error) {
            catchErrorMessage(error, res);
        }

    })


//!api for getting all task created by a user 
router.get('/', authenticateToken,async (req, res) => {
    try {
        const requiredId = req.params.id;
        const orders = await Order.findOne({_id:requiredId});
        if (!orders) {
            errorMessageFor404(res);
        } else {
            res.json(orders)
        }
    } catch (error) {
        catchErrorMessage(error, res);

    }
})

//!api for updating order STATUS by a users accessToken

router.put('/status/:id',[
    body("status","status should be given)").notEmpty(),
    body("status","status sholud be any of these threes('delivered' or 'in-progress'')").isIn(["delivered","in-progress"])
],authenticateToken,async(req,res)=>{
    try {
         const errors = validationResult(req);
         if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()})
         }
        // const requiredUserId = req.userPayload.id;
      const status  = req.body.status;
      const requiredId = req.params.id;
      const requiredOrder = await Order.findByIdAndUpdate({_id:requiredId},{status:status},{new:true});

      if(!requiredOrder){
          errorMessageFor404(res);
      }else{
          res.json(requiredOrder);
      }
    } catch (error) {
     catchErrorMessage(error, res);
    }
 })


//!api for updating orders by id
router.put('/:id',[
    body("status","status sholud be any of these threes('delivered' or 'in-progress'')").isIn(["delivered","in-progress"])
],authenticateToken,async(req,res)=>{
   try {
     const body = req.body;
     const requiredOrderId = req.params.id;
     const requiredUserId = req.userPayload.id;
     const requiredOrder = await Order.findByIdAndUpdate({_id:requiredOrderId,userId:requiredUserId},body,{new:true});
     if(!requiredOrder){
         errorMessageFor404(res);
     }else{
         res.json(requiredOrder);
     }
   } catch (error) {
    catchErrorMessage(error, res);
   }
})


//!API FOR delete orders by accessToken
router.delete('/:id',authenticateToken,async(req,res)=>{
    try {
        const requiredOrderId = req.params.id;
     const requiredOrder= await Order.findOneAndDelete({_id:requiredOrderId});
     if(!requiredOrder){
         errorMessageFor404(res);
     }else{
         res.json(requiredOrder);
     }
    } catch (error) {
        catchErrorMessage(error, res);
        
    }
})

module.exports = router;


function errorMessageFor404(res) {
    res.status(404).json({ Message: "Required Order not found" });
}

function catchErrorMessage(error, res) {
    console.log(`Something went wrong for the error :\n${error}`);
    res.status(500).json({ Message: "Something is wrong with the server" });
}
