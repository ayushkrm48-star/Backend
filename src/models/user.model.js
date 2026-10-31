// User model for handling user-related operations

import mongoose , {Schema} from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema({
    username : {
        type: String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        index: true
    },
    email : {
        type: String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true
    },
    fullName : {
        type: String,
        required : true,
        unique : true,
        trim : true
    },
    avatar : {
        type : String, // url
        required : true 
    },
    coverImage : {
        type : String 
    },
    watchHistory : [
        {
            type : Schema.Types.ObjectId,
            ref : "Video"
        }
    ],
    password : {
        type : String,
        required : [true ,"Password is Required"]
    },
    refreshToken : {
        type : String
    }

} , {timestamps:true});


// here will use pre-save hook to hash the password before saving it to the database but we should make sure that we are not hashing the password again if it is already hashed. So we will check if the password is modified or not before hashing it.

// pre save hook means a mongoose middleware that is executed before saving a document to the database. In this case, we will use it to hash the password before saving it to the database. We will use bcryptjs library to hash the password.

userSchema.pre("save" , async function () {

    if(!this.isModified("password")){
        return;
    }
     
    this.password = await bcrypt.hash(this.password , 12);
});


// now we will create a custom method to compare the password entered by the user with the hashed password stored in the database.

// for making the custom method we will use the methods property of the schema

userSchema.methods.isPasswordMatched = async function (enteredPassword){
    return await bcrypt.compare(enteredPassword , this.password);
    // user will enter the password and we will compare it with the hashed password stored in the database. If they match then we will return true otherwise false.
}

// now we will create a custom method to generate the access token and refresh token for the user. We will use jsonwebtoken library to generate the tokens.

userSchema.methods.generateAccessTokens = function (){
        return jwt.sign(
            {
                _id : this._id,
                email : this.email
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                algorithm : "HS256",
                expiresIn : process.env.ACCESS_TOKEN_EXPIRY
            }
        )
}

userSchema.methods.generateRefreshTokens = function (){
        return jwt.sign(
            {
                _id : this._id,
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                algorithm : "HS256",
                expiresIn : process.env.REFRESH_TOKEN_EXPIRY
            }
        )
}

const User = mongoose.model("User", userSchema);

export default User;

