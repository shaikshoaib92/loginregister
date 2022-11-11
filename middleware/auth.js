
const isLogin = async(req,res,next) =>{
    try{
        if(req.session.user_id){ }
        else{
            return res.redirect('/');
        }
        next();
    }catch(error){
        return console.log(error.messagr);
    }
}

const isLogout = async(req,res,next) =>{
    try{
        if(req.session.user_id){
            return res.redirect('/home');
        }
        next();
    }catch(error){
       return console.log(error.messagr);
    }
}

module.exports={
    isLogin,
    isLogout
}