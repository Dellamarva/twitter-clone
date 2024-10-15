import express from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import connectMongoDB from "./db/connectMongoDB.js";

//Initialze App and Port
const app = express();
const PORT = process.env.PORT || 5000;

//Pull the data from .env
dotenv.config();

//Create Middle Layer
app.use("/api/auth", authRoutes);

//Create Port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectMongoDB();
});