import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';


export const protectRoute = async (req,res,next) => { //next calls the next function in the get function from auth.routes
    try {
        const token = req.cookies.jwt; //get the token from cookies
        if (!token) {
            return res.status(401).json({error: "Unauthorized: You need to login first"});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET); //decode the token, verify with secret

        if (!decoded) { //check if token is valid
            return res.status(401).json({error: "Unauthorized: Invalid Token"});
        }

        const user = await User.findById(decoded.userId).select("-password"); //find user, return all but password

        if (!user) {
            return res.status(404).json({error: "User not found"});
        }

        //put user into the req field and send it
        req.user = user;
        next();

    } catch (error) {
        console.log("Error in protectRoute middleware", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}