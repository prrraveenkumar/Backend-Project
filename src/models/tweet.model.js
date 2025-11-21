import mongoose,{Schema} from "mongoose";

const tweetSchema = new Schema({
    owner:{
        type:Schema.Types.ObjectId,
        ref:"user"
    },
    content:{
        type: string,
        require: true
    }


},{timestamps:true })

export const Tweet = mongoose.model("Tweet",tweetSchema)