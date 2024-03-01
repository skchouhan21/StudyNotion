const mongoose =  require('mongoose');

const userSchema = new mongoose.Schema({
    firstName:{
        type:String, 
        required:true,
        trim:true
    },
    lastName:{
        type:String, 
        required:true,
        trim:true
    },
    email:{
        type:String, 
        required:true,
        trim:true
    },
    password:{
        type:String, 
        required:true,
        trim:true
    },
    accountType:{
        type:String, 
        enum:["Student","Instructor","Admin"],
        required:true,
    },
    additionalDetails:{
        type:mongoose.Schema.Types.ObjectId, 
        ref:"Profile",
        required:true, //watch for this required or not
    },
    courses:[{
        type:mongoose.Schema.Types.ObjectId, 
        ref:"Course",
    }],
    token:{
        type: String
    },
    resetPasswordExpires:{
        type: Date
    },
    image:{
        type:String,
        required:true
    },
    courseProgress:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"CourseProgress"
    }],
    active: {
        type: Boolean,
        default: true,
    },
    approved: {
        type: Boolean,
        default: true,
    },
})

module.exports = mongoose.model("User", userSchema);


















// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//     firstName: {
//         type:String,
//         required:true,
//         trim:true,
//     },
//     lastName:{
//         type: String,
//         required: true,
//         trim:true,
//     },
//     email: {
//         type: String,
//         unique : true,
//         required: true,
//         trim:true,
//     },
//     password: {
//         type: String,
//         required: true,
//         minlength: 6,
//     },
//     accountType: {
//         type: String,
//         enum: ["Admin","Student", "Instructor"], 
//         required:true,
//     },
//     additionalDetails:{
//         type:mongoose.Schema.Types.ObjectId,
//         required:true,
//         ref:"Profile",
//     },
//     courses: [
//         {
//             type: mongoose.Schema.Types.ObjectId,
//             ref:"Course",
//         }
//     ],
//     image:{
//         type: String,
//         required:true,
//     },
//     token: {
//         type:String,
//     },
//     resetPasswordExpires: {
//         type: Date,
//     },
//     courseProgress: [
//         {
//             type : mongoose.Schema.Types.ObjectId,
//             ref:"CourseProgress",
//         }
//     ],
// });

// module.exports = mongoose.model("user", userSchema);