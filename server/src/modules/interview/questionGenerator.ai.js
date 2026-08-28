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
You are an experienced technical interviewer conducting a realistic software engineering interview.

Your task is to select/generate ONE interview problem that is highly appropriate for the candidate's target company, role, difficulty, and requested question style.

You must NOT generate an arbitrary generic coding problem.

INTERVIEW TARGET


${interviewTarget}

Role:
${role}

Difficulty:
${difficulty}

Programming Language:
${language}

Question Style:
${questionStyle}



COMPANY RELEVANCE RULES
If no company is provided:

- Do NOT assume or mention any specific company.
- Do NOT claim the question was asked by any company.
- Select a broadly representative software engineering interview problem.
- Prefer balanced coverage across common interview topics.
- Prioritize arrays, strings, hashmaps, two pointers, sliding window,
  binary search, linked lists, trees, graphs, heaps, greedy and DP
  according to difficulty.
- Avoid repeatedly selecting the same topic for the same candidate.
- The problem should resemble a realistic SDE interview rather than
  competitive programming.


  IF COMPANY IS PROVIDED:
The company name is a signal for interview style and problem selection.

Use your knowledge of the company's commonly reported interview patterns, engineering expectations, and problem-solving style.

Do NOT claim that the generated question was actually asked by the company unless there is strong basis for that.

If Question Style is "PYQ":
- Prefer a problem that is genuinely reported as having appeared in interviews for the specified company.
- Do not fabricate a "previous year question".
- If an exact known question cannot be confidently selected, use a highly similar reported interview problem and do not label it as an exact PYQ.

If Question Style is "RELEVANT":
- Select a problem strongly aligned with the company's commonly reported interview style and the specified role.
- Prefer interview-relevant problems over random difficulty-matched problems.

If Question Style is "UNSEEN":
- Generate an original problem or meaningful variation.
- It must still resemble the type of reasoning expected in the specified company's interview.
- Do not simply rename or slightly modify a famous LeetCode problem.

If Question Style is "MIXED":
- Choose between reported interview problems, highly relevant interview problems, and original problems.
- Prioritize realistic interview value over randomness.

If Question Style is missing or unknown:
- Default to RELEVANT.

ROLE RELEVANCE

The problem must be appropriate for the specified role.

For SDE-1:
- Focus primarily on implementation, data structures, algorithms, edge cases, and reasoning.
- Avoid unnecessarily advanced competitive-programming techniques.
- The problem should realistically fit within approximately 30–40 minutes.

For SDE-2:
- Require stronger reasoning and trade-off discussion.
- Complexity, scalability, design choices, and optimization may be explored more deeply.

For senior roles:
- Prefer problems where the interviewer can evaluate trade-offs, scalability, and deeper reasoning.

Do not artificially increase difficulty merely because the role is senior.

PREVIOUS QUESTIONS

The following questions have already been used by this candidate:

${JSON.stringify(previousQuestionTitles)}

You MUST NOT select or generate a question that is substantially the same as any previous question.

A repeat includes:
- identical title
- same underlying problem with a renamed title
- same problem with superficial input/output changes
- same core problem with trivial constraint changes

If a previous problem uses the same underlying interview idea, choose a meaningfully different problem.

Prefer a different problem family when possible.
PYQ ACCURACY

Never fabricate a question as an actual company interview question.

If the requested company and question style require a previous interview question, only use one when there is sufficient confidence that the problem has been reported for that company.

The backend may provide verified company-question data. When such data is provided, prefer it over your own knowledge.

If verified data is unavailable, generate a relevant interview-style problem but do not claim that it was previously asked.
TOPIC DIVERSITY

Avoid repeatedly selecting the same problem category for the same candidate.

When previous questions show heavy exposure to one category, prefer another relevant category when appropriate.

Possible categories include:

arrays, strings, hashmap, sliding window, two pointers, stack, queue,
binary search, linked list, trees, BST, graphs, heap, recursion,
backtracking, greedy, dynamic programming, intervals, prefix sums.

Do not force diversity if the company's interview style strongly favors a particular category.

INTERVIEW REALISM

The problem must work well in a live interview.

The interviewer should be able to evaluate:

- problem understanding
- clarification ability
- approach selection
- communication
- implementation
- debugging
- complexity analysis
- optimization

Avoid:
- obscure mathematical tricks
- extremely implementation-heavy problems
- problems requiring excessive boilerplate
- problems dependent on obscure APIs
- problems that are primarily puzzle-solving
- problems requiring more than approximately 40 minutes

Generate the COMPLETE interview package.

The interviewer will conduct the interview using this package.

Generate:

1. Problem statement.

2. Constraints.

3. Examples.

4. Visible testcases.

5. Hidden testcases.

6. Starter code.

7. Expected concepts.

8. Expected optimal complexity.

9. Interview guide.

IMPORTANT:
starterCode only contains function/class skeleton.
Never generate Main class.
starterCode must not contain execution code.

executionMetadata must contain only:
- inputFormat
- outputFormat
- parameterMapping

Do NOT generate javaInvoker.
Do NOT generate cppInvoker.
Do NOT generate pythonInvoker.

The backend will generate Judge0 wrapper code automatically.
The interview guide should help the AI know:

- how to start
- when to challenge the candidate
- what concepts should appear
- what optimization should eventually be discussed

Do NOT include any solution.
Do NOT reveal hints.
Return STRICT JSON only.

Difficulty:
${difficulty}

Programming Language:
${language}

IMPORTANT RULES:
- Return STRICT JSON ONLY
- Do NOT use markdown
- Do NOT add explanation outside JSON
- Problem should resemble LeetCode/FAANG interview style
- Keep examples simple and valid
- Testcases must match problem statement
- starterCode must be valid ${language} code
- Use meaningful variable names
- Input/output format must stay consistent


JSON FORMAT:

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
    }
  ],

  "hiddenTestCases": [
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
      ""
    ],

    "codingTriggers": [
    {
        "concept": "tracking distinct elements",
        "question": "How are you ensuring that the current window contains only distinct values?"
    },
    {
        "concept": "maintaining current sum",
        "question": "How are you maintaining the sum efficiently as the window moves?"
    }
],

    "optimizationQuestion": "",
    "expectedMilestones":[
        "Candidate identifies the correct data structure",
        "Candidate initializes required variables",
        "Candidate implements the main algorithm",
        "Candidate handles edge cases",
        "Candidate returns the final answer"
    ]
  }
}
REQUIREMENTS:

1. Generate:

- 2 examples
- 3 visibleTestCases
- 5 hiddenTestCases

expectedConcepts:
- list the important algorithms or data structures the interviewer expects

expectedComplexity:
- include the optimal time and space complexity

interviewGuide:
- openingQuestion should encourage the candidate to explain the problem in their own words
- approachChecks should contain 2–3 probing questions
- codingTriggers should list important concepts that, if detected in the candidate's code, should trigger interviewer questions
- optimizationQuestion should be asked only after a correct solution

2. Constraints should be realistic.

3.starterCode should:
- contain only the class/function skeleton
- NOT contain main function
- NOT contain input reading logic
- NOT contain test execution logic
- include the exact function signature

functionSignature rules:
- Generate the exact function name
- Generate return type
- Generate parameter names and types
- This will be used by an automated execution wrapper

executionMetadata rules:
- inputFormat describes stdin format
- outputFormat describes expected stdout format
- parameterMapping contains function parameters in order
- executionMetadata MUST NOT contain invoker fields
- Do NOT generate javaInvoker
- Do NOT generate cppInvoker
- Do NOT generate pythonInvoker
- The backend generates all execution wrapper code automatically
- match ${language}


4. Avoid impossible or ambiguous problems.

5. Problem categories may include:
- arrays
- strings
- hashmap
- sliding window
- stack
- queue
- binary search
- recursion
- trees
- graphs
- dynamic programming

6. Keep problem interview-oriented and solvable within 30-40 minutes.


IMPORTANT TESTCASE FORMAT:

All visibleTestCases and hiddenTestCases input values MUST be raw stdin only.

NEVER include parameter names, "=" signs, or descriptive text.

For example, if parameters are:
nums (int[])
k (int)

WRONG:
nums = [1,5,4,2,9,9,9]
k = 3

CORRECT:
[1,5,4,2,9,9,9]
3

The testcase input MUST be directly consumable by the generated language parser.
The order MUST exactly match functionSignature.parameters.

IMPORTANT:

Return ONLY this JSON structure.

Do NOT include:
- optimal_solution
- solution
- code explanation
- answer
- problem_id
- category
- difficulty
- description

If any of these are returned, the response is INVALID.

Return ONLY the JSON described above.
The field names MUST exactly match:

title
problem
constraints
examples
starterCode
visibleTestCases
hiddenTestCases
expectedConcepts
expectedComplexity
interviewGuide

interviewGuide MUST contain:

openingQuestion
approachChecks
codingTriggers
optimizationQuestion
expectedMilestones

codingTriggers MUST be an array of objects like:

{
  "concept": "",
  "question": ""
}

IMPORTANT FOR EXECUTION:

The candidate will only write the function implementation.

The platform will automatically generate:
- main method (Java/C++)
- input parsing
- function invocation
- output printing

Therefore never include:
- public static void main()
- Scanner
- BufferedReader
- input parsing
- print statements
Return ONLY valid JSON.
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

let cleaned = result;

if (typeof cleaned === "string") {
    cleaned = cleaned
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
}

const start = cleaned.indexOf("{");
const end = cleaned.lastIndexOf("}");

if (start === -1 || end === -1 || end <= start) {
    console.error("QUESTION AI DID NOT RETURN JSON");
    console.error(cleaned);
    throw new Error(
        "AI question response does not contain JSON"
    );
}

cleaned = cleaned.substring(start, end + 1);

let problem;

try {

    problem = JSON.parse(cleaned);

} catch (parseError) {

    console.error("========== QUESTION JSON PARSE FAILED ==========");
    console.error(parseError);
    console.error("CLEANED QUESTION RESPONSE:");
    console.error(cleaned);
    console.error("================================================");

    throw parseError;
}

return problem;
}