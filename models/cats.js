const mongoose=require("mongoose");
const Schema=mongoose.Schema;



const catSchema= Schema({
    name:{
        type:String,
        require:true
    },
    images:[{
        url:String,
        filename:String
    }
    ],
    likes:{
        type:Number,
        default:0
        
    }
    
})

module.exports= mongoose.model("Cat",catSchema);