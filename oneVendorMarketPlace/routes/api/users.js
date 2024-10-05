const express = require('express');
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const authenticateToken  = require('../../middleware/auth')


router.post('/', [
    body("fname", "first name is required").notEmpty(),
    body("lname", "last name is requires").notEmpty(),
    body("email", "please enrter a valid email address").notEmpty().isEmail(),
    body("age", "Age is not mendatory field but it should be numeric").optional().isNumeric(),
    body("password", "Password should be 6 characters or more").notEmpty().isLength({ min: 6 }),
    body("type", "type is required").notEmpty(),
    body("type", "type should be either 'admin' or 'customer'").isIn(["admin", "customer"])

],
    async (req, res) => {

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const hashedPassWord = await hashThePassword(req);
            const userObject = {
                fname: req.body.fname,
                lname: req.body.lname,
                email: req.body.email,
                age: req.body.age,
                password: hashedPassWord,
                type:req.body.type
            }
            const user = new User(userObject);
            await user.save();
            res.json(user);
        } catch (error) {
            catchErrorMessage(error, res);
        }

    })


//!api for getting all user
router.get('/', async (req, res) => {
    try {
        const all_users = await User.find({});
        if (!all_users) {
            errorMessageFor404(res);
        } else {
            res.json(all_users)
        }
    } catch (error) {
        catchErrorMessage(error, res);

    }
})

//!api for user login
router.post('/login', [
    body("type", "type should be defined").notEmpty(),
    body("type", "type should be either 'email' or 'refresh'").isIn(["email", "refresh"])
],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() })
            }
            const { email, password, type, refreshToken } = req.body;
            if (type == 'email') {
                await handleEmailLogin(email, res, password);
            } else {
                await handleRefreshLogin(refreshToken, res);
            }
        } catch (error) {
            catchErrorMessage(error, res);

        }
    })


//!api for user profile by accessToken
router.get('/profile',authenticateToken,async(req,res)=>{
    try {
        const requiredId = req.userPayload.id;
        const requiredUser = await User.findById(requiredId);
        if(!requiredUser){
            errorMessageFor404(res);
        }else{
            res.json(requiredUser);
        }
    } catch (error) {
        catchErrorMessage(error, res);
    }
})


//!api for updating user by id
router.put('/:id',async(req,res)=>{
   try {
     const body = req.body;
     if(body.password){
         const hashedPassWord = await hashThePassword(req);
         body.password= hashedPassWord;
     }
     const requiredId = req.params.id;
     const requiredUser = await User.findByIdAndUpdate(requiredId,body,{new:true});
     if(!requiredUser){
         errorMessageFor404(res);
     }else{
         res.json(requiredUser);
     }
   } catch (error) {
    catchErrorMessage(error, res);
   }
})
//!api for updating user by accessToken
router.put('/',authenticateToken,async(req,res)=>{
   try {
     const body = req.body;
     if(body.password){
         const hashedPassWord = await hashThePassword(req);
         body.password= hashedPassWord;
     }
     const requiredId = req.userPayload.id;
     const requiredUser = await User.findByIdAndUpdate(requiredId,body,{new:true});
     if(!requiredUser){
         errorMessageFor404(res);
     }else{
         res.json(requiredUser);
     }
   } catch (error) {
    catchErrorMessage(error, res);
   }
})

//!API FOR delete user by id
router.delete('/:id',async(req,res)=>{
    try {
        const requiredId = req.params.id;
     const requiredUser = await User.findByIdAndDelete(requiredId);
     if(!requiredUser){
         errorMessageFor404(res);
     }else{
         res.json(requiredUser);
     }
    } catch (error) {
        catchErrorMessage(error, res);
        
    }
})
//!API FOR delete user by accessToken
router.delete('/',authenticateToken,async(req,res)=>{
    try {
        const requiredId = req.userPayload.id;
     const requiredUser = await User.findByIdAndDelete(requiredId);
     if(!requiredUser){
         errorMessageFor404(res);
     }else{
         res.json(requiredUser);
     }
    } catch (error) {
        catchErrorMessage(error, res);
        
    }
})






module.exports = router;






async function hashThePassword(req) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassWord = await bcrypt.hash(req.body.password, salt);
    return hashedPassWord;
}

async function handleEmailLogin(email, res, password) {
    const requiredUser = await User.findOne({ email: email });
    if (!requiredUser) {
        errorMessageFor404(res);

    } else {
        const isValidPassword = bcrypt.compare(password, requiredUser.password);
        if (!isValidPassword) {
            res.status(401).json({ Message: "Wrong Paassword" });
        } else {
            await getUserTokens(requiredUser, res);

        }
    }
}

function handleRefreshLogin(refreshToken, res) {
    if (!refreshToken) {
        res.status(401).json({ Message: "Refresh token not found" });
    } else {
         jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, payload) => {
            if (err) {
                res.status(401).json({ Message: "Unauthorized" });
            } else {
                const requiredId = payload.id;
                const requiredUser = await User.findById(requiredId);
                if (!requiredUser) {
                    errorMessageFor404(res);

                } else {
                    await getUserTokens(requiredUser, res);

                }
            }
        });
    }
}



function getUserTokens(requiredUser, res) {
    const accessToken =  jwt.sign({ email: requiredUser.email, id: requiredUser._id ,type:requiredUser.type}, process.env.JWT_SECRET, { expiresIn: "3h" });
    const refreshToken = jwt.sign({ email: requiredUser.email, id: requiredUser._id }, process.env.JWT_SECRET, { expiresIn: "110h" });
    const requiredUsers_JSON = requiredUser.toJSON();
    requiredUsers_JSON.accessToken = accessToken;
    requiredUsers_JSON.refreshToken = refreshToken;
    res.json(requiredUsers_JSON);
}

function errorMessageFor404(res) {
    res.status(404).json({ Message: "Users not found" });
}

function catchErrorMessage(error, res) {
    console.log(`Something went wrong for the error :\n${error}`);
    res.status(500).json({ Message: "Something is wrong with the server" });
}
