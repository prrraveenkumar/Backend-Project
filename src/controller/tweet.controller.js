import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { use } from "react"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    const userId = req.user._id
    const {content} = req.body

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "invalid userId")
    }

    const createdTweet = await Tweet.create({
        owner : userId,
        content,
    })

    if(!createdTweet){
        throw new ApiError(400, "error in creating tweet")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, createTweet, "Tweet created"))


})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const userId = req.user._id

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "invalid user")    
    }

    const userTweets = await Tweet.find({ owner: userId }).sort({ createdAt: -1 });



    return res
    .status(200)
    .json(new ApiResponse(200, userTweets, "User tweet fetched"))


})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {content} = req.body
    const userId = req.user._id

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "invalid tweet")    
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not allowed to update this tweet");
    }

    const updateTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{content : content}
        },
        {
            new : true
        }
    )

    return res
    .status(200)
    .json(new ApiResponse(200, updateTweet, "Tweet updated successfully"))


})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params

    const userId = req.user._id

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "invalid tweet")    
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not allowed to delete this tweet");
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(200)
    .json(new ApiResponse(200, deletedTweet, "Tweet is deleted"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}