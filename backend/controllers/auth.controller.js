import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js';

/* SIGNUP */
export const signup = async (req, res) => {
    try {
        const {fullName, username, email, password} = req.body;

        //check if email is valid w/ regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) { //If invalid email
            return res.status(400).json({ error: "Invalid email format" });
        }

        //Find if a username is already in use
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username is already taken" });
        }

        //Find if an email is already in use
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: "Email is already taken"});
        }

        //Check if email is long enough
        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }

        //Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //Create new User object
        const newUser = new User({
            fullName: fullName,
            username: username,
            email: email,
            password: hashedPassword
        });

        
        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res); //Generate a Token and set the cookie if we have a new User
            await newUser.save(); //Save to database
            res.status(201).json({ //201 = something created, send user back to the client
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg
            });
        } else { //Error creating new user
            res.status(400).json({ error: "Invalid user data" });
        }
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

/* LOGIN */
export const login = async (req, res) => { 
    try {

        const {username, password} = req.body; //get the username and password
        const user = await User.findOne({username}); //check if username is valid
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || ""); //check if password is correct

        //Send error if either are incorrect
        if (!user || !isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid username or password"});
        }
        
        generateTokenAndSetCookie(user._id, res);
        res.status(200).json({ //200 = something created, send user back to the client
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg
        });
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

/* LOGOUT */
export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge: 0}); //Kill the cookie
        res.status(200).json({message: "Logged out successfully"});
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

//gets authenticated user, checks if user is authenticated or not
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user); //send user back to client
    } catch (error) {
        console.log("Error in getMe controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}