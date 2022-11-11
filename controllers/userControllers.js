const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const config = require("../config/config");


const securePassword = async (password) => {

    try{
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;

    }catch(error){
        console.log(error.message);
    }

}

const sendVerifyMail = async(name,email,user_id)=>{
    try{
        const transporter = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:config.emailUser,
                pass:config.emailPass
            }
        });
        const mailOptions = {
            from:config.emailUser,
            to:email,
            subject:'Verification mail',
            html:'<p>Hi '+name+' please click heare to <a href="http://localhost:3000/verify?id='+user_id+'"> verify </a> your mail.</p>'
        }
        transporter.sendMail(mailOptions, function(err,info){
            if(error){
                console.log(error);
            }else{
                console.log("Email has been sent:- ",info.response);
            }
        });
    }catch(error){
        console.log(error.message);
    }
}


const sendRestPasswordMail = async(name,email,token)=>{
    try{
        const transporter = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:config.emailUser,
                pass:'fgewoszndkvvdxlw'
            }
        });
        const mailOptions = {
            from:'shaikshoaibsoftwares@gmail.com',
            to:email,
            subject:'Reset Password',
            html:'<p>Hi '+name+' please click heare to <a href="http://localhost:3000/forget-password?token='+token+'"> forget </a> to Reset password</p>'
        }
        transporter.sendMail(mailOptions, function(err,info){
            if(err){
                console.log(err);
            
            }else{
       
                console.log("Email has been sent:- ",info.response);  
            }
        });
    }catch(error){
        console.log(error.message);
    }
}


const loadRegister = async(req,res) => {
    try{
        res.render('registration');
    }catch(error){
        console.log(error.message);
    }
}

const insertUser = async(req,res) => {

    try{
        const spassword = await securePassword(req.body.password);
        const user = new User({
            name:req.body.name,
            email:req.body.email,
            place:req.body.place,
            mobile:req.body.mno,
            image:req.file.filename,
            password:spassword,
            is_admin:0
        });

        const userData = await user.save();
        if(userData){
            sendVerifyMail(req.body.name, req.body.email, userData._id);
            res.render('registration',{message:"Registred sucessfully. verify your mail"});
        }else{
            res.render('registration',{message:"Registration failed"});
        }

    }catch(error){
        console.log(error.message);
    }
}

const verifyMail = async(req,res) =>{
    try{
        const updateInfo = await User.updateOne({_id:req.query.id},{ $set:{ is_verfied:1}});

        console.log(updateInfo);
        res.render("email-verified");
    }catch(error){
        console.log(error.message);
    }
}

//login
const loginLoad = async(req,res)=>{
    try{
        res.render('login');
    }catch(error){
        console.log(error.message);
    }
}

const verifyLogin = async(req,res) =>{
    try{
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({email:email});

        if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password);
            if(passwordMatch){
                if(userData.is_verfied===0){
                    res.render('login',{message:"Please verify your mail."})
                }else{
                    req.session.user_id = userData._id;
                     res.redirect('/home');
                    
                }
            }else{
                return res.status(200).send({message:"Incorrect Credentials"});
                // res.send('login',{message:"Incorrect Credentials"});
                
            }
        }else{
            res.status(200).send({message:"Incorrect Credentials"});
            // res.send('login',);
         
        }
    }catch(error){
        console.log(error.message);
       
    }
}

const loadHome = async(req,res) =>{
    try{
        const userData  = await User.findById({_id:req.session.user_id});
        res.render('home',{user:userData});
        
    }catch(error){
        console.log(error.message);
    }
}


const userlogout = async(req,res)=>{
    try{
        req.session.destroy();
        res.redirect('/');

    }catch(error){
        console.log(error.message);
    }
}

const forgetLoad  = async (req,res) =>{
    try{
        res.render('forget');
    }catch(error){
        console.log(error.message);
    }
}

const forgetVerify = async(req,res)=>{
    try{
        const email = req.body.email;
        const userData =  User.findOne({emai:email});
        if(userData){
       
            if(userData.is_verfied==0){
                res.render('forget',{message:"Please veify your mail"});
            }else{
                const randomString =randomstring.generate();
                const updatedData = await User.updateOne({email:email},{$set:{token:randomString}});
                sendRestPasswordMail(userData.name,userData.email,randomString);
                res.render('forget',{message:"check your mail to reset password"});

              } 

        }else{  
            res.render('forget',{message:"Email dosent exist."});
        }
    }catch(error){
        console.log(error.message)
    }
}

const forgetPasswordLoad = async(req,res) =>{
    try{
        const token = req.query.token;
        const tokenData = await User.findOne({token:token});
        if(tokenData){
            res.render('forget-password',{user_id:tokenData._id});
        }else{
            res.render('404',{message:"token is invalid"});
        }
    }catch(error){
        console.log(error.message);
    }
}

const resetPassword = async(req,res)=>{
    try{
        const password = req.body.password;
        const user_id = req.body.user_id;

        const secure_password = await securePassword(password);
        const updatedData =  await User.findByIdAndUpdate({_id:user_id},{$set:{password:secure_password,toke:''}});
        req.redirect("/");
    }catch(error){
        console.log(error);
    }
}

const editLoad = async(req,res)=>{
    try{

        const id = req.query.id;
        const userData = await User.findById({_id:id});
        if(userData){
            res.render('edit',{user:userData});

        }else{
            res.redirect('/home');
        }

    }catch(error){
        console.log(error.message);
    }
}

const updateProfile = async(req,res) =>{
    try{

        if(req.file){
            const userData = await User.findByIdAndUpdate({_id:req.body.user_id},{$set:{name:req.body.name,place:req.body.place,email:req.body.email,mobile:req.body.mno,image:req.file.filename}});

        }else{
            const userData = await User.findByIdAndUpdate({_id:req.body.user_id},{$set:{name:req.body.name,place:req.body.place,email:req.body.email,mobile:req.body.mno}});
        }

        res.redirect('/home');

    }catch(error){
        console.log(error.message)
    }
}

module.exports = {
    loadRegister,
    insertUser,
    verifyMail,
    loginLoad,
    verifyLogin,
    loadHome,
    userlogout,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword,
    editLoad,
    updateProfile
}