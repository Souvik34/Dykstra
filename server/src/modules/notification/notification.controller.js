import {
    getNotificationsService,
    markNotificationReadService,
    markAllNotificationsReadService,
} from "./notification.service.js";

export const getNotificationsController = async (req, res) => {
    try {
        const result = await getNotificationsService(req.user.id);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("Get notifications error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch notifications",
        });
    }
};

export const markNotificationReadController = async (req, res) => {
    try {
        const notification = await markNotificationReadService(
            req.user.id,
            req.params.id
        );

        return res.status(200).json({
            success: true,
            data: notification,
        });
    } catch (error) {
        console.error("Mark notification read error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to mark notification as read",
        });
    }
};

export const markAllNotificationsReadController = async (req, res) => {
    try {
        const updated = await markAllNotificationsReadService(
            req.user.id
        );

        return res.status(200).json({
            success: true,
            data: { updated },
        });
    } catch (error) {
        console.error("Mark all notifications read error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to mark notifications as read",
        });
    }
};