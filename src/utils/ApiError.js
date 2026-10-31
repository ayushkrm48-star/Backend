// now we will create a custom error class which will extend the built in Error class and will have a status code and a message property which will be used to send the error response to the client.

class ApiError extends Error{
    constructor(
        statusCode,
        message = "Something went wrong" ,
        errors = [],
        stack = null

    )
    {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;

        if(stack){
            this.stack = stack;
        }
        else{
            Error.captureStackTrace(this , this.constructor);
        }

        // Error.captureStackTrace() error object ko stack trace mein add nahi karta; woh us error object ki stack property par stack-trace information generate karta hai.


        // this → jis error object par stack trace generate karni hai.

        // this.constructor → stack trace ka cutoff point, 
        // Cutoff function se andar ki taraf: omit. Cutoff function ko call karne wali side: preserve
    }
}

export default ApiError ;