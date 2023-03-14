if(process.env.Node_ENV !=="deployment"){
    require("dotenv").config(); 
}

const express=require("express");
const mongoose=require("mongoose");
const ejsMate=require("ejs-mate");
const session=require("express-session");
const path =require("path");
const User=require("./models/user");
const methodOverride=require("method-override");
const ExpressError = require("./utils/ExpressError");
const flash=require("connect-flash");
const passport = require("passport");
const localStrategy=require("passport-local");
const mongoSanitize=require("express-mongo-sanitize");
const helmet = require("helmet");
const MongoStore = require('connect-mongo');


const catsRoutes=require("./routers/cat")
const userRoutes=require("./routers/user");

const dbUrl=process.env.DB_URL ||'mongodb://127.0.0.1:27017/catsDB';

mongoose.set("strictQuery", false);
mongoose.connect(dbUrl)
.then(()=>{
    console.log("The database is connected");
})

const app=express();
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"public")));
app.engine("ejs",ejsMate);
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
app.use(mongoSanitize());

const secret=process.env.SECRET ||"this is a secret";
const store=MongoStore.create({
    mongoUrl:dbUrl,
    secret,
    touchAfter:24*60*60
})

store.on("error",function(e){
    console.log("SESSION STORE ERROR",e)
})

const sess={
    store,
    name:"session",
    secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:new Date(Date.now() + 8 * 3600000),
        httpOnly:true,
        //secure:true
    } 
  }

app.use(session(sess));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new localStrategy(User.authenticate()));

const scriptSrcUrls=[
    "https://stackpath.bootstrapcdn.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls=[
    "https://cdn.jsdelivr.net",
    "https://use.fontawesome.com/",
];

app.use(helmet.contentSecurityPolicy({
    directives:{
        defaultSrc: [],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        imgSrc:[
            "'self'","data:", "https://res.cloudinary.com/dygo6du89/",
            "https://images.unsplash.com"
        ],
        
    },
})),
helmet.crossOriginOpenerPolicy({policy:"same-origin"}),
helmet.crossOriginResourcePolicy({ policy: "same-site"})


app.use((req,res,next)=>{
    res.locals.admin=req.user;
    res.locals.message=req.flash("success");
    res.locals.error=req.flash("error");
    next();
})

app.use("/",(catsRoutes));
app.use("/",(userRoutes));

app.all("*",(req,res,next)=>{
   next(new ExpressError("Page not found",404))
})

app.use((err,req,res,next)=>{
    const {statusCode=500}=err;
    if(!err.message)err.message="Oh,no something went wrong"
    res.status(statusCode).render("error",{err});
})

const port=process.env.PORT ||3000;

app.listen(port,()=>{
    console.log(`Serving on the port ${port}`);
})
