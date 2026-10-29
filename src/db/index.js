import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`Application is now connected to the Database DB HOST : ${connectionInstance.connection.host}`);
    }
    catch(error){
        console.log("ERROR : DATABASE CONNECTION FAILED!");
        process.exit(1);
    }
}

export default connectDB;
