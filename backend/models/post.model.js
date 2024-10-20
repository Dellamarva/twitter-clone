import mongoose from 'mongoose';

//Post attributes for database
const postSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId, //A user will be a type of Id according to MongoDB
        ref: 'User',
        required: true
    },
    text: {
        type: String,
    },
    img: {
        type: String,
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    comments: [
        {
            text: {
                type: String,
                required: true
            },
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
        },
    ],
}, {timestamps: true});

//Model
const Post = mongoose.model("Post", postSchema);

export default Post;