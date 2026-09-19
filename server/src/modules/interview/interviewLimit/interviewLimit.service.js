import {
    getInterviewLimitRepo,
    getRecentInterviewsRepo
} from "./interviewLimit.repository.js";


const INTERVIEW_LIMIT = 3;


/*
 * Get the current rolling 7-day interview quota.
 *
 * Usage is based on actual interview_sessions.started_at
 * timestamps rather than a fixed quota window.
 */
export const getInterviewLimitService = async (
    userId
) => {

    const recentInterviews =
        await getRecentInterviewsRepo(userId);


    const used =
        recentInterviews.length;

    const remaining =
        Math.max(
            INTERVIEW_LIMIT - used,
            0
        );


    /*
     * No quota reached.
     *
     * There is no countdown because another
     * interview can be started immediately.
     */
    if (used < INTERVIEW_LIMIT) {

        return {

            limit:
                INTERVIEW_LIMIT,

            used,

            remaining,

            resetsAt:
                null,

            limitReached:
                false
        };
    }


    /*
     * All 3 interview slots are currently used.
     *
     * The oldest interview is the first one
     * that will leave the rolling 7-day window.
     */
    const oldestInterview =
        recentInterviews[0];


    const oldestStartedAt =
        new Date(
            oldestInterview.started_at
        );


    const nextAvailableAt =
        new Date(
            oldestStartedAt.getTime() +
            7 * 24 * 60 * 60 * 1000
        );


    return {

        limit:
            INTERVIEW_LIMIT,

        used,

        remaining:
            0,

        resetsAt:
            nextAvailableAt.toISOString(),

        limitReached:
            true
    };
};


/*
 * Consume ONE interview slot.
 *
 * Called before startInterviewService().
 */
export const consumeInterviewSlotService = async (
    userId
) => {

    const recentInterviews =
        await getRecentInterviewsRepo(userId);


    const used =
        recentInterviews.length;


    /*
     * All 3 slots are currently occupied.
     */
    if (used >= INTERVIEW_LIMIT) {

        const oldestInterview =
            recentInterviews[0];


        const oldestStartedAt =
            new Date(
                oldestInterview.started_at
            );


        const nextAvailableAt =
            new Date(
                oldestStartedAt.getTime() +
                7 * 24 * 60 * 60 * 1000
            );


        const error =
            new Error(
                "Interview limit reached for this 7-day period."
            );


        error.code =
            "INTERVIEW_LIMIT_REACHED";


        error.limit =
            INTERVIEW_LIMIT;


        error.used =
            used;


        error.remaining =
            0;


        error.resetsAt =
            nextAvailableAt.toISOString();


        throw error;
    }


    /*
     * There is at least one available slot.
     *
     * The actual interview session will be created
     * immediately after this service returns.
     */
    const newUsed =
        used + 1;


    return {

        allowed:
            true,

        limit:
            INTERVIEW_LIMIT,

        used:
            newUsed,

        remaining:
            Math.max(
                INTERVIEW_LIMIT - newUsed,
                0
            ),

        resetsAt:
            null
    };
};