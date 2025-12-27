import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials:true
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"))

app.use(cookieParser())

// routes import

import userRoutes from "./routes/user.routs.js"  

// Routes Declration

app.use("/api/v1/user", userRoutes)

// Error handling middleware
// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // ✅ Safely extract status code and message
  const statusCode =
    typeof err.statusCode === "number" && err.statusCode >= 100 && err.statusCode < 600
      ? err.statusCode
      : 500;

  const message =
    typeof err.message === "string"
      ? err.message
      : "Internal Server Error";

  res
  .status(statusCode)
  .json({
    success: false,
    message,
    errors: err.errors || [],
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});


export default app;