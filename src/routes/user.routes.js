// now we will create a router

import {Router} from "express"
import {registerUser , loginUser , logoutUser , renewAccessToken , changePassword , getUser} from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js"
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();
// an instance of Router

router.route("/register").post
(
    upload.fields([
        {   
            // here this name is the name of the field in the form that contains the file. It should be same as the name of the field in the form.
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),
    registerUser
);


router.route("/login").post(loginUser);


// secured Route

router.route("/logout").post(verifyJWT,logoutUser);
router.route("/refresh-token").post(renewAccessToken);
router.route("/change-password").patch(verifyJWT , changePassword);

export default router;


