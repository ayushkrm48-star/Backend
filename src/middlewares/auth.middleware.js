// now we will make a authentication middleware which will Verifies access token and identifies user

import jwt from "jsonwebtoken"
import ApiError from "../utils/ApiError.js"
import asyncHandler from "../utils/asyncHandler.js"
import User from "../models/user.model.js"

const verifyJWT = asyncHandler(async(req ,_, next )=> {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");

        if(!token){
            console.error("Unauthorized request");
            throw new ApiError(401 , "Unauthorized request");
        }
        

        /*

        jwt.verify() does mainly two things

        First: Verification
        - Token ka structure check karta hai.
        - Signature verify karta hai using secret key.
        - Expiration check karta hai.
        - Agar token tampered, invalid ya expired hai, toh error throw karta hai.
        
        Second: Decoding
        Agar verification successful ho jaati hai, toh payload return karta hai.
        */
        const decodedToken = jwt.verify(token , 
                                        process.env.ACCESS_TOKEN_SECRET ,
                                        {
                                            algorithms: ["HS256"]
                                        }
                                        );

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if(!user){
            throw new ApiError(401 , "Invalid Access Token");
        }

        // now we will just add one more key value pair in the req object so that we can use it afterwards to get the details of loggedIn user
        req.user = user;
        // ye actuall mein bahut important statement , iss single line se jab bhi user koi bhi backend pe request marega toh baar baar hme login nhi karna padega aur hame uss user ka pura data mil jayega in req object

        next();

    } catch (error) {
        console.log("Error in Auth Middleware" , error);
        throw new ApiError(401 , error?.message || "Invalid Access Token");
    }
});

export default verifyJWT;
