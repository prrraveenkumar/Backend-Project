import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    //TODO: create playlist

    if (name.trim() === "") {
        throw new ApiError(400, "Name of playlist required")
    }

    const userID = req.user._id

    if (!mongoose.Types.ObjectId.isValid(userID)) {
        throw new ApiError(404, "Invalid user")
    }

    const user = await User.findById(userID)
    if (!user) {
        throw new ApiError(400, "Cannot find user")
    }

    const createdPlaylist = await Playlist.create({
        name,
        description,
        owner: userID

    })


    if (!createPlaylist) {
        throw new ApiError(500, "Problem in creating playlist")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, createPlaylist, "Playlist created"))

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(404, "Invalid user")
    }

    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(400, "Cannot find user")
    }

    const userPlaylists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $project: {
                owner: 1,
                video: 1,
                description: 1,
                name: 1

            }

        }
    ])

    if (!userPlaylists) {
        throw new ApiError(500, "Problem in fetching playlist")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, userPlaylists, "User playlists fectched successfully"))

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Playlist id is invalid")
    }

    const playlist = await Playlist.findById(playlistId)
        .populate("owner", "username avatar")
        .populate("video", "title views thumbnail createdAt")

    if (!playlist) {
        throw new ApiError(400, "Playlist does not exist")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist feched"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!mongoose.Types.ObjectId.isValid(playlistId) ||
        !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(404, "invalid playlistId or videoId")
    }


    const [playlist, video] = await Promise.all([
        Playlist.findById(playlistId),
        Video.findById(videoId)
    ])

    if (!playlist || !video) {
        throw new ApiError(400, "cannot find Playlist or Video")
    }


    const addedVideo = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: { video: videoId }
        },
        { new: true }

    ).populate("video", "title thumbnail duration views")

    if (!addedVideo) {
        throw new ApiError(500, "Problem in adding video")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, addedVideo, "Video is added"))


})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist

    if (!mongoose.Types.ObjectId.isValid(playlistId) ||
        !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(404, "invalid playlistId or videoId")
    }


    const [playlist, video] = await Promise.all([
        Playlist.findById(playlistId),
        Video.findById(videoId)
    ])

    if (!playlist || !video) {
        throw new ApiError(400, "cannot find Playlist or Video")
    }

    const updatePlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: { video: videoId }

        }
    )

    if (!updatePlaylist) {
        throw new ApiError(500, "Problem in deleting video")
    }


    return res
        .status(200)
        .json(new ApiResponse(200, updatePlaylist, "video removed"))


})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist

    const userId = res.user._id

    if (!mongoose.Types.ObjectId.isValid(playlistId) ||
        !mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(404, "PlaylistId or userId not valid")
    }

    const [playlist, user] = await Promise.all([
        Playlist.findById(playlistId),
        User.findById(userId)
    ])

    if (!playlist || !user) {
        throw new ApiError(400, "Playlist OR User Cannot find")
    }

    if (playlist.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are  not allowed to delete this PLaylist")

    }
    const deletedPLaylist = await Playlist.findByIdAndDelete(playlistId)

    if (!deletePlaylist) {
        throw new ApiError(500, "Problem in deleting Playlist")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deletePlaylist, "Playlist Deleted"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist

    const userId = req.user._id

    if (!mongoose.Types.ObjectId.isValid(playlistId) ||
        !mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(404, "PlaylistId or userId not valid")
    }

    const [playlist, user] = await Promise.all([
        Playlist.findById(playlistId),
        User.findById(userId)
    ])

    if (!playlist || !user) {
        throw new ApiError(400, "Playlist OR User Cannot find")
    }

    if (playlist.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are  not allowed to update this PLaylist")

    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                description: description || playlist.description,
                name: name || playlist.name
            }
        },
        {
            new : true
        }
    )

    if(!updatedPlaylist){
        throw new ApiError(500, "Problem in updating playlist")
    }


    return res
        .status(200)
        .json(new ApiResponse(200, updatePlaylist, "Playlist deleted"))




})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}