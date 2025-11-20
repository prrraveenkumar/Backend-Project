import { Router } from "express";
import { registerUser,loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory} from "../controller/user.controller.js";
import {upload} from "../middleware/multer.middelware.js"
import { verifyJWT } from "../middleware/auth.middelware.js";
import multer from "multer";

const router = Router()

router.route("/register").post(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]),registerUser)


router.route("/login").post(loginUser)

//secured routes

router.route("/logout").post(verifyJWT , logoutUser)

router.route("/refresh-token").post(refreshAccessToken )

router.route("/change-password").post(verifyJWT, changeCurrentPassword )

router.route("/current-user").get(verifyJWT, getCurrentUser )

router.route("/updated-account").patch(verifyJWT, updateAccountDetails)

router.route("/avatar").patch(verifyJWT,upload.single("avatar"), updateUserAvatar )

router.route("/cover-image").patch(verifyJWT, upload.single("/cover-image"), updateUserCoverImage )

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)

router.route("history").post(verifyJWT, getWatchHistory)
   


export default router