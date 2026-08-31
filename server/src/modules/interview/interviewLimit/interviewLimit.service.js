import {
    getInterviewLimitRepo,
    createInterviewLimitRepo,
    incrementInterviewLimitRepo,
    resetInterviewLimitRepo
} from "./interviewLimit.repository.js";


const DAILY_INTERVIEW_LIMIT = 3;

const WINDOW_DURATION_MS =
    24 * 60 * 60 * 1000;


/*
 * Calculate when the current 24-hour window expires.
 */
const getResetTime = (windowStartedAt) => {

    return new Date(
        new Date(windowStartedAt).getTime() +
        WINDOW_DURATION_MS
    );
};


/*
 * Get current interview limit.
 *
 * This does NOT consume a slot.
 */
export const getInterviewLimitService = async (
    userId
) => {

    const limitRecord =
        await getInterviewLimitRepo(userId);


    /*
     * User has never started an interview.
     */
    if (!limitRecord) {

        return {
            limit: DAILY_INTERVIEW_LIMIT,
            used: 0,
            remaining: DAILY_INTERVIEW_LIMIT,
            resetsAt: null,
            limitReached: false
        };
    }


    const windowStartedAt =
        new Date(
            limitRecord.window_started_at
        );

    const resetTime =
        getResetTime(windowStartedAt);

    const now = new Date();


    /*
     * 24 hours have passed.
     *
     * New window automatically starts
     * when the user tries again.
     */
    if (now >= resetTime) {

        return {
            limit: DAILY_INTERVIEW_LIMIT,
            used: 0,
            remaining: DAILY_INTERVIEW_LIMIT,
            resetsAt: null,
            limitReached: false
        };
    }


    const used =
        Number(limitRecord.used);

    const limit =
        Number(limitRecord.daily_limit);

    const remaining =
        Math.max(
            limit - used,
            0
        );


    return {

        limit,

        used,

        remaining,

        resetsAt:
            resetTime.toISOString(),

        limitReached:
            remaining <= 0
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

    const limitRecord =
        await getInterviewLimitRepo(userId);


    /*
     * First interview ever.
     */
    if (!limitRecord) {

        const created =
            await createInterviewLimitRepo(
                userId
            );

        const resetTime =
            getResetTime(
                created.window_started_at
            );

        const used =
            Number(created.used);

        const limit =
            Number(created.daily_limit);

        return {

            allowed: true,

            limit,

            used,

            remaining:
                Math.max(
                    limit - used,
                    0
                ),

            resetsAt:
                resetTime.toISOString()
        };
    }


    const windowStartedAt =
        new Date(
            limitRecord.window_started_at
        );

    const resetTime =
        getResetTime(windowStartedAt);

    const now = new Date();


    /*
     * Current 24-hour window expired.
     *
     * Start a completely new window.
     *
     * Previous unused interviews are NOT
     * carried forward.
     */
    if (now >= resetTime) {

        const reset =
            await resetInterviewLimitRepo(
                userId
            );

        const newResetTime =
            getResetTime(
                reset.window_started_at
            );

        const used =
            Number(reset.used);

        const limit =
            Number(reset.daily_limit);

        return {

            allowed: true,

            limit,

            used,

            remaining:
                Math.max(
                    limit - used,
                    0
                ),

            resetsAt:
                newResetTime.toISOString()
        };
    }


    /*
     * Current window is still active.
     */
    const used =
        Number(limitRecord.used);

    const limit =
        Number(limitRecord.daily_limit);


    /*
     * No interviews remaining.
     */
    if (used >= limit) {

        const error =
            new Error(
                "Daily interview limit reached."
            );

        error.code =
            "INTERVIEW_LIMIT_REACHED";

        error.limit =
            limit;

        error.used =
            used;

        error.remaining =
            0;

        error.resetsAt =
            resetTime.toISOString();

        throw error;
    }


    /*
     * Consume one slot.
     */
    const updated =
        await incrementInterviewLimitRepo(
            userId
        );

    const updatedUsed =
        Number(updated.used);

    const updatedLimit =
        Number(updated.daily_limit);


    return {

        allowed: true,

        limit:
            updatedLimit,

        used:
            updatedUsed,

        remaining:
            Math.max(
                updatedLimit - updatedUsed,
                0
            ),

        resetsAt:
            resetTime.toISOString()
    };
};