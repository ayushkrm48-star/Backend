
import 'dotenv/config';
import express from "express"
const app = express();
import connectDB from "./db/index.js";

// method1 of connecting to the database
// now we will use ifis


// ;
// (async() => {
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`); 

//         app.on("error" , (error) => {
//             console.log("ERROR",  error);
//         })

//         app.listen(process.env.PORT , () => {
//             console.log(`App is Listening on the port : ${process.env.PORT}`);
//         })
//     }
//     catch(error){
//         console.log("ERROR : Database connection failed!");
//         throw error;
//     }
// })()

connectDB()
.then(() => { 
    app.listen(process.env.PORT || 8000 , () => {
        console.log(`App is Listening on the PORT : ${process.env.PORT}`);
    })
})
.catch()

