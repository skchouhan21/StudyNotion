const OTP = require("../models/OTP");
const User = require("../models/User");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
require("dotenv").config();

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Email in senOtp controller", email);
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(401).json({
        success: false,
        message: "Email already exists",
      });
    }

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    let result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = OTP.findOne({ otp: otp });
    }
    console.log("OTP generated", otp);
    mailSender(email, "otp", otp);

    const createdOtp = await OTP.create({
      email,
      otp,
    });

    return res.status(200).json({
      success: true,
      message: "OTP created!",
      createdOtp,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.signUp = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      otp,
      contactNumer,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "Fill all details",
      });
    }

    if (password !== confirmPassword) {
      return res.status(403).json({
        success: false,
        message: "Passwords don't match",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(401).json({
        success: false,
        message: "Email already exists",
      });
    }

    // const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
    // console.log("Otp in signup page is:",recentOtp[0].otp)
    // if (recentOtp.length == 0) {
    //     return res.status(400).json({
    //         success:false,
    //         message:'OTP Not Found',
    //     })
    // } else if(otp !== recentOtp[0].otp){
    //     return res.status(400).json({
    //         success:false,
    //         message:"Invalid OTP",
    //     });
    // }

    // const recentOtp = await OTP.find({ email })
    //   .sort({ createdAt: -1 })
    //   .limit(1);

    // if (recentOtp.length === 0 || !recentOtp[0].otp) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "OTP Not Found",
    //   });
    // } else if (otp !== recentOtp[0].otp) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid OTP",
    //   });
    // }

    const hashedPwd = await bcrypt.hash(password, 10);

    let approved = "";
    approved === "Instructor" ? (approved = false) : (approved = true);

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumer: null,
    });

    console.log("Data received in signup is", firstName);
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPwd,
      accountType,
      approved: approved,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });
    console.log("Data created successfully");
    return res.status(200).json({
      success: true,
      message: "User is registered Successfully",
      newUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registrered. Please try again",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email or Password empty",
      });
    }

    const existingUser = await User.findOne({ email })
      .populate("additionalDetails")
      .exec();
    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email not registered",
      });
    }

    if (await bcrypt.compare(password, existingUser.password)) {
      const payload = {
        email: email,
        accountType: existingUser.accountType,
        id: existingUser._id,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });

      existingUser.toObject();
      existingUser.token = token;
      existingUser.password = undefined;

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      return res.cookie("token", token, options).status(200).json({
        success: true,
        message: "Login successfull",
        token,
        existingUser,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Login Failure, please try again",
    });
  }
};

// Controller for Changing Password
exports.changePassword = async (req, res) => {
  try {
    // Get user data from req.user
    const userDetails = await User.findById(req.user.id);

    // Get old password, new password, and confirm new password from req.body
    const { oldPassword, newPassword } = req.body;

    // Validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    );
    if (!isPasswordMatch) {
      // If old password does not match, return a 401 (Unauthorized) error
      return res
        .status(401)
        .json({ success: false, message: "The password is incorrect" });
    }

    // Match new password and confirm new password
    // if (newPassword !== confirmNewPassword) {
    // 	// If new password and confirm new password do not match, return a 400 (Bad Request) error
    // 	return res.status(400).json({
    // 		success: false,
    // 		message: "The password and confirm password does not match",
    // 	});
    // }

    // Update password
    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    );

    // Send notification email
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      );
      console.log("Email sent successfully:", emailResponse.response);
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      });
    }

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
    console.error("Error occurred while updating password:", error);
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    });
  }
};

// const User = require("../models/user");
// const otp = require("../models/OTP");
// const otpGenerator = require("otp-generator");
// const OTP = require("../models/OTP");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// require("dotenv").config();

// //sendOTP
// exports.sendOTP = async (req,res) => {
//     try {
//         //fetch email from reques body
//         const {email} = req.body;

//         //check if user already exist
//         const checkUserPresent = await User.findone({email});

//         //if user already exist, then return a response
//         if(checkUserPresent) {
//             return res.status(401).json({
//                 success:false,
//                 message:'User already registetred',
//             })
//         }

//         //generate otp
//         var otp = otpGenerator.generate(6, {
//             upperCaseAlphabets:false,
//             lowerCaseAlphabets:false,
//             specialChars:false,
//         });
//         console.log("OtP generated: ",otp);

//         //check unique otp or not
//         let result = await OTP.findOne({otp : otp});

//         while(result) {
//             otp = otpGenerator(6, {
//                 upperCaseAlphabets:false,
//                 lowerCaseAlphabets:false,
//                 specialChars:false,
//             });
//             result = await OTP.findOne({otp: otp});
//         }

//         const otpPayload = {email,otp};

//         //create an entry for otp
//         const otpBody = await OTP.create(otpPayload);
//         console.log(otpBody);

//         //return response successful
//         res.status(200).json({
//             success:true,
//             message:'OTP Sent Successfully',
//             otp,
//         })
//     }

//     catch(error){
//         console.log(error);
//         return res.status(500).json({
//             success:false,
//             message: error.message,
//         })
//     }
// }

// //signup
// exports.signUp = async (req,res) => {
//     try{
//         //data fetch from request body
//         const {
//             firstName,
//             lastName,
//             email,
//             password,
//             confirmPassword,
//             accountType,
//             contactNumber,
//             otp
//         } = req.body

//         //vaildation
//         if(!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
//             return res.status(403).json({
//                 success: false,
//                 message:"All fields are required",
//             })
//         }

//         //2 password match
//         if(password !== confirmPassword) {
//             return res.status(400).json({
//                 success:false,
//                 message: "Password and ConfirmPassword value does not match, please try again",
//             });
//         }

//         //check user already exist or not
//         const existingUser = await User.findOne({email});
//         if(existingUser){
//             return res.status(400).json({
//                 success:false,
//                 message:"User is already registered",
//             });
//         }

//         //find most recent OTP stored for the user
//         const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
//         console.log(recentOTP);
//         //validate OTP
//         if(recentOtp.length == 0){
//             //OTP no found
//             return res.status(400).json({
//                 success:false,
//                 message:"OTP Found",
//             })
//         }else if(otp !== recentOtp.otp){
//             //Invalid OTP
//             return res.status(400).json({
//                 success:false,
//                 message:"Invalid OTP",
//             });
//         }

//         //Hash password
//         const hashedPassword = await bcrypt.hash(password,10);

//         //entry create in DB
//         const ProfileDetails = await Profile.create({
//             gender:null,
//             dateOfBirth:null,
//             about:null,
//             contactNumber:null,
//         });

//         const user = await User.create({
//             firstName,
//             lastName,
//             email,
//             contactNumber,
//             password:hashedPassword,
//             accountType,
//             additionalDetails: ProfileDetails._id,
//             image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
//         })

//         //return response

//         return res.status(200).json({
//             success:true,
//             message:'User is registered Successfully',
//             User,
//         });
//     }
//     catch(error){
//         console.log(error);
//         return res.status(500).json({
//             success: false,
//             message:"User cannot be registered. Please try again",
//         })
//     }
// }

// //Login
// exports.login = async (req,res) => {
//     try{
//         //get data from request body
//         const {email, password} = req.body;
//         //validation data
//         if(!email || !password) {
//             return res.status(403).json({
//                 success: false,
//                 message:'All fields  are required'
//             });
//         }
//         //user check exist or not
//         const user = await User.findOne({email}).populate("additionalDetails");
//         if(!user){
//             return res.status(401).json({
//                 success:false,
//                 message:'User is not registered, please signup first',
//             });
//         }

//         //generate jwt, after password matching
//         if(await bcrypt.compare(password, user.password)){

//             const payload = {
//                 email: user.email,
//                 id: user._id,
//                 accountType: user.accountType,
//             }
//             const token = jwt.sign(payload, process.env.JWT_SECRET, {
//                 expiresIn:"2h",
//             });
//             user.token = token;
//             user.password = undefined;

//             //create cookie and send response
//             const options = {
//                 expires: new Date(Date.now() + 3*24*60*60*1000),
//                 httpOnly: true,
//             }
//             res.cookie("token", token, options).status(200).json({
//                 success:true,
//                 token,
//                 user,
//                 message: 'Logged in successfully',
//             })
//         }
//         else{
//             return res.status(401).json({
//                 success:false,
//                 message:'password is incorrect',
//             });
//         }
//     }
//     catch(error){
//         console.log(error);
//         return res.status(500).json({
//             success:false,
//             message:'Login failure, please try again',
//         })
//     }
// };

// //changePasword
// exports.changedPassword = async(req,res) => {
//     //get data from req body
//     //get oldpassword, newPassword, confirmPassword
//     //validation
//     //update pwd in DB
//     //send mail = Password updated
//     //return response
// }
