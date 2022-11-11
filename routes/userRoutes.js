const express = require("express");
const user_route = express();
const session = require("express-session");

const config = require("../config/config");

user_route.use(session({secret:config.sessionSecret,
    resave: true,
    saveUninitialized: true
}));

const auth = require("../middleware/auth");

user_route.set('view engine','ejs');
user_route.set('views','./views/users');

const bodyParser = require('body-parser');
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}))

const multer = require("multer");
const path = require("path");

user_route.use(express.static('public'));


const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,path.join(__dirname,'./public/userImages'));
    },
    filename: function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name);
    }
});
const upload = multer({storage:storage});


const userControllers = require("../controllers/userControllers");

user_route.get('/register',auth.isLogout,userControllers.loadRegister);

user_route.post('/register',upload.single('image'),userControllers.insertUser);

user_route.get('/verify',userControllers.verifyMail);

user_route.get('/',auth.isLogout,userControllers.loginLoad);
user_route.get('/login',auth.isLogout,userControllers.loginLoad);


user_route.post('/login',userControllers.verifyLogin);

user_route.get('/home',auth.isLogin,userControllers.loadHome);

user_route.get('/logout',auth.isLogin,userControllers.userlogout);

user_route.get('/forget', auth.isLogout,userControllers.forgetLoad);

user_route.post('/forget',userControllers.forgetVerify);

user_route.get('/forget-password',auth.isLogout,userControllers.forgetPasswordLoad);
user_route.post('/forget-password',userControllers.resetPassword);

user_route.get('/edit',auth.isLogin,userControllers.editLoad);

user_route.post('/edit',upload.single('image'),userControllers.updateProfile);

module.exports = user_route;