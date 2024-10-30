//packages
import bcrypt from "bcryptjs";
import {v2 as cloudinary} from "cloudinary";

//models
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

/* returns the user's profile that was searched */
export const getUserProfile = async (req, res) => {

    const {username} = req.params; //get username

    try {
        const user = await User.findOne({username}).select("-password"); //get User
        if (!user) {
            return res.status(404).json({error: "User not found"});
        }
        res.status(200).json(user); //Want all user data to display on profile when visiting
    } catch (error) {
        console.log("Error in getUserProfile: ", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}

/* Ability to follow and unfollow an account */
export const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById(id); //Account to follow
        const currentUser = await User.findById(req.user._id); //Current User

        //check if they are the same b/c you cannot follow/unfollow yourself
        if (id === req.user._id.toString()) {
            return res.status(400).json({ error: "You can't follow/unfollow yourself" });
        }

        //check if either of the users exist
        if (!userToModify || !currentUser) {
            return res.status(400).json({ error: "User not found" });
        }

        //check if you are already following the account
        const isFollowing = currentUser.following.includes(id);

        if(isFollowing) {
            //Unfollow
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id }}); //Update Followers
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id }}); //Update Following

            res.status(200).json({ message: "User unfollowed successfully" });
        } else {
            //Follow the user
            await User.findByIdAndUpdate(id, { $push: {followers: req.user._id }}); //Update Followers
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id }}); //Update Following
            //Send Notification to the user being followed
            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id,
            });
            await newNotification.save(); //save to database

            res.status(200).json({ message: "User followed successfully" });
        }

    } catch (error) {
        console.log("Error in getUserProfile: ", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}

/* returns 4 suggested users to display */
export const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id; //Get current user

        const usersFollowedByMe = await User.findById(userId).select("following"); //get followings

        //get 10 random users
        const users = await User.aggregate([
            {
                $match: {
                    _id: {$ne:userId}
                }
            },
            {$sample:{size:10}}
        ]);

        //filter users that are not already being followed and choose 4 of them to display
        const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id));
        const suggestedUsers = filteredUsers.slice(0,4);

        //Get rid of those users passwords
        suggestedUsers.forEach(users => users.password = null);

        //Send the suggested users back to the client
        res.status(200).json(suggestedUsers);

    } catch (error) {
        console.log("Error in getSuggestedUsers: ", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}

/* updates profile */
export const updateUserProfile = async (req, res) => {

    //Get info of user
    const {fullName, email, username, currentPassword, newPassword, bio, link} = req.body;
    let {profileImg, coverImg} = req.body;
    const userId = req.user._id;

    try {
        let user = await User.findById(userId); //get User
        if (!user) { //check if user exists
            return res.status(404).json({message: "User not found" });
        }

        //Check if password change is valid
        if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json({ error: "Please provide both current password and new password" });
        }

        //Change password
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) { //check if password is correct
                return res.status(400).json({ error: "Current password is incorrect" });
            }
            if (newPassword.length < 6) { //check password length
                return res.status(400).json({ error: "Password must be at least 6 characters long" });
            }

            //Encrypt new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        //Update profileImg
        if (profileImg) {
            //Delete old image
            if (user.profileImg) {
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }
            //upload new image
            const uploadedResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedResponse.secure_url;
        }

        //Update coverImg
        if (coverImg) {
            //Delete old image
            if (user.coverImg) {
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
            }
            //Upload new image
            const uploadedResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadedResponse.secure_url;
        }

        //Update more fields
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        user = await user.save(); //save updated user to database
        user.password = null; //set password to null for response

        return res.status(200).json(user); //send user back to client
    } catch (error) {
        console.log("Error in updateUserProfile: ", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}