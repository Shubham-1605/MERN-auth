import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import {EMAIL_VERIFY_TEMPLATE,PASSWORD_RESET_TEMPLATE} from '../config/emailTemplates.js'

export const register = async (req, res) => {
    
    const {name, email, password} = req.body;

    if(!name || !email || !password){
        return res.json({success: false, message: 'Missing details'});
    }

    try{

        const existingUser = await userModel.findOne({email});

        if(existingUser){
            return res.json({success: false, message: 'User already exists'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({name, email, password: hashedPassword});
        await user.save();

        const token = jwt.sign({id: user._id},process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token', token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        // sendinig welcome email to user after registration
        const mailoption = {
            from: process.env.SMTP_EMAIL,
            to: email,
            subject: 'Welcome to our app',
            text: `welcome to thunder website.your account has been created with email id : ${email}`
        }

        try {
            const info = await transporter.sendMail(mailoption);
            console.log('Welcome email send result:', {
                accepted: info.accepted,
                rejected: info.rejected,
                messageId: info.messageId
            });
        } catch (mailError) {
            console.error('Error sending welcome email:', mailError);
        }

        return res.json({success: true});

    }catch(error){
        res.json({success: false, message: error.message});
    }
};

export const login = async (req,res) =>{
    const {email,password} = req.body;

    if(!email || !password){
        return res.json({success: false, message: 'Email and password are required'});
    }

    try{
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success: false, message: 'Invalid email'});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.json({success: false, message: 'Invalid password'});
        }

        const token = jwt.sign({id: user._id},process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token', token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        return res.json({success: true});

    }catch(error){
        return res.json({success: false, message: error.message});
    }
}

export const logout = async (req, res) => {

    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.json({ success: true, message: "logged out" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// send verifivation OTP to user email
export const sendverifyotp = async (req,res) => {
    try{
        const userId = (req.body && req.body.userId) || req.userId;

        const user = await userModel.findById(userId);

        if(user.isAccountVerified){
            return res.json({success: false, message: 'Account is already verified'});
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.verifyotp = otp;
        user.verifyotpexpiryAt = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

        await user.save();

        const mailoption = {
            from: process.env.SMTP_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            // text: `your OTP for account verification is ${otp}. It is valid for 10 minutes.`
            html :EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
        }
        await transporter.sendMail(mailoption);

        res.json({success: true, message: 'verification OTP sent to email'});

    }catch(error){
        res.json({success: false, message: error.message});
    }
}


// verify accout using OTP
export const verifyEmail = async (req,res) => {
    const otp = req.body ? req.body.otp : undefined;
    const userId = (req.body && req.body.userId) || req.userId;

    if(!userId || !otp){
        return res.json({success: false, message: 'Missing details'});
    }
    try{
        const user = await userModel.findById(userId);

        if(!user){
            return res.json("success: false, message: 'user not found");
        }

        if(user.verifyotp === ' ' || user.verifyotp !== otp){
            return res.json({success: false, message: 'Invalid OTP'});
        }

        if(user.verifyotpexpiryAt < Date.now()){
            return res.json({success: false, message: 'OTP expired'});
        }

        user.isAccountVerified = true;
        user.verifyotp = ' ';
        user.verifyotpexpiryAt = 0;

        await user.save();
        return res.json({success: true,message: 'email verified successfully'});

    }catch(error){
        res.json({success: false, message: error.message});
    }
}

// check user is authenticated or not
export const isAuthenticated = async (req,res) => {
    try{
        return res.json({success:true});
    }catch(error){
        res.json({success: false, message: error.message});
    }
}

// send password reset OTP
export const sendresetotp = async (req,res) =>{
    const {email} = req.body;
    
    if(!email){
        return res.json({success: false, message: 'Email is required'});
    }

    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false, message: 'User not found'});
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.resetotp = otp;
        user.resetotpExpireAt = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

         await user.save();

        const mailoption = {
            from: process.env.SMTP_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            // text: `your OTP for password reset is ${otp}. It is valid for 10 minutes.`
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
        }
        await transporter.sendMail(mailoption);

        return res.json({success: true, message: 'password reset OTP sent to email'});

    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

// reset password using OTP
export const resetpassword = async (req,res) => {
    const {email, otp, newPassword} = req.body;

    if(!email || !otp || !newPassword){
        return res.json({success: false, message: 'Email, OTP and new password are required'});
    }

    try {
        
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false, message:'user not found'});
        }

        if(user.resetotp === ' ' || user.resetotp !== otp){
            return res.json({success: false, message: 'Invalid OTP'});
        }

        if(user.resetotpExpireAt < Date.now()){
            return res.json({success: false, message: 'OTP expired'});
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetotp = ' ';
        user.resetotpExpireAt = 0;

        await user.save();
        return res.json({success: true, message: 'password reset successfully'});

    } catch (error) {
        return res.json({success: false, message : error.message});
    }
}
