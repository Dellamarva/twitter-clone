import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { getUserProfile, followUnfollowUser, getSuggestedUsers, updateUserProfile } from '../controllers/user.controller.js';

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile); //gets the user's profile
router.get("/suggested", protectRoute, getSuggestedUsers); //Lists suggested users to follow
router.post("/follow/:id", protectRoute, followUnfollowUser); //Follow/Unfollow users
router.post("/update",protectRoute, updateUserProfile); //Update Profile

export default router;