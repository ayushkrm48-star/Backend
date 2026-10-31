import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"


const app = express();



// we have registered the cors middleware which will allow the requests from the origin specified in the .env file and will also allow the credentials to be sent in the request 
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}));



// we have registered the json parsing middleware which will parse the json data from the request and make it available in the req.body object
app.use(express.json({
    limit : "16kb"
}))



// we have registered the urlencoded parsing middleware which will parse the urlencoded data from the request and make it available in the req.body object
app.use(express.urlencoded({extended:true,limit:"16kb"}));




// we have registered the static files middleware which will serve the static files from the public directory
// it will serve for the url of types /public/<filename> and the file will be served from the public directory but the url will not contain the public directory name it will just be /<filename> 
// example : if we have a file named index.html in the public directory then it will be served at the url /index.html and not /public/index.html
app.use(express.static("public"));




// we have registered the cookie parser middleware which will parse the cookies from the request and make it available in the req.cookies object
app.use(cookieParser());



// now we will import the routes 
import userRoute from "./routes/user.routes.js"

// now we will the mount the route / register the route

app.use("/api/v1/users" , userRoute);

export default app;
