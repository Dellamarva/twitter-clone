import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        //Get notifications directed towards a user showing who sent the notif with their info
        const notifications = await Notification.find({ to: userId }).populate({
            path: "from",
            select: "username profileImg"
        })

        //Update the notifications to read
        await Notification.updateMany({ to: userId }, { read: true });

        res.status(200).json(notifications);
    } catch (error) {
        console.log("Error getNotifications: ", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}

export const deleteNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        await Notification.deleteMany({ to:userId });
        res.status(200).json({ message: "Notifications deleted successfully" });

    } catch (error) {
        console.log("Error deleteNotifications: ", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}

export const deleteNotification = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user._id;
        const notification = await Notification.findById(notificationId);

        //Check if notification exists
        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }

        //Check if notification belongs to user
        if (notification.to.toString() !== userId.toString()) {
            return res.status(403).json({ error: "You are not allowed to delete this notification" });
        }

        await Notification.findByIdAndDelete(notificationId);
        res.status(200).json({ message: "Notification deleted successfully" });

    } catch (error) {
        console.log("Error in deleteNotification function", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}