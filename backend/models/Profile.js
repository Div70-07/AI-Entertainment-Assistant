const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
{

    owner:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
    },
    
    name: {
        type: String,
        required: true
    },

    genres: [{
        type: String
    }],

    creators: [{
        type: String
    }],

    moods: [{
        type: String
    }],

    interests: [{
        type: String
    }],

    watchHistory: [{
    title: String,
    creator: String,
    genre: String,
    mood: String,
    videoId: String,
    watchedAt: {
        type: Date,
        default: Date.now
    }

}],

feedbackHistory:[{
    videoId:String,
    creator:String,
    genre:String,
    mood:String,

    feedback:{
        type:String,
        enum:[
            "liked",
            "disliked",
            "clicked",
            "skipped"
        ]
    },

    createdAt:{
        type:Date,
        default:Date.now
    }

}],

    searchHistory: [{
        type: String
    }],

    preferredDuration: String,

    language: String
},
{
    timestamps: true
});

module.exports = mongoose.model("Profile", profileSchema);
