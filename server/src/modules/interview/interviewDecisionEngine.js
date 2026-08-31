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
            return false;

        case InterviewPhase.APPROACH:
            return false;

 case InterviewPhase.CODING:

    /*
    Already interrupted for this code version.
    */

    if (
        lastInterruptAtVersion === currentCodeVersion
    ) {
        return false;
    }

    /*
    Obvious garbage should interrupt immediately.
    Do not require 3 added lines.
    */

    if (
        codeAnalysis?.garbageDetected
    ) {
        return true;
    }

    /*
    Normal coding activity.
    */

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

    /*
    Obvious garbage / non-code activity.
    This must take priority over normal
    coding milestones.
    */

    if (
        codeAnalysis?.garbageDetected
    ) {
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
        return "USER_IMPLEMENTED_MAIN_ALGORITHM";
    }

    if (
        codeAnalysis?.edgeCaseAdded
    ) {
        return "USER_HANDLED_EDGE_CASE";
    }

    if (
        codeAnalysis?.returnAdded
    ) {
        return "FIRST_WORKING_IMPLEMENTATION";
    }

    return null;
        case InterviewPhase.DEBUGGING:
            return "DEBUGGING";

        case InterviewPhase.OPTIMIZATION:
            return "OPTIMIZATION";

        default:
            return null;
    }
};