const mongoose =  require('mongoose');

const profileSchema = new mongoose.Schema({
    firstName:{
        type:String, 
        trim:true
    },
    lastName:{
        type:String, 
        trim:true
    },
    gender:{
        type:String, 
    },
    dateOfBirth:{
        type:String, 
        
    },
    about:{
        type:String, 
        trim:true,
    },
    contactNumber:{
        type:String, 
    },


})

module.exports = mongoose.model("Profile", profileSchema);


















// const mongoose = require("mongoose");

// const profileSchema = new mongoose.Schema({
//     gender: {
//         type: String,
//     },
//     dateOfBirth: {
//         type: String,
//     },
//     about: {
//         type: String,
//         trim : true,
//     },
//     contactNumber: {
//         type: Number,
//         trim : true,
//     }
// });

// module.exports = mongoose.model("Profile", profileSchema);