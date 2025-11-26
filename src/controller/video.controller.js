import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query,
        sortBy = "createdAt",
        sortType = "desc",
        userId
    } = req.query;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId");
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
                isPublished: true,
                ...(query && {
                    title: { $regex: query, $options: "i" }
                })
            }
        },
        {
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        },
        { $skip: skip },
        { $limit: parseInt(limit) },
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
        .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video

    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Title and description is required ")
    }

    const videoLocalPath = req.files?.video?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required")
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required")
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!videoFile) {
        throw new ApiError(400, "Failed to upload video")
    }

    if (!thumbnail) {
        throw new ApiError(400, "Failed to upload thumbnail")
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration,
        owner: req.user._id
    })

    const uploadedVideo = await Video.findById(video._id)

    if (!uploadedVideo) {
        throw new ApiError(500, "Something went wrong while uploading video")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, uploadedVideo, "Video is upload successfully"))

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400, "this video doesn't exist")

    }

    if (!video.isPublished) {

        return res
            .status(200).
            json(new ApiResponse(200, null, "video is not published yet"))
    }
    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video is fetched Succesfully"))


})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const { title, description } = req.body
    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required ")
    }

    const thumbnailLocalPath = req.file?.path


    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnail is required")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!thumbnail.url) {
        throw new ApiError(500, "there is problem in uploading thumbnail")
    }

    const updatedVideo = await Video.findOneAndUpdate(
        { _id: videoId, owner: req.user._id },
        {
            $set: { title, description, thumbnail: thumbnail.url }
        },
        { new: true }
    );


    if (!updatedVideo) {
        throw new ApiError(400, "either there is no such video exist or error in updating video")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video is updated Successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    const deletedVideo = await Video.findOneAndDelete({
    _id: videoId,
    owner: req.user._id
});


    if (!deletedVideo) {
        throw new ApiError(400, "Video not Found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Video deleted successfully"))



})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400, "Video id Does not exist")
    }

    video.isPublished = !video.isPublished;

    const toggledPublishVideo = await video.save({ validateBeforeSave: false });

    if (!toggledPublishVideo) {
        throw new ApiError(500, "video update failed")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { isPublished: toggledPublishVideo.isPublished }, "Publish status toggled successfully"))



})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}