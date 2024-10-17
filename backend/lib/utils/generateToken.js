import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (userId, res) => {
    //Check which user has this token with UserId
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: '15d'});
    res.cookie("jwt", token, {
        maxAge:15*24*60*60*1000, //MS
        httpOnly: true, //Prevent XSS attacks and cross-site scripting attacks, only accessible through http
        sameSite: "strict", // CSRF attacks cross-site request forgery attacks
        secure: process.env.NODE_ENV != "development",
    });
}