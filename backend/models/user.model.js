/* Models are like Tables/Collection w/ NoSQL */
import mongoose from 'mongoose';

//User account attributes for database
const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
    },
    fullName:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,
        minLength: 6,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId, //A follower will need to be a type of Id according to MongoDB
            ref:"User", //A follower will be a user ID
            default: [], //A user has 0 followers when they signup
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId, //A follower will need to be a type of Id according to MongoDB
            ref:"User", //A follower will be a user ID
            default: [], //A user will be following 0 users when they signup
        }
    ],

    profileIMG: {
        type: String,
        default: "",
    },
    coverIMG:{
        type: String,
        default: "",
    },
    bio:{
        type: String, 
        default: "",
    },

    link:{
        type: String,
        default: "",
    }
},{timestamps: true}); //Timestamps give "Created at" and "Updated at" field for a user

//Model
const User = mongoose.model("User", userSchema);

export default User;