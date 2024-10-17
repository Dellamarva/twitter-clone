import express from "express";
import { getMe, signup, login, logout} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
 
const router = express.Router();

// get authoirzed user
router.get("/me", protectRoute, getMe);

// When we hit /api/auth/signup, this function activates
router.post("/signup", signup);

// /api/auth/login
router.post("/login", login);

// /api/auth/logout
router.post("/logout", logout);

export default router;