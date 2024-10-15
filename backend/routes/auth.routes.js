import express from "express";
import {signup, login, logout} from "../controllers/auth.controller.js";
 
const router = express.Router();

// When we hit /api/auth/signup, this function activates
router.post("/signup", signup);

// /api/auth/login
router.post("/login", login);

// /api/auth/logout
router.post("/logout", logout);

export default router;