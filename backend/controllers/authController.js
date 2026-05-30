const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Profile = require("../models/Profile");

const registerUser = async (req,res)=>{

    try{

        const { email, password } = req.body;

        if(!email || !password){

            return res.status(400).json({
                message:"Email and password are required"
            });

        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email:normalizedEmail
        });

        if(existingUser){

            return res.status(400).json({
                message:"User already exists"
            });

        }

        const hashedPassword =
            await bcrypt.hash(password,10);

        const user = await User.create({
            email:normalizedEmail,
            password:hashedPassword
        });

        try{

            await Profile.create({
                owner:user._id,
                name:normalizedEmail.split("@")[0],
                genres:[],
                creators:[],
                moods:[],
                interests:[],
                watchHistory:[],
                feedbackHistory:[],
                searchHistory:[],
                language:"English"
            });

        }
        catch(profileError){

            await User.findByIdAndDelete(user._id);

            throw profileError;

        }

        res.status(201).json({
            _id:user._id,
            email:user.email,
            role:user.role,
            createdAt:user.createdAt,
            updatedAt:user.updatedAt
        });

    }
    catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};

const loginUser = async (req,res)=>{

    try{

        const { email, password } = req.body;

        if(!email || !password){

            return res.status(400).json({
                message:"Email and password are required"
            });

        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email:normalizedEmail
        });

        if(!user){

            return res.status(401).json({
                message:"Invalid credentials"
            });

        }

        const isPasswordValid =
            await bcrypt.compare(password,user.password);

        if(!isPasswordValid){

            return res.status(401).json({
                message:"Invalid credentials"
            });

        }

        const token = jwt.sign(
            {
                userId:user._id,
                role:user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"7d"
            }
        );

        res.status(200).json({
            token,
            user:{
                id:user._id,
                email:user.email,
                role:user.role
            }
        });

    }
    catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};

module.exports = {
    registerUser,
    loginUser
};
