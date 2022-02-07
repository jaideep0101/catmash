const mongoose=require("mongoose");
const Cat=require("../models/cats");
const {cats}=require("./seedHelpers");

mongoose.connect('mongodb://localhost:27017/catsDB')
.then(()=>{
    console.log("The database is connected");
});

const sample = (array)=>array[Math.floor(Math.random()*array.length)];

const seeds = async()=>{
await Cat.deleteMany({});
for(let i=0;i<18;i++){
    const cat = new Cat({
    name:`${sample(cats)}`,
    likes:0,
    images:[
        {
            url: "https://res.cloudinary.com/dygo6du89/image/upload/v1643878808/catmash/nxuay6ipl51apqaitvjz.jpg",
            filename: 'catmash/nxuay6ipl51apqaitvjz',
            
          }
      
    ]
});
await cat.save();
}}

seeds().then(()=> {
    mongoose.connection.close()
});
