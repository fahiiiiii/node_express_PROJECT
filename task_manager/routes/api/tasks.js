const express = require('express');
const router = express.Router();
const { body, validationResult } = require("express-validator"); 
const Task = require('../../models/Task');
const authenticateToken  = require('../../middleware/auth')

//!api for creating a task by user 
router.post('/', authenticateToken,
    [body("title", "title name is required").notEmpty()],

    async (req, res) => {

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const id = req.userPayload.id;
            const taskObject = {
                title: req.body.title,
                // status: 'to-do',
                desCription:req.body.desCription ??" ",
                userId: id
            }
            const task = new Task(taskObject);
            await task.save();
            res.json(task);
        } catch (error) {
            catchErrorMessage(error, res);
        }

    })


//!api for getting all task created by a user 
router.get('/', authenticateToken,async (req, res) => {
    try {
        const requiredId = req.userPayload.id;
        const tasks = await Task.find({userId:requiredId});
        if (!tasks) {
            errorMessageFor404(res);
        } else {
            res.json(tasks)
        }
    } catch (error) {
        catchErrorMessage(error, res);

    }
})

//!api for updating task STATUS by a users accessToken

router.put('/status/:id',[
    body("status","status should be given)").notEmpty(),
    body("status","status sholud be any of these threes('to-do','in-progress' or 'done')").isIn(["to-do","in-progress","done"])
],authenticateToken,async(req,res)=>{
    try {
         const errors = validationResult(req);
         if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()})
         }
        const requiredUserId = req.userPayload.id;
      const status  = req.body.status;
      const requiredId = req.params.id;
      const requiredTask = await Task.findByIdAndUpdate({_id:requiredId,urserId:requiredUserId},{status:status},{new:true});

      if(!requiredTask){
          errorMessageFor404(res);
      }else{
          res.json(requiredTask);
      }
    } catch (error) {
     catchErrorMessage(error, res);
    }
 })


//!api for updating user by id
router.put('/:id',authenticateToken,async(req,res)=>{
   try {
     const body = req.body;
     const requiredTaskId = req.params.id;
     const requiredUserId = req.userPayload.id;
     const requiredTask = await Task.findByIdAndUpdate({_id:requiredTaskId,userId:requiredUserId},body,{new:true});
     if(!requiredTask){
         errorMessageFor404(res);
     }else{
         res.json(requiredTask);
     }
   } catch (error) {
    catchErrorMessage(error, res);
   }
})


//!API FOR delete user by accessToken
router.delete('/:id',authenticateToken,async(req,res)=>{
    try {
        const requiredUserId = req.userPayload.id;
        const requiredTaskId = req.params.id;
     const requiredTask= await Task.findOneAndDelete({_id:requiredTaskId,userId:requiredUserId});
     if(!requiredTask){
         errorMessageFor404(res);
     }else{
         res.json(requiredTask);
     }
    } catch (error) {
        catchErrorMessage(error, res);
        
    }
})

module.exports = router;


function errorMessageFor404(res) {
    res.status(404).json({ Message: "Required Task not found" });
}

function catchErrorMessage(error, res) {
    console.log(`Something went wrong for the error :\n${error}`);
    res.status(500).json({ Message: "Something is wrong with the server" });
}
