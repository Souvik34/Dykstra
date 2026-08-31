
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
    getInterviewHistoryRepo,
    getInterviewReportRepo
} from "./interview.repository.js";

import { getIO } from "../../socket.js";

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


/*
=========================================================
IDLE TIMER
=========================================================
*/

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

            console.error(
                "Idle timer error:",
                err
            );
        }

    }, IDLE_TIMEOUT);

    idleTimers.set(sessionId, timer);
};


const clearInterviewIdleTimer = (sessionId) => {

    if (idleTimers.has(sessionId)) {

        clearTimeout(
            idleTimers.get(sessionId)
        );

        idleTimers.delete(sessionId);
    }
};


/*
=========================================================
AI RESPONSE PARSER
=========================================================
*/

const parseAIResponse = (response) => {

    if (
        response === null ||
        response === undefined
    ) {

        return {
            reply: null,
            nextFocus: null,
            optimizationCompleted: false
        };
    }


    /*
    OBJECT RESPONSE
    */

    if (
        typeof response === "object"
    ) {

        return {

            reply:
                typeof response.reply === "string"
                    ? response.reply.trim()
                    : typeof response.response === "string"
                        ? response.response.trim()
                        : typeof response.message === "string"
                            ? response.message.trim()
                            : null,

            nextFocus:
                typeof response.nextFocus === "string"
                    ? response.nextFocus.trim().toUpperCase()
                    : null,

            optimizationCompleted:
                response.optimizationCompleted === true
        };
    }


    /*
    STRING RESPONSE
    */

    if (
        typeof response === "string"
    ) {

        const cleaned =
            response
                .replace(/```json/gi, "")
                .replace(/```/g, "")
                .trim();

        if (!cleaned) {

            return {
                reply: null,
                nextFocus: null,
                optimizationCompleted: false
            };
        }


        /*
        Try JSON.
        */

        try {

            const parsed =
                JSON.parse(cleaned);

            return {

                reply:
                    typeof parsed.reply === "string"
                        ? parsed.reply.trim()
                        : typeof parsed.response === "string"
                            ? parsed.response.trim()
                            : typeof parsed.message === "string"
                                ? parsed.message.trim()
                                : null,

                nextFocus:
                    typeof parsed.nextFocus === "string"
                        ? parsed.nextFocus.trim().toUpperCase()
                        : null,

                optimizationCompleted:
                    parsed.optimizationCompleted === true
            };

        } catch {

            /*
            Gemini returned normal text.
            */

            return {

                reply: cleaned,

                nextFocus: null,

                optimizationCompleted: false
            };
        }
    }


    return {

        reply: null,

        nextFocus: null,

        optimizationCompleted: false
    };
};


/*
=========================================================
CONTEXTUAL FALLBACK
=========================================================
*/

const getFallbackReply = ({
    message,
    phase,
    evaluation,
    interrupt,
    interruptReason,
    codeAnalysis
}) => {

    const text =
        typeof message === "string"
            ? message.toLowerCase()
            : "";


    /*
    Candidate explicitly wants to stop.
    */

    if (
        text.includes("end interview") ||
        text.includes("stop interview") ||
        text.includes("not prepared") ||
        text.includes("next time")
    ) {

        return (
            "Understood. We can end the interview here. " +
            "I'll record your current progress and provide feedback."
        );
    }


    /*
    Realtime interruption.
    */

  if (interruptReason === "NON_CODE_ACTIVITY") {

    const garbageReplies = [

        "I noticed some content in the editor that doesn't appear to be part of the implementation. Please stay focused on the problem and continue.",

        "I noticed the recent changes don't appear to be part of the solution. Let's stay focused on the implementation.",

        "The recent editor changes don't appear to be related to the problem. Please continue with your solution."

    ];

    return garbageReplies[
        Math.floor(
            Math.random() *
            garbageReplies.length
        )
    ];
}

    if (interrupt) {

        if (
            interruptReason &&
            typeof interruptReason === "string"
        ) {

            return interruptReason;
        }

        if (
            codeAnalysis?.criticalLogicAdded
        ) {

            return (
                "I noticed you've introduced an important part of the solution. " +
                "Can you explain why this approach works?"
            );
        }

        if (
            codeAnalysis?.returnAdded
        ) {

            return (
                "You've added the return logic. " +
                "Before continuing, can you walk me through the reasoning behind this implementation?"
            );
        }

        return (
            "Can you explain what you just changed and why?"
        );
    }


    /*
    Successful submission.
    */

    if (
        evaluation &&
        Number(evaluation.failed) === 0 &&
        Number(evaluation.total) > 0
    ) {

        if (
            phase === InterviewPhase.CODING
        ) {

            return (
                "Your solution passes the test cases. " +
                "Can you explain its time and space complexity?"
            );
        }

        return (
            "Your solution passes the test cases. " +
            "Can you walk me through your approach?"
        );
    }


    /*
    Failed submission.
    */

    if (
        evaluation &&
        Number(evaluation.failed) > 0
    ) {

        return (
            "Some test cases are still failing. " +
            "Can you walk me through your approach and identify where you think the issue might be?"
        );
    }


    /*
    Phase-specific fallbacks.
    */

    switch (phase) {

        case InterviewPhase.UNDERSTANDING:

            return (
                "Before we move on, could you explain your understanding " +
                "of the problem and the constraints?"
            );


        case InterviewPhase.APPROACH:

            return (
                "Could you walk me through your proposed approach " +
                "and explain why it should work?"
            );


        case InterviewPhase.CODING:

            return (
                "Could you walk me through the reasoning behind your implementation?"
            );


        case InterviewPhase.DEBUGGING:

            return (
                "Let's investigate the failing case. " +
                "What do you think is causing the issue?"
            );


        case InterviewPhase.OPTIMIZATION:

            return (
                "Can you explain how you would optimize this solution further?"
            );


        default:

            return (
                "Could you walk me through your reasoning for this approach?"
            );
    }
};


/*
=========================================================
INTERVIEW REPORT
=========================================================
*/

export const getInterviewReportService = async (
    sessionId
) => {

    return await getInterviewReportRepo(
        sessionId
    );
};


/*
=========================================================
START INTERVIEW
=========================================================
*/

export const startInterviewService = async ({
    userId,
    type,
    difficulty,
    language,
    company,
    role,
    questionStrategy
}) => {

    console.log(
        "========== START INTERVIEW =========="
    );


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

        normalizedQuestionStrategy =
            "RELEVANT";
    }


    const previousQuestions =
        await getInterviewQuestionHistoryRepo(
            userId
        );


    const rawQuestion =
        await generateStructuredQuestion({

            company:
                normalizedCompany,

            role:
                normalizedRole,

            difficulty,

            language,

            questionStyle:
                normalizedQuestionStrategy,

            previousQuestions
        });


    const questionText =
        typeof rawQuestion === "string"
            ? rawQuestion
            : JSON.stringify(rawQuestion);


    let question;


    try {

        const cleaned =
            questionText
                .replace(/```json/gi, "")
                .replace(/```/g, "")
                .trim();


        const start =
            cleaned.indexOf("{");

        const end =
            cleaned.lastIndexOf("}");


        if (
            start === -1 ||
            end === -1 ||
            end <= start
        ) {

            throw new Error(
                "AI did not return valid JSON."
            );
        }


        const jsonString =
            cleaned.substring(
                start,
                end + 1
            );


        question =
            JSON.parse(jsonString);


        await saveInterviewQuestionHistoryRepo({

            userId,

            title:
                question.title
        });


        const starter =
            question.starterCode ||
            question.starter_code ||
            {};


        question.starterCode =
            typeof starter === "string"
                ? starter
                : starter[language] || "";


        /*
        Never expose hidden answers.
        */

        delete question.optimal_solution;
        delete question.solution;
        delete question.answer;


    } catch (err) {

        console.error(
            "RAW QUESTION:",
            rawQuestion
        );

        console.error(
            "QUESTION PARSE ERROR:",
            err
        );

        throw err;
    }


    const session =
        await createInterviewSessionRepo({

            userId,

            type,

            difficulty,

            language,

            company:
                normalizedCompany,

            role:
                normalizedRole,

            questionStrategy:
                normalizedQuestionStrategy,

            title:
                question.title,

            currentQuestion:
                JSON.stringify(question)
        });


    await updateInterviewPhaseRepo(
        session.id,
        InterviewPhase.UNDERSTANDING
    );


    resetInterviewIdleTimer(
        session.id
    );


    const responseQuestion = {
        ...question
    };


    delete responseQuestion.hiddenTestCases;
    delete responseQuestion.interviewGuide;
    delete responseQuestion.expectedConcepts;
    delete responseQuestion.expectedComplexity;


    console.log(
        "Interview created:",
        session.id
    );


    return {

        session: {

            id:
                session.id,

            status:
                session.status,

            phase:
                InterviewPhase.UNDERSTANDING
        },

        firstQuestion:
            responseQuestion
    };
};


/*
=========================================================
MAIN INTERVIEW MESSAGE SERVICE
=========================================================
*/

export const sendInterviewMessageService = async ({
    sessionId,
    userId,
    message,
    code,
    isSubmission = false
}) => {

    console.log(
        "========================================"
    );

    console.log(
        ">>> sendInterviewMessageService"
    );

    console.log(
        "Session:",
        sessionId
    );

    console.log(
        "Message:",
        message
    );

    console.log(
        "isSubmission:",
        isSubmission
    );

    console.log(
        "========================================"
    );


    const session =
        await getInterviewSessionRepo({

            sessionId,

            userId
        });


    if (!session) {

        throw new Error(
            "Interview session not found."
        );
    }


    resetInterviewIdleTimer(
        sessionId
    );


    /*
    =====================================================
    FINISHED
    =====================================================
    */

    if (
        session.phase ===
        InterviewPhase.FINISHED
    ) {

        return {

            aiReply:
                "The interview has concluded and my evaluation has already been submitted. Thank you for your time and best of luck.",

            phase:
                InterviewPhase.FINISHED,

            evaluation: null,

            codeAnalysis: null,

            interrupted: false
        };
    }


    /*
    =====================================================
    INTERVIEW START
    =====================================================
    */

    const isInterviewStart =
        message === "__INTERVIEW_START__";


    if (isInterviewStart) {

        const openingMessage =
            `
Hi, I'm Antonio and I'll be your interviewer today.

We'll spend around 45 minutes together.

Let's begin.

Could you briefly introduce yourself?
`.trim();


        const conversation =
            await getInterviewMessagesRepo(
                sessionId
            );


        const existingIntroduction =
            conversation.find(
                msg =>
                    msg.sender === "ai" &&
                    typeof msg.message === "string" &&
                    msg.message.includes(
                        "Hi, I'm Antonio and I'll be your interviewer today."
                    )
            );


        if (existingIntroduction) {

            return {

                aiReply:
                    existingIntroduction.message,

                phase:
                    session.phase,

                evaluation: null,

                codeAnalysis: null,

                interrupted: false
            };
        }


        await insertInterviewMessageRepo({

            sessionId,

            sender: "ai",

            message:
                openingMessage
        });


        getIO()
            .to(`interview-${sessionId}`)
            .emit(
                "interviewer-message",
                {

                    message:
                        openingMessage,

                    aiReply:
                        openingMessage,

                    phase:
                        session.phase,

                    evaluation: null,

                    codeAnalysis: null,

                    interrupted: false
                }
            );


        return {

            aiReply:
                openingMessage,

            message:
                openingMessage,

            phase:
                session.phase,

            evaluation: null,

            codeAnalysis: null,

            interrupted: false
        };
    }


    /*
    =====================================================
    LOAD INTERVIEW PACKAGE
    =====================================================
    */

    let interviewPackage;


    try {

        interviewPackage =
            JSON.parse(
                session.current_question
            );

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
    =====================================================
    SAVE USER MESSAGE
    =====================================================
    */

    await insertInterviewMessageRepo({

        sessionId,

        sender: "user",

        message:
            message || ""
    });


    /*
    =====================================================
    LOAD CONVERSATION
    =====================================================
    */

    const conversation =
        await getInterviewMessagesRepo(
            sessionId
        );


    /*
    =====================================================
    IMPORTANT:
    CODE DETECTION MUST NOT DEPEND ONLY ON EDITOR CODE.
    
    If the candidate says:
    
        "Hi I am Souvik"
    
    while starter code exists, that is CHAT,
    NOT CODE.
    
    Code is considered submitted only when:
    
        isSubmission === true
    AND
        actual code is detected.
    =====================================================
    */

    const submittedCode =
        typeof code === "string"
            ? code.trim()
            : "";


    const detectedSubmissionType =
        submittedCode
            ? detectSubmissionType(
                submittedCode
            )
            : SubmissionType.TEXT;


    const codeDetected =
        isSubmission === true &&
        detectedSubmissionType ===
            SubmissionType.CODE;


    console.log(
        "Submission type:",
        detectedSubmissionType
    );

    console.log(
        "Code detected:",
        codeDetected
    );


    /*
    =====================================================
    INITIAL STATE
    =====================================================
    */

    let evaluation = null;

    let codeAnalysis = null;


    /*
    =====================================================
    CODE SUBMISSION
    =====================================================
    */

    if (
        codeDetected &&
        session.type === "DSA"
    ) {

        console.log(
            "========== CODE SUBMISSION =========="
        );


        /*
        Analyze progress before evaluation.
        */

        codeAnalysis =
            analyzeCodeProgress({

                previousCode:
                    session.last_code || "",

                currentCode:
                    submittedCode,

                interviewGuide:
                    interviewPackage.interviewGuide
            });


        /*
        Test cases.
        */

        const testCases = [

            ...(interviewPackage.visibleTestCases || []),

            ...(interviewPackage.hiddenTestCases || [])
        ];


        try {

            console.time(
                "Judge0"
            );


            evaluation =
                await evaluateCode({

                    language:
                        session.language,

                    code:
                        submittedCode,

                    testCases,

                    problem:
                        interviewPackage
                });


            console.timeEnd(
                "Judge0"
            );


            console.log(
                "Evaluation:",
                evaluation
            );


        } catch (judgeError) {

            console.error(
                "Judge0 evaluation failed:",
                judgeError
            );


            /*
            Interview continues even if
            execution service fails.
            */

            evaluation = null;
        }


        /*
        Always save submitted code.
        */

        try {

            await updateCodeSnapshotRepo({

                sessionId,

                code:
                    submittedCode
            });

        } catch (snapshotError) {

            console.error(
                "Code snapshot failed:",
                snapshotError
            );
        }
    }


    /*
    =====================================================
    OPTIMIZATION COMPLETION
    =====================================================
    */

    let optimizationCompleted =
        Boolean(
            session.optimization_completed
        );


    if (
        session.phase ===
            InterviewPhase.OPTIMIZATION &&
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
    =====================================================
    AI RESPONSE
    =====================================================
    
    IMPORTANT:
    
    AI is called for:
    
      - normal candidate messages
      - actual code submissions
      - NOT merely because editor code exists
    
    Realtime code interruptions are handled by
    realtimeCodeUpdateService separately.
    =====================================================
    */

    let rawResponse = null;

    let aiReply = null;

    let aiNextFocus = null;

    let aiOptimizationCompleted = false;


    try {

        console.time(
            "Interviewer AI"
        );


        rawResponse =
            await generateInterviewerResponse({

                phase:
                    session.phase,

                interviewGuide:
                    interviewPackage.interviewGuide,

                expectedConcepts:
                    interviewPackage.expectedConcepts,

                conversation,

                candidateMessage:
                    message || "",

                candidateCode:
                    codeDetected
                        ? submittedCode
                        : session.last_code || null,

                evaluation,

                codeAnalysis,

                interruptReason: null,

                interactionType:
                    codeDetected
                        ? "CODE_SUBMIT"
                        : "CHAT",

                optimizationCompleted
            });


        console.timeEnd(
            "Interviewer AI"
        );


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


    } catch (aiError) {

        console.error(
            "Interviewer AI generation failed:",
            aiError
        );

        rawResponse = null;
    }


    /*
    =====================================================
    PARSE AI
    =====================================================
    */

    const parsedAI =
        parseAIResponse(
            rawResponse
        );


    aiReply =
        parsedAI.reply;

    aiNextFocus =
        parsedAI.nextFocus;

    aiOptimizationCompleted =
        parsedAI.optimizationCompleted;


    /*
    =====================================================
    DECIDE NEXT PHASE
    =====================================================
    
    This happens AFTER AI parsing.
    
    Never use nextPhase before it exists.
    =====================================================
    */

    const approachAccepted =
        session.phase ===
            InterviewPhase.UNDERSTANDING &&
        (
            aiNextFocus === "APPROACH" ||
            aiNextFocus === "APPROACH_DEVELOPMENT"
        );


    /*
    The state machine is the authoritative
    phase-transition mechanism.
    */

    let nextPhase =
        decideNextPhase({

            currentPhase:
                session.phase,

            evaluation,

            codeDetected,

            approachAccepted,

            optimizationCompleted
        });


    /*
    If realtime code already caused the
    session to enter CODING, do not move
    it backwards because the current AI
    response did not contain nextFocus.
    */

    if (
        session.phase ===
            InterviewPhase.CODING &&
        nextPhase ===
            InterviewPhase.UNDERSTANDING
    ) {

        nextPhase =
            InterviewPhase.CODING;
    }


    console.log(
        "========== PHASE DECISION =========="
    );

    console.log(
        "Current:",
        session.phase
    );

    console.log(
        "AI nextFocus:",
        aiNextFocus
    );

    console.log(
        "Code detected:",
        codeDetected
    );

    console.log(
        "Evaluation:",
        evaluation
    );

    console.log(
        "Approach accepted:",
        approachAccepted
    );

    console.log(
        "Next:",
        nextPhase
    );

    console.log(
        "===================================="
    );


    /*
    =====================================================
    UPDATE PHASE
    =====================================================
    */

    if (
        nextPhase !== session.phase
    ) {

        console.log(
            `PHASE CHANGE: ${session.phase} -> ${nextPhase}`
        );


        await updateInterviewPhaseRepo(
            sessionId,
            nextPhase
        );


        /*
        Interrupt state belongs to the
        current phase. Reset it when phase
        changes.
        */

        await resetInterruptRepo(
            sessionId
        );
    }


    /*
    =====================================================
    AI REQUEST FAILED / INVALID
    =====================================================
    
    Do NOT crash the interview.
    
    Do NOT return null.
    
    Generate a contextual fallback.
    =====================================================
    */

    if (!aiReply) {

        console.warn(
            "AI response missing. Using contextual fallback."
        );


        aiReply =
            getFallbackReply({

                message,

                phase:
                    nextPhase,

                evaluation,

                interrupt: false,

                interruptReason: null,

                codeAnalysis
            });


        console.log(
            "Fallback reply:",
            aiReply
        );
    }


    /*
    =====================================================
    AI REQUESTED INTERVIEW COMPLETION
    =====================================================
    */

    if (
        aiOptimizationCompleted
    ) {

        console.log(
            "AI marked optimization completed."
        );


        await markOptimizationCompletedRepo(
            sessionId
        );


        const feedback =
            await endInterviewService({

                sessionId,

                userId
            });


        return {

            interviewEnded: true,

            aiReply,

            phase:
                InterviewPhase.FINISHED,

            evaluation,

            codeAnalysis,

            feedback,

            interrupted: false
        };
    }


    /*
    =====================================================
    SAVE AI RESPONSE
    =====================================================
    */

    try {

        await insertInterviewMessageRepo({

            sessionId,

            sender: "ai",

            message:
                aiReply
        });

    } catch (saveError) {

        console.error(
            "Failed to save AI message:",
            saveError
        );
    }


    /*
    =====================================================
    SOCKET
    =====================================================
    */

    try {

        getIO()
            .to(`interview-${sessionId}`)
            .emit(
                "interviewer-message",
                {

                    message:
                        aiReply,

                    phase:
                        nextPhase,

                    evaluation,

                    codeAnalysis,

                    interrupted: false
                }
            );

    } catch (socketError) {

        console.error(
            "Socket emit failed:",
            socketError
        );
    }


    /*
    =====================================================
    RESPONSE
    =====================================================
    */

    const response = {

        aiReply,

        phase:
            nextPhase,

        evaluation,

        codeAnalysis,

        interrupted: false
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


/*
=========================================================
END INTERVIEW
=========================================================
*/

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

        throw new Error(
            "Interview session not found"
        );
    }


    if (
        session.status === "completed" ||
        session.phase ===
            InterviewPhase.FINISHED
    ) {

        const error =
            new Error(
                "INTERVIEW_ALREADY_COMPLETED"
            );

        error.code =
            "INTERVIEW_ALREADY_COMPLETED";

        throw error;
    }


    clearInterviewIdleTimer(
        sessionId
    );


    const conversation =
        await getInterviewMessagesRepo(
            sessionId
        );


    let interviewPackage = {};


    try {

        interviewPackage =
            JSON.parse(
                session.current_question
            );

    } catch (err) {

        console.error(
            "Interview package parse failed:",
            err
        );
    }


    let rawFeedback;


    try {

        rawFeedback =
            await generateInterviewFeedback({

                type:
                    session.type,

                difficulty:
                    session.difficulty,

                conversation,

                expectedConcepts:
                    interviewPackage.expectedConcepts || [],

                expectedComplexity:
                    interviewPackage.expectedComplexity || {},

                interviewGuide:
                    interviewPackage.interviewGuide || {}
            });

    } catch (feedbackError) {

        console.error(
            "Feedback generation failed:",
            feedbackError
        );

        rawFeedback = null;
    }


    let feedback;


    try {

        const cleaned =
            typeof rawFeedback === "string"
                ? rawFeedback
                    .replace(/```json/gi, "")
                    .replace(/```/g, "")
                    .trim()
                : JSON.stringify(
                    rawFeedback
                );


        feedback =
            JSON.parse(
                cleaned
            );

    } catch (err) {

        console.error(
            "Feedback Parse Error:",
            rawFeedback
        );


        feedback = {

            overallScore: 0,

            communicationScore: 0,

            problemSolvingScore: 0,

            optimizationScore: 0,

            strengths: [
                "Feedback could not be generated."
            ],

            weaknesses: [
                "The interview evaluation service did not return valid feedback."
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
            Array.isArray(
                feedback.strengths
            )
                ? feedback.strengths.join("\n")
                : feedback.strengths,

        weaknesses:
            Array.isArray(
                feedback.weaknesses
            )
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


    clearInterviewIdleTimer(
        sessionId
    );


    return feedback;
};


/*
=========================================================
GET INTERVIEW BY ID
=========================================================
*/

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

        throw new Error(
            "Interview session not found"
        );
    }


    if (
        session.status === "completed" ||
        session.phase ===
            InterviewPhase.FINISHED
    ) {

        const error =
            new Error(
                "INTERVIEW_ALREADY_COMPLETED"
            );

        error.code =
            "INTERVIEW_ALREADY_COMPLETED";

        throw error;
    }


    const question =
        JSON.parse(
            session.current_question
        );


    delete question.hiddenTestCases;
    delete question.interviewGuide;
    delete question.expectedConcepts;
    delete question.expectedComplexity;


    return {

        session: {

            id:
                session.id,

            language:
                session.language,

            difficulty:
                session.difficulty,

            phase:
                session.phase,

            status:
                session.status
        },

        firstQuestion:
            question
    };
};


/*
=========================================================
REALTIME CODE UPDATE SERVICE
=========================================================
*/

export const realtimeCodeUpdateService = async ({
    sessionId,
    userId,
    code
}) => {

    try {

        console.log(
            "======== REALTIME SERVICE START ========"
        );


        if (
            typeof code !== "string"
        ) {

            return;
        }
console.log("REALTIME sessionId:", sessionId);
console.log("REALTIME userId:", userId);


        const session =
            await getInterviewSessionRepo({
                sessionId,
                userId
            }
            );
console.log("REALTIME SESSION RESULT:", session ? "FOUND" : "NOT FOUND");

        if (!session) {

            console.warn(
                "Realtime update: session not found",
                sessionId,
                userId
            );

            return;
        }


        if (
            session.phase ===
                InterviewPhase.FINISHED ||
            session.status === "completed"
        ) {

            return;
        }


        resetInterviewIdleTimer(
            sessionId
        );


        const interviewPackage =
            JSON.parse(
                session.current_question
            );


        /*
        Analyze code evolution.
        */

        const codeAnalysis =
            analyzeCodeProgress({

                previousCode:
                    session.last_code || "",

                currentCode:
                    code,

                interviewGuide:
                    interviewPackage.interviewGuide
            });


        console.log(
            "Current phase:",
            session.phase
        );

        console.log(
            "Code analysis:"
        );

        console.dir(
            codeAnalysis,
            {
                depth: null
            }
        );


        /*
        Save helper.
        */

        const saveSnapshot = async () => {

            try {

                await updateCodeSnapshotRepo({

                    sessionId,

                    code
                });

            } catch (err) {

                console.error(
                    "Realtime snapshot failed:",
                    err
                );
            }
        };


        /*
        =====================================================
        NOTHING CHANGED
        =====================================================
        */

        if (
            !codeAnalysis.changed
        ) {

            return;
        }


        /*
        =====================================================
        ALWAYS SAVE THE LATEST CODE
        =====================================================
        
        This is important.
        
        The realtime service should keep
        session.last_code current even when
        no interruption happens.
        */

        await saveSnapshot();


        /*
        =====================================================
        PHASE TRANSITION -> CODING
        =====================================================
        
        Meaningful implementation activity means
        the candidate has started coding.
        
        We allow:
        
        UNDERSTANDING -> CODING
        APPROACH -> CODING
        
        We NEVER move:
        
        CODING -> UNDERSTANDING
        CODING -> APPROACH
        =====================================================
        */

        const meaningfulCodingActivity =
            codeAnalysis.addedLines >= 3 ||
            codeAnalysis.returnAdded === true ||
            codeAnalysis.criticalLogicAdded === true;


        if (
            meaningfulCodingActivity &&
            (
                session.phase ===
                    InterviewPhase.UNDERSTANDING ||
                session.phase ===
                    InterviewPhase.APPROACH
            )
        ) {

            try {

                const updated =
                    await updateInterviewPhaseRepo(
                        sessionId,
                        InterviewPhase.CODING
                    );


                session.phase =
                    updated?.phase ||
                    InterviewPhase.CODING;


                /*
                Phase changed, therefore
                old interrupt state should not
                carry over.
                */

                await resetInterruptRepo(
                    sessionId
                );


                console.log(
                    `REALTIME PHASE CHANGE: ${session.phase} -> CODING`
                );

            } catch (phaseError) {

                console.error(
                    "Realtime phase update failed:",
                    phaseError
                );

                return;
            }
        }


        /*
        =====================================================
        DO NOT INTERRUPT OUTSIDE CODING
        =====================================================
        */

        if (
            session.phase !==
                InterviewPhase.CODING
        ) {

            console.log(
                "Realtime: waiting for CODING phase."
            );

            return;
        }


        /*
        =====================================================
        IGNORE SMALL / INSIGNIFICANT EDITS
        =====================================================
        */

        const significantEdit =
            codeAnalysis.addedLines >= 3 ||
            codeAnalysis.returnAdded === true ||
            codeAnalysis.criticalLogicAdded === true;


        if (!significantEdit) {

            console.log(
                "Realtime: insignificant edit."
            );

            return;
        }


        /*
        =====================================================
        INTERRUPT DECISION
        =====================================================
        
        IMPORTANT:
        
        evaluation is null here intentionally.
        
        Realtime monitoring does NOT execute code.
        It observes the implementation.
        =====================================================
        */

        const currentCodeVersion =
            Number(
                session.code_version || 0
            ) + 1;


        const interrupt =
            shouldInterrupt({

                phase:
                    session.phase,

                evaluation: null,

                interruptionCount:
                    Number(
                        session.interruption_count || 0
                    ),

                codeAnalysis,

                lastInterruptAtVersion:
                    session.last_interrupt_at_version,

                currentCodeVersion
            });


        console.log(
            "Realtime interrupt:",
            interrupt
        );


        /*
        =====================================================
        NO INTERRUPT
        =====================================================
        */

        if (!interrupt) {

            return;
        }


        /*
        =====================================================
        RECORD INTERRUPT
        =====================================================
        */

        const interruptReason =
            getInterruptReason({

                phase:
                    session.phase,

                evaluation: null,

                codeAnalysis
            });

            /*
=====================================================
NON-CODE ACTIVITY
=====================================================

Obvious garbage is deterministic.

Do NOT spend an AI request on it.
*/

if (
    interruptReason === "NON_CODE_ACTIVITY"
) {

    const aiReply =
        getFallbackReply({

            message: "",

            phase:
                session.phase,

            evaluation:
                null,

            interrupt:
                true,

            interruptReason,

            codeAnalysis
        });

    await recordInterruptRepo({

        sessionId,

        codeVersion:
            currentCodeVersion
    });

    try {

        await insertInterviewMessageRepo({

            sessionId,

            sender: "ai",

            message: aiReply
        });

    } catch (saveError) {

        console.error(
            "Garbage interruption save failed:",
            saveError
        );
    }

    try {

        getIO()
            .to(`interview-${sessionId}`)
            .emit(
                "interviewer-message",
                {
                    message: aiReply,

                    phase:
                        session.phase,

                    evaluation:
                        null,

                    codeAnalysis,

                    interrupted:
                        true
                }
            );

    } catch (socketError) {

        console.error(
            "Garbage interruption socket failed:",
            socketError
        );
    }

    console.log(
        "Realtime garbage interruption sent."
    );

    return;
}

        console.log(
            "Realtime interrupt reason:",
            interruptReason
        );


        await recordInterruptRepo({

            sessionId,

            codeVersion:
                currentCodeVersion
        });


        /*
        =====================================================
        LOAD CONVERSATION
        =====================================================
        */

        const conversation =
            await getInterviewMessagesRepo(
                sessionId
            );


        /*
        =====================================================
        ASK INTERVIEWER
        =====================================================
        */

        let rawResponse = null;


        try {

            console.log(
                "Calling interviewer AI for realtime interrupt..."
            );


            rawResponse =
                await generateInterviewerResponse({

                    phase:
                        session.phase,

                    interviewGuide:
                        interviewPackage.interviewGuide,

                    expectedConcepts:
                        interviewPackage.expectedConcepts,

                    conversation,

                    candidateMessage:
                        "",

                    candidateCode:
                        code,

                    evaluation:
                        null,

                    codeAnalysis,

                    interruptReason,

                    interactionType:
                        "CODE_INTERRUPT",

                    optimizationCompleted:
                        session.optimization_completed
                });


            console.log(
                "Realtime AI response:"
            );

            console.dir(
                rawResponse,
                {
                    depth: null
                }
            );


        } catch (aiError) {

            console.error(
                "Realtime interviewer AI failed:",
                aiError
            );
        }


        /*
        =====================================================
        PARSE AI
        =====================================================
        */

        const parsedAI =
            parseAIResponse(
                rawResponse
            );


        let aiReply =
            parsedAI.reply;


        /*
        =====================================================
        REALTIME FALLBACK
        =====================================================
        
        If Gemini fails, the realtime
        interruption STILL happens.
        
        The candidate will not be left
        without an interviewer message.
        =====================================================
        */

        if (!aiReply) {

            aiReply =
                getFallbackReply({

                    message: "",

                    phase:
                        session.phase,

                    evaluation: null,

                    interrupt: true,

                    interruptReason,

                    codeAnalysis
                });
        }


        /*
        =====================================================
        SAVE AI INTERRUPTION
        =====================================================
        */

        try {

            await insertInterviewMessageRepo({

                sessionId,

                sender: "ai",

                message:
                    aiReply
            });

        } catch (saveError) {

            console.error(
                "Realtime AI message save failed:",
                saveError
            );
        }


        /*
        =====================================================
        EMIT INTERRUPTION
        =====================================================
        */

        try {

            getIO()
                .to(`interview-${sessionId}`)
                .emit(
                    "interviewer-message",
                    {

                        message:
                            aiReply,

                        phase:
                            session.phase,

                        evaluation:
                            null,

                        codeAnalysis,

                        interrupted:
                            true
                    }
                );

        } catch (socketError) {

            console.error(
                "Realtime socket emit failed:",
                socketError
            );
        }


        console.log(
            "======== REALTIME SERVICE END ========"
        );


    } catch (err) {

        /*
        CRITICAL:
        
        Realtime monitoring must NEVER
        crash the interview process.
        */

        console.error(
            "REALTIME CODE UPDATE ERROR:"
        );

        console.error(
            err
        );
    }
};


/*
=========================================================
INTERVIEW HISTORY
=========================================================
*/

export const getInterviewHistoryService = async (
    userId
) => {

    const interviews =
        await getInterviewHistoryRepo(
            userId
        );


    return interviews.map(
        (interview) => {

            let question = {};


            try {

                question =
                    JSON.parse(
                        interview.current_question || "{}"
                    );

            } catch (error) {

                console.error(
                    "Failed to parse interview question:",
                    error
                );
            }


            /*
            Never expose internal interviewer data.
            */

            delete question.hiddenTestCases;
            delete question.interviewGuide;
            delete question.expectedConcepts;
            delete question.expectedComplexity;
            delete question.solution;
            delete question.optimal_solution;
            delete question.answer;


            return {

                id:
                    interview.id,

                title:
                    interview.title,

                type:
                    interview.type,

                difficulty:
                    interview.difficulty,

                language:
                    interview.language,

                company:
                    interview.company,

                role:
                    interview.role,

                questionStrategy:
                    interview.question_strategy,

                createdAt:
                    interview.created_at,

                endedAt:
                    interview.ended_at,

                question,

                code:
                    interview.last_code || "",

                report:
                    interview.overall_score === null
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
        }
    );
};
