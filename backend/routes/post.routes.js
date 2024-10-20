import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { createPost, deletePost, commentPost, likeUnlikePost, getAllPosts, getLikedPosts, getFollowing, getUserPosts } from "../controllers/post.controller.js";

const router = express.Router();

router.get("/all", protectRoute, getAllPosts);
router.get("/following", protectRoute, getFollowing); //Get posts of the users a user follows
router.get("/likes/:id", protectRoute, getLikedPosts); //Get list of posts a user has liked
router.get("/user/:username", protectRoute, getUserPosts);
router.post("/create", protectRoute, createPost);
router.post("/like/:id", protectRoute, likeUnlikePost);
router.post("/comment/:id", protectRoute, commentPost);
router.delete("/:id", protectRoute, deletePost);

export default router;