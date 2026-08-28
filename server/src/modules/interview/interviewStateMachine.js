export const InterviewPhase = {

    UNDERSTANDING: "UNDERSTANDING",

    APPROACH: "APPROACH",

    CODING: "CODING",

    DEBUGGING: "DEBUGGING",

    OPTIMIZATION: "OPTIMIZATION",

    FINISHED: "FINISHED"

};

export const decideNextPhase = ({
    currentPhase,
    evaluation,
    codeDetected,
    approachAccepted = false,
    optimizationCompleted = false
}) => {

    switch (currentPhase) {

        case InterviewPhase.UNDERSTANDING:

            // Candidate has demonstrated the approach
            if (approachAccepted) {
                return InterviewPhase.APPROACH;
            }

            // Candidate skipped discussion and started coding
            if (codeDetected) {
                return InterviewPhase.CODING;
            }

            return InterviewPhase.UNDERSTANDING;


        case InterviewPhase.APPROACH:

            // Candidate started implementing
            if (codeDetected) {
                return InterviewPhase.CODING;
            }

            return InterviewPhase.APPROACH;


        case InterviewPhase.CODING:

            // No execution result yet
            if (!evaluation) {
                return InterviewPhase.CODING;
            }

            // Failed tests → debugging
            if (evaluation.failed > 0) {
                return InterviewPhase.DEBUGGING;
            }

            // All tests passed → optimization
            return InterviewPhase.OPTIMIZATION;


        case InterviewPhase.DEBUGGING:

            if (!evaluation) {
                return InterviewPhase.DEBUGGING;
            }

            // Still broken
            if (evaluation.failed > 0) {
                return InterviewPhase.DEBUGGING;
            }

            // Fixed
            return InterviewPhase.OPTIMIZATION;


        case InterviewPhase.OPTIMIZATION:

            if (optimizationCompleted) {
                return InterviewPhase.FINISHED;
            }

            return InterviewPhase.OPTIMIZATION;


        case InterviewPhase.FINISHED:

            return InterviewPhase.FINISHED;


        default:

            return InterviewPhase.UNDERSTANDING;
    }
};