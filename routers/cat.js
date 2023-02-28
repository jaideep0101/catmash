const express=require("express");
const router = express.Router();
const catchAsync=require("../utils/catchAsync");
const Cat=require("../models/cats");
const {isLoggedIn,validateCat}=require("../middleware")
const {cloudinary,storage}=require("../cloudinary/cloudinary")
const multer=require("multer");
var cloudinary = require('cloudinary');
const upload=multer({storage})

router.get("/",catchAsync(async(req,res)=>{
    const cats=await Cat.aggregate([ { $sample: { size: 2 } }]);
    res.render("cats/home",{cats});
   }));

   router.get("/cats",catchAsync(async(req,res)=>{
    const cats=await Cat.find({});
     res.render("cats/index",{cats});
    }));
    router.get("/about",catchAsync(async(req,res)=>{
      res.render("cats/about");
     }));

    router.post("/cats",isLoggedIn,upload.single("image"),validateCat,catchAsync(async(req,res)=>{
       const {path,filename}=req.file;
      const cat=new Cat(req.body.cat);
      console.log(req.file);
        cat.images=({url:path,filename});
        await cat.save();
        req.flash("success","Cat has been uploaded");
        res.redirect("/cats");
      }));

    router.get("/leaderboard",catchAsync(async(req,res)=>{
        const cats= await Cat.find({}).sort({likes:-1});
        res.render("cats/leaderboard",{cats});
    }));
    
      router.get("/cats/new",isLoggedIn,(req,res)=>{
        res.render("cats/new");
    });
    
      router.put("/cats/:id",catchAsync(async(req,res)=>{
        const {id}=req.params;
        const cat=await Cat.findByIdAndUpdate(id,{$inc:{likes:1}});
        await cat.save();
        res.redirect("/");
     }));
     
     router.delete("/cats/:id",isLoggedIn,catchAsync(async(req,res)=>{
       await Cat.findByIdAndDelete(req.params.id);    
await cloudinary.uploader.destroy(req.body.deleteImages);
      res.redirect("/cats");
       
     }));

   module.exports=router;