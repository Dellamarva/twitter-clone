import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import {v2 as cloudinary} from "cloudinary";

/* Make a post */
export const createPost = async (req, res) => {
    try {
        const { text } = req.body;
        let { img } = req.body;
        const userId = req.user._id.toString(); //Get id in req

        const user = await User.findById(userId); //Get user
        if (!user) { //Check if user exists
            return res.status(404).json({ message: "User not found" });
        }
        if (!text && !img) { //Check if post is valid
            return res.status(400).json({ error: "Post must have text or image"});
        }

        if (img) { //Upload image
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        //Create post object
        const newPost = new Post({
            user: userId,
            text,
            img
        });

        await newPost.save(); //save to the database
        res.status(201).json(newPost); //Send post to client
    } catch (error) {
        console.log("Error createPost: ", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}

/* Delete a post */
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id); //get Post
        if (!post) { //check if post exists
            return res.status(404).json({ error: "Post not found" });
        }

        //check if user owns the post
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "You are not authorized to delete this post" });
        }

        //Delete Image if it exists
        if (post.img) {
            const imgId = post.img.split("/").pop().split(".")[0]; //get id of image
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(req.params.id); //delete post form database

        res.status(200).json({ message: "Post deleted successfully" }); //Send deletion confirmation to client
    } catch (error) {
        console.log("Error deletePost: ", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}

/* Comment on a post */
export const commentPost = async (req, res) => {
    try {
        const { text } = req.body;
        //let { img } = req.body; implement later
        const postId = req.params.id;
        const userId = req.user._id;

        if (!text) { //check comment is valid
            return res.status(400).json({ error: "Text field is required" });
        }

        const post = await Post.findById(postId);

        if (!post) { //check if post exists
            return res.status(404).json({ error: "Post not found" });
        }

        const comment = { //Create comment object
            user: userId, 
            text
        }

        post.comments.push(comment); //Add comment to post entry of database
        await post.save(); //save post to database

        res.status(200).json(post); //send comment back to the client

    } catch (error) {
        console.log("Error commentPost: ", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}

/* Like/Unlike posts */
export const likeUnlikePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await Post.findById(postId); //Get post
        const user = await User.findById(userId); //Get user
        if (!post) { //check if post exists
            return res.status(404).json({ error: "Post not found" });
        }
        if (!user) { //check if user exists
            return res.status(400).json({ error: "User not found" });
        }

        //Check if the user liked the post or not
        const isLiked = post.likes.includes(userId);
        if (isLiked) {
            //Unlike
            await Post.updateOne({_id: postId}, { $pull: { likes: userId }}); //Update likes in post
            await User.updateOne({ _id: userId}, { $pull: { likedPosts: postId } }); //Update likes list in user profile

            const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString()); //Better for UI design so likes is updated without refreshing the page

            res.status(200).json(updatedLikes);
        } else {
            //Like
            post.likes.push(userId); //Update likes in post
            await User.updateOne({ _id: userId }, { $push: { likedPosts: postId }}); //Update likes list in user profile
            await post.save();

            //Send Notification to the user for a liked post
            const newNotification = new Notification({
                type: "like",
                from: userId,
                to: post.user
            });
            await newNotification.save(); //save to database
            //TODO: return id of the user as a response
            res.status(200).json(post.likes);
        }

    } catch (error) {
        console.log("Error likeUnlikePost: ", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}

/* Get All Posts */
export const getAllPosts = async (req, res) => {
    try {
        //-1 has the latest post at the top, populate lists all attributes of user from post
        const posts = await Post.find().sort({ createdAt: -1 }).populate({
            path: "user",
            select: "-password"
        })
        .populate({ //user info from the comments
            path: "comments.user",
            select: "-password"
        });
        if (posts.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(posts);
    } catch (error) {
        console.log("Error getAllPosts: ", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}

/* Get list of posts a user has liked */
export const getLikedPosts = async (req, res) => {
    const userId = req.params.id;

    try {
        //Get user and check if it exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        //Get all liked posts the user has liked
        const likedPosts = await Post.find({ _id: {$in: user.likedPosts}})
        .populate({ //Add all user attributes from their comments and posts
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        });

        res.status(200).json(likedPosts);
    } catch (error) {
        console.log("Error getLikedPosts: ", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}

/* Get list of posts from users a user follows */
export const getFollowing = async (req, res) => {
    try {
        //Get the user and check if its valid
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const following = user.following;

        const feedPosts = await Post.find({ user: { $in: following }})
        .sort({ createdAt: -1}) //latest post at the top
        .populate({ //get attributes of the owner of a post and comment
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        });

        res.status(200).json(feedPosts);
    } catch (error) {
        console.log("Error getFollowing: ", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}

/* Get list of posts from the user */
export const getUserPosts = async (req, res) => {
    try {
        //Get username and check if user exists
        const { username } = req.params;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        //List all posts from username in latest order
        const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 }).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        });

        res.status(200).json(posts);
    } catch (error) {
        console.log("Error getUserPosts: ", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}