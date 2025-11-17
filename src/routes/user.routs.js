import { Router } from "express";
import { registerUser,loginUser, logoutUser, refreshAccessToken } from "../controller/user.controller.js";
import {upload} from "../middleware/multer.middelware.js"
import { verifyJWT } from "../middleware/auth.middelware.js";

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
   


export default router