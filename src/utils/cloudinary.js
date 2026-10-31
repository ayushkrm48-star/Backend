import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import 'dotenv/config';

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET
});


const uploadOnCloudinary = async (fileLocalPath) => {
    try{
        if(!fileLocalPath) return null;
        // upload file on the cloudinary
        const response = await cloudinary.uploader.upload(fileLocalPath , {
            resource_type : "auto" 
        })
        console.log(`File has been uploaded on the cloudinary`);
        console.log(response);
        fs.unlinkSync(fileLocalPath);
        return response;
    }
    catch(error){
        console.log("ERROR : Error on uploading the file");
        // then in that case we will unlink the file from the local storage by using the fs module of nodejs. So we will use the unlinkSync method of the fs module to delete the file from the local storage.
        fs.unlinkSync(fileLocalPath);
        throw new Error(error.message);
    }
}

export default uploadOnCloudinary;
