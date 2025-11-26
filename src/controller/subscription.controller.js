import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const userId = req.user._id

    if(!mongoose.Types.ObjectId.isValid(channelId) ||
      !mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(404, "invalid userId  or channelId")
    }

    const user= await User.findById(userId)
    if(!user){
        throw new ApiError(400, "user not found")
    }

    const existingsubscribed = await Subscription.findOne({
        channel : channelId,
        subscriber : userId
    })

    if(existingsubscribed){
        await Subscription.findByIdAndDelete(existingsubscribed._id)

        return res
        .status(200)
        .json(new ApiResponse (200, {subscriber : false}, "Unsubscribed"))
    }

    const newsubscriber = await Subscription.create({
        channel : channelId,
        subscriber : userId

    })


    if(!newsubscriber){
        throw new ApiError(500, "problem in creating subscription")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {subscriber: true}, "Subscribed"))
      
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "invalid user")
    }

    const channelSubscriber = await Subscription.aggregate([
        {
            $match:{
                channel: mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $count: "subscriber"
        }

    ])

    const subscriberCount = channelSubscriber[0]?.subscriber || 0;

    return res
    .status(200)
    .json(new ApiResponse(200, subscriberCount, "Channel subscriber feched successfully"))


})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400, "invalid subscriberId")
    }

    const subscribedChannel = await Subscription.aggregate([
        {
            $match:{
                subscriber: mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $count: "channel"
        }

    ])

    const channelCount = subscribedChannel[0]?.channel || 0;

    return res
    .status(200)
    .json(new ApiResponse(200, channelCount, "Channel subscriber feched successfully"))


})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}