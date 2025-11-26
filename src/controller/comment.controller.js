import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
}


    const skip = (parseInt(page) - 1) * parseInt(limit)

    const videoComment = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $skip: skip
        }
        , {
            $limit: parseInt(limit)
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }

        },
        {
            $addFields: {
                owner: { $first: "$ownerDetails" }
            }

        },
        {
            $project: {
                ownerDetails: 0
            }
        }

    ])


    return res
        .status(200)
        .json(new ApiResponse(200, videoComment, "Comment fetched successfully"))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params
    const userId = req.user._id
    const { content } = req.body

    if (!content || content.trim().length === 0) {
        throw new ApiError(400, "Comment content cannot be empty")

    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "VideoID is invalid")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not exist")
    }

    const addedComment = await Comment.create({
        content,
        video: videoId,
        owner: userId

    })

    if (!addedComment) {
        throw new ApiError(500, "ther is problem in uploading comment")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, addedComment, "Comment added successfully"))


})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { content } = req.body
    const { commentId } = req.params

    if (!content || content.trim().length === 0) {
        throw new ApiError(400, "Comment content cannot be empty")
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment format")

    }

    const comment = await Comment.findById(commentId)

    if(comment.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not allowed user to delete this comment")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            content,
        },
        {
            new: true
        }
    )

    if (!updatedComment) {
        throw new ApiError(500, "There is problem")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedComment, "Comment is updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid commentid format")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404, "comment cant found")
    }

    if(comment.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not allowed user to delete this comment")
    }



    await Comment.findByIdAndDelete(commentId)




    return res
    .status(200)
    .json(new ApiResponse(200,{delete : true},"Comment is deleted"))


})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}