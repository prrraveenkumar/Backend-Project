import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"
import { Tweet } from "../models/tweet.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video
    const userId = req.user._id
    if (!mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid UserID or VideoID")
    }

    const [user, video] = await Promise.all([
        User.findById(userId),
        Video.findById(video)
    ])


    if (!user) throw new ApiError(400, "User in invalid")
    if (!video) throw new ApiError(200, "Cannot not video")

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: userId
    })


    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)

        return res
            .status(200)
            .json(new ApiResponse(200, { Liked: false }), "video Unlike")


    }

    const createdLike = await Like.create({
        video: videoId,
        likedBy: userId
    })

    if (!createdLike) {
        throw new ApiError(500, "Problem in creating like")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { Liked: true }, "Video have been liked"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment
    const userId = req.user._id
    if (!mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid UserID or CommentID")
    }

    const [user, comment] = await Promise.all([
        User.findById(userId),
        Comment.findById(commentId)
    ])

    if (!user) throw new ApiError(400, "UserId is invalid")
    if (!comment) throw new ApiError(400, "CommentID is invalid")

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: userId
    })


    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)

        return res
            .status(200)
            .json(new ApiResponse(200, { Liked: false }), "Comment Unlike")


    }

    const createdLike = await Like.create({
        comment: commentId,
        likedBy: userId
    })

    if (!createdLike) {
        throw new ApiError(500, "Problem in creating like")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { Liked: true }, "Comment have been liked"))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;

    // Validate IDs
    if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(tweetId)
    ) {
        throw new ApiError(400, "Invalid UserID or TweetID");
    }

    // Fetch user and tweet in parallel
    const [user, tweet] = await Promise.all([
        User.findById(userId),
        Tweet.findById(tweetId)
    ]);

    if (!user) throw new ApiError(400, "User not found");
    if (!tweet) throw new ApiError(400, "Tweet not found");

    // Check if like exists
    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: userId
    });

    // If exists → UNLIKE
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { liked: false },
                    "Tweet unliked successfully"
                )
            );
    }

    // Otherwise create LIKE
    const createdLike = await Like.create({
        tweet: tweetId,
        likedBy: userId
    });

    if (!createdLike) {
        throw new ApiError(500, "Failed to like tweet");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { liked: true },
                "Tweet liked successfully"
            )
        );
});


const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user._id

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(404, "Invalid UserID")
    }

    const user = await findById(userId)

    if (!user) throw new ApiError(400, "User cannot found")

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: mongoose.Types.ObjectId(userId),
                video: { $ne: null }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            }
        },
        {
            $unwind: "$videoDetails"
        },
        {
            $project: {
                _id: 0,
                videoId: "$videoDetails._id",
                title: "$videoDetails.title",
                thumbnail: "$videoDetails.thumbnail",
                views: "$videoDetails.views",
                duration: "$videoDetails.duration",
                owner: "$videoDetails.owner",
                createdAt: "$videoDetails.createdAt"
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}