import { InterviewPhase } from "./interviewStateMachine.js";

const MAX_INTERRUPTS_PER_PHASE = 3;

export const shouldInterrupt = ({
    phase,
    evaluation,
    interruptionCount = 0,
    codeAnalysis,
    lastInterruptAtVersion,
    currentCodeVersion
}) => {

    // Limit interruptions
    if (interruptionCount >= MAX_INTERRUPTS_PER_PHASE) {
        return false;
    }

 switch (phase) {
    case InterviewPhase.UNDERSTANDING:
        return codeAnalysis?.garbageDetected === true;

    case InterviewPhase.APPROACH:
        return codeAnalysis?.garbageDetected === true;

    case InterviewPhase.CODING:
        if (lastInterruptAtVersion === currentCodeVersion) {
            return false;
        }

        if (codeAnalysis?.garbageDetected) {
            return true;
        }

        if (
            codeAnalysis.addedLines < 3 &&
            !codeAnalysis.returnAdded &&
            !codeAnalysis.criticalLogicAdded &&
            !(evaluation && evaluation.failed > 0)
        ) {
            return false;
        }

        return true;

    case InterviewPhase.DEBUGGING:
        return true;

    case InterviewPhase.OPTIMIZATION:
        if (
            evaluation &&
            evaluation.total > 0 &&
            evaluation.passed === evaluation.total
        ) {
            return true;
        }

        return false;

    default:
        return false;
}
};

export const getInterruptReason = ({
    phase,
    evaluation,
    codeAnalysis
}) => {

    switch (phase) {

        case InterviewPhase.UNDERSTANDING:
            return "OPENING";

        case InterviewPhase.APPROACH:
            return "APPROACH_DISCUSSION";

            case InterviewPhase.CODING:

    if (codeAnalysis?.garbageDetected) {
        return "NON_CODE_ACTIVITY";
    }

    if (
        evaluation &&
        evaluation.failed > 0
    ) {
        return "FAILED_HIDDEN_TESTCASE";
    }

    if (
        codeAnalysis?.criticalLogicAdded
    ) {
        return "IMPLEMENTATION_PROGRESS";
    }

    if (
        codeAnalysis?.edgeCaseAdded
    ) {
        return "EDGE_CASE_ADDED";
    }

    if (
        codeAnalysis?.returnAdded
    ) {
        return "RETURN_ADDED";
    }

    return "IMPLEMENTATION_PROGRESS";
 
        case InterviewPhase.DEBUGGING:
            return "DEBUGGING";

        case InterviewPhase.OPTIMIZATION:
            return "OPTIMIZATION";

        default:
            return null;
    }
};