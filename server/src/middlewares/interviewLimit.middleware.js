import {
    consumeInterviewSlotService
} from "../modules/interview/interviewLimit/interviewLimit.service.js";


export const interviewLimitMiddleware = async (
    req,
    res,
    next
) => {

    try {

        const userId = req.user.id;

        const result =
            await consumeInterviewSlotService(
                userId
            );

        req.interviewLimit = result;

        next();

    } catch (error) {

        console.error(
            "Interview limit middleware error:",
            error
        );

        if (
            error.code ===
            "INTERVIEW_LIMIT_REACHED"
        ) {

            return res.status(429).json({
                success: false,

                code:
                    "INTERVIEW_LIMIT_REACHED",
message:
    "You have reached your 3-interview limit for the last 7 days.",

                limit:
                    error.limit,

                used:
                    error.used,

                remaining: 0,

                resetsAt:
                    error.resetsAt
            });
        }


        return res.status(500).json({
            success: false,
            message:
                "Unable to check interview limit."
        });
    }
};