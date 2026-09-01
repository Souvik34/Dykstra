/* eslint-disable prettier/prettier */

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Brain, Code2, Target, Github, Linkedin } from "lucide-react";
import dp from "../assets/images/dp.jpg";
export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      {
        title: "About Dykstra — DSA Tracking & Interview Preparation",
      },
      {
        name: "description",
        content:
          "Dykstra is a DSA tracker built for focused revision and technical interview preparation. Practice problems, track your progress, revise intelligently, and prepare with AI-powered interviews.",
      },
      {
        property: "og:title",
        content: "About Dykstra",
      },
      {
        property: "og:description",
        content:
          "Learn about Dykstra, a DSA tracker built around focused revision and technical interview preparation.",
      },
      {
        property: "og:url",
        content: "https://dykstra.in/about",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://dykstra.in/about",
      },
    ],
  }),

  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* HERO */}
      <section className="px-6 pb-20 pt-24">
        <div className="mx-auto max-w-4xl text-center">

          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500">
            <Code2 className="h-6 w-6 text-white" />
          </div>

          <p className="mb-4 text-sm font-medium text-blue-400">
            About Dykstra
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Prepare with purpose.
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
              Improve with consistency.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/50 sm:text-lg">
            Dykstra is a developer-focused platform for practicing DSA,
            tracking problem-solving progress, revising intelligently, and
            preparing for technical interviews.
          </p>

        </div>
      </section>


      {/* WHAT IS DYKSTRA */}
      <section className="border-t border-white/[0.07] px-6 py-20">
        <div className="mx-auto max-w-4xl">

          <h2 className="text-2xl font-bold text-white">
            What is Dykstra?
          </h2>

          <div className="mt-5 space-y-4 text-sm leading-7 text-white/50 sm:text-base">

            <p>
              Preparing for technical interviews is more than solving as many
              coding problems as possible. You need to know what you have
              practiced, remember what you learned, and identify the areas
              where you still need improvement.
            </p>

            <p>
              Dykstra brings these parts of interview preparation together in
              one place. It helps developers practice data structures and
              algorithms, keep track of their progress, revisit problems at
              the right time, and prepare through realistic technical
              interviews.
            </p>

            <p>
              The goal is simple: make preparation more structured,
              measurable, and focused.
            </p>

          </div>

        </div>
      </section>


     {/* BUILT BY */}
<section className="border-t border-white/[0.07] px-6 py-20">
  <div className="mx-auto flex max-w-4xl flex-col items-center gap-10 md:flex-row">

    {/* PHOTO */}
    <div className="shrink-0">
      <div className="h-32 w-32 overflow-hidden rounded-full border border-white/[0.1] bg-white/[0.03] sm:h-40 sm:w-40">
        <img
          src={dp}
          alt="Souvik Sural — Creator of Dykstra"
          className="h-full w-full object-cover"
        />
      </div>
    </div>

    {/* CONTENT */}
    <div className="text-center md:text-left">

      <p className="text-sm font-medium text-blue-400">
        Why I built Dykstra
      </p>

      <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
        Souvik Sural
      </h2>

      <p className="mt-4 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
        Like many developers, I've solved a lot of DSA problems only to
        find myself starting from arrays again a few months later.
        The problem wasn't always learning — it was remembering and
        revising what I'd already learned.
      </p>

      <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
        That's why I built Dykstra: to make revision a structured part
        of preparation instead of something we come back to only when
        interviews are around.
      </p>

      <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
        With Dykstra, you can track your DSA progress, get a personalized
        roadmap with AI, revise the problems you've already solved, and
        practice through technical interviews designed to help you improve.
      </p>

      {/* SOCIAL LINKS */}
      <div className="mt-6 flex justify-center gap-5 md:justify-start">

        <a
          href="https://github.com/Souvik34"
          target="_blank"
          rel="noreferrer"
          aria-label="Souvik Sural on GitHub"
          className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
        >
          <Github className="h-5 w-5 text-[#F0F6FC]" />
          GitHub
        </a>

        <a
          href="https://www.linkedin.com/in/souvik-sural/"
          target="_blank"
          rel="noreferrer"
          aria-label="Souvik Sural on LinkedIn"
          className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
        >
          <Linkedin className="h-5 w-5 text-[#0A66C2]" />
          LinkedIn
        </a>

      </div>

    </div>
  </div>
</section>


      {/* PRINCIPLES */}
      <section className="border-t border-white/[0.07] px-6 py-20">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">

            <Target className="h-7 w-7 text-blue-400" />

            <h3 className="mt-5 font-semibold text-white">
              Practice with purpose
            </h3>

            <p className="mt-3 text-sm leading-6 text-white/45">
              Keep track of the problems you solve instead of letting your
              preparation become a collection of random practice sessions.
            </p>

          </div>


          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">

            <Brain className="h-7 w-7 text-violet-400" />

            <h3 className="mt-5 font-semibold text-white">
              Revise intelligently
            </h3>

            <p className="mt-3 text-sm leading-6 text-white/45">
              Revisit problems and topics over time so that concepts become
              something you can recall during an interview, not something you
              solved once and forgot.
            </p>

          </div>


          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">

            <Code2 className="h-7 w-7 text-cyan-400" />

            <h3 className="mt-5 font-semibold text-white">
              Prepare for interviews
            </h3>

            <p className="mt-3 text-sm leading-6 text-white/45">
              Go beyond practice with technical interview sessions designed
              around problem understanding, approach, coding, debugging,
              optimization, and feedback.
            </p>

          </div>

        </div>
      </section>


      {/* CLOSING */}
      <section className="border-t border-white/[0.07] px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">

          <h2 className="text-2xl font-bold text-white">
            Built for developers preparing for what comes next.
          </h2>

          <p className="mt-4 text-sm leading-7 text-white/45">
            Whether you're preparing for your first technical interview or
            sharpening your skills for your next opportunity, Dykstra is built
            to help you prepare consistently and understand where you stand.
          </p>

          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Explore Dykstra
            <ArrowRight className="h-4 w-4" />
          </Link>

        </div>
      </section>

    </main>
  );
}