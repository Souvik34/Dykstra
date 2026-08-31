/**
 * ---------------------------------------------------------
 * AI Interview Code Detector
 *
 * Detects interview progress instead of simply
 * detecting whether user pasted code.
 *
 * This module NEVER knows the problem.
 * It only analyses code evolution.
 * ---------------------------------------------------------
 */

export const SubmissionType = {
    TEXT: "TEXT",
    CODE: "CODE",
    SUBMISSION: "SUBMISSION"
};

const CODE_KEYWORDS = [

    "class ",
    "public ",
    "private ",
    "protected ",
    "return",
    "function",
    "def ",
    "while",
    "for",
    "if",
    "switch",
    "case",
    "new ",
    "{",
    "};",
    "=>",
    "System.out",
    "console.log"

];



export const detectSubmissionType = (
    message = "",
    isSubmission = false
) => {

    if (isSubmission) {
        return SubmissionType.SUBMISSION;
    }

    const score =
        CODE_KEYWORDS.reduce(
            (count, keyword) =>
                message.includes(keyword)
                    ? count + 1
                    : count,
            0
        );

    return score >= 3
        ? SubmissionType.CODE
        : SubmissionType.TEXT;
};

export const analyzeCodeProgress = ({
    previousCode = "",
    currentCode = "",
    interviewGuide = {}
}) => {

    const previousLines =
        previousCode
            .split("\n")
            .map(x => x.trim())
            .filter(Boolean);

    const currentLines =
        currentCode
            .split("\n")
            .map(x => x.trim())
            .filter(Boolean);

    const addedLines =
        currentLines.filter(
            line => !previousLines.includes(line)
        );

    /*
    =====================================================
    CODE / GARBAGE CLASSIFICATION
    =====================================================
    */

    const javaKeywords = [
        "class",
        "public",
        "private",
        "protected",
        "static",
        "final",
        "void",
        "int",
        "long",
        "double",
        "float",
        "boolean",
        "char",
        "new",
        "return",
        "if",
        "else",
        "for",
        "while",
        "do",
        "switch",
        "case",
        "break",
        "continue",
        "try",
        "catch",
        "throw",
        "throws",
        "import",
        "package",
        "extends",
        "implements",
        "this",
        "null",
        "true",
        "false"
    ];

    const codePatterns = [
        /[{}()[\];]/,
        /\b(int|long|double|float|boolean|char|String)\b/,
        /\b(if|else|for|while|switch|case|return|new)\b/,
        /[=!<>+\-*/%]=?/,
        /\w+\s*\(/,
        /\w+\s*\[/,
        /\w+\s*=\s*[^=]/,
        /^\s*(\/\/|\/\*|\*)/,
    ];

    const garbagePatterns = [
        /^[a-zA-Z]{1,20}$/,
        /^(.)\1{3,}$/,
        /^(asdf|qwer|zxcv|hjkl|jkl|aaaa|bbbb|test)+$/i,
        /\b(hello bro|random|nonsense|blah blah)\b/i
    ];

    const isCodeLike = (line) => {

        if (!line) {
            return false;
        }

        if (
            codePatterns.some(
                pattern => pattern.test(line)
            )
        ) {
            return true;
        }

        const words =
            line
                .split(/\s+/)
                .map(word =>
                    word
                        .replace(/[^a-zA-Z]/g, "")
                        .toLowerCase()
                )
                .filter(Boolean);

        return words.some(
            word =>
                javaKeywords.includes(word)
        );
    };

    const looksLikeGarbage = (line) => {

        if (!line) {
            return false;
        }

        /*
        Obvious repeated/random keyboard patterns.
        */

        if (
            garbagePatterns.some(
                pattern => pattern.test(line)
            )
        ) {
            return true;
        }

        /*
        A line containing normal programming
        syntax is NOT garbage.
        */

        if (isCodeLike(line)) {
            return false;
        }

        /*
        If the line is mostly alphabetic natural/random
        text and has no programming structure, flag it.
        */

 

        return false;
    };

    const garbageLines =
        addedLines.filter(
            line => looksLikeGarbage(line)
        );

    /*
    Don't classify the entire edit as garbage
    if the candidate added legitimate code alongside
    some text.
    */

const garbageDetected =
    garbageLines.length >= 2 &&
    garbageLines.length >=
        Math.ceil(addedLines.length * 0.5);

    /*
    =====================================================
    EXISTING ANALYSIS
    =====================================================
    */

    const completion =
        Math.min(
            100,
            Math.round(
                (currentLines.length / 40) * 100
            )
        );

    let matchedTrigger = null;
    let criticalLogicAdded = false;

    const triggers =
        interviewGuide.codingTriggers || [];

    for (const trigger of triggers) {

        const lower =
            trigger.concept.toLowerCase();

        const matched =
            addedLines.find(
                line =>
                    line
                        .toLowerCase()
                        .includes(lower)
            );

        if (matched) {

            matchedTrigger =
                trigger.concept;

            criticalLogicAdded =
                true;

            break;
        }
    }

    const edgeCaseAdded =
        addedLines.some(
            line =>
                line.includes("null") ||
                line.includes("length==0") ||
                line.includes("isEmpty") ||
                line.includes("size()==0")
        );

    const returnAdded =
        addedLines.some(
            line =>
                /\breturn\b/.test(line)
        );

    return {

        changed:
            addedLines.length > 0,

        addedLines:
            addedLines.length,

        completion,

        triggerMatched:
            matchedTrigger,

        criticalLogicAdded,

        edgeCaseAdded,

        returnAdded,

        garbageDetected,

        garbageLines,

        snapshot:
            currentCode
    };
};