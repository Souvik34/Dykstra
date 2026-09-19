import {
    getPublicStatsService
} from "./publicStats.service.js";

export const getPublicStatsController = async (req, res) => {
    try {
        const stats = await getPublicStatsService();

        res.status(200).json({
            success: true,
            data: stats,
        });

    } catch (error) {
        console.error("Public stats error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch public stats",
        });
    }
};