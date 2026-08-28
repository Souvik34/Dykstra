import axios from "axios";

import { prepareCode } from "../../services/runners/index.js";


const PISTON_URL =
  "http://localhost:2000/api/v2/execute";


const languageMap = {

  java: {
    language: "java",
    version: "15.0.2",
    filename: "Main.java"
  },

  cpp: {
    language: "c++",
    version: "10.2.0",
    filename: "main.cpp"
  }

};


export const executeCode = async ({
  language,
  code,
  input,
  problem
}) => {

  try {

    const runtime =
      languageMap[language];


    if (!runtime) {

      throw new Error(
        `Unsupported language: ${language}`
      );
    }


    /*
     * Prepare the complete executable program.
     *
     * Java:
     *   user Solution
     *   + parsers
     *   + serializers
     *   + Main
     *
     * C++:
     *   user Solution
     *   + parsers
     *   + serializers
     *   + main
     */

    const preparedCode =
      prepareCode({
        language,
        code,
        problem
      });


    const stdin =
      input == null
        ? ""
        : String(input);


    console.log(
      `Executing ${language} using Piston`
    );


    const response =
      await axios.post(

        PISTON_URL,

        {
          language:
            runtime.language,

          version:
            runtime.version,

          files: [
            {
              name:
                runtime.filename,

              content:
                preparedCode
            }
          ],

          stdin

        },

        {
          headers: {
            "Content-Type":
              "application/json"
          },

          /*
           * Piston itself has execution limits.
           * This is only the HTTP request timeout.
           */

          timeout: 30000
        }

      );


    const data =
      response.data;


    const compile =
      data.compile || null;


    const run =
      data.run || null;


    /*
     * Compilation failed.
     */

    if (
      compile &&
      (
        compile.code !== 0 ||
        compile.signal ||
        compile.stderr ||
        compile.message
      )
    ) {

      return {

        output:
          null,

        error:
          compile.stderr ||
          compile.output ||
          compile.message ||
          "Compilation failed",

        status:
          "Compilation Error",

        raw:
          data

      };

    }


    /*
     * Runtime failed.
     */

    if (
      run &&
      (
        run.code !== 0 ||
        run.signal
      )
    ) {

      return {

        output:
          run.stdout || null,

        error:
          run.stderr ||
          run.output ||
          run.message ||
          run.signal ||
          "Runtime Error",

        status:
          run.signal === "SIGKILL"
            ? "Time Limit Exceeded"
            : "Runtime Error",

        raw:
          data

      };

    }


    /*
     * Successful execution.
     */

    return {

      output:
        run?.stdout || "",

      error:
        null,

      status:
        "Accepted",

      raw:
        data

    };


  } catch (err) {

    console.error(
      "Piston Error:"
    );


    if (err.response) {

      console.error(
        "Status:",
        err.response.status
      );

      console.error(
        "Data:",
        err.response.data
      );

    } else {

      console.error(err);

    }


    throw new Error(
      "Code execution failed"
    );

  }

};