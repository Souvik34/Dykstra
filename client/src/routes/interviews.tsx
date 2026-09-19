/* eslint-disable prettier/prettier */

import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Play,
  Sparkles,
  Clock3,
} from "lucide-react";
import { toast } from "sonner";

import interviewService from "../services/interviewService";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ScreenLoader } from "@/components/ui/ScreenLoader";

export const Route = createFileRoute("/interviews")({
  component: InterviewsPage,
});

function InterviewsPage() {
  const navigate = useNavigate();

  const [difficulty, setDifficulty] = useState("Medium");
  const [language, setLanguage] = useState("java");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("SDE-1");

  const [questionStrategy, setQuestionStrategy] =
    useState("RELEVANT");

  const [loading, setLoading] = useState(false);

  /*
   * ============================================================
   * INTERVIEW LIMIT STATE
   * ============================================================
   */

  const [interviewsRemaining, setInterviewsRemaining] =
    useState(3);

  const [interviewLimit, setInterviewLimit] =
    useState(3);

  const [resetAt, setResetAt] =
    useState<string | null>(null);

  const [limitLoading, setLimitLoading] =
    useState(true);

  const [timeRemaining, setTimeRemaining] =
    useState("");


  /*
   * ============================================================
   * FETCH INTERVIEW LIMIT
   * ============================================================
   */

  const fetchInterviewLimit = async () => {
    try {
      setLimitLoading(true);

      const response =
        await interviewService.getInterviewLimit();

      const data = response?.data;

      if (!data) {
        return;
      }

      setInterviewLimit(
        Number(data.limit ?? 3)
      );

      setInterviewsRemaining(
        Number(data.remaining ?? 0)
      );

      setResetAt(
        data.resetsAt ?? null
      );

    } catch (error) {

      console.error(
        "Failed to fetch interview limit:",
        error
      );

    } finally {

      setLimitLoading(false);
    }
  };


  /*
   * ============================================================
   * LOAD LIMIT WHEN PAGE OPENS
   * ============================================================
   */

  useEffect(() => {
    fetchInterviewLimit();
  }, []);


  /*
   * ============================================================
   * COUNTDOWN TIMER
   * ============================================================
   */

useEffect(() => {

  if (!resetAt) {
    setTimeRemaining("");
    return;
  }

  const updateTimer = () => {

    const now =
      Date.now();

    const resetTime =
      new Date(resetAt).getTime();

    const difference =
      resetTime - now;


    /*
     * Window expired.
     *
     * Ask backend for the fresh
     * quota instead of guessing.
     */
    if (difference <= 0) {

      setTimeRemaining("");

      fetchInterviewLimit();

      return;
    }


    const totalSeconds =
      Math.floor(
        difference / 1000
      );


    const days =
      Math.floor(
        totalSeconds / 86400
      );


    const hours =
      Math.floor(
        (totalSeconds % 86400) / 3600
      );


    const minutes =
      Math.floor(
        (totalSeconds % 3600) / 60
      );


    const seconds =
      totalSeconds % 60;


    setTimeRemaining(
      `${days}d ${hours}h ${minutes}m ${seconds}s`
    );
  };


  updateTimer();


  const interval =
    setInterval(
      updateTimer,
      1000
    );


  return () => {
    clearInterval(interval);
  };

}, [resetAt]);
  /*
   * ============================================================
   * START INTERVIEW
   * ============================================================
   */

  const startInterview = async () => {

    if (loading) {
      return;
    }

    /*
     * Prevent the request if the UI already knows
     * that the user has no interviews left.
     */

    if (interviewsRemaining <= 0) {

      toast.error(
  "You've reached your 7-day interview limit."
);

      return;
    }


    setLoading(true);

    try {

      const res =
        await interviewService.startAISession({

          type: "DSA",

          difficulty,

          language,

          company:
            company.trim() || null,

          role,

          questionStrategy,

        });


      const sessionId =
        res.data.session.id;


      /*
       * The middleware consumed one slot.
       *
       * Update the UI immediately so the user
       * doesn't have to refresh the page.
       */

      setInterviewsRemaining(
        (previous) =>
          Math.max(previous - 1, 0)
      );


      /*
       * If this was the final interview,
       * fetch the authoritative reset time
       * from the backend.
       */

      if (interviewsRemaining - 1 <= 0) {

        await fetchInterviewLimit();

      } else {

        /*
         * We don't have to refetch immediately
         * because the backend already returned
         * successfully and one slot was consumed.
         */

        setResetAt(
          res?.data?.data?.resetsAt ??
          resetAt
        );
      }


      toast.success(
        "Interview Started!"
      );


      navigate({
        to: `/workspace/${sessionId}`,
      });

    } catch (err: any) {

      console.error(
        "START INTERVIEW ERROR:",
        err
      );


      /*
       * Backend is the final authority.
       *
       * If another tab/device consumed the
       * final slot, this catches it.
       */

      if (
        err?.response?.status === 429
      ) {

        const limitData =
          err?.response?.data;


        setInterviewsRemaining(0);

        if (limitData?.resetsAt) {

          setResetAt(
            limitData.resetsAt
          );
        }


        toast.error(
          limitData?.message ||
            "You've reached your daily interview limit."
        );

        return;
      }


      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to start interview."
      );

    } finally {

      setLoading(false);
    }
  };


  /*
   * ============================================================
   * LOADING SCREEN
   * ============================================================
   */

  if (loading) {

    return (
      <ScreenLoader
        text="Preparing interview"
      />
    );
  }


  /*
   * ============================================================
   * LIMIT REACHED
   * ============================================================
   */

  const limitReached =
    interviewsRemaining <= 0;


  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030507] text-white">

      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-40
          -top-40
          h-[520px]
          w-[520px]
          rounded-full
          bg-blue-600/[0.12]
          blur-[140px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-40
          top-[5%]
          h-[500px]
          w-[500px]
          rounded-full
          bg-violet-600/[0.10]
          blur-[150px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          bottom-[-250px]
          left-[25%]
          h-[500px]
          w-[500px]
          rounded-full
          bg-blue-500/[0.07]
          blur-[150px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          bottom-[10%]
          right-[10%]
          h-[250px]
          w-[250px]
          rounded-full
          bg-violet-500/[0.06]
          blur-[100px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-40
        "
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(59,130,246,0.07), transparent 35%)",
        }}
      />


      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-7 md:px-8">


        {/* ===================================================
            TOP BAR
        ==================================================== */}

        <div className="mb-10 flex items-center justify-between">

          <Button
            variant="ghost"
            onClick={() =>
              navigate({
                to: "/dashboard",
              })
            }
            className="
              gap-2
              text-muted-foreground
              transition-all
              hover:bg-white/[0.05]
              hover:text-white
            "
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Dashboard
          </Button>


          <div
            className="
              flex
              items-center
              gap-2
              rounded-full
              border
              border-blue-400/10
              bg-white/[0.035]
              px-3
              py-1.5
              text-xs
              text-muted-foreground
              backdrop-blur-md
            "
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />

            AI Interview
          </div>

        </div>


        {/* ===================================================
            HEADER
        ==================================================== */}

        <div className="mb-9 text-center">

          <div
            className="
              mx-auto
              mb-5
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              border
              border-blue-400/15
              bg-blue-500/[0.08]
              shadow-[0_0_40px_rgba(59,130,246,0.08)]
            "
          >
            <Sparkles className="h-6 w-6 text-blue-400" />
          </div>


          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            AI Mock Interview
          </h1>


          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
            Configure your interview and practice like you're sitting
            across from a real interviewer.
          </p>

        </div>


        {/* ===================================================
            MAIN CARD
        ==================================================== */}

        <Card
          className="
            mx-auto
            w-full
            max-w-2xl
            overflow-hidden
            border-white/[0.08]
            bg-[#080a0f]/80
            shadow-[0_25px_80px_rgba(0,0,0,0.45)]
            backdrop-blur-2xl
          "
        >

          {/* =================================================
              CARD HEADER
          ================================================== */}

          <CardHeader
            className="
              border-b
              border-white/[0.07]
              bg-white/[0.015]
              px-6
              py-5
            "
          >

            <div className="flex items-center justify-between gap-4">

              <div>

                <h2 className="text-base font-semibold">
                  Interview configuration
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  Customize the interview based on your target role.
                </p>

              </div>


              {/* =================================================
                  DAILY LIMIT BADGE
              ================================================== */}

              {!limitLoading && (
                <div
                  className={`
                    shrink-0
                    rounded-xl
                    border
                    px-3
                    py-2
                    text-right
                    transition-all
                    ${
                      limitReached
                        ? "border-red-400/15 bg-red-500/[0.05]"
                        : "border-blue-400/10 bg-blue-500/[0.04]"
                    }
                  `}
                >

                  <div className="flex items-center gap-2">

                    <div
                      className={`
                        h-1.5
                        w-1.5
                        rounded-full
                        ${
                          limitReached
                            ? "bg-red-400"
                            : "bg-blue-400"
                        }
                      `}
                    />

                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                     7-Day Limit
                    </span>

                  </div>


                  <p
                    className={`
                      mt-0.5
                      text-sm
                      font-semibold
                      ${
                        limitReached
                          ? "text-red-300"
                          : "text-white"
                      }
                    `}
                  >
                    {interviewsRemaining} / {interviewLimit}
                  </p>

                </div>
              )}

            </div>

          </CardHeader>


          <CardContent className="space-y-6 px-6 py-6">


            {/* =================================================
                LIMIT INFORMATION
            ================================================== */}

            {!limitLoading && (

              <div
                className={`
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  border
                  px-4
                  py-3
                  ${
                    limitReached
                      ? "border-red-400/10 bg-red-500/[0.035]"
                      : "border-white/[0.06] bg-white/[0.02]"
                  }
                `}
              >

                <div className="flex items-center gap-3">

                  <div
                    className={`
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-lg
                      ${
                        limitReached
                          ? "bg-red-500/[0.08]"
                          : "bg-blue-500/[0.08]"
                      }
                    `}
                  >
                    <Clock3
                      className={`
                        h-4
                        w-4
                        ${
                          limitReached
                            ? "text-red-400"
                            : "text-blue-400"
                        }
                      `}
                    />
                  </div>


                  <div>

                    <p className="text-xs font-medium">

                      {limitReached
                        ? "7-day interview limit reached"
                        : `${interviewsRemaining} interview${
  interviewsRemaining === 1
    ? ""
    : "s"
} remaining`
                      }

                    </p>


                    <p className="mt-0.5 text-[11px] text-muted-foreground">

                      {limitReached
                        ? "Your next interview becomes available when the oldest interview leaves the 7-day window."
                        : "You can start another AI interview whenever you're ready."
                      }

                    </p>

                  </div>

                </div>


                {/* =================================================
                    RESET TIMER
                ================================================== */}

                {limitReached &&
                  timeRemaining && (

                    <div className="text-right">

                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Available in
                      </p>

                      <p className="mt-0.5 text-sm font-semibold text-white">
                        {timeRemaining}
                      </p>

                    </div>

                  )}

              </div>

            )}


            {/* =================================================
                DIFFICULTY + LANGUAGE
            ================================================== */}

            <div className="grid gap-5 md:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Difficulty
                </label>

                <Select
                  value={difficulty}
                  onValueChange={setDifficulty}
                >

                  <SelectTrigger
                    className="
                      border-white/[0.08]
                      bg-white/[0.025]
                      transition
                      hover:bg-white/[0.04]
                    "
                  >
                    <SelectValue />
                  </SelectTrigger>


                  <SelectContent>

                    <SelectItem value="Easy">
                      Easy
                    </SelectItem>

                    <SelectItem value="Medium">
                      Medium
                    </SelectItem>

                    <SelectItem value="Hard">
                      Hard
                    </SelectItem>

                  </SelectContent>

                </Select>

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium">
                  Programming Language
                </label>

                <Select
                  value={language}
                  onValueChange={setLanguage}
                >

                  <SelectTrigger
                    className="
                      border-white/[0.08]
                      bg-white/[0.025]
                      transition
                      hover:bg-white/[0.04]
                    "
                  >
                    <SelectValue />
                  </SelectTrigger>


                  <SelectContent>

                    <SelectItem value="java">
                      Java
                    </SelectItem>

                    <SelectItem value="cpp">
                      C++
                    </SelectItem>

                  

                  </SelectContent>

                </Select>

              </div>

            </div>


            {/* =================================================
                COMPANY
            ================================================== */}

            <div>

              <label className="mb-2 block text-sm font-medium">
                Target Company
              </label>


              <input
                value={company}
                onChange={(e) =>
                  setCompany(e.target.value)
                }
                placeholder="e.g. Microsoft, Google, Amazon"
                className="
                  h-10
                  w-full
                  rounded-md
                  border
                  border-white/[0.08]
                  bg-white/[0.025]
                  px-3
                  text-sm
                  outline-none
                  transition
                  placeholder:text-muted-foreground/50
                  focus:border-blue-500/50
                  focus:ring-1
                  focus:ring-blue-500/20
                "
              />


              <p className="mt-2 text-xs text-muted-foreground">
                Optional. Leave blank for a general software engineering
                interview.
              </p>

            </div>


            {/* =================================================
                ROLE
            ================================================== */}

            <div>

              <label className="mb-2 block text-sm font-medium">
                Target Role
              </label>


              <Select
                value={role}
                onValueChange={setRole}
              >

                <SelectTrigger
                  className="
                    border-white/[0.08]
                    bg-white/[0.025]
                  "
                >
                  <SelectValue />
                </SelectTrigger>


                <SelectContent>

                  <SelectItem value="SDE-1">
                    SDE-1
                  </SelectItem>

                  <SelectItem value="SDE-2">
                    SDE-2
                  </SelectItem>

                  <SelectItem value="Senior Software Engineer">
                    Senior Software Engineer
                  </SelectItem>

                </SelectContent>

              </Select>

            </div>


            {/* =================================================
                QUESTION STRATEGY
            ================================================== */}

            <div>

              <label className="mb-2 block text-sm font-medium">
                Question Type
              </label>


              <Select
                value={questionStrategy}
                onValueChange={setQuestionStrategy}
              >

                <SelectTrigger
                  className="
                    border-white/[0.08]
                    bg-white/[0.025]
                  "
                >
                  <SelectValue />
                </SelectTrigger>


                <SelectContent>

                  <SelectItem value="RELEVANT">
                    Interview Relevant
                  </SelectItem>

                  <SelectItem value="PYQ">
                    Reported Interview Question
                  </SelectItem>

                  <SelectItem value="UNSEEN">
                    Unseen Question
                  </SelectItem>

                  <SelectItem value="MIXED">
                    Mixed
                  </SelectItem>

                </SelectContent>

              </Select>

            </div>


            {/* =================================================
                AI INFORMATION
            ================================================== */}

            <div
              className="
                rounded-xl
                border
                border-blue-400/10
                bg-blue-500/[0.035]
                p-4
              "
            >

              <div className="flex gap-3">

                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />

                <div>

                  <p className="text-sm font-medium">
                    AI-powered interview
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Your interviewer will adapt follow-up questions
                    based on your approach, code, and responses.
                  </p>

                </div>

              </div>

            </div>


            {/* =================================================
                START BUTTON
            ================================================== */}

            <Button
              className={`
                h-11
                w-full
                border-0
                font-medium
                shadow-lg
                transition-all

                ${
                  limitReached
                    ? "cursor-not-allowed bg-white/[0.06] text-muted-foreground shadow-none hover:bg-white/[0.06]"
                    : "bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 shadow-blue-950/30 hover:scale-[1.005] hover:from-blue-500 hover:via-blue-400 hover:to-violet-500"
                }
              `}
              size="lg"
              onClick={startInterview}
              disabled={
                loading ||
                limitLoading ||
                limitReached
              }
            >

              {limitReached ? (

                <>
                  <Clock3 className="mr-2 h-4 w-4" />

                  Limit Reached

                </>

              ) : (

                <>
                  <Play className="mr-2 h-4 w-4" />

                  Start Interview

                </>

              )}

            </Button>


            {/* =================================================
                DAILY LIMIT FOOTER
            ================================================== */}

            <div className="text-center">

              {limitReached && timeRemaining ? (

              <p className="text-[11px] text-muted-foreground">

  Your next{" "}
  <span className="font-medium text-white/70">
    interview
  </span>{" "}
  will be available in{" "}

  <span className="font-medium text-blue-400">
    {timeRemaining}
  </span>

  .

</p>

              ) : (

                <p className="text-[11px] text-muted-foreground">

                Free users can start up to{" "}
<span className="font-medium text-white/70">
  {interviewLimit} AI interviews
</span>{" "}
within a rolling 7-day window.
                </p>

              )}

            </div>

          </CardContent>

        </Card>

      </div>

    </div>
  );
}