import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import User from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import ApiResponse  from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"


// THIS OPTION WE WILL USE TO FOR THE COOKIES 
const options = {
        httpOnly : true,
        // iska mtlb hota hain ki browser ka javascript iss cookie ko document.cookie ke through access nhi kar payga but abhi vo requests ke sath in cookies ko attach jarur kar skta hain
        secure : process.env.NODE_ENV === "production",
        // iska mtlb hota hain ki browser cookie ko sirf HTTPS connections par send karega. kyonki ye secure hoti hain aur encrypted hoti hain 
        // so during the production time using HTTPS it should be set to be true while local development time using HTTP it should be false
        sameSite: "lax",
        maxAge  : 15*60*1000, // which means 15minutes 
};


const registerUser = asyncHandler(async(req , res) => {
    // console.log("Sab kuch shi hain");
    // console.log("serving the request ");
    // res.status(200).json({
    //     message : "ok"
    // })

    // steps for the user registration
    // 1. get the data from the request body

    // 2. validate the data(contains all the required fields and the data is in the correct format)

    // 3. check if the user already exists in the database

    // 4. if the user does not exist then create a new user in the database

    // upload the profile picture to the cloudinary and get the url of the uploaded image

    // remove the password and refresh token from the response.

    // 5. send the response to the client

    // step 1: get the data from the request body
    const {username , email , fullName , password} = req.body;

    // step 2: validate the data(contains all the required fields and the data is in the correct format)
    if([username , email , fullName , password].some((field) => typeof field !== "string" || field.trim( )=== "")){
        // this will return true if any of the field is empty
    
        throw new ApiError(400 , "All fields are required");
    }

    // now lets also check if the email is in the correct format using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
        throw new ApiError(400 , "Invalid email format");
    }

    // step 3: check if the user already exists in the database
    const existingUser = await User.findOne(
        {
            $or : [
                {username : username},
                {email : email}
            ]
        }
    )

    if(existingUser){
        throw new ApiError(409 , "User already exists");
    }

    // now lets check if the user has uploaded the profile picture and cover image or not. If not then we will throw an error.
    console.log(req.files);

    if(!req.files || !req.files.avatar){
        throw new ApiError(400 , "Profile picture is required");
    }

    // but if all the required files are uploaded then we will get the file path of the uploaded files and store them in the database.

    const avatarLocalPath = req.files.avatar[0].path;
    // const coverImageLocalPath = req.files.coverImage[0]?.path;
    // here the coverImage field is optional

    let coverImageLocalPath = "";
    if(Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        const coverImageLocalPath = req.files.coverImage[0].path;
    }
    

    // now we will upload the profile picture and cover image to the cloudinary and get the url of the uploaded images.

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    // for one more time we will check if the avatarUrl is null or not. If it is null then we will throw an error.
    if(!avatar){
        throw new ApiError(500 , "Error in uploading the profile picture");
    }


    // step 4 : now we will create a new user in the database
    const newUser = await User.create({
        username : username.toLowerCase(),
        email : email,
        fullName : fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        password : password,
    })

    // now we will remove the password and refreshtoken from the response
    const createdUser = await User.findById(newUser._id).select(
        "-password -refreshToken"
    );

    if(!createdUser){
        throw new ApiError(500 , "Something went wrong while registering the user");
    }


    // step 5 : sending the response to the client

    return res.status(201).json(
        new ApiResponse(200 , createdUser , "User has been created Successfully!")
    )




    

});

const generateTokens = async(userId) => {
    try{
        const user = await User.findById(userId);

        const accessToken = user.generateAccessTokens();
        

        const refreshToken = user.generateRefreshTokens();


        // now we will also save this refresh token inside this current user database
        user.refreshToken = refreshToken;

        await user.save({validateBeforeSave : false});
        return {accessToken , refreshToken};

    }
    catch(error){
        console.error("Token generation error:", error);
        throw new ApiError(500 , "Can't generate the tokens");
    }
};

const loginUser = asyncHandler(async(req , res) => {
    // steps -->
    // step 1 : take data from the user
    // step 2 : username or email
    // step 3 : find the user
    // step 4 : password check
    // step 5 : access and refresh tokens
    // step 6 : send cookie

    const {username,email,password} = req.body;
    
    if(!username && !email){
        console.log("User has not given either of the username or email");
        throw new ApiError(404 , "User has not given either of the username or email");
    }



    let user = null;    

    if(username){
        user = await User.findOne({username});
    }
    else{
        user = await User.findOne({email});
    }

    if(!user){
        console.log("User has not been registered yet!");
        throw new ApiError(404 , "User Not Found");
    }

    if(!password){
        throw new ApiError(404 , "Enter Password");
    }
    
    const isPasswordValid = await user.isPasswordMatched(password);
    if(!isPasswordValid){
        console.log("User has provided the wrong password");
        throw new ApiError(404 , "Invalid crediantials");
    }

    const {accessToken , refreshToken} = await generateTokens(user._id);

    // now we also wants to send some data when the user got logged in

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // now we will also send the tokens in the cookie 



    return res
    .status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json(new ApiResponse(
        200,
        {
            user : loggedInUser , 
            accessToken,
            refreshToken
        },
        "User has been LoggedIn SuccessFully!"
    ))


});

const logoutUser = asyncHandler(async(req , res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            refreshToken : undefined
        },
        {
            new : true
        }
    )
    
    return res
    .status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options)
    .json(new ApiResponse(200 , {} , "User has been Logout Successfully"));
});


// now we will generate a controller for renewing the accessToken

const renewAccessToken = asyncHandler(async(req , res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401 , "Unauthorized Request");
    }

    // now lets verify this incoming Refresh Token 
    const decodedToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id);

    if(!user){
        throw new ApiError(401 , "Invalid Refresh Token");
    }

    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401 , "RefreshToken is Expired or used!");
    }


    // now we will just generate the new tokens
    const {accessToken , refreshToken} = await generateTokens(user._id);

    return res.status(200).cookie("accessToken" , accessToken).cookie("refreshToken",refreshToken).json(new ApiResponse(200 , {accessToken,refreshToken} , "Access Token has been renewed Successfully"));

});


// now lets write the controller for changing the password of the user
const changePassword = asyncHandler(async (req , res) => {
    const {oldPassword , newPassword} = req.body;

    const user = await User.findById(req.user._id);
    // iss step user toh milega hi milega kyonki ham verifyJWT middleware se gujar ke aa rhe honge

    // abb bas hame ye check karna hain kya user na jo oldpassword bheja hain wo correct hain ya nhi 
    const isPassCorrect = await user.isPasswordMatched(oldPassword);

    if (!isPassCorrect) {
        console.log("User has not provided the correct password");
        throw new ApiError(400 , "Invalid Password");
    } 
     
    user.password = newPassword;

    await user.save({validateBeforeSave:false});

    return res
    .status(200)
    .json(new ApiResponse(200 , {} , "Password has been Changed Successfully!"));
});

const getUser = asyncHandler(async(req , res) => {
    return res
    .status(200)
    .json(new ApiResponse(200 , req.user , "User has been Fetched Successfully!"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    // 1. Validate input
    if (!fullName?.trim() || !email?.trim()) {
        throw new ApiError(400, "Full name and email are required");
    }

    // 2. Normalize input
    const normalizedFullName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
        throw new ApiError(400, "Invalid email address");
    }

    // 4. Get logged-in user
    const user = await User.findById(req.user._id);


    // 5. Check whether email is already registered
    const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id }
    });

    if (existingUser) {
        throw new ApiError(409, "Email is already in use");
    }

    // 6. Update only allowed fields
    user.fullName = normalizedFullName;
    user.email = normalizedEmail;

    // 7. Save changes
    await user.save();

    // 8. Fetch updated user without sensitive fields
    const updatedUser = await User.findById(user._id)
        .select("-password -refreshToken");

    // 9. Return response
    return res.status(200).json(
        new ApiResponse(
            200,
            updatedUser,
            "Account details updated successfully"
        )
    );
});

const updateUserAvatar = asyncHandler(async (req, res) => {

    // 1. Check whether file is provided
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // 2. Upload new avatar to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar?.url) {
        throw new ApiError(500, "Error while uploading avatar");
    }

    // 3. Get logged-in user and update avatar
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");


    // 4. Return updated user
    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "Avatar updated successfully"
        )
    );
});

const updateUsercoverImage = asyncHandler(async (req, res) => {

    // 1. Check whether file is provided
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // 2. Upload new avatar to Cloudinary
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage?.url) {
        throw new ApiError(500, "Error while uploading avatar");
    }

    // 3. Get logged-in user and update avatar
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");


    // 4. Return updated user
    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "Cover Image updated successfully"
        )
    );
});






export {registerUser , loginUser , logoutUser , renewAccessToken , changePassword , getUser , updateAccountDetails , updateUserAvatar , updateUsercoverImage};
