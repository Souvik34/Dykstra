/* eslint-disable prettier/prettier */

import { useState, useEffect, useRef} from "react";
import { Link } from "@tanstack/react-router";
import BuyMeCoffee from "./BuyMeCoffee";
import {
  ArrowRight,
  ChevronDown,
  Code2,
  Sparkles,
  Brain,
  TrendingUp,
  RotateCcw,
  Video,
  Target,
  Github,
  Linkedin,
  Flame,
  GitBranch,
  Database,
  TimerReset,
  Check,
  Play,
  // Users,
  Activity,
  BarChart3,
  Trophy,
  Zap,
} from "lucide-react";

import { Users } from "lucide-react";
import { AboutLinkPreview } from "@/components/ui/about-link-preview";
import dp from "../../assets/images/dp.jpg";
import banner from "@/assets/images/Banner.png";
import img1 from "@/assets/images/img1.png";
import img2 from "@/assets/images/img2.png";
import img3 from "@/assets/images/img3.png";
import img4 from "@/assets/images/img4.png";
import img5 from "@/assets/images/img5.png";
import img6 from "@/assets/images/img6.png";

import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";



const DSA_VISUALIZER_IMAGE = img6;
const LEETCODE_SCREEN = img1;

const features = [
  {
    eyebrow: "INTELLIGENCE",
    title: "Know what to work on next.",
    description:
      "Dykstra studies your solved problems, weak areas, revision history and progress to help you focus on the work that matters most.",
    icon: Brain,
    image: img2,
    align: "left" as const,
  },
  {
    eyebrow: "REVISION",
    title: "Remember what you worked for.",
    description:
      "Dykstra keeps your solved problems alive with intelligent spaced revision, while forceful revision lets you revisit anything whenever you need it.",
    icon: RotateCcw,
    image: img3,
    align: "right" as const,
  },
  {
    eyebrow: "INTERVIEWS",
    title: "Practice the interview. Not just the problem.",
    description:
      "Talk through your approach, write code, handle follow-ups and receive structured feedback from an AI interviewer.",
    icon: Video,
    image: img4,
    align: "left" as const,
  },
  {
    eyebrow: "READINESS",
    title: "See how prepared you really are.",
    description:
      "Your progress becomes a picture of interview readiness instead of a collection of disconnected numbers.",
    icon: Target,
    image: img5,
    align: "right" as const,
  },
];

const faqs = [
  {
    question: "What is Dykstra?",
    answer:
      "Dykstra is a single workspace for DSA practice, intelligent revision, algorithm visualization, LeetCode progress, interview practice and preparation tracking.",
  },
  {
    question: "Is Dykstra only for DSA practice?",
    answer:
      "No. DSA practice is the foundation, but Dykstra connects problem solving, visualization, revision and interview preparation into one workflow.",
  },
  {
    question: "How does intelligent revision work?",
    answer:
      "Dykstra uses your solving activity and revision history to determine what needs attention, so revision becomes continuous instead of something you do only before an interview.",
  },
  {
    question: "What is spaced revision?",
    answer:
      "Spaced revision schedules previously solved problems at increasing intervals, helping you revisit concepts instead of repeatedly solving the same problems randomly.",
  },
  {
    question: "What is forced revision?",
    answer:
      "Forced revision brings problems back when they need immediate attention, helping you revisit weak or forgotten concepts instead of waiting for the next scheduled revision.",
  },
  {
    question: "Can I visualize algorithms?",
    answer:
      "Yes. Dykstra includes an interactive DSA visualizer so algorithms can be understood through execution rather than only through static code.",
  },
  {
    question: "Can I connect my LeetCode progress?",
    answer:
      "Yes. Dykstra can bring your LeetCode activity into the same preparation workflow, making it easier to connect solved problems with revision and readiness.",
  },
  {
    question: "Can I practice technical interviews?",
    answer:
      "Yes. Dykstra includes an AI interview experience designed around problem understanding, approach, coding, debugging, optimization and feedback.",
  },
  {
    question: "Is Dykstra free to use?",
    answer: "Yes! It's free.",
  },
];

/* =========================================================
   SMALL REVEAL
========================================================= */

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(5px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{
        duration: 0.75,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <Reveal>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">
          {eyebrow}
        </p>
      </Reveal>

      <Reveal delay={0.06}>
        <h2 className="mt-3 text-4xl font-black tracking-[-0.045em] sm:text-5xl lg:text-6xl">
          {title}
        </h2>
      </Reveal>

      <Reveal delay={0.12}>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">
          {description}
        </p>
      </Reveal>
    </div>
  );
}

/* =========================================================
   LANDING PAGE
========================================================= */

export default function LandingPage() {
  
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const { scrollYProgress } = useScroll();
const [stats, setStats] = useState<{
  users: number;
  revisions: number;
  interviews: number;
} | null>(null);

useEffect(() => {
  fetch("https://api.dykstra.in/api/public/stats")
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        setStats(data.data);
      }
    })
    .catch((err) => {
      console.error("Failed to load public stats:", err);
    });
}, []);



  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -70]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.16], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.18], [1, 0.97]);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#030408] text-white">
      {/* ===================================================
          GLOBAL BACKGROUND
      ==================================================== */}

      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20 overflow-hidden"
      >
        <motion.div
          animate={{ x: [0, 35, 0], y: [0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-[15%] -top-[15%] h-[650px] w-[650px] rounded-full bg-blue-600/[0.07] blur-[150px]"
        />

        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 25, 0] }}
          transition={{ duration: 21, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-[18%] top-[18%] h-[700px] w-[700px] rounded-full bg-violet-600/[0.06] blur-[160px]"
        />

        <div className="absolute bottom-[5%] left-[25%] h-[450px] w-[450px] rounded-full bg-cyan-500/[0.03] blur-[140px]" />

        <div className="absolute inset-0 opacity-[0.018] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:56px_56px]" />
      </div>

      {/* ===================================================
          HERO
      ==================================================== */}

      <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
        <motion.div
          style={{ y: heroY, scale: heroScale }}
          className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, scale: 1.025, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{
              delay: 0.35,
              duration: 2.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative mt-[-10px] h-[850px] w-full max-w-[1550px]"
          >
            <motion.img
              src={banner}
              alt=""
              initial={{ opacity: 0, scale: 1.025 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.45,
                duration: 2.5,
                ease: "easeInOut",
              }}
              className="absolute inset-0 h-full w-full object-contain object-top"
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan-500/[0.018] via-transparent to-violet-500/[0.035] mix-blend-screen" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#030408]/92 via-[#030408]/42 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-[12%] bg-gradient-to-r from-[#030408]/60 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-[12%] bg-gradient-to-l from-[#030408]/60 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[220px] bg-gradient-to-t from-[#030408]/92 via-[#030408]/42 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_15%,rgba(3,4,8,.08)_55%,rgba(3,4,8,.42)_100%)]" />

            <motion.div
              initial={{ x: "-130%", opacity: 0 }}
              animate={{ x: "130%", opacity: [0, 0.35, 0] }}
              transition={{
                delay: 4,
                duration: 8,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 10,
              }}
              className="pointer-events-none absolute inset-y-0 left-0 w-[22%] rotate-[8deg] bg-gradient-to-r from-transparent via-white/[0.025] to-transparent blur-3xl"
            />
          </motion.div>
        </motion.div>

        <div className="pointer-events-none absolute inset-0 bg-[#030408]/[0.7]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(3,4,8,.02)_0%,rgba(3,4,8,.12)_55%,rgba(3,4,8,.34)_100%)]" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 mx-auto max-w-5xl px-6 pb-10 pt-16 text-center"
        >
          <Reveal>
            <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-[#05070c]/[0.65] px-4 py-2 shadow-[0_10px_40px_rgba(0,0,0,.25)] backdrop-blur-xl">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 shadow-[0_0_20px_rgba(59,130,246,.35)]">
                <Code2 className="h-3.5 w-3.5 text-white" />
              </span>
              <span className="text-sm font-semibold tracking-tight">Dykstra</span>
            </div>
          </Reveal>

          <motion.h1
            initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              duration: 1.15,
              delay: 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-[46px] font-black leading-[0.98] tracking-[-0.055em] drop-shadow-[0_8px_35px_rgba(0,0,0,.45)] sm:text-[66px] md:text-[82px] lg:text-[100px]"
          >
            One place to
            <br />
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent [background-size:200%_100%] animate-[gradientShift_6s_ease-in-out_infinite]">
              become interview ready.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              duration: 0.9,
              delay: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mx-auto mt-8 max-w-2xl text-[16px] leading-7 text-white/75 drop-shadow-[0_4px_18px_rgba(0,0,0,.6)] sm:text-lg"
          >
            Practice DSA, visualize algorithms, revise intelligently, connect
            your LeetCode progress and simulate technical interviews.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.9,
              delay: 1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              to="/signup"
              className="group relative flex h-12 items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 px-6 text-sm font-bold text-white shadow-[0_15px_45px_rgba(37,99,235,.30)] transition-all duration-300 hover:scale-[1.025] hover:shadow-[0_20px_65px_rgba(59,130,246,.40)]"
            >
              <span className="absolute inset-y-0 -left-16 w-12 rotate-12 bg-white/20 blur-md transition-transform duration-700 group-hover:translate-x-[400px]" />
              <span className="relative">Start Preparing</span>
              <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              to="/login"
              className="flex h-12 items-center justify-center rounded-xl border border-white/[0.14] bg-[#05070c]/[0.55] px-6 text-sm font-semibold text-white/90 shadow-[0_10px_35px_rgba(0,0,0,.20)] backdrop-blur-xl transition-all duration-300 hover:border-white/[0.22] hover:bg-white/[0.08] hover:text-white"
            >
              Sign in
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.25, duration: 0.8 }}
            className="mt-16 flex items-center justify-center gap-2 text-xs font-medium text-white drop-shadow-[0_3px_15px_rgba(0,0,0,.6)]"
          >
            <Sparkles className="h-3.5 w-3.5 text-violet-300" />
            Built for developers who want to prepare with purpose.
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-white/35"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#030408] to-transparent" />
      </section>

      {/* ===================================================
          CORE SYSTEM / METRICS
      ==================================================== */}
<section className="relative overflow-hidden px-6 py-28 sm:py-36">
  <div className="mx-auto max-w-6xl">

    {/* =====================================================
        HEADER
    ====================================================== */}
    <Reveal>
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
          THE SYSTEM
        </div>

        <h2 className="mt-6 text-4xl font-black leading-[1.02] tracking-[-0.045em] sm:text-5xl">
          Your preparation,
          <span className="block bg-gradient-to-r from-cyan-300 via-white to-violet-400 bg-clip-text text-transparent">
            connected.
          </span>
        </h2>

        <p className="mt-5 max-w-xl text-base leading-7 text-white/50 sm:text-lg">
          Practice is only the beginning. Dykstra connects the problems
          you solve, the concepts you revisit, the interviews you face,
          and the areas that still need work.
        </p>
      </div>
    </Reveal>

    {/* =====================================================
        BENTO
    ====================================================== */}
    <div className="mt-14 grid auto-rows-[190px] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

      {/* ===================================================
          01 — PRACTICE MAP
      ==================================================== */}
      <Reveal className="md:col-span-2 md:row-span-2">
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ duration: 0.25 }}
          className="
            group relative h-full overflow-hidden rounded-[28px]
            border border-white/[0.08] bg-[#07090d] p-6
            transition-all duration-300
            hover:border-cyan-400/[0.18]
            hover:shadow-[0_25px_80px_rgba(34,211,238,.06)]
          "
        >
          <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-cyan-400/[0.045] blur-[120px]" />

          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.05]">
                    <GitBranch className="h-4 w-4 text-cyan-300/80" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-white/80">
                      Practice Map
                    </p>
                    <p className="text-[10px] text-white/25">
                      Think beyond individual problems
                    </p>
                  </div>
                </div>

                <p className="mt-5 max-w-sm text-sm leading-6 text-white/40">
                  Arrays lead to hashing. Hashing leads to graphs.
                  Graphs lead to interviews. Your preparation starts
                  becoming a system instead of a list.
                </p>
              </div>

              <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.18em] text-white/20">
                DSA
              </span>
            </div>
          </div>

          {/* Graph */}
          <div className="absolute inset-x-5 bottom-3 top-[145px]">
            <svg
              viewBox="0 0 500 245"
              className="h-full w-full overflow-visible"
            >
              {/* Connections */}
              <motion.path
                d="M65 175 L155 105 L260 145 L370 75"
                fill="none"
                stroke="rgba(34,211,238,.18)"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />

              <motion.path
                d="M155 105 L220 45 L370 75"
                fill="none"
                stroke="rgba(34,211,238,.11)"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.25,
                  duration: 1,
                  ease: "easeOut",
                }}
              />

              <motion.path
                d="M260 145 L330 200 L370 75"
                fill="none"
                stroke="rgba(34,211,238,.09)"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.45,
                  duration: 1,
                  ease: "easeOut",
                }}
              />

              {/* Secondary faint connections */}
              <motion.path
                d="M65 175 L260 145"
                fill="none"
                stroke="rgba(255,255,255,.035)"
                strokeWidth="1"
                strokeDasharray="3 5"
              />

              {/* Nodes */}
              {[
                {
                  x: 65,
                  y: 175,
                  label: "Arrays",
                  main: false,
                },
                {
                  x: 155,
                  y: 105,
                  label: "Hashing",
                  main: false,
                },
                {
                  x: 220,
                  y: 45,
                  label: "BFS",
                  main: false,
                },
                {
                  x: 260,
                  y: 145,
                  label: "Graphs",
                  main: false,
                },
                {
                  x: 330,
                  y: 200,
                  label: "Trees",
                  main: false,
                },
                {
                  x: 370,
                  y: 75,
                  label: "Interview",
                  main: true,
                },
              ].map((node, index) => (
                <g key={node.label}>
                  {/* glow */}
                  {node.main && (
                    <motion.circle
                      cx={node.x}
                      cy={node.y}
                      r="18"
                      fill="rgba(34,211,238,.04)"
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8 }}
                    />
                  )}

                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r={node.main ? 7 : 5}
                    fill={
                      node.main
                        ? "rgba(34,211,238,.75)"
                        : "rgba(34,211,238,.25)"
                    }
                    initial={{
                      opacity: 0,
                      scale: 0,
                    }}
                    whileInView={{
                      opacity: 1,
                      scale: 1,
                    }}
                    viewport={{ once: true }}
                    transition={{
                      delay: 0.25 + index * 0.1,
                      duration: 0.35,
                    }}
                  />

                  <text
                    x={node.x}
                    y={node.y + 23}
                    textAnchor="middle"
                    fill={
                      node.main
                        ? "rgba(255,255,255,.42)"
                        : "rgba(255,255,255,.23)"
                    }
                    fontSize="7"
                    fontWeight="600"
                  >
                    {node.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </motion.div>
      </Reveal>

      {/* ===================================================
          02 — REVISION ENGINE
      ==================================================== */}
      <Reveal delay={0.05} className="md:col-span-2">
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ duration: 0.25 }}
          className="
            group relative h-full overflow-hidden rounded-[28px]
            border border-white/[0.08] bg-[#07090d] p-6
            transition-all duration-300
            hover:border-violet-400/[0.18]
          "
        >
          <div className="pointer-events-none absolute -bottom-40 -right-32 h-80 w-80 rounded-full bg-violet-500/[0.045] blur-[110px]" />

          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/10 bg-violet-400/[0.05]">
                  <RotateCcw className="h-4 w-4 text-violet-300/80" />
                </div>

                <div>
                  <p className="text-sm font-bold text-white/80">
                    Revision Engine
                  </p>
                  <p className="text-[10px] text-white/25">
                    Don't let solved problems disappear
                  </p>
                </div>
              </div>

              <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-violet-300/30">
                MEMORY
              </span>
            </div>

            <div className="relative mt-auto h-[95px] overflow-hidden">

              {/* Memory stream */}
              <motion.div
                initial={{ x: -120, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.9,
                  ease: "easeOut",
                }}
                className="absolute left-0 top-[38px] flex items-center gap-3"
              >
                <div className="flex h-10 w-16 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025]">
                  <Code2 className="h-4 w-4 text-white/25" />
                </div>

                <div className="h-px w-10 bg-gradient-to-r from-white/10 to-violet-400/30" />

                <div className="flex h-10 w-16 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/[0.04]">
                  <span className="text-[9px] font-bold text-violet-300/55">
                    RECALL
                  </span>
                </div>

                <div className="h-px w-10 bg-gradient-to-r from-violet-400/30 to-violet-400/60" />

                <div className="relative flex h-10 w-16 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-400/[0.08]">
                  <motion.span
                    animate={{
                      opacity: [0.4, 1, 0.4],
                      scale: [0.95, 1.05, 0.95],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="text-[9px] font-black tracking-wide text-violet-200/70"
                  >
                    RETAIN
                  </motion.span>

                  <motion.div
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.15, 0, 0.15],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                    className="absolute inset-0 rounded-xl border border-violet-300/30"
                  />
                </div>
              </motion.div>

              {/* Interval labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
                {[
                  ["1d", "return"],
                  ["2d", "recheck"],
                  ["4d", "reinforce"],
                  ["8d", "recall"],
                  ["16d", "retain"],
                  ["30d", "keep"],
                ].map(([day, label], index) => (
                  <motion.div
                    key={day}
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{ once: true }}
                    transition={{
                      delay: 0.2 + index * 0.08,
                      duration: 0.3,
                    }}
                    className="text-center"
                  >
                    <p className="text-[9px] font-bold text-white/35">
                      {day}
                    </p>
                    <p className="mt-0.5 text-[7px] text-white/15">
                      {label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </Reveal>

      {/* ===================================================
          03 — LEETCODE
      ==================================================== */}
      <Reveal delay={0.1}>
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ duration: 0.25 }}
          className="
            group relative h-full overflow-hidden rounded-[28px]
            border border-white/[0.08] bg-[#07090d] p-6
            transition-all duration-300
            hover:border-emerald-400/[0.18]
          "
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <img
                src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/leetcode.png"
                alt="LeetCode"
                className="h-7 w-7 object-contain"
              />

              <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-emerald-300/40">
                SYNC
              </span>
            </div>

            <h3 className="mt-5 text-lg font-black text-white/80">
              Keep your history.
            </h3>

            <p className="mt-2 text-xs leading-5 text-white/35">
              Your existing LeetCode activity doesn't have to live
              separately from the rest of your preparation.
            </p>

            {/* Heatmap */}
            <div className="mt-5 grid grid-cols-[repeat(13,minmax(0,1fr))] gap-[3px]">
              {Array.from({ length: 65 }).map((_, index) => {
                const level = (index * 7 + index % 4) % 5;

                return (
                  <motion.span
                    key={index}
                    initial={{
                      opacity: 0,
                      scale: 0.4,
                    }}
                    whileInView={{
                      opacity: 1,
                      scale: 1,
                    }}
                    viewport={{ once: true }}
                    transition={{
                      delay: Math.min(index * 0.008, 0.5),
                      duration: 0.2,
                    }}
                    className="aspect-square rounded-[2px]"
                    style={{
                      background:
                        level === 0
                          ? "rgba(255,255,255,.04)"
                          : `rgba(34,197,94,${0.12 + level * 0.13})`,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </motion.div>
      </Reveal>

      {/* ===================================================
          04 — AI INTERVIEW
      ==================================================== */}
      <Reveal delay={0.14}>
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ duration: 0.25 }}
          className="
            group relative h-full overflow-hidden rounded-[28px]
            border border-white/[0.08] bg-[#07090d] p-6
            transition-all duration-300
            hover:border-blue-400/[0.18]
          "
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-400/10 bg-blue-400/[0.05]">
                <Video className="h-4 w-4 text-blue-300/80" />
              </div>

              <span className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.15em] text-white/20">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400/70" />
                LIVE
              </span>
            </div>

            <h3 className="mt-5 text-lg font-black text-white/80">
              Interview room.
            </h3>

            <p className="mt-2 text-xs leading-5 text-white/35">
              Practice the conversation, not just the solution.
            </p>

            <div className="mt-5 space-y-2">
              <motion.div
                initial={{
                  opacity: 0,
                  x: -12,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.15,
                  duration: 0.35,
                }}
                className="w-[84%] rounded-xl rounded-bl-sm border border-white/[0.06] bg-white/[0.025] px-3 py-2"
              >
                <p className="text-[8px] leading-4 text-white/30">
                  Walk me through your approach.
                </p>
              </motion.div>

              <motion.div
                initial={{
                  opacity: 0,
                  x: 12,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.3,
                  duration: 0.35,
                }}
                className="ml-auto w-[72%] rounded-xl rounded-br-sm border border-blue-400/[0.08] bg-blue-400/[0.035] px-3 py-2"
              >
                <p className="text-[8px] leading-4 text-blue-200/40">
                  I'd start by looking at the constraints...
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </Reveal>

      {/* ===================================================
          05 — READINESS
      ==================================================== */}
      <Reveal delay={0.18}>
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ duration: 0.25 }}
          className="
            group relative h-full overflow-hidden rounded-[28px]
            border border-white/[0.08] bg-[#07090d] p-6
            transition-all duration-300
            hover:border-emerald-400/[0.18]
          "
        >
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-52 w-52 rounded-full bg-emerald-400/[0.04] blur-[90px]" />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-400/[0.05]">
                <Target className="h-4 w-4 text-emerald-300/80" />
              </div>

              <Sparkles className="h-4 w-4 text-white/15" />
            </div>

            <h3 className="mt-5 text-lg font-black text-white/80">
              Readiness, not guesses.
            </h3>

            <p className="mt-2 text-xs leading-5 text-white/35">
              See which parts of your preparation are developing
              and which still need attention.
            </p>

            <div className="relative mt-3 h-[76px]">
              <svg
                viewBox="0 0 220 80"
                className="h-full w-full"
              >
                <polygon
                  points="110,7 185,31 157,72 63,72 35,31"
                  fill="rgba(52,211,153,.02)"
                  stroke="rgba(52,211,153,.10)"
                  strokeWidth="1"
                />

                <polygon
                  points="110,21 158,36 142,59 78,59 62,36"
                  fill="none"
                  stroke="rgba(52,211,153,.10)"
                  strokeWidth="1"
                />

                <motion.polygon
                  points="110,14 171,34 145,64 82,58 57,35"
                  fill="rgba(52,211,153,.06)"
                  stroke="rgba(52,211,153,.45)"
                  strokeWidth="1.5"
                  initial={{
                    opacity: 0,
                    scale: 0.65,
                  }}
                  whileInView={{
                    opacity: 1,
                    scale: 1,
                  }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.7,
                    ease: "easeOut",
                  }}
                />

                {[
                  [110, 14],
                  [171, 34],
                  [145, 64],
                  [82, 58],
                  [57, 35],
                ].map(([x, y], index) => (
                  <motion.circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="2"
                    fill="rgba(110,231,183,.7)"
                    initial={{
                      opacity: 0,
                    }}
                    whileInView={{
                      opacity: 1,
                    }}
                    viewport={{ once: true }}
                    transition={{
                      delay: 0.5 + index * 0.08,
                    }}
                  />
                ))}
              </svg>
            </div>
          </div>
        </motion.div>
      </Reveal>

      {/* ===================================================
          06 — FOCUS MODE
      ==================================================== */}
      <Reveal delay={0.22}>
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ duration: 0.25 }}
          className="
            group relative h-full overflow-hidden rounded-[28px]
            border border-white/[0.08] bg-[#07090d] p-6
            transition-all duration-300
            hover:border-white/[0.16]
          "
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025]">
                <TimerReset className="h-4 w-4 text-white/50" />
              </div>

              <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-white/15">
                FOCUS
              </span>
            </div>

            <h3 className="mt-5 text-lg font-black text-white/80">
              Make time count.
            </h3>

            <p className="mt-2 text-xs leading-5 text-white/35">
              Track the effort behind the problem, not just the final answer.
            </p>

            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="font-mono text-2xl font-bold tracking-[-0.04em] text-white/65">
                  24:18
                </p>

                <p className="mt-1 text-[8px] uppercase tracking-[0.14em] text-white/20">
                  Focus session
                </p>
              </div>

              <div className="flex h-9 items-end gap-1">
                {[18, 26, 20, 34, 25, 42, 31].map(
                  (height, index) => (
                    <motion.div
                      key={index}
                      initial={{
                        height: 0,
                      }}
                      whileInView={{
                        height,
                      }}
                      viewport={{ once: true }}
                      transition={{
                        delay: index * 0.06,
                        duration: 0.35,
                        ease: "easeOut",
                      }}
                      className="w-1 rounded-full bg-white/[0.16]"
                    />
                  ),
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </Reveal>

    </div>
  </div>
</section>



      {/* ===================================================
          DASHBOARD
      ==================================================== */}

      <section className="relative px-6 pb-28 sm:pb-36">
        <SectionHeading
          eyebrow="One system"
          title={
            <>
              Your preparation,
              <span className="text-white/40"> in one picture.</span>
            </>
          }
          description="Your dashboard should tell you more than how many problems you solved."
        />

        <div className="relative mx-auto mt-14 max-w-6xl">
          <ScreenshotFrame src={img1} alt="Dykstra dashboard" />

          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            {[
              ["Practice", "What you solved"],
              ["Revision", "What needs attention"],
              ["Interviews", "How you perform"],
              ["Readiness", "Where you stand"],
            ].map(([title, text], index) => (
              <Reveal key={title} delay={index * 0.05}>
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-4">
                  <p className="text-xs font-bold text-white/80">{title}</p>
                  <p className="mt-1 text-[11px] text-white/40">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================
          DSA VISUALIZER — REAL IMG6
      ==================================================== */}

      <section className="relative overflow-hidden border-y border-white/[0.06] px-6 py-28 sm:py-36">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.05] blur-[160px]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[0.82fr_1.18fr]">
          <Reveal>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/[0.04] px-3 py-1.5 text-[10px] font-black tracking-[0.2em] text-cyan-300">
                <GitBranch className="h-3.5 w-3.5" />
                DSA VISUALIZER
              </div>

              <h2 className="mt-6 text-4xl font-black leading-[1.03] tracking-[-0.04em] sm:text-5xl">
                Understand the algorithm
                <span className="block text-white/40">while it runs.</span>
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-white/60 sm:text-lg">
                Dykstra turns algorithms into something you can follow. See
                nodes, edges, pointers and state changes instead of staring at
                static code.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  ["Graph algorithms", "BFS · DFS · Dijkstra"],
                  ["Step-by-step", "Follow execution state by state"],
                  ["Visual feedback", "See what the code is doing"],
                ].map(([title, text]) => (
                  <motion.div
                    key={title}
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/[0.07]">
                      <Check className="h-4 w-4 text-cyan-300" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white/80">
                        {title}
                      </p>
                      <p className="text-xs text-white/35">{text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <VisualizerShowcase src={DSA_VISUALIZER_IMAGE} />
          </Reveal>
        </div>
      </section>

{/* =====================================================
    PRODUCT METRICS
====================================================== */}
<section className="relative overflow-hidden px-6 py-24 sm:py-32">
  <div className="mx-auto max-w-6xl">

    <Reveal>
      <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
            THE NUMBERS
          </div>

          <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
            Built for real preparation.
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/35">
            A look at how Dykstra is being used across practice,
            revision, and interview preparation.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/20">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400/70" />
          Live data
        </div>
      </div>
    </Reveal>

    <div className="grid grid-cols-1 overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#07090d] sm:grid-cols-3">

      {/* USERS */}
      <Reveal>
        <motion.div
          whileHover={{ backgroundColor: "rgba(255,255,255,0.018)" }}
          className="group relative min-h-[210px] overflow-hidden border-b border-white/[0.07] p-7 transition-colors sm:border-b-0 sm:border-r"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-400/[0.035] blur-[80px]" />

          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.04]">
                <Users className="h-4 w-4 text-cyan-300/70" />
              </div>

              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/15">
                USERS
              </span>
            </div>

            <div className="mt-12">
              <p className="text-4xl font-black tracking-[-0.05em] text-white/85">
                {stats?.users ?? "—"}
              </p>

              <p className="mt-2 text-xs text-white/30">
                people using Dykstra
              </p>
            </div>
          </div>
        </motion.div>
      </Reveal>

      {/* REVISIONS */}
      <Reveal delay={0.05}>
        <motion.div
          whileHover={{ backgroundColor: "rgba(255,255,255,0.018)" }}
          className="group relative min-h-[210px] overflow-hidden border-b border-white/[0.07] p-7 transition-colors sm:border-b-0 sm:border-r"
        >
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-48 w-48 rounded-full bg-violet-400/[0.035] blur-[80px]" />

          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/10 bg-violet-400/[0.04]">
                <RotateCcw className="h-4 w-4 text-violet-300/70" />
              </div>

              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/15">
                REVISIONS
              </span>
            </div>

            <div className="mt-12">
              <p className="text-4xl font-black tracking-[-0.05em] text-white/85">
                {stats?.revisions ?? "—"}
              </p>

              <p className="mt-2 text-xs text-white/30">
                revision cycles completed
              </p>
            </div>
          </div>
        </motion.div>
      </Reveal>

      {/* AI INTERVIEWS */}
      <Reveal delay={0.1}>
        <motion.div
          whileHover={{ backgroundColor: "rgba(255,255,255,0.018)" }}
          className="group relative min-h-[210px] overflow-hidden p-7 transition-colors"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-400/[0.035] blur-[80px]" />

          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-400/10 bg-blue-400/[0.04]">
                <Video className="h-4 w-4 text-blue-300/70" />
              </div>

              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/15">
                AI INTERVIEWS
              </span>
            </div>

            <div className="mt-12">
              <p className="text-4xl font-black tracking-[-0.05em] text-white/85">
                {stats?.interviews ?? "—"}
              </p>

              <p className="mt-2 text-xs text-white/30">
                interview sessions completed
              </p>
            </div>
          </div>
        </motion.div>
      </Reveal>

    </div>

    <Reveal delay={0.15}>
      <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.015] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/25">
            Website activity
          </span>
        </div>

        <span className="text-xs text-white/25">
          Powered by Vercel Analytics
        </span>
      </div>
    </Reveal>

  </div>
</section>
      {/* ===================================================
          LEETCODE INTEGRATION — LOGO + HEATMAP
      ==================================================== */}

     <section className="relative overflow-hidden px-6 py-28 sm:py-36">
  <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1.08fr_0.92fr]">

    {/* =====================================================
        LEFT — LEETCODE ACTIVITY
    ====================================================== */}

    <Reveal>
      <div className="relative overflow-hidden rounded-[30px] border border-white/[0.08] bg-[#07090d] p-5 shadow-[0_35px_100px_rgba(0,0,0,.45)] sm:p-7">

        {/* green ambient glow */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-emerald-500/[0.055] blur-[110px]" />

        <div className="pointer-events-none absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-green-500/[0.035] blur-[110px]" />

        <div className="relative">

          {/* Header */}
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025]">
                <img
                  src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/leetcode.png"
                  alt="LeetCode"
                  className="h-6 w-6 object-contain"
                />
              </div>

              <div>
                <p className="text-sm font-bold text-white/80">
                  LeetCode
                </p>

                <p className="mt-0.5 text-[10px] text-white/30">
                  Practice activity
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/[0.035] px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.6)]" />

              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-300/70">
                Connected
              </span>
            </div>

          </div>

          {/* Screenshot */}
          <div className="relative mt-6 overflow-hidden rounded-2xl border border-white/[0.07] bg-black/30">
            <LeetCodeShowcase image={LEETCODE_SCREEN} />
          </div>

          
         

        </div>
      </div>
    </Reveal>


    {/* =====================================================
        RIGHT — CONTENT
    ====================================================== */}

    <Reveal delay={0.08}>
      <div>

        {/* Label */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.04] px-3 py-1.5 text-[10px] font-black tracking-[0.2em] text-emerald-300">

          <img
            src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/leetcode.png"
            alt="LeetCode"
            className="h-3.5 w-3.5 object-contain"
          />

          LEETCODE INTEGRATION

        </div>


        {/* Heading */}
        <h2 className="mt-6 text-4xl font-black leading-[1.02] tracking-[-0.045em] sm:text-5xl">

          Your LeetCode
          <span className="block text-white/40">
            shouldn’t live alone.
          </span>

        </h2>


        {/* Description */}
        <p className="mt-6 max-w-xl text-base leading-7 text-white/55 sm:text-lg">
          Dykstra brings your problem-solving activity into the rest
          of your preparation. Practice on LeetCode, revise what you
          have solved, track your progress, and turn that practice
          into interview readiness.
        </p>


        {/* Connected flow */}
        <div className="mt-9">

          <p className="mb-3 text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
            One preparation loop
          </p>

          <div className="flex flex-wrap items-center gap-2">

            {[
              {
                icon: Code2,
                label: "Practice",
              },
              {
                icon: RotateCcw,
                label: "Revise",
              },
              {
                icon: Target,
                label: "Prepare",
              },
              {
                icon: Video,
                label: "Interview",
              },
            ].map((item, index) => {

              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex items-center gap-2"
                >

                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      delay: 0.15 + index * 0.08,
                      duration: 0.4,
                    }}
                    className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5"
                  >

                    <Icon className="h-3.5 w-3.5 text-emerald-300/80" />

                    <span className="text-[10px] font-bold text-white/55">
                      {item.label}
                    </span>

                  </motion.div>

                  {index < 3 && (
                    <ArrowRight className="hidden h-3.5 w-3.5 text-white/15 sm:block" />
                  )}

                </div>
              );
            })}

          </div>
        </div>


        {/* Text feature */}
        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            delay: 0.5,
            duration: 0.5,
          }}
          className="mt-9 rounded-2xl border border-emerald-400/[0.08] bg-emerald-400/[0.025] p-4"
        >

          <div className="flex gap-3">

            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-400/[0.08]">
              <Sparkles className="h-3.5 w-3.5 text-emerald-300/80" />
            </div>

            <div>
              <p className="text-xs font-bold text-white/65">
                Practice becomes preparation.
              </p>

              <p className="mt-1.5 text-xs leading-5 text-white/35">
                The problems you solve are not just numbers on a
                profile. They become part of the system that helps
                you identify what to revisit and where you stand
                before an interview.
              </p>
            </div>

          </div>

        </motion.div>


        {/* Bottom statement */}
        <p className="mt-6 text-[11px] leading-5 text-white/25">
          Keep your existing LeetCode practice. Let Dykstra connect
          it to the rest of your preparation.
        </p>

      </div>
    </Reveal>

  </div>
</section>

      {/* ===================================================
          REVISION
      ==================================================== */}

      <section className="relative overflow-hidden border-y border-white/[0.06] px-6 py-28 sm:py-36">
        <SectionHeading
          eyebrow="Revision that keeps going"
          title={
            <>
              Solve once.
              <span className="block text-white/40">Remember later.</span>
            </>
          }
          description="Solved problems should become future revision, not disappear into a completed list."
        />

        <Reveal delay={0.1} className="mx-auto mt-16 max-w-6xl">
          <RevisionTimeline />
        </Reveal>
      </section>

      {/* ===================================================
          EXISTING FEATURE SHOWCASE
      ==================================================== */}

      <section className="space-y-28 px-6 py-28 sm:py-36">
        <div className="mx-auto max-w-6xl">
          {features.map((feature, index) => (
            <FeatureSection
              key={feature.title}
              feature={feature}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* ===================================================
          REAL PRODUCT FLOW
      ==================================================== */}

      <section className="relative overflow-hidden border-y border-white/[0.06] px-6 py-28 sm:py-36">
        <SectionHeading
          eyebrow="The difference"
          title={
            <>
              Stop switching between tools.
              <span className="block text-white/40">Keep the loop together.</span>
            </>
          }
          description="Dykstra is designed around the complete preparation journey."
        />

        <Reveal delay={0.1} className="mx-auto mt-14 max-w-5xl">
          <ConnectedFlow />
        </Reveal>
      </section>

      {/* ===================================================
          WHY DYKSTRA
      ==================================================== */}

      <section className="border-t border-white/[0.07] px-6 py-28 sm:py-36">
        <div className="mx-auto max-w-5xl text-center">
          <Reveal>
            <h2 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-white">
                <AboutLinkPreview>Solving</AboutLinkPreview>{" "}
                <AboutLinkPreview>DSA</AboutLinkPreview> is one thing.
              </span>
              <br />
              <span className="text-white/60">
                Keeping what you learned{" "}
                <AboutLinkPreview>fresh</AboutLinkPreview> is another.
              </span>
            </h2>

            <p className="mx-auto mt-8 max-w-2xl text-base leading-7 text-white/45 sm:text-lg">
              Dykstra is built around a simple idea: preparation is not one
              session. It is a loop of solving, understanding, remembering,
              practicing and improving.
            </p>

            <p className="mt-8 text-sm text-white/40">
              Built by <AboutLinkPreview>Souvik Sural</AboutLinkPreview>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ===================================================
          COMMUNITY
      ==================================================== */}

      <section className="relative px-6 py-28">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.07] blur-[140px]" />

        <div className="relative mx-auto max-w-5xl">
          <SectionHeading
            eyebrow="Community feedback"
            title="Built with developers."
            description="As developers use Dykstra, their real experiences and feedback can shape what comes next."
          />

          <Reveal delay={0.1}>
            <div className="relative mx-auto mt-12 overflow-hidden rounded-[30px] border border-white/[0.09] bg-white/[0.025] px-7 py-14 text-center shadow-[0_30px_100px_rgba(0,0,0,.35)] backdrop-blur-xl sm:px-12 sm:py-16">
              <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />

              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-gradient-to-br from-cyan-400/[0.10] via-blue-500/[0.10] to-violet-500/[0.12] shadow-[0_10px_40px_rgba(59,130,246,.10)]"
              >
                <Sparkles className="h-6 w-6 text-violet-300" />
              </motion.div>

              <h3 className="mt-7 text-2xl font-bold tracking-tight sm:text-3xl">
                Be one of the first.
              </h3>

              <p className="mx-auto mt-4 max-w-xl text-[17px] leading-8 text-white/55">
                Tried Dykstra? Tell us what helped, what felt confusing and
                what you would love to see next.
              </p>

              <Link
                to="/feedback"
                className="group mt-8 inline-flex h-11 items-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.045] px-5 text-sm font-semibold text-white/90 transition-all duration-300 hover:border-violet-400/30 hover:bg-violet-500/[0.10] hover:text-white"
              >
                Share your feedback
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <p className="mt-6 text-sm text-white/30">
                Real experiences. No manufactured testimonials.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===================================================
          FAQ
      ==================================================== */}

      <section className="px-6 py-28">
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            eyebrow="Questions"
            title="Frequently asked."
            description="A few things you may want to know before starting."
          />

          <div className="mt-12 divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {faqs.map((faq, index) => {
              const active = activeFaq === index;

              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    onClick={() => setActiveFaq(active ? null : index)}
                    className="flex w-full items-center justify-between gap-5 py-6 text-left"
                  >
                    <span className="text-base font-semibold text-white sm:text-lg">
                      {faq.question}
                    </span>

                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-white/45 transition-transform duration-300 ${
                        active ? "rotate-180 text-cyan-300" : ""
                      }`}
                    />
                  </button>

                  <motion.div
                    initial={false}
                    animate={{
                      height: active ? "auto" : 0,
                      opacity: active ? 1 : 0,
                    }}
                    transition={{
                      duration: 0.28,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="overflow-hidden"
                  >
                    <p className="pb-6 pr-10 text-sm leading-7 text-white/60 sm:text-base">
                      {faq.answer}
                    </p>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================================================
          FINAL CTA
      ==================================================== */}

      <section className="relative overflow-hidden px-6 py-32">
        <div className="absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.10] blur-[140px]" />

        <div className="relative mx-auto max-w-4xl text-center">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-violet-300">
              Your next step
            </p>

            <h2 className="mt-4 text-5xl font-black tracking-[-0.04em] sm:text-6xl">
              Your next interview
              <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                starts here.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/60">
              Build the habits, skills and confidence that show up when the
              interview actually begins.
            </p>

            <Link
              to="/signup"
              className="group mt-9 inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 px-7 text-sm font-bold text-white shadow-[0_15px_50px_rgba(59,130,246,.25)] transition-all duration-300 hover:scale-[1.02]"
            >
              Start with Dykstra
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ===================================================
          FOOTER
      ==================================================== */}

      <footer className="border-t border-white/[0.07] px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500">
                  <Code2 className="h-4.5 w-4.5 text-white" />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">Dykstra</p>
                  <p className="text-[11px] text-white/35">
                    Interview preparation, connected.
                  </p>
                </div>
              </div>

              <p className="mt-5 max-w-sm text-sm leading-6 text-white/45">
                Practice. Visualize. Revise. Interview. Improve.
              </p>

              <a
                href="https://github.com/Souvik34/Dykstra"
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </div>

            <FooterColumn
              title="Product"
              links={[
                ["/problems", "Practice"],
                ["/revisions", "Revision"],
                ["/interviews", "Interviews"],
                ["/dashboard", "Dashboard"],
              ]}
            />

            <FooterColumn
              title="Resources"
              links={[
                ["/about", "About Dykstra"],
                ["/terms", "Terms & Conditions"],
                ["/privacy", "Privacy Policy"],
              ]}
            />

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/55">
                Connect
              </p>

              <div className="mt-4 space-y-3">
                <a
                  href="https://github.com/Souvik34/Dykstra"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>

                <a
                  href="https://www.linkedin.com/company/dykstra-ai/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>

                <Link
                  to="/feedback"
                  className="block text-sm text-white/40 transition hover:text-white"
                >
                  Feedback
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.07] pt-6 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Dykstra</span>
            <span>Built for developers preparing for what comes next.</span>
            <span>
              Made with <span className="text-red-400/70">♥</span> by Souvik
              Sural
            </span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes heatmapGlow {
          0%, 100% {
            opacity: .72;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes scan {
          0% {
            transform: translateY(-120%);
            opacity: 0;
          }
          15% {
            opacity: .28;
          }
          50% {
            opacity: .10;
          }
          100% {
            transform: translateY(720%);
            opacity: 0;
          }
        }
      `}</style>
    </main>
  );
}

/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
  icon: Icon,
  value,
  label,
  detail,
  delay,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  detail: string;
  delay: number;
}) {
  return (
    <Reveal delay={delay}>
      <motion.div
        whileHover={{ y: -7 }}
        className="group relative h-full overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 transition-colors duration-500 hover:border-cyan-400/20 hover:bg-white/[0.04]"
      >
        <div className="flex items-start justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025]">
            <Icon className="h-4.5 w-4.5 text-cyan-300" />
          </span>

          <span className="text-4xl font-black tracking-[-0.05em] text-white/90">
            {value}
          </span>
        </div>

        <p className="mt-7 text-sm font-bold text-white/80">{label}</p>
        <p className="mt-1 text-xs leading-5 text-white/35">{detail}</p>

        <div className="pointer-events-none absolute -bottom-12 -right-12 h-28 w-28 rounded-full bg-cyan-500/[0.07] blur-3xl transition-all duration-500 group-hover:bg-cyan-500/[0.14]" />
      </motion.div>
    </Reveal>
  );
}

/* =========================================================
   DSA VISUALIZER SHOWCASE

   This uses the real img6 screenshot supplied by the user.
   The animation is applied around the screenshot rather than
   inventing a fake visualizer.
========================================================= */

function VisualizerShowcase({ src }: { src: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 45, scale: 0.96 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <div className="absolute -inset-8 rounded-[45px] bg-cyan-400/[0.055] blur-[70px] transition-all duration-700 group-hover:bg-cyan-400/[0.10]" />

      <motion.div
        whileHover={{ y: -8, rotateX: 1, rotateY: -1, scale: 1.008 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[28px] border border-cyan-300/[0.13] bg-[#070910] shadow-[0_40px_120px_rgba(0,0,0,.58)] [transform-style:preserve-3d]"
      >
        <div className="flex h-11 items-center justify-between border-b border-white/[0.07] bg-[#0d1017]/90 px-4 backdrop-blur-xl">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>

          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-cyan-300/60">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
            DSA Visualizer
          </div>
        </div>

        <div className="relative">
          <img
            src={src}
            alt="Dykstra DSA Visualizer"
            className="block w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.025]"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#030408]/40" />

          <motion.div
            initial={{ x: "-130%", opacity: 0 }}
            animate={{ x: "130%", opacity: [0, 0.22, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatDelay: 7,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute inset-y-0 left-0 w-1/4 rotate-[8deg] bg-gradient-to-r from-transparent via-cyan-300/[0.08] to-transparent blur-xl"
          />

          <motion.div
            animate={{
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute inset-x-[12%] bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent"
          />
        </div>

        <div className="absolute bottom-4 left-4 rounded-full border border-cyan-300/15 bg-[#030408]/70 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-cyan-200/70 backdrop-blur-xl">
          Watch the algorithm execute
        </div>
      </motion.div>
    </motion.div>
  );
}

/* =========================================================
   LEETCODE SHOWCASE
========================================================= */

function LeetCodeShowcase({ image }: { image: string }) {
  const heatmap = Array.from({ length: 112 }, (_, index) => {
    const wave = Math.sin(index * 0.73) + Math.cos(index * 0.31);
    const level =
      wave > 1.25 ? 4 : wave > 0.55 ? 3 : wave > -0.15 ? 2 : wave > -1 ? 1 : 0;

    return level;
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -45, scale: 0.96 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <div className="absolute -inset-8 rounded-[45px] bg-orange-400/[0.035] blur-[75px]" />

      <motion.div
        whileHover={{ y: -8, scale: 1.008 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-[28px] border border-white/[0.09] bg-[#070910] shadow-[0_40px_120px_rgba(0,0,0,.55)]"
      >
        <div className="flex h-11 items-center justify-between border-b border-white/[0.07] bg-[#0d1017]/90 px-4 backdrop-blur-xl">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>

          <div className="flex items-center gap-2">
            <LeetCodeMark />
            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">
              Connected progress
            </span>
          </div>
        </div>

        <div className="relative min-h-[390px] overflow-hidden">
          <img
            src={image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-[0.08] blur-[1px] grayscale transition-opacity duration-700 group-hover:opacity-[0.12]"
          />

          <div className="absolute inset-0 bg-[#06080d]/85" />

          <div className="relative z-10 p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white/40">
                  LeetCode activity
                </p>
                <p className="mt-1 text-xl font-black tracking-tight">
                  Consistency, not just count.
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-orange-400/20 bg-orange-400/[0.06]">
                <LeetCodeMark size={22} />
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-white/[0.07] bg-[#0a0d13]/85 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
                    Activity
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white/80">
                    Problem-solving heatmap
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[9px] text-white/30">
                  <span>Less</span>
                  {[0, 1, 2, 3, 4].map((level) => (
                    <span
                      key={level}
                      className="h-2.5 w-2.5 rounded-[3px]"
                      style={{
                        background:
                          level === 0
                            ? "rgba(255,255,255,.055)"
                            : `rgba(249,115,22,${0.16 + level * 0.16})`,
                      }}
                    />
                  ))}
                  <span>More</span>
                </div>
              </div>

              <div className="mt-5 grid grid-flow-col grid-rows-7 gap-[5px] overflow-hidden">
                {heatmap.map((level, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: Math.min(index * 0.008, 0.7),
                      duration: 0.25,
                    }}
                    className="aspect-square rounded-[3px]"
                    style={{
                      background:
                        level === 0
                          ? "rgba(255,255,255,.045)"
                          : `rgba(249,115,22,${0.15 + level * 0.16})`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <HeatStat value="DSA" label="Synced" />
              <HeatStat value="REV" label="Revision" />
              <HeatStat value="READY" label="Tracked" />
            </div>
          </div>

          {/* Bottom fade requested by user */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-36 bg-gradient-to-t from-[#030408] via-[#030408]/75 to-transparent" />
        </div>
      </motion.div>
    </motion.div>
  );
}

function HeatStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3">
      <p className="text-xs font-black text-white/75">{value}</p>
      <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-white/30">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   LEETCODE MARK
========================================================= */

function LeetCodeMark({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M15.6 2.7 9.3 9l6.3 6.3"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.3 9h10.1"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M8.2 19.7H5.9a2.4 2.4 0 0 1-2.4-2.4V6.7a2.4 2.4 0 0 1 2.4-2.4h2.3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   REVISION TIMELINE

   No fake progress bar. The timeline itself animates:
   cards enter sequentially and the connecting line draws.
========================================================= */

function RevisionTimeline() {
  const intervals = [
    { day: "1", label: "First revisit" },
    { day: "2", label: "Second revisit" },
    { day: "4", label: "Reinforce" },
    { day: "8", label: "Recall" },
    { day: "16", label: "Retain" },
    { day: "30", label: "Long-term" },
  ];

  return (
    <div className="relative overflow-hidden rounded-[30px] border border-white/[0.08] bg-white/[0.025] p-6 shadow-[0_35px_100px_rgba(0,0,0,.38)] sm:p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,.055),transparent_58%)]" />

      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
              Spaced revision
            </p>
            <p className="mt-2 text-lg font-bold">
              A solved problem keeps coming back.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[10px] font-semibold text-white/40">
            <TimerReset className="h-3.5 w-3.5 text-cyan-300/70" />
            6 intervals
          </div>
        </div>

        <div className="relative mt-12">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-[8%] right-[8%] top-8 hidden h-px origin-left bg-gradient-to-r from-cyan-400/15 via-cyan-400/45 to-violet-400/20 md:block"
          />

          <div className="grid gap-4 md:grid-cols-6">
            {intervals.map((item, index) => (
              <motion.div
                key={item.day}
                initial={{ opacity: 0, y: 20, scale: 0.94 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{
                  delay: index * 0.09,
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative z-10"
              >
                <motion.div
                  whileHover={{ y: -5, scale: 1.04 }}
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/15 bg-[#080a10] shadow-[0_12px_35px_rgba(0,0,0,.35)]"
                >
                  <span className="text-lg font-black text-cyan-200">
                    {item.day}
                  </span>
                </motion.div>

                <p className="mt-4 text-center text-xs font-bold text-white/75">
                  {item.day} day{item.day === "1" ? "" : "s"}
                </p>
                <p className="mt-1 text-center text-[10px] leading-4 text-white/30">
                  {item.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-3 md:grid-cols-3">
          {[
            ["Solved", "Problem enters your revision cycle."],
            ["Due", "Dykstra brings it back when needed."],
            ["Revisited", "Your next performance informs the cycle."],
          ].map(([title, text], index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <p className="text-xs font-bold text-white/75">{title}</p>
              <p className="mt-1 text-xs leading-5 text-white/35">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CONNECTED FLOW
========================================================= */

function ConnectedFlow() {
  const cards = [
    {
      title: "Practice",
      description: "Solve DSA problems and build your history.",
      icon: Code2,
      color: "cyan",
    },
    {
      title: "Visualize",
      description: "See algorithms instead of memorizing them.",
      icon: GitBranch,
      color: "blue",
    },
    {
      title: "Revise",
      description: "Return to problems before they disappear.",
      icon: RotateCcw,
      color: "violet",
    },
    {
      title: "Interview",
      description: "Use AI practice to test the whole skill.",
      icon: Video,
      color: "cyan",
    },
    {
      title: "Improve",
      description: "Use the feedback to decide what comes next.",
      icon: Target,
      color: "violet",
    },
  ];

  return (
    <div className="relative">
      <div className="absolute left-[10%] right-[10%] top-[52px] hidden h-px bg-gradient-to-r from-cyan-400/10 via-blue-400/35 to-violet-400/10 md:block" />

      <div className="grid gap-4 md:grid-cols-5">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <Reveal key={card.title} delay={index * 0.07}>
              <motion.div
                whileHover={{ y: -8 }}
                className="group relative h-full rounded-3xl border border-white/[0.08] bg-[#080a10]/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,.25)] transition-all duration-500 hover:border-white/[0.14]"
              >
                <motion.div
                  whileHover={{ rotate: 6, scale: 1.08 }}
                  className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025]"
                >
                  <Icon className="h-5 w-5 text-cyan-300" />
                </motion.div>

                <p className="mt-7 text-sm font-bold">{card.title}</p>
                <p className="mt-2 text-xs leading-5 text-white/40">
                  {card.description}
                </p>

                <div className="pointer-events-none absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-cyan-500/[0.06] blur-3xl transition-all duration-500 group-hover:bg-cyan-500/[0.13]" />

                {index < cards.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-12 z-20 hidden h-4 w-4 text-cyan-300/25 md:block" />
                )}
              </motion.div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"
    >
      <Icon className="h-4 w-4 text-cyan-300/75" />
      <p className="mt-4 text-sm font-black text-white/80">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/30">
        {label}
      </p>
    </motion.div>
  );
}

/* =========================================================
   FEATURE SECTION

   IMPORTANT: The original side-slide behavior is retained.
   Text comes from one side, screenshot from the other.
========================================================= */

function FeatureSection({
  feature,
  index,
}: {
  feature: (typeof features)[number];
  index: number;
}) {
  const Icon = feature.icon;

  const textBlock = (
    <motion.div
      initial={{
        opacity: 0,
        x: feature.align === "left" ? -70 : 70,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
      }}
      viewport={{
        once: true,
        amount: 0.25,
      }}
      transition={{
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="flex items-center"
    >
      <div className="max-w-xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.03] px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] text-white/60">
          <Icon className="h-3.5 w-3.5 text-cyan-300" />
          {feature.eyebrow}
        </div>

        <h3 className="mt-6 text-4xl font-black leading-tight tracking-[-0.03em] sm:text-5xl">
          {feature.title}
        </h3>

        <p className="mt-5 text-base leading-7 text-white/60 sm:text-lg">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );

  const visualBlock = (
    <motion.div
      initial={{
        opacity: 0,
        x: feature.align === "left" ? 70 : -70,
        scale: 0.94,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        scale: 1,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: 0.95,
        delay: 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <ScreenshotFrame src={feature.image} alt={feature.title} />
    </motion.div>
  );

  return (
    <div
      className={`grid gap-14 lg:grid-cols-2 lg:items-center ${
        index > 0 ? "pt-20" : ""
      }`}
    >
      {feature.align === "left" ? (
        <>
          {textBlock}
          {visualBlock}
        </>
      ) : (
        <>
          {visualBlock}
          {textBlock}
        </>
      )}
    </div>
  );
}


/* =========================================================
   SCREENSHOT FRAME

   This keeps the original polished browser-frame treatment.
========================================================= */

function ScreenshotFrame({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const { scrollYProgress } = useScroll();

  const tilt = useTransform(scrollYProgress, [0, 1], [-1.5, 1.5]);
  const smoothTilt = useSpring(tilt, {
    stiffness: 80,
    damping: 20,
  });

  return (
    <motion.div
      style={{ rotateX: smoothTilt }}
      whileHover={{
        y: -7,
        scale: 1.008,
      }}
      transition={{
        duration: 0.45,
        ease: "easeOut",
      }}
      className={`group relative overflow-hidden rounded-[26px] border border-white/[0.09] bg-[#090b11] shadow-[0_35px_100px_rgba(0,0,0,.48)] [transform-style:preserve-3d] ${className}`}
    >
      <div className="relative z-10 flex h-10 items-center border-b border-white/[0.06] bg-[#111318]/90 px-4 backdrop-blur-xl">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>

        <div className="ml-3 h-2 w-28 rounded-full bg-white/[0.035]" />
      </div>

      <div className="relative overflow-hidden">
        <img
          src={src}
          alt={alt}
          className="block w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.018]"
          loading="lazy"
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#030408]/25 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#030408]/55 via-[#030408]/12 to-transparent" />

        <motion.div
          initial={{ x: "-120%" }}
          whileInView={{ x: "130%" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            delay: 0.35,
            duration: 1.1,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="pointer-events-none absolute inset-y-0 left-0 w-[18%] rotate-[8deg] bg-gradient-to-r from-transparent via-white/[0.045] to-transparent blur-xl"
        />

        <div className="pointer-events-none absolute -bottom-24 left-1/2 h-48 w-3/4 -translate-x-1/2 rounded-full bg-violet-500/[0.07] blur-[80px]" />

        <div className="pointer-events-none absolute inset-x-[15%] bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent" />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.025] to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
      </div>
    </motion.div>
  );
}

<BuyMeCoffee />

/* =========================================================
   FOOTER
========================================================= */

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/55">
        {title}
      </p>

      <div className="mt-4 space-y-3">
        {links.map(([to, label]) => (
          <Link
            key={label}
            to={to}
            className="block text-sm text-white/40 transition hover:text-white"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
