// now we will use multer , it is a middleware for handling multipart/form-data, which is primarily used for uploading files. We will use multer to handle the file upload in our application. We will use multer to upload the file to the server and then we will use cloudinary to upload the file to the cloud.

import multer from "multer"
 

// first we will create a storage engine for multer , which will tell multer where to store the uploaded files and what to name them. We will use diskStorage engine of multer to store the files on the server.


// DiskStorage means SSD/HDD storage , it is a persistent storage, which means the files will be stored on the server even after the server is restarted. 

// we can also use memoryStorage engine of multer to store the files in memory, which means the files will be stored in RAM and will be lost after the server is restarted.

const storage = multer.diskStorage({
    destination : function(req , file , cb){
        // here file is the object that contains the information about the uploaded file. It has the following properties:

        // fieldname : the name of the field in the form that contains the file
        // originalname : the name of the file on the user's computer
        // encoding : the encoding type of the file
        // mimetype : the mime type of the file
        // size : the size of the file in bytes
        // and after uploadind on the diskStorage it will have the following properties:
        // destination : the folder where the file is stored
        // filename : the name of the file on the server
        cb(null , "./public/temp");
        // null means there is no error and the second argument is the destination folder where the file will be stored. 

    },
    filename : function (req , file , cb){
        const uniqueSuffix =
        Date.now() + "-" + Math.round(Math.random() * 1E9);

        cb(null, file.fieldname + "-" + uniqueSuffix);
    }
});


const upload = multer({storage : storage});
// Hum Multer ko bol rahe hain:
// "Bhai, jab bhi koi file upload ho, toh is storage engine ka use karna."
// Yaani upload khud uploaded file nahi hai. Ye configured Multer instance hai, jiske through hum upload middleware banate hain.

export default upload;

