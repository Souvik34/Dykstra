import { executeCode } from "./codeExecution.js";


export const evaluateCode = async ({
    language,
    code,
    testCases = [],
    problem
}) => {

    console.log("=================================");
    console.log("EVALUATE CODE CALLED");
    console.log("LANGUAGE =", language);
    console.log("CODE LENGTH =", code?.length);
    console.log("TEST CASE COUNT =", testCases.length);
    console.log("=================================");

    const results = [];

    let passed = 0;


    for (const [index, tc] of testCases.entries()) {

        const {
            input,
            expectedOutput
        } = tc;

        console.log("=================================");
        console.log(`TEST CASE ${index + 1}`);
        console.log("INPUT =", input);
        console.log("EXPECTED =", expectedOutput);
        console.log("=================================");


        try {

            const execution =
                await executeCode({

                    language,
                    code,
                    input,
                    problem

                });


            console.log(
                `Execution Result - Test Case ${index + 1}`
            );

            console.dir(
                execution,
                { depth: null }
            );


            /*
             * Compilation / runtime error
             */

            if (execution.error) {

                results.push({

                    input,

                    expectedOutput,

                    userOutput:
                        execution.output ?? null,

                    isCorrect:
                        false,

                    error:
                        execution.error,

                    status:
                        execution.status

                });

                continue;
            }


            /*
             * Normalize output.
             */

            const normalize = (str) =>
                String(str ?? "")
                    .trim()
                    .replace(/\r/g, "")
                    .replace(/\s+/g, " ");


            const userOutput =
                normalize(
                    execution.output
                );


            const expected =
                normalize(
                    expectedOutput
                );


            const isCorrect =
                userOutput === expected;


            console.log(
                "USER OUTPUT =",
                userOutput
            );

            console.log(
                "EXPECTED OUTPUT =",
                expected
            );

            console.log(
                "CORRECT =",
                isCorrect
            );


            if (isCorrect) {
                passed++;
            }


            results.push({

                input,

                expectedOutput,

                userOutput,

                isCorrect,

                error:
                    null,

                status:
                    execution.status

            });

        } catch (error) {

            console.error(
                `Test Case ${index + 1} execution failed:`,
                error
            );


            results.push({

                input,

                expectedOutput,

                userOutput:
                    null,

                isCorrect:
                    false,

                error:
                    error.message,

                status:
                    "Execution Error"

            });
        }
    }


    return {

        total:
            testCases.length,

        passed,

        failed:
            testCases.length - passed,

        successRate:
            testCases.length
                ? (passed / testCases.length) * 100
                : 0,

        results,

        executionMode:
            "piston"

    };
};