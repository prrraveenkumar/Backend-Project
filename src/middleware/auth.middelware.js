import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // FIX 1: Check req.cookies, not req.accessToken
        // FIX 2: Use optional chaining (?.) to prevent crash if header is missing
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");


        console.log("HEADER:", req.header("Authorization"));
        console.log("COOKIE:", req.cookies);
        console.log("RAW TOKEN:", req.header("Authorization")?.replace("Bearer ", ""));


        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access Token");
    }
}); 