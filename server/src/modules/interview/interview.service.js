import {
    createInterviewSessionRepo,
    insertInterviewMessageRepo,
    getInterviewSessionRepo,
    getInterviewMessagesRepo,
    createInterviewFeedbackRepo,
    endInterviewSessionRepo,
    updateInterviewPhaseRepo,
    updateCodeSnapshotRepo,
    recordInterruptRepo,
    markOptimizationCompletedRepo,
    resetInterruptRepo,
    getInterviewQuestionHistoryRepo,
saveInterviewQuestionHistoryRepo,
getInterviewHistoryRepo
    
} from "./interview.repository.js";


import { getIO } from "../../socket.js";

import { getInterviewReportRepo } from "./interview.repository.js";
import { generateStructuredQuestion } from "./questionGenerator.ai.js";

import { evaluateCode } from "./codeEvaluation.service.js";

import { generateInterviewFeedback } from "./interview.ai.js";

import {
    detectSubmissionType,
    analyzeCodeProgress,
    SubmissionType
} from "./codeDetector.js";

import {
    shouldInterrupt,
    getInterruptReason
} from "./interviewDecisionEngine.js";

import {
    InterviewPhase,
    decideNextPhase
} from "./interviewStateMachine.js";

import {
    generateInterviewerResponse
} from "./interviewer.ai.js";

const idleTimers = new Map();

const IDLE_TIMEOUT = 2 * 60 * 1000;

const resetInterviewIdleTimer = (sessionId) => {
    if (idleTimers.has(sessionId)) {
        clearTimeout(idleTimers.get(sessionId));
    }

    const timer = setTimeout(() => {
        try {
            getIO()
                .to(`interview-${sessionId}`)
                .emit("interview-idle", {
                    sessionId,
                    message: "Are you still working on the problem?"
                });

            idleTimers.delete(sessionId);
        } catch (err) {
            console.error("Idle timer error:", err);
        }
    }, IDLE_TIMEOUT);

    idleTimers.set(sessionId, timer);
};

const clearInterviewIdleTimer = (sessionId) => {
    if (idleTimers.has(sessionId)) {
        clearTimeout(idleTimers.get(sessionId));
        idleTimers.delete(sessionId);
    }
};
export const getInterviewReportService = async (sessionId) => {

    const report = await getInterviewReportRepo(sessionId);

    return report;
};
export const startInterviewService = async ({
    userId,
    type,
    difficulty,
    language,
    company,
    role,
    questionStrategy
}) => {

    console.log("1. Starting interview");

    const normalizedCompany =
        company?.trim() || null;

    const normalizedRole =
        role?.trim() || "SDE-1";

    let normalizedQuestionStrategy =
        questionStrategy || "RELEVANT";

    if (
        !normalizedCompany &&
        normalizedQuestionStrategy === "PYQ"
    ) {
        normalizedQuestionStrategy = "RELEVANT";
    }
const previousQuestions =
    await getInterviewQuestionHistoryRepo(userId);
 const rawQuestion =
   await generateStructuredQuestion({
    company: normalizedCompany,
    role: normalizedRole,
    difficulty,
    language,
    questionStyle: normalizedQuestionStrategy,
    previousQuestions
});
        const questionText =
    typeof rawQuestion === "string"
        ? rawQuestion
        : JSON.stringify(rawQuestion);
        console.log("2. Question generated");
console.log(rawQuestion);
let question;

try {
    
    const cleaned = questionText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
    
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    
    const jsonString = cleaned.substring(start, end + 1);
    
    question = JSON.parse(jsonString);
console.log("3. Parsed question");
await saveInterviewQuestionHistoryRepo({
    userId,
    title: question.title
});
    const starter =
        question.starterCode ||
        question.starter_code ||
        {};

    question.starterCode =
        typeof starter === "string"
            ? starter
            : starter[language] || "";

    delete question.optimal_solution;
    delete question.solution;
    delete question.answer;

} catch (err) {

    console.error("RAW RESPONSE:\n", rawQuestion);
    console.error("PARSE ERROR:", err);
    throw err;

}
 const session =
await createInterviewSessionRepo({
    userId,
    type,
    difficulty,
    language,
    company: normalizedCompany,
    role: normalizedRole,
    questionStrategy:
        normalizedQuestionStrategy,
    title: question.title,
    currentQuestion: JSON.stringify(question)
});
    
        console.log("4. Session created", session.id);

    await updateInterviewPhaseRepo(

        session.id,

        InterviewPhase.UNDERSTANDING

    );
resetInterviewIdleTimer(session.id);
  
   const responseQuestion = {
    ...question
};

delete responseQuestion.hiddenTestCases;
delete responseQuestion.interviewGuide;
delete responseQuestion.expectedConcepts;
delete responseQuestion.expectedComplexity;
console.log("5. Returning response");
return {

    session: {
        id: session.id,
        status: session.status,
        phase: InterviewPhase.UNDERSTANDING
    },

    firstQuestion: responseQuestion

};
};


export const sendInterviewMessageService = async ({
    sessionId,
    userId,
    message,
    code,
    isSubmission = false
}) => {

    console.log("=================================");
    console.log(">>> sendInterviewMessageService called");
    console.log("Session:", sessionId);
    console.log("Candidate message:", message);
    console.log("=================================");

  const session =
    await getInterviewSessionRepo({
        sessionId,
        userId
    });

    if (!session) {
        throw new Error("Interview session not found.");
    }

    const isInterviewStart =
        message === "__INTERVIEW_START__";

    resetInterviewIdleTimer(sessionId);

    /*
    ======================================
    INTERVIEW ALREADY FINISHED
    ======================================
    */

    if (session.phase === InterviewPhase.FINISHED) {

        return {
            aiReply:
                "The interview has concluded and my evaluation has already been submitted. Thank you for your time and best of luck.",

            phase: InterviewPhase.FINISHED,

            evaluation: null,

            codeAnalysis: null,

            interrupted: false
        };
    }

    /*
    ======================================
    SAVE USER MESSAGE
    ======================================
    */

    await insertInterviewMessageRepo({
        sessionId,
        sender: "user",
        message
    });

    /*
    ======================================
    LOAD INTERVIEW PACKAGE
    ======================================
    */

    let interviewPackage;

    try {

        interviewPackage =
            JSON.parse(session.current_question);

    } catch (err) {

        console.error(
            "Interview package corrupted:",
            err
        );

        throw new Error(
            "Interview package corrupted."
        );
    }

    /*
    ======================================
    LOAD CONVERSATION
    ======================================
    */

    const conversation =
        await getInterviewMessagesRepo(sessionId);


    /*
    ======================================
    INTERVIEW START / INTRODUCTION
    ======================================
    */

   if (isInterviewStart) {

    const openingMessage = `
Hi, I'm Antonio and I'll be your interviewer today.

We'll spend around 45 minutes together.

Let's begin.

Could you briefly introduce yourself?
`.trim();

    /*
     * Check whether the introduction already exists.
     *
     * This can happen when:
     * - React StrictMode triggers the effect twice
     * - the user reconnects
     * - the page is refreshed
     * - the socket reconnects
     */
    const existingIntroduction = conversation.find(
        msg =>
            msg.sender === "ai" &&
            typeof msg.message === "string" &&
            msg.message.includes(
                "Hi, I'm Antonio and I'll be your interviewer today."
            )
    );

    /*
     * Introduction already exists.
     *
     * IMPORTANT:
     * Never return aiReply: null here.
     *
     * The frontend needs a usable response even if
     * the introduction was already persisted.
     */
    if (existingIntroduction) {

        return {
            aiReply: existingIntroduction.message,
            phase: session.phase,
            evaluation: null,
            codeAnalysis: null,
            interrupted: false
        };
    }

    /*
     * First time introduction.
     */
    await insertInterviewMessageRepo({
        sessionId,
        sender: "ai",
        message: openingMessage
    });

    const io = getIO();

    io.to(`interview-${sessionId}`).emit(
        "interviewer-message",
        {
            message: openingMessage,
            aiReply: openingMessage,
            phase: session.phase,
            evaluation: null,
            codeAnalysis: null,
            interrupted: false
        }
    );

    return {
        aiReply: openingMessage,
        message: openingMessage,
        phase: session.phase,
        evaluation: null,
        codeAnalysis: null,
        interrupted: false
    };
}

    /*
    ======================================
    DETECT SUBMISSION TYPE
    ======================================
    */

    console.log("=================================");
    console.log("Candidate message:");
    console.log(message);

    console.log("Editor code:");
    console.log(code);

    const candidateContent =
        code?.trim()
            ? code
            : message;

    const submissionType =
        detectSubmissionType(
            candidateContent
        );

    console.log(
        "Submission type:",
        submissionType
    );

    const codeDetected =
        submissionType === SubmissionType.CODE &&
        message !== "__INTERVIEW_START__";

    console.log(
        "Code detected:",
        codeDetected
    );

    console.log("=================================");


    /*
    ======================================
    INITIAL STATE
    ======================================
    */

    let evaluation = null;

    let codeAnalysis = null;


    /*
    ======================================
    JUDGE0 EVALUATION
    ======================================
    */

    if (
        codeDetected &&
        isSubmission === true &&
        session.type === "DSA"
    ) {

        console.log(
            "Entered CODE analysis block"
        );

        /*
        Analyze code progress
        */

        codeAnalysis =
            analyzeCodeProgress({

                previousCode:
                    session.last_code || "",

                currentCode:
                    candidateContent,

                interviewGuide:
                    interviewPackage.interviewGuide

            });

        /*
        Build test cases
        */

        const testCases = [

            ...(interviewPackage.visibleTestCases || []),

            ...(interviewPackage.hiddenTestCases || [])

        ];

        console.time("Judge0");

        try {
console.log(" LANGUAGE FROM SESSION =", session.language);
console.log(" LANGUAGE TYPE =", typeof session.language);
            evaluation =
                await evaluateCode({

                    language:
                        session.language,

                    code:
                        candidateContent,

                    testCases,

                    problem:
                        interviewPackage
                });

            console.log(
                "========== JUDGE0 =========="
            );

            console.log(
                "Passed:",
                evaluation?.passed
            );

            console.log(
                "Failed:",
                evaluation?.failed
            );

            console.log(
                "Total:",
                evaluation?.total
            );

            console.log(
                "============================"
            );

        } catch (judgeError) {

            console.error(
                "Judge0 evaluation failed:",
                judgeError
            );

            /*
            Don't crash the interview if Judge0
            temporarily fails.
            */

            evaluation = null;
        }

        console.timeEnd("Judge0");

        console.log(
            "========== EVALUATION =========="
        );

        console.dir(
            evaluation,
            {
                depth: null
            }
        );

        console.log(
            "================================"
        );


        /*
        Save code snapshot
        */

        try {

            await updateCodeSnapshotRepo({

                sessionId,

                code: candidateContent
            });

        } catch (snapshotError) {

            console.error(
                "Code snapshot update failed:",
                snapshotError
            );
        }
    }


    /*
    ======================================
    OPTIMIZATION COMPLETION
    ======================================
    */

    let optimizationCompleted =
        session.optimization_completed;

    if (
        session.phase === InterviewPhase.OPTIMIZATION &&
        !optimizationCompleted &&
        !codeDetected &&
        typeof message === "string" &&
        message.trim().length > 20
    ) {

        await markOptimizationCompletedRepo(
            sessionId
        );

        optimizationCompleted = true;
    }


    /*
    ======================================
    DECIDE NEXT PHASE
    ======================================
    */

    const nextPhase =
    decideNextPhase({

        currentPhase:
            session.phase,

        evaluation,

        codeDetected,

        approachAccepted:
            aiNextFocus === InterviewPhase.APPROACH,

        optimizationCompleted
    });

    console.log(
        "========== PHASE =========="
    );

    console.log(
        "Current:",
        session.phase
    );

    console.log(
        "Next:",
        nextPhase
    );

    console.log(
        "Evaluation failed:",
        evaluation?.failed
    );

    console.log(
        "==========================="
    );


    /*
    ======================================
    UPDATE PHASE
    ======================================
    */

    if (
        nextPhase !== session.phase
    ) {

        await updateInterviewPhaseRepo(
            sessionId,
            nextPhase
        );

        await resetInterruptRepo(
            sessionId
        );
    }


    /*
    ======================================
    INTERRUPT DECISION
    ======================================
    */

    const currentCodeVersion =
        session.code_version +
        (codeDetected ? 1 : 0);

    const interrupt =
        shouldInterrupt({

            phase:
                nextPhase,

            evaluation,

            interruptionCount:
                session.interruption_count,

            codeAnalysis,

            lastInterruptAtVersion:
                session.last_interrupt_at_version,

            currentCodeVersion
        });


    console.log(
        "Should interrupt:",
        interrupt
    );


    /*
    ======================================
    INTERRUPT REASON
    ======================================
    */

    let interruptReason = null;

    if (interrupt) {

        interruptReason =
            getInterruptReason({

                phase:
                    nextPhase,

                evaluation,

                codeAnalysis
            });

        console.log(
            "Interrupt reason:",
            interruptReason
        );

        await recordInterruptRepo({

            sessionId,

            codeVersion:
                currentCodeVersion
        });
    }


    /*
    ======================================
    GENERATE AI RESPONSE
    ======================================
    */

    let rawResponse = null;

    let aiReply = null;
    let aiNextFocus = null;


    if (
        interrupt ||
        !codeDetected
    ) {

        console.time("AI");

        try {

            rawResponse =
                await generateInterviewerResponse({

                    phase:
                        nextPhase,

                    interviewGuide:
                        interviewPackage.interviewGuide,

                    expectedConcepts:
                        interviewPackage.expectedConcepts,

                    conversation,

                    candidateMessage:
                        message,

                    candidateCode:
                        codeDetected
                            ? candidateContent
                            : session.last_code || null,

                    evaluation,

                    codeAnalysis,

                    interruptReason,

                    interactionType:
                        codeDetected
                            ? "CODE_SUBMIT"
                            : "CHAT",

                    optimizationCompleted:
                        optimizationCompleted
                });

        } catch (aiError) {

            console.error(
                "Interviewer AI generation failed:",
                aiError
            );

            rawResponse = null;
        }

        console.timeEnd("AI");


        console.log(
            "========== RAW AI RESPONSE =========="
        );

        console.dir(
            rawResponse,
            {
                depth: null
            }
        );

        console.log(
            "======================================"
        );
    }


    /*
    ======================================
    ROBUST AI RESPONSE PARSER
    ======================================
    */

    const getSafeAIReply = (response) => {

        /*
        Case 1:
        Gemini returned nothing
        */

        if (
            response === null ||
            response === undefined
        ) {

            console.warn(
                "AI returned null/undefined."
            );

            return null;
        }


        /*
        Case 2:
        Gemini returned an object
        */

        if (
            typeof response === "object"
        ) {

            const reply =
                response.reply;

            if (
                typeof reply === "string" &&
                reply.trim().length > 0
            ) {

                return reply.trim();
            }

            /*
            Sometimes AI may return:
            { response: "..." }
            */

            if (
                typeof response.response === "string" &&
                response.response.trim().length > 0
            ) {

                return response.response.trim();
            }

            /*
            Sometimes AI may return:
            { message: "..." }
            */

            if (
                typeof response.message === "string" &&
                response.message.trim().length > 0
            ) {

                return response.message.trim();
            }

            return null;
        }


        /*
        Case 3:
        Gemini returned a string
        */

        if (
            typeof response === "string"
        ) {

            let cleaned =
                response
                    .replace(/```json/gi, "")
                    .replace(/```/g, "")
                    .trim();

            if (!cleaned) {
                return null;
            }


            /*
            Try JSON first
            */

            try {

                const parsed =
                    JSON.parse(cleaned);

                if (
                    parsed &&
                    typeof parsed.reply === "string" &&
                    parsed.reply.trim().length > 0
                ) {

                    return parsed.reply.trim();
                }

                if (
                    parsed &&
                    typeof parsed.response === "string" &&
                    parsed.response.trim().length > 0
                ) {

                    return parsed.response.trim();
                }

            } catch (parseError) {

                /*
                Not JSON.
                That's okay.
                Gemini sometimes returns plain text.
                */
            }


            /*
            Plain text response
            */

            return cleaned;
        }


        return null;
    };


    /*
    ======================================
    EXTRACT AI REPLY
    ======================================
    */

    aiReply =
        getSafeAIReply(rawResponse);
if (typeof rawResponse === "object" && rawResponse !== null) {

    aiNextFocus = rawResponse.nextFocus || null;

} else if (typeof rawResponse === "string") {

    try {

        const cleaned = rawResponse
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        const parsed = JSON.parse(cleaned);

        aiNextFocus =
            typeof parsed.nextFocus === "string"
                ? parsed.nextFocus
                : null;

    } catch (err) {

        aiNextFocus = null;
    }
}

    /*
    ======================================
    HANDLE NULL / INVALID AI RESPONSE
    ======================================
    */

    if (!aiReply) {

        console.warn(
            "AI response was invalid. Using contextual fallback."
        );

        /*
        Don't give the same generic sentence
        for every failure.
        */

        if (
            message?.toLowerCase().includes("end") ||
            message?.toLowerCase().includes("stop") ||
            message?.toLowerCase().includes("not prepared") ||
            message?.toLowerCase().includes("next time")
        ) {

            aiReply =
                "Understood. We can end the interview here. I'll record the current progress and provide feedback based on what you've completed.";

        } else if (
            evaluation &&
            evaluation.failed === 0
        ) {

            aiReply =
                "Your solution passes the test cases. Could you explain your approach and its time and space complexity?";

        } else if (
            evaluation &&
            evaluation.failed > 0
        ) {

            aiReply =
                "Some test cases are still failing. Could you walk me through your approach and identify where you think the issue might be?";

        } else if (
            nextPhase === InterviewPhase.CODING
        ) {

            aiReply =
                "Could you walk me through the reasoning behind your implementation?";

        } else if (
            nextPhase === InterviewPhase.OPTIMIZATION
        ) {

            aiReply =
                "Can you explain how you would optimize this solution further?";

        } else {

            aiReply =
                "Could you walk me through your reasoning for this approach?";
        }
    }


    /*
    ======================================
    HANDLE INTERVIEW END FROM AI
    ======================================
    */

    if (
        typeof rawResponse === "object" &&
        rawResponse !== null &&
        rawResponse.optimizationCompleted
    ) {

        console.log(
            "AI marked optimization completed."
        );

        await markOptimizationCompletedRepo(
            sessionId
        );

        await endInterviewService(
            sessionId
        );

        return {

            interviewEnded: true,

            aiReply,

            phase:
                InterviewPhase.FINISHED,

            evaluation,

            codeAnalysis,

            interrupted: false
        };
    }


    /*
    ======================================
    SAVE AI MESSAGE
    ======================================
    */

    try {

        await insertInterviewMessageRepo({

            sessionId,

            sender: "ai",

            message: aiReply
        });

    } catch (saveError) {

        console.error(
            "Failed to save AI message:",
            saveError
        );
    }


    /*
    ======================================
    SOCKET EMIT
    ======================================
    */

    try {

        const io = getIO();

        io.to(`interview-${sessionId}`)
            .emit(
                "interviewer-message",
                {
                    message: aiReply,

                    phase:
                        nextPhase,

                    evaluation
                }
            );

    } catch (socketError) {

        console.error(
            "Socket emit failed:",
            socketError
        );
    }


    /*
    ======================================
    RETURN TO FRONTEND
    ======================================
    */

    const response = {

        aiReply,

        phase:
            nextPhase,

        evaluation,

        codeAnalysis,

        interrupted:
            interrupt
    };

    console.log(
        "========== RETURNING TO FRONTEND =========="
    );

    console.dir(
        response,
        {
            depth: null
        }
    );

    console.log(
        "============================================"
    );

    return response;
};

    
    
export const endInterviewService = async ({
    sessionId,
    userId
}) => {

    const session =
        await getInterviewSessionRepo({
            sessionId,
            userId
        });


    if (!session) {
        throw new Error("Interview session not found");
    }
      if (
        session.status === "completed" ||
        session.phase === InterviewPhase.FINISHED
    ) {
        const error = new Error("INTERVIEW_ALREADY_COMPLETED");
        error.code = "INTERVIEW_ALREADY_COMPLETED";
        throw error;
    }

    // clearInterviewIdleTimer(sessionId);
     clearInterviewIdleTimer(sessionId);

    const conversation =
        await getInterviewMessagesRepo(sessionId);

    let interviewPackage = {};

    try {

        interviewPackage =
            JSON.parse(session.current_question);

    } catch (err) {

        console.error(
            "Interview package parse failed",
            err
        );

    }

    const rawFeedback =
        await generateInterviewFeedback({

            type: session.type,

            difficulty: session.difficulty,

            conversation,

            expectedConcepts:
                interviewPackage.expectedConcepts || [],

            expectedComplexity:
                interviewPackage.expectedComplexity || {},

            interviewGuide:
                interviewPackage.interviewGuide || {}

        });

    let feedback;

    try {

        const cleaned =
            rawFeedback
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

        feedback =
            JSON.parse(cleaned);

    } catch (err) {

        console.error(
            "Feedback Parse Error",
            rawFeedback
        );

        feedback = {

            overallScore: 0,

            communicationScore: 0,

            problemSolvingScore: 0,

            optimizationScore: 0,

            strengths: [
                "Could not evaluate"
            ],

            weaknesses: [
                "Parsing failed"
            ],

            finalFeedback:
                "Interview feedback generation failed."

        };

    }

    await createInterviewFeedbackRepo({

        sessionId,

        overallScore:
            feedback.overallScore,

        communicationScore:
            feedback.communicationScore,

        problemSolvingScore:
            feedback.problemSolvingScore,

        optimizationScore:
            feedback.optimizationScore,

        strengths:
            Array.isArray(feedback.strengths)
                ? feedback.strengths.join("\n")
                : feedback.strengths,

        weaknesses:
            Array.isArray(feedback.weaknesses)
                ? feedback.weaknesses.join("\n")
                : feedback.weaknesses,

        finalFeedback:
            feedback.finalFeedback

    });

    await updateInterviewPhaseRepo(
    sessionId,
    InterviewPhase.FINISHED
);
    await endInterviewSessionRepo(
        sessionId
    );

    return feedback;

};


export const getInterviewByIdService = async ({
    sessionId,
    userId
}) => {

    const session =
        await getInterviewSessionRepo({
            sessionId,
            userId
        });


    if (!session) {
        throw new Error("Interview session not found");
    }

    if (
        session.status === "completed" ||
        session.phase === InterviewPhase.FINISHED
    ) {
        const error = new Error("INTERVIEW_ALREADY_COMPLETED");
        error.code = "INTERVIEW_ALREADY_COMPLETED";
        throw error;
    }

    const question = JSON.parse(session.current_question);

    delete question.hiddenTestCases;
    delete question.interviewGuide;
    delete question.expectedConcepts;
    delete question.expectedComplexity;

    return {
        session: {
            id: session.id,
            language: session.language,
            difficulty: session.difficulty,
            phase: session.phase,
            status: session.status,
        },
        firstQuestion: question,
    };
};

export const realtimeCodeUpdateService = async ({
    sessionId,
    code
}) => {

    try
    {
  console.log("======== REALTIME SERVICE START ========");

    const session = await getInterviewSessionRepo(sessionId);

    if (!session) {
        return;
    }
resetInterviewIdleTimer(sessionId);
    console.log("Current phase:", session.phase);

    const interviewPackage =
        JSON.parse(session.current_question);

    const codeAnalysis =
        analyzeCodeProgress({

            previousCode:
                session.last_code || "",

            currentCode: code,

            interviewGuide:
                interviewPackage.interviewGuide

        });

    console.log("Code Analysis:");
    console.dir(codeAnalysis, { depth: null });

    const saveSnapshot = async () => {

        await updateCodeSnapshotRepo({
            sessionId,
            code
        });

    };

    /*
    ======================================
    Nothing changed
    ======================================
    */

    if (!codeAnalysis.changed) {
        return;
    }

    /*
    ======================================
    AUTO MOVE APPROACH -> CODING
    ======================================
    */

    if (
        session.phase === InterviewPhase.APPROACH &&
        codeAnalysis.changed
    ) {

        const updated =
            await updateInterviewPhaseRepo(
                sessionId,
                InterviewPhase.CODING
            );

        session.phase = updated.phase;

        console.log(" Phase switched -> CODING");
        console.log("Phase after switch:", session.phase);
        console.log("I AM HERE 111111111");
    }

    /*
    ======================================
    Ignore until coding phase
    ======================================
    */

    if (session.phase !== InterviewPhase.CODING) {

        await saveSnapshot();

        return;
    }

    /*
    ======================================
    Ignore insignificant edits
    ======================================
    */

   if (
    codeAnalysis.addedLines < 3 &&
    !codeAnalysis.returnAdded
) {

    await saveSnapshot();

    return;

}

    /*
    ======================================
    Should interrupt?
    ======================================
    */
   console.log("Calling shouldInterrupt...");

    const interrupt =
        shouldInterrupt({

            phase: session.phase,

            evaluation: null,

            interruptionCount:
                session.interruption_count,

            codeAnalysis,

            lastInterruptAtVersion:
                session.last_interrupt_at_version,

            currentCodeVersion:
                session.code_version + 1

        });
console.log("Interrupt =", interrupt);

    if (!interrupt) {

        await saveSnapshot();

        return;
    }

    /*
    ======================================
    Record interrupt
    ======================================
    */

    await recordInterruptRepo({

        sessionId,

        codeVersion:
            session.code_version + 1

    });

    const conversation =
        await getInterviewMessagesRepo(sessionId);

    const interruptReason =
        getInterruptReason({

            phase: session.phase,

            evaluation: null,

            codeAnalysis

        });

    /*
    ======================================
    Generate AI response
    ======================================
    */
console.log("Calling Gemini...");

    const rawResponse =
        await generateInterviewerResponse({

            phase: session.phase,

            interviewGuide:
                interviewPackage.interviewGuide,

            expectedConcepts:
                interviewPackage.expectedConcepts,

            conversation,

            candidateMessage: "",

            candidateCode: code,

            evaluation: null,

            codeAnalysis,

            interruptReason,

            interactionType: "CODE_INTERRUPT"

        });

        console.log("Gemini replied.");
        console.log(rawResponse);
    let aiReply;

  try {

    if (typeof rawResponse === "string") {

        const cleaned = rawResponse
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        try {

            const parsed = JSON.parse(cleaned);

            aiReply = parsed.reply;

            if (!aiReply) {
                throw new Error();
            }

        } catch {

            aiReply = cleaned;
        }

    } else {

        aiReply = rawResponse.reply;

        if (!aiReply) {
            throw new Error();
        }

    }

} catch {

    aiReply =
        "Can you explain what you just changed?";

}

    /*
    ======================================
    Save AI message
    ======================================
    */

    await insertInterviewMessageRepo({

        sessionId,

        sender: "ai",

        message: aiReply

    });

    /*
    ======================================
    Save latest code snapshot
    ======================================
    */

    await saveSnapshot();

    /*
    ======================================
    Emit socket event
    ======================================
    */
   console.log("Emitting interviewer-message...");
console.log(aiReply);

    getIO()
        .to(`interview-${sessionId}`)
        .emit(
            "interviewer-message",
            {
                message: aiReply,
                phase: session.phase,
                evaluation: null
            }
        );

    console.log("Realtime Analysis:");
    console.dir(codeAnalysis, {
        depth: null
    });
    }

     catch (err) {
        console.error("REALTIME ERROR:");
        console.error(err);
    }
  

};

export const getInterviewHistoryService = async (userId) => {

    const interviews =
        await getInterviewHistoryRepo(userId);

    return interviews.map((interview) => {

        let question = {};

        try {
            question =
                JSON.parse(interview.current_question || "{}");
        } catch (error) {
            console.error(
                "Failed to parse interview question:",
                error
            );
        }

        /*
         * Never expose internal interviewer data
         */
        delete question.hiddenTestCases;
        delete question.interviewGuide;
        delete question.expectedConcepts;
        delete question.expectedComplexity;
        delete question.solution;
        delete question.optimal_solution;
        delete question.answer;

        return {
            id: interview.id,

            title: interview.title,

            type: interview.type,

            difficulty: interview.difficulty,

            language: interview.language,

            company: interview.company,

            role: interview.role,

            questionStrategy:
                interview.question_strategy,

            createdAt:
                interview.created_at,

            endedAt:
                interview.ended_at,

            question,

            code:
                interview.last_code || "",

            report: interview.overall_score === null
                ? null
                : {
                    overallScore:
                        interview.overall_score,

                    communicationScore:
                        interview.communication_score,

                    problemSolvingScore:
                        interview.problem_solving_score,

                    optimizationScore:
                        interview.optimization_score,

                    strengths:
                        interview.strengths,

                    weaknesses:
                        interview.weaknesses,

                    finalFeedback:
                        interview.final_feedback,

                    createdAt:
                        interview.report_created_at
                }
        };
    });
};