const express=require("express");
const router = express.Router();
const catchAsync=require("../utils/catchAsync");
const User=require("../models/user");
const passport = require("passport");
const {isLoggedIn,validateCat}=require("../middleware")

router.get("/register",catchAsync(async(req,res)=>{
    res.render("admin/register");
}));
router.post("/register",catchAsync(async(req,res)=>{
    try{
 const {email,username,password}=req.body;
const admin=new User({email,username});
const registeredAdmin=await User.register(admin,password);
req.login(registeredAdmin,err=> {
    if (err) return next(err);
    req.flash("success","Welcome to catmash!");
     res.redirect("/cats");
  })
    }
 catch(e)
    {
   req.flash("error",e.message);
   res.redirect("register");
 }
   
}));
router.get("/login",(req,res)=>{
    res.render("admin/login");
});

router.post("/login",passport.authenticate("local",{failureFlash:true,failureRedirect:"/login"}),catchAsync(async(req,res)=>{ 
req.flash("success","Welcome back");
const redirectUrl=req.session.returnTo ||"/cats"
res.redirect(redirectUrl);
}));

router.get("/logout",catchAsync(async(req,res)=>{
    req.logout();
    req.flash("success","Good bye")
    res.redirect("/");
}));




module.exports=router;