const jwt = require("jsonwebtoken")


exports.auth = async (req,res, next) => {

    try {
        
        const token = req.body.token || req.cookies.token || req.get("Authorization")?.replace("Bearer ", "");
        
        if(!token) {
            
            return res.status(401).json({
                success:false,
                message:'TOken is missing',
            });
        }
        try {            
            const payload = jwt.verify(token,process.env.JWT_SECRET);
            req.user = payload;
        } catch (error) {            
            return res.status(401).json({
                success:false,
                message:"Invaild token."
            })
        }         
        next();
    } 
    catch (error) {        
        console.log(error)
        return res.status(401).json({
            success:false,
            message:"Error in validating token"
        })
    }
}

exports.isStudent = async(req,res,next) => {
    try{
        if(req.user.accountType !== "Student") {
            return res.status(401).json({
                success:false,
                message:'This is a protected route for Students only',
            });
        }
        next();
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:'User role cannot be verified, please try again'
        })
    }
}
exports.isInstructor = async(req,res,next) => {
    try{
        if(req.user.accountType !== "Instructor") {
            return res.status(401).json({
                success:false,
                message:'This is a protected route for Instructor only',
            });
        }
        next();
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:'User role cannot be verified, please try again'
        })
    }
}

exports.isAdmin = async (req, res, next) => {
    try{
        console.log("printing AccountType", req.user.accountType)
           if(req.user.accountType !== "Admin") {
               return res.status(401).json({
                   success:false,
                   message:'This is a protected route for Admin only',
               });
           }
           next();
    }
    catch(error) {
       return res.status(500).json({
           success:false,
           message:'User role cannot be verified, please try again'
       })
    }
   }


















// const jwt = require("jsonwebtoken");
// require("dotenv").config();
// const User = require("../models/user");

// //auth
// exports.auth = async (req,res,next) => {
//     try{
//         //extract token
//         const token = req.cookies.token 
//                         || req.body.token 
//                         || req.header("Authorisation").replace("Bearer ","");

//         //if token missing, then return response
//         if(!token) {
//             return res.status(401).json({
//                 success:false,
//                 message:"Token is missing",
//             });
//         }
//         //verify the token
//         try{
//             const decode = jwt.verify(token, process.env.JWT_SECRET);
//             console.log(decode);
//             req.user = decode;
//         }
//         catch(error){
//             //verification - issue
//             return res.status(401).json({
//                 success:false,
//                 message:'token is invalid',
//             });
//         }
//         next();
//     }
//     catch(error){
//         return res.status(401).json({
//             success:false,
//             message: "Something went wrong while validating the token",
//         });
//     }
// }


// //isStudent
// exports.isStudent = async (req, res, next) => {
//     try{
//         if(req.user.accountType !== "Student") {
//             return res.status(401).json({
//                 success:false,
//                 message:'This is a protected route for students only',
//             });
//         }
//         next();
//     }
//     catch(error){
//         return res.status(500).json({
//             success:false,
//             message:"User role connot be varified, please try again"
//         })
//     }
// }

// //isInstructor
// exports.isInstructor = async (req, res, next) => {
//     try{
//         if(req.user.accountType !== "Instructor") {
//             return res.status(401).json({
//                 success:false,
//                 message:'This is a protected route for Instructor only',
//             });
//         }
//         next();
//     }
//     catch(error){
//         return res.status(500).json({
//             success:false,
//             message:"User role connot be varified, please try again"
//         })
//     }
// }

// //isAdmin
// exports.isAdmin = async (req, res, next) => {
//     try{
//         if(req.user.accountType !== "Admin") {
//             return res.status(401).json({
//                 success:false,
//                 message:'This is a protected route for Admin only',
//             });
//         }
//         next();
//     }
//     catch(error){
//         return res.status(500).json({
//             success:false,
//             message:"User role connot be varified, please try again"
//         })
//     }
// }