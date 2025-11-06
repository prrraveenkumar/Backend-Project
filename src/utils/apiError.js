class ApiError extends Error{
    constructor(
        message = "something went wrong",
        statusCode,
        errors =[],
        stack =""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.errors = errors
        this.success = false
        this.message = message


        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}
