// now we will create a asyncHandler which creates a wrapper around the async functions and handles the errors and sends the response to the client in case of error

// for that we will use higher order function , A higher-order function is a function that does at least one of these two things:
// 1. Kisi doosre function ko argument ke roop mein accept karta hai.
// 2. Kisi doosre function ko return karta hai.  

// const asyncHandler = (fn) => {
//     return async(req , res , next ) => 
//         {
//             try{
//                 await fn(req , res , next);
//             }
//             catch(error){
//                 // now we will send the error to next middleware which is the error handler middleware and it will handle the error and send the response to the client
//                 next(error);
//             }
//         }
//     }   

// export default asyncHandler;

// now we will see one more syntax of writing the same function but this time we will use promise and then catch instead of async await and try catch

const asyncHandler = (fn) => {
    return (req , res , next) => {
        Promise
        .resolve(fn(req , res , next))
        .catch((error) => {
            next(error);
        })
    }
}

export default asyncHandler;


