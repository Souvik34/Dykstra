import { generateAI } from "../ai/aiProvider.js";

export const generateStructuredQuestion =
async ({
    company,
    role,
    difficulty,
    language,
    questionStyle,
    previousQuestions = []
}) => {
  const previousQuestionTitles = previousQuestions.map(q =>
    typeof q === "string" ? q : q.title
);
const interviewTarget = company?.trim()
    ? `Target company: ${company}`
    : `Target company: General software engineering interview`;
const prompt = `
You are an experienced Senior Software Engineering interviewer generating ONE complete coding interview problem for a simulated technical interview.

Your output will be parsed directly by JavaScript using JSON.parse().
Therefore your response MUST be valid JSON.

========================
INTERVIEW TARGET
========================

${interviewTarget}

Role:
${role}

Difficulty:
${difficulty}

Programming Language:
${language}

Question Style:
${questionStyle || "RELEVANT"}

========================
PRIMARY OBJECTIVE
========================

Generate exactly ONE realistic coding interview problem appropriate for:

- the target company, if provided
- the specified role
- the specified difficulty
- the requested programming language
- the requested question style

The problem must be suitable for a live software engineering interview.

The candidate should reasonably be able to:
1. understand the problem
2. clarify requirements
3. explain an approach
4. implement the solution
5. debug it
6. discuss complexity
7. discuss an optimization

The problem should normally be solvable within approximately 30–40 minutes.

Do NOT generate an arbitrary competitive-programming puzzle.

========================
COMPANY RELEVANCE
========================

If no company is provided:

- Do not mention any specific company.
- Do not claim the problem was asked by any company.
- Select a broadly representative software engineering interview problem.
- Prefer common interview topics such as:
  arrays, strings, hashmaps, two pointers, sliding window,
  binary search, linked lists, trees, graphs, heaps,
  greedy, recursion, backtracking, intervals, prefix sums,
  and dynamic programming.
- Consider previous questions to maintain topic diversity.

If a company is provided:

- Use the company's commonly reported interview style and engineering expectations.
- Do not claim that the problem was actually asked by the company unless this is genuinely known.
- Company relevance should influence problem selection, not the factual claims in the problem.

========================
QUESTION STYLE
========================

If Question Style is "PYQ":

- Prefer a problem genuinely reported as appearing in interviews for the specified company.
- Never fabricate a previous-year/company interview question.
- If an exact known question cannot be selected confidently, use a highly similar reported interview-style problem.
- Do not falsely label it as an exact company question.

If Question Style is "RELEVANT":

- Select a problem strongly aligned with the company's commonly reported interview style.
- Prefer interview relevance over random difficulty matching.

If Question Style is "UNSEEN":

- Generate an original problem or a meaningful variation.
- It must still test realistic software engineering reasoning.
- Do not simply rename a famous LeetCode problem.
- Do not make superficial changes to an existing problem.

If Question Style is "MIXED":

- Choose between reported interview problems, highly relevant interview problems, and original problems.
- Prioritize realistic interview value.

If Question Style is missing or unknown:

- Treat it as "RELEVANT".

========================
ROLE RELEVANCE
========================

For SDE-1:

- Focus on implementation, data structures, algorithms, edge cases, and reasoning.
- Avoid unnecessarily advanced competitive programming techniques.
- The problem should realistically fit into approximately 30–40 minutes.

For SDE-2:

- Require stronger reasoning and trade-off discussion.
- Complexity and scalability may be explored more deeply.

For senior roles:

- Prefer problems that allow discussion of trade-offs, scalability, and design decisions.
- Do not artificially increase difficulty merely because the role is senior.

========================
PREVIOUS QUESTIONS
========================

The candidate has already received these questions:

${JSON.stringify(previousQuestionTitles)}

Do NOT select a substantially identical problem.

A repeat includes:

- identical title
- same underlying problem
- renamed version of the same problem
- superficial input/output changes
- trivial constraint changes
- same core interview idea with minor modifications

Prefer a meaningfully different problem family.

Also consider topic diversity.

If previous questions heavily use one category, prefer another relevant category when possible.

Do not force diversity if doing so would make the problem inappropriate for the target company or role.

========================
INTERVIEW REALISM
========================

The problem must allow the interviewer to evaluate:

- problem understanding
- clarification
- approach selection
- communication
- implementation
- debugging
- complexity analysis
- optimization

Avoid:

- obscure mathematical tricks
- puzzle-only questions
- excessive boilerplate
- obscure APIs
- extremely implementation-heavy problems
- problems requiring more than approximately 40 minutes
- ambiguous requirements
- impossible constraints

========================
PROBLEM REQUIREMENTS
========================

Generate:

1. Problem statement
2. Realistic constraints
3. Exactly 2 examples
4. Exactly 3 visible test cases
5. Exactly 5 hidden test cases
6. Starter code
7. Function signature
8. Execution metadata
9. Expected concepts
10. Expected optimal complexity
11. Interview guide

The test cases MUST match the problem statement.

All test cases must be internally consistent.

The expected outputs MUST be correct.

========================
STARTER CODE
========================

starterCode must contain ONLY the function/class skeleton.

It must:

- use the exact function signature
- be valid ${language}
- contain no solution
- contain no algorithm implementation
- contain no main method
- contain no input parsing
- contain no test execution
- contain no print statements
- contain no Scanner
- contain no BufferedReader
- contain no execution wrapper

The candidate will implement only the function.

The backend will generate execution wrappers automatically.

Even though the candidate language is ${language}, return starterCode for:

- java
- cpp
- python
- javascript

Each starter code must represent the same function.

========================
FUNCTION SIGNATURE
========================

functionSignature MUST contain:

- exact function name
- exact return type
- parameters in exact order
- exact parameter names
- exact parameter types

This information will be used by the automated execution system.

========================
EXECUTION METADATA
========================

executionMetadata MUST contain ONLY:

- inputFormat
- outputFormat
- parameterMapping

Do NOT include:

- javaInvoker
- cppInvoker
- pythonInvoker
- javascriptInvoker
- main method
- execution code
- parsing code

The backend generates all wrappers automatically.

inputFormat must describe raw stdin format.

outputFormat must describe raw stdout format.

parameterMapping must list function parameters in exactly the same order as functionSignature.parameters.

========================
TEST CASE FORMAT
========================

Every visibleTestCases[].input and hiddenTestCases[].input MUST contain ONLY raw stdin.

Never include:

- parameter names
- "=" signs
- JSON-style parameter descriptions
- explanatory text
- comments
- markdown
- labels

Example:

If parameters are:

nums (int[])
k (int)

then valid input is:

[1,5,4,2,9,9,9]
3

NOT:

nums = [1,5,4,2,9,9,9]
k = 3

The input must be directly consumable by the generated parser for ${language}.

The parameter order MUST exactly match functionSignature.parameters.

========================
EXAMPLES
========================

Generate exactly 2 examples.

Each example must contain:

- input
- output
- explanation

Examples must use the same input format as the test cases.

The explanation must explain the result without revealing an implementation solution.

========================
VISIBLE TEST CASES
========================

Generate exactly 3 visible test cases.

They should cover basic and representative scenarios.

Do not reveal hidden edge cases unnecessarily.

========================
HIDDEN TEST CASES
========================

Generate exactly 5 hidden test cases.

They should test important edge cases and correctness.

Include cases such as appropriate:

- minimum input
- boundary values
- duplicate values
- empty-like situations when allowed
- large values
- tricky ordering
- equal values
- cases that expose incorrect implementations

Do not include impossible inputs.

========================
EXPECTED CONCEPTS
========================

expectedConcepts must list the important algorithms, data structures, or techniques that a strong candidate might reasonably use.

Do NOT include a full solution.

Do NOT include implementation instructions.

Do NOT include explanations.

========================
EXPECTED COMPLEXITY
========================

expectedComplexity must contain:

- time
- space

These should represent the optimal or intended interview-level complexity.

========================
INTERVIEW GUIDE
========================

interviewGuide MUST contain:

openingQuestion:
- One natural question asking the candidate to explain their understanding or initial thoughts.

approachChecks:
- Exactly 2–3 questions.
- Questions should test reasoning and trade-offs.
- Do not reveal the solution.

codingTriggers:
- An array of objects.
- Each object MUST contain exactly:
  - concept
  - question
- Concepts should correspond to meaningful implementation milestones.
- Questions should allow the interviewer to briefly test whether the candidate understands what they wrote.

optimizationQuestion:
- One question that can be asked after a correct solution.
- It should explore scalability, trade-offs, or an alternative approach.
- Do not directly reveal the optimization.

expectedMilestones:
- A short ordered list of observable interview milestones.
- Do not include solution code.
- Do not expose hidden test cases.

========================
IMPORTANT INTERVIEWER RULE
========================

The interviewGuide is confidential interviewer information.

Do not put the solution, optimal algorithm, or explicit implementation instructions into:

- problem
- examples
- constraints
- starterCode
- test cases

Expected concepts and interview guide are for the interviewer only.

========================
JSON SAFETY REQUIREMENTS
========================

THIS IS CRITICAL.

Your response will be passed directly to JSON.parse().

Return JSON only.

Do NOT use markdown.

Do NOT wrap the JSON in triple backticks.

Do NOT add text before the JSON.

Do NOT add text after the JSON.

Do NOT use comments.

Do NOT use trailing commas.

All property names MUST use double quotes.

All string values MUST use double quotes.

If a string contains a double quote, escape it as \\".

If a string contains a backslash, escape it correctly.

If a string contains a newline, represent it as \\n inside the JSON string.

Do NOT insert literal unescaped newlines inside JSON string values.

Do NOT insert raw control characters inside strings.

Do NOT use JavaScript objects.

Do NOT use single quotes.

Do NOT return undefined or null where a required field is expected.

Ensure the entire response is one valid JSON object.

Before returning the response, internally verify that the JSON would successfully pass JSON.parse().

========================
STRICT OUTPUT SCHEMA
========================

Return exactly this structure:

{
  "title": "",
  "problem": "",
  "constraints": [
    ""
  ],
  "examples": [
    {
      "input": "",
      "output": "",
      "explanation": ""
    },
    {
      "input": "",
      "output": "",
      "explanation": ""
    }
  ],
  "starterCode": {
    "java": "",
    "cpp": "",
    "python": "",
    "javascript": ""
  },
  "functionSignature": {
    "name": "",
    "returnType": "",
    "parameters": [
      {
        "name": "",
        "type": ""
      }
    ]
  },
  "executionMetadata": {
    "inputFormat": "",
    "outputFormat": "",
    "parameterMapping": []
  },
  "visibleTestCases": [
    {
      "input": "",
      "expectedOutput": ""
    },
    {
      "input": "",
      "expectedOutput": ""
    },
    {
      "input": "",
      "expectedOutput": ""
    }
  ],
  "hiddenTestCases": [
    {
      "input": "",
      "expectedOutput": ""
    },
    {
      "input": "",
      "expectedOutput": ""
    },
    {
      "input": "",
      "expectedOutput": ""
    },
    {
      "input": "",
      "expectedOutput": ""
    },
    {
      "input": "",
      "expectedOutput": ""
    }
  ],
  "expectedConcepts": [
    ""
  ],
  "expectedComplexity": {
    "time": "",
    "space": ""
  },
  "interviewGuide": {
    "openingQuestion": "",
    "approachChecks": [
      "",
      "",
      ""
    ],
    "codingTriggers": [
      {
        "concept": "",
        "question": ""
      }
    ],
    "optimizationQuestion": "",
    "expectedMilestones": [
      ""
    ]
  }
}

========================
FINAL VALIDATION
========================

Before responding, verify all of the following:

- Exactly one JSON object.
- Valid JSON syntax.
- Exactly 2 examples.
- Exactly 3 visible test cases.
- Exactly 5 hidden test cases.
- starterCode contains all four languages.
- starterCode contains no main/input/output execution code.
- functionSignature matches starterCode.
- executionMetadata contains only the required three fields.
- parameterMapping matches functionSignature parameter order.
- Test case input matches executionMetadata.
- Expected outputs are correct.
- Problem is solvable within approximately 30–40 minutes.
- No solution is exposed.
- No fabricated company/PYQ claim is made.
- Previous questions are not substantially repeated.
- interviewGuide contains all required fields.
- codingTriggers contains concept/question objects.
- No markdown.
- No comments.
- No trailing commas.
- No unescaped quotes.
- No literal unescaped newlines inside JSON strings.
- The complete response can be passed directly to JSON.parse().

Return ONLY the JSON object.
`;
// const result = await ai.models.generateContent({
//   model: "gemini-3.5-flash",
//   contents: prompt,
//   // contents: "Generate an easy array interview problem in JSON."   
// });
const result = await generateAI(prompt);

console.log("========== QUESTION AI RAW RESPONSE ==========");
console.dir(result, { depth: null });
console.log("==============================================");

if (typeof result !== "string") {
    throw new Error("AI question response is not a string");
}

const extractJSON = (text) => {

    let cleaned = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (
        start === -1 ||
        end === -1 ||
        end <= start
    ) {
        throw new Error(
            "AI question response does not contain JSON"
        );
    }

    return cleaned.substring(start, end + 1);
};

let cleaned = extractJSON(result);

let problem;

try {

    problem = JSON.parse(cleaned);

} catch (parseError) {

    console.error(
        "========== QUESTION JSON PARSE FAILED =========="
    );

    console.error("Parse error:", parseError.message);

    console.error(
        "========== INVALID JSON =========="
    );

    console.error(cleaned);

    console.error(
        "==================================="
    );

    throw new Error(
        `AI generated invalid question JSON: ${parseError.message}`
    );
}

return problem;
}