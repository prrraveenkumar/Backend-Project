//require("dot.env").config({path:   "./env"});
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({ 
    path: "./.env" 
}); 

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`SERVER is running on port ${process.env.PORT || 8000}`);       
    });
})
.catch((err)=>{
    console.log("MONGO DB CONNETION FAILED :", err);
});





/*
import express from "express";
const app = express();
; (async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        app.on("error", (error)=>{
            console.log("there is an error in express:", error);
            throw error;

        app.listen(process.env.PORT,()=>{
            console.log(`Server is running on port ${process.env.PORT}`); 
        })
        })
        
    } catch (error) {
        console.error("Error connecting to the database:", error); 
    }
})   () */ 