import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import connectMongoDB from "./db/connectMongoDB.js";

//Pull the data from .env
dotenv.config();

//Initialze App and Port
const app = express();
const PORT = process.env.PORT || 5000;

//Create Middle Layer (runs between req and res)
app.use(express.json()); //to parse req.body
app.use(express.urlencoded({ extended: true })); //to parse form data(urlencoded)
app.use(cookieParser()); //Enables the ability to parse the cookie in the req calls

app.use("/api/auth", authRoutes);

//Create Port and connect to DB
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectMongoDB();
});