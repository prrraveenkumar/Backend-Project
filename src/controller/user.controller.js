import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async(userId)=>{

    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken
        const refreshToken = user.generateRefreshToken

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})

        return {refreshToken, accessToken }


    }catch(err){
        throw new ApiError(500,"Something Went wrong while generating tokens")
    }


}

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;
  console.log("Email:", email);

  console.log("Req.body : ", req.body)

  // ✅ 1. Check for empty fields
  if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // ✅ 2. Check if user already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
console.log("Req.Files : ", req.files)
  // ✅ 3. Handle file uploads (make sure multer is configured)
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // ✅ 4. Upload images to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar");
  }

  // ✅ 5. Create user
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // ✅ 6. Find user again without sensitive fields
  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  // ✅ 7. Send response
  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  );
});

const loginUser = asyncHandler(async (req, res) => {
    // 1. Get credentials from body
    const { email, username, password } = req.body;
    console.log(email)

    // 2. --- FIX 1: Correct Validation ---
    if (!(username || email)) {
        throw new ApiError(400, "Username or email is required");
    }
    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    // 3. Find the user in the database
    const user = await User.findOne({
        $or: [{ email }, { username }]
    });

    // 4. --- FIX 2: Security (Username Enumeration) ---
    // Check if user exists AND password is valid using generic errors.
    if (!user) {
        throw new ApiError(401, "Invalid username or password");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid username or password"); // <-- Same generic error
    }

    // 5. Generate tokens
    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id);

    // 6. --- FIX 3: Optimization (Remove redundant DB call) ---
    // Use the user object we already have, just clean it for the response.
    const loggedInUser = user.toObject();
    delete loggedInUser.password;
    delete loggedInUser.refreshToken; // Only if it's stored on the user model

    // 7. Set options for cookies
    const options = {
        httpOnly: true,
        secure: true
    };

    // 8. Send response
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser,
                accessToken,
                refreshToken
            }, "User logged in successfully")
        );
}); 

const logoutUser = asyncHandler(async (req, res) => {
  // Remove refreshToken from DB
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: null } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options) // FIXED
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler((req,res)=>{
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshAccessToken 
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unautharized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REREFRESH_TOKEN_SECRET)
    
        const user = User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refesh token is expires or used ")
        }
    
        const options  = {
            httpOnly: true,
            secured : true
        }
    
        const {newrefreshToken,accessToken} = generateAccessAndRefreshToken(user._id)
    
        res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,newrefreshToken},
                "Access token refresh"
            )
        )
    } catch (error) {
        throw new ApiError (401, error?.message,"invalid Refresh Token" )
        
    }




     
})


export { registerUser,loginUser,logoutUser,refreshAccessToken };


