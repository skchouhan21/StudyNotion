const User = require("../models/User")
const crypto = require('crypto')
const mailSender = require('../utils/mailSender');
const bcrypt = require('bcrypt')

exports.resetPasswordToken = async (req,res) => {

   try {
       const {email} = req.body;

       if(!email){
           return res.status(400).json({
               success:false,
               message:"Email is empty"
           })
       }
   
       const existingUser = await User.findOne({email})
   
       if(!existingUser){
           return res.status(400).json({
               success:false,
               message:"Email doesn't exist"
           })
       }
   
       const token = crypto.randomUUID()
   
       const updatedUser = await User.findOneAndUpdate({email},
                                                    {
                                                    token:token,
                                                    resetPasswordExpires: Date.now() + 5*60*1000
                                                    },
                                                    {new:true}) 

       const url = `http://localhost:3000/update-password/${token}`

       await mailSender(email, "Password Reset Link", `Password reset link: ${url}`);

       return res.status(200).json({
           success:true,
           message:'Reset link sent'
       })
   } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong while sending reset pwd mail'
        })
   }
}

exports.resetPassword = async (req,res) => {

    try {
        const {token, password, confirmPassword} = req.body;     

        if(!token||!password||!confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Enter all details"
            })
        }

        const existingUser = await User.findOne({token:token});
        if(!existingUser) {
            return res.json({
                success:false,
                message:'Token is invalid',
            });
        }

        if(existingUser.resetPasswordExpires<Date.now()){
            return res.status(500).json({
                success:false,
                message:"Token is no longer valid"
            })
        }

        if (password!==confirmPassword) {
            return res.status(500).json({
                success:false,
                message:"Password Don't match"
            })
        }

        const hashedPwd = await bcrypt.hash(password, 10);
        const updatedUser = await User.findOneAndUpdate({token},{
            password:hashedPwd
        },{new:true})
        console.log("Updated user after password change is", updatedUser)
        return res.status(200).json({
            success:true,
            message:"Password Changed successfully"
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong while reseting password'
        })
    }
}


















// const User = require("../models/user");
// const mailSender = require("../utils/mailSender");
// const bcrypt = require("bcrypt");
// //resetPasswordToken
// exports.resetPasswordToken = async (req, res) => {
//     try{
//             //get email from req body
//             const email = req.body.email;
//             //check user for this email, email validation
//             const user = await User.findOne({email: email});
//             if(!user) {
//                 return res.json({success:false,
//                 message:'Your Email is not registered with us'});
//             }
//             //generate token
//             const token = crypto.randomUUID();
//             //update user by adding token and expiration time
//             const updatedDetails = await User.findOneAndUpdate(
//                 {email : email},
//                 {
//                     token:token,
//                     resetPasswordExpires: Date.now() + 5*60*1000,
//                 },
//                 {
//                     new:true
//                 }
//             );
//             //create url
//             const url = `http://localhost:8003/update-password/${token}`
//             //send mail containing the url
//             await mailSender(email, 
//                             "Password Reset Link",
//                             `Password Reset Link: ${url}`);
//             //return response

//             return res.json({
//                 success:true,
//                 message:'Email sent successfully, please check email and change password',
//             });
//     }
//     catch(error){
//         console.log(error);
//         return res.status(500).json({
//             success:false,
//             message: 'something wentwrong while semding reset password mail'
//         })
//     }

// }

// //resetPassword

// exports.resetPassword = async (req,rs) => {
//     try{
//         //data fetch
//         const {token , password , confirmPassword} = req.body;
//         //validation
//         if(password !== confirmPassword){
//             return res.json({
//                 success: false,
//                 message: 'Password not matching',
//             });
//         }
//         //get userdetails from db using token
//         const userDetails = await User.findOne({token: token});
//         //if no entry - invalid token
//         if(!userDetails) {
//             return res.json({
//                 success:false,
//                 message:'Token is invalid',
//             });
//         }
//         //token time check
//         if(userDetails.resetPasswordExpires < Date.now()){
//             return res.json({
//                 success:false,
//                 message:'Token is expired, please regenerate your token',
//             });
//         }
//         //hash password
//         const hashedPassword = await bcrypt.hash(password, 10);
//         //password update 
//         await User.findOneAndUpdate(
//             {token:token},
//             {password:hashedPassword},
//             {new:true},
//         );
//         //return response
//         return res.status(200).json({
//             success:true,
//             message:"password reset successful",
//         });
//     }
//     catch(error){
//         console.log("Error in Password Reset : ", error);
//         return res.status(500).json({
//             success:false,
//             message:"Something went wrong while sending reset password mail"
//         })
//     }
// }