import mongoose,{Schema, Model , SchemaType} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
 

const videoSchema = new Schema({
    videoFile:{
        type : String,
        required : true
    },
    thumbnail:{
        type : String,
        required : true
    },
    title:{
        type : String,
        required : true
    },
    description:{
        type : String,
        required : true
    },
    duration:{
        type : Number,
        requires : true
    },
    views :{
        type : Number,
        default : 0
    },
    isPublishd:{
        type : Boolean,
         default: true
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref : "User "
    }
    
},
{timestamps : true})

videoSchema.plugin(mongooseAggregatePaginate)


export const Video = mongoose.model("Video", videoSchema)