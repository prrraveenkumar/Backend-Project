import mongoose from "mongoose"
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const userID = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(userID)) {
        throw new ApiError(404, "UserId is not valid");
    }

    const user = await User.findById(userID);

    if (!user) {
        throw new ApiError(403, "Invalid request");
    }

    const stats = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(userID)
            }
        },

        // Fetch all videos by this user
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos"
            }
        },

        // Fetch subscribers of this channel
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },

        // Likes on all videos
        {
            $lookup: {
                from: "likes",
                let: { videoIds: "$videos._id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ["$video", "$$videoIds"] }
                        }
                    }
                ],
                as: "likes"
            }
        },

        // Comments on all videos
        {
            $lookup: {
                from: "comments",
                let: { videoIds: "$videos._id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ["$video", "$$videoIds"] }
                        }
                    }
                ],
                as: "comments"
            }
        },

        // Add calculated fields
        {
            $addFields: {
                totalVideos: { $size: "$videos" },
                totalSubscribers: { $size: "$subscribers" },
                totalLikes: { $size: "$likes" },
                totalComments: { $size: "$comments" },
                totalViews: { $sum: "$videos.views" },
            }
        },

        // Final response
        {
            $project: {
                name: 1,
                totalVideos: 1,
                totalSubscribers: 1,
                totalViews: 1,
                totalLikes: 1,
                totalComments: 1
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, stats[0], "Stats fetched successfully"));
});


const getChannelVideos = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(404, "User ID is invalid");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(400, "User is not found");
    }

    const allVideo = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
                isPublished: true
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                title: 1,
                thumbnail: 1,
                views: 1,
                duration: 1
            }
        }


    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, allVideo, "Videos fetched successfully"));
});


export {
    getChannelStats,
    getChannelVideos
}