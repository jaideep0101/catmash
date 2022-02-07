const {catSchema}=require("./schema");
const ExpressError = require("./utils/ExpressError")

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo=req.originalUrl;
        req.flash("error","Login To Upload Cuties")
        res.redirect("/login");
      }
      else{
          next();
      }
}

module.exports.validateCat = (req,res,next)=>{
    const {error}= catSchema.validate(req.body);
    console.log(req.body);
    if(error){
       const msg=error.details.map(el=>el.message).join(",");
       throw new ExpressError(msg,400);
    }
    else{
        next();
    }
}
