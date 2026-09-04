    import pool from "../../db/db.js";



    export const createInterviewSessionRepo = async ({
        userId,
        type,
        difficulty,
        language,
        company,
        role,
        questionStrategy,
        title,
        currentQuestion
    }) => {

        const result = await pool.query(
            `
            INSERT INTO interview_sessions
            (
                user_id,
                type,
                difficulty,
                language,
                company,
                role,
                question_strategy,
                title,
                current_question
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
            `,
            [
                userId,
                type,
                difficulty,
                language,
                company,
                role,
                questionStrategy,
                title,
                currentQuestion
            ]
        );

        return result.rows[0];
    };

    export const insertInterviewMessageRepo = async ({
    sessionId,
    sender,
    message,
    }) => {

    const result = await pool.query(
        `
        INSERT INTO interview_messages
        (
        session_id,
        sender,
        message
        )

        VALUES ($1, $2, $3)

        RETURNING *
        `,
        [
        sessionId,
        sender,
        message,
        ]
    );

    return result.rows[0];
    };



    export const getInterviewSessionRepo = async ({
        sessionId,
        userId,
    }) => {
        const result = await pool.query(
            `
            SELECT *
            FROM interview_sessions
            WHERE id = $1
            AND user_id = $2
            `,
            [sessionId, userId]
        );

        return result.rows[0];
    };


    export const getInterviewMessagesRepo = async (
    sessionId
    ) => {

    const result = await pool.query(
        `
        SELECT *
        FROM interview_messages
        WHERE session_id = $1
        ORDER BY created_at ASC
        `,
        [sessionId]
    );

    return result.rows;
    };

    export const createInterviewFeedbackRepo =
    async ({
        sessionId,
        overallScore,
        communicationScore,
        problemSolvingScore,
        optimizationScore,
        strengths,
        weaknesses,
        finalFeedback,
    }) => {

        const result = await pool.query(
        `
        INSERT INTO interview_feedback
        (
            session_id,
            overall_score,
            communication_score,
            problem_solving_score,
            optimization_score,
            strengths,
            weaknesses,
            final_feedback
        )

        VALUES
        (
            $1, $2, $3, $4,
            $5, $6, $7, $8
        )

        RETURNING *
        `,
        [
            sessionId,
            overallScore,
            communicationScore,
            problemSolvingScore,
            optimizationScore,
            strengths,
            weaknesses,
            finalFeedback,
        ]
        );

        return result.rows[0];
    };

    export const endInterviewSessionRepo =
    async (sessionId) => {

        await pool.query(
        `
        UPDATE interview_sessions
        SET
            status = 'completed',
            ended_at = NOW()

        WHERE id = $1
        `,
        [sessionId]
        );
    };

   export const updateInterviewPhaseRepo = async (
    sessionId,
    phase
) => {
    const { rows } = await pool.query(
        `
        UPDATE interview_sessions
        SET
            phase = $2,
            interruption_count = 0,
            last_interrupt_at_version = NULL,
            coding_started =
                CASE
                    WHEN $2::text = 'CODING' THEN TRUE
                    ELSE coding_started
                END
        WHERE id = $1
        RETURNING phase, coding_started
        `,
        [sessionId, phase]
    );

    console.log("DB Phase:", rows[0]?.phase);
    console.log("Coding Started:", rows[0]?.coding_started);

    return rows[0];
};
    export const updateCodeSnapshotRepo = async ({
        sessionId,
        code
    })=>{

        await pool.query(
            `
            UPDATE interview_sessions
            SET
                last_code=$2,
                code_version=code_version+1
            WHERE id=$1
            `,
            [sessionId,code]
        );

    };
    export const recordInterruptRepo = async ({
        sessionId,
        codeVersion
    }) => {

        await pool.query(
            `
            UPDATE interview_sessions
            SET
                interruption_count = interruption_count + 1,
                last_interrupt_at_version = $2
            WHERE id = $1
            `,
            [sessionId, codeVersion]
        );

    };

    export const resetInterruptRepo = async (
        sessionId
    ) => {

        await pool.query(
            `
            UPDATE interview_sessions
            SET
                interruption_count = 0,
                last_interrupt_at_version = NULL
            WHERE id = $1
            `,
            [sessionId]
        );

    };

    export const markOptimizationCompletedRepo = async (
        sessionId
    ) => {

        await pool.query(
            `
            UPDATE interview_sessions
            SET optimization_completed = TRUE
            WHERE id = $1
            `,
            [sessionId]
        );

    };

    export const getInterviewReportRepo = async (sessionId) => {

        const query = `
            SELECT
                session_id,
                overall_score,
                communication_score,
                problem_solving_score,
                optimization_score,
                strengths,
                weaknesses,
                final_feedback,
                created_at
            FROM interview_feedback
            WHERE session_id = $1
        `;

        const result = await pool.query(query, [sessionId]);

        return result.rows[0];
    };

    export const saveInterviewQuestionHistoryRepo = async ({
        userId,
        title
    }) => {
        await pool.query(
            `
            INSERT INTO interview_question_history
            (user_id, title)
            VALUES ($1, $2)
            `,
            [userId, title]
        );
    };

    export const getInterviewQuestionHistoryRepo = async (userId) => {
        const { rows } = await pool.query(
            `
            SELECT title
            FROM interview_question_history
            WHERE user_id = $1
            ORDER BY created_at DESC
            `,
            [userId]
        );

        return rows;
    };

  export const getInterviewHistoryRepo = async (userId) => {
    const { rows } = await pool.query(
        `
        SELECT
            s.id,
            s.title,
            s.type,
            s.difficulty,
            s.language,
            s.company,
            s.role,
            s.question_strategy,
            s.current_question,
            s.last_code,
            s.status,
            s.ended_at,

            f.overall_score,
            f.communication_score,
            f.problem_solving_score,
            f.optimization_score,
            f.strengths,
            f.weaknesses,
            f.final_feedback,
            f.created_at AS report_created_at

        FROM interview_sessions s

        LEFT JOIN interview_feedback f
            ON f.session_id = s.id

        WHERE s.user_id = $1

        ORDER BY COALESCE(s.ended_at, f.created_at) DESC
        `,
        [userId]
    );

    return rows;
};