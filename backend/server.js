//Packages
import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import {v2 as cloudinary} from "cloudinary";

//Routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import notificationRoutes from "./routes/notification.routes.js";


//Utility
import connectMongoDB from "./db/connectMongoDB.js";

//Pull the data from .env
dotenv.config();

//Connect cloudinary account, ability to upload and delete images
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//Initialze App and Port
const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

//Create Middle Layer (runs between req and res)
app.use(express.json({limit: "5mb"})); //to parse req.body
app.use(express.urlencoded({ extended: true })); //to parse form data(urlencoded)
app.use(cookieParser()); //Enables the ability to parse the cookie in the req calls

app.use("/api/auth", authRoutes); //Signup, Login, Logout, getMe
app.use("/api/users", userRoutes); //Profile, Suggested, Follow/Unfollow, Update Profile
app.use("/api/post", postRoutes); //CreatePost, Like/Unlike, Comment, DeletePost, getPosts, GetFollowingPosts, GetUserPosts, GetLikedPosts
app.use("/api/notifications", notificationRoutes);

if (process.env.NODE_ENV === "production") { //For deployment
    app.use(express.static(path.join(__dirname, "/frontend/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    })
}

//Create Port and connect to DB
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectMongoDB();
});