const asyncHandler =  (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        res.status(error.code || 500).json({
            message: error.message,
            success: false
        });
    }
};


export {asyncHandler}

const aasyncHandler = (requestHamdler) =>{
    (req,res,next)=>{
        Promise.resolve(requestHamdler(req,res,next)).
        catch((err)=> next(err))
    }
}

