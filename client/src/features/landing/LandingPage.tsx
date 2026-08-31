/* eslint-disable prettier/prettier */

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronDown,
  Code2,
  Sparkles,
  Brain,
  RotateCcw,
  Video,
  Target,
  Github,
} from "lucide-react";

import banner from "@/assets/images/Banner.png";
import img1 from "@/assets/images/img1.png";
import img2 from "@/assets/images/img2.png";
import img3 from "@/assets/images/img3.png";
import img4 from "@/assets/images/img4.png";
import img5 from "@/assets/images/img5.png";

import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";

/* =========================================================
   DATA
========================================================= */

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
      "Dykstra is a single workspace for DSA practice, intelligent revision, interview practice and preparation tracking.",
  },

  {
    question: "Is Dykstra only for DSA practice?",
    answer:
      "No. DSA practice is the foundation, but Dykstra is designed to connect problem solving, revision and interview preparation into one workflow.",
  },

  {
    question: "How does intelligent revision work?",
    answer:
      "Dykstra uses your solving activity and revision history to determine what needs attention, so revision becomes continuous instead of something you do only before an interview.",
  },

  {
    question: "What is spaced revision?",
    answer:
      "Spaced revision schedules previously solved problems at increasing intervals, helping you revisit concepts at the right time instead of repeatedly solving the same problems randomly.",
  },

  {
    question: "What is forced revision?",
    answer:
      "Forced revision brings problems back when they need immediate attention, helping you revisit weak or forgotten concepts instead of waiting for the next scheduled revision.",
  },

  {
    question: "Can I practice technical interviews?",
    answer:
      "Yes. Dykstra includes an AI interview experience designed around problem understanding, approach, coding, debugging, optimization and feedback.",
  },

  {
    question: "Will Dykstra track my progress?",
    answer:
      "Yes. Your dashboard brings together solving activity, topic progress, revision state and interview readiness so you can see how your preparation is progressing.",
  },



  {
    question: "Is Dykstra free to use?",
    answer:
      "Yes! It's free."
  },

  {
    question: "Can I use Dykstra for interview preparation?",
    answer:
      "Yes. Dykstra is designed to take you from practice to revision to interview preparation, helping you build consistency rather than preparing only at the last moment.",
  },
];

const footerColumns = [
  {
    title: "Product",
    links: [
      "Practice",
      "Revision",
      "Interviews",
      "Dashboard",
    ],
  },
  {
    title: "Resources",
    links: [
      "FAQ",
      "Feedback",
    ],
  },
  {
    title: "Legal",
    links: [
      "Terms & Conditions",
      "Privacy Policy",
    ],
  },
];

/* =========================================================
   LANDING PAGE
========================================================= */

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const { scrollYProgress } = useScroll();

  const heroY = useTransform(
    scrollYProgress,
    [0, 0.2],
    [0, -70],
  );

  const heroOpacity = useTransform(
    scrollYProgress,
    [0, 0.16],
    [1, 0],
  );

  const heroScale = useTransform(
    scrollYProgress,
    [0, 0.18],
    [1, 0.97],
  );

  
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#030408] text-white">

      {/* =====================================================
          GLOBAL BACKGROUND
      ====================================================== */}

      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20 overflow-hidden"
      >
        <div className="absolute -left-[15%] -top-[15%] h-[650px] w-[650px] rounded-full bg-blue-600/[0.07] blur-[150px]" />

        <div className="absolute -right-[18%] top-[18%] h-[700px] w-[700px] rounded-full bg-violet-600/[0.06] blur-[160px]" />

        <div className="absolute bottom-[5%] left-[25%] h-[450px] w-[450px] rounded-full bg-cyan-500/[0.03] blur-[140px]" />

        <div
          className="
            absolute
            inset-0
            opacity-[0.018]
            [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)]
            [background-size:56px_56px]
          "
        />
      </div>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">

        {/* ===================================================
            FULL HERO IMAGE
        ==================================================== */}

        <motion.div
          style={{
            y: heroY,
            scale: heroScale,
          }}
          className="
            pointer-events-none
            absolute
            inset-0
            flex
            justify-center
            overflow-hidden
          "
        >

          <motion.div
            initial={{
              opacity: 0,
              scale: 1.025,
              filter: "blur(8px)",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              filter: "blur(0px)",
            }}
          transition={{
  delay: 0.35,
  duration: 2.5,
  ease: [0.22, 1, 0.36, 1],
}}
            className="
              relative
              mt-[-10px]
              h-[850px]
              w-full
              max-w-[1550px]
            "
          >

            {/* =================================================
                FULL IMAGE
            ================================================== */}

            <motion.img
              src={banner}
              alt=""
              initial={{
                opacity: 0,
                scale: 1.025,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
   transition={{
  delay: 0.45,
  duration: 2.5,
  ease: "easeInOut",
}}
              className="
                absolute
                inset-0
                h-full
                w-full
                object-contain
                object-top
              "
            />

            {/* =================================================
                SOFT IMAGE ATMOSPHERE
            ================================================== */}

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                bg-gradient-to-r
                from-cyan-500/[0.018]
                via-transparent
                to-violet-500/[0.035]
                mix-blend-screen
              "
            />

            {/* =================================================
                VERY SOFT TOP FADE
            ================================================== */}

            <div
              className="
                pointer-events-none
                absolute
                inset-x-0
                top-0
                h-48
                bg-gradient-to-b
               from-[#030408]/92
via-[#030408]/42
                to-transparent
              "
            />

            {/* =================================================
                SOFT SIDE FADES
            ================================================== */}

            <div
              className="
                pointer-events-none
                absolute
                inset-y-0
                left-0
                w-[12%]
                bg-gradient-to-r
                from-[#030408]/60
                to-transparent
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                inset-y-0
                right-0
                w-[12%]
                bg-gradient-to-l
                from-[#030408]/60
                to-transparent
              "
            />

            {/* =================================================
                MUCH LIGHTER BOTTOM FADE
            ================================================== */}

            <div
              className="
                pointer-events-none
                absolute
                inset-x-0
                bottom-0
                h-[220px]
                bg-gradient-to-t
               from-[#030408]/92
via-[#030408]/42
                to-transparent
              "
            />

            {/* =================================================
                SOFT CENTER VIGNETTE
            ================================================== */}

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                bg-[radial-gradient(ellipse_at_center,transparent_15%,rgba(3,4,8,.08)_55%,rgba(3,4,8,.42)_100%)]
              "
            />

            {/* =================================================
                VERY SUBTLE PERMANENT LIGHT SWEEP
            ================================================== */}

            <motion.div
              initial={{
                x: "-130%",
                opacity: 0,
              }}
              animate={{
                x: "130%",
                opacity: [0, 0.35, 0],
              }}
              transition={{
                delay: 4,
                duration: 8,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 10,
              }}
              className="
                pointer-events-none
                absolute
                inset-y-0
                left-0
                w-[22%]
                rotate-[8deg]
                bg-gradient-to-r
                from-transparent
                via-white/[0.025]
                to-transparent
                blur-3xl
              "
            />

          </motion.div>
        </motion.div>

        {/* =================================================
            HERO GLOBAL OVERLAY
        ================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-[#030408]/[0.7]
          "
        />

        {/* =================================================
            CENTER READABILITY
        ================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-[radial-gradient(circle_at_center,rgba(3,4,8,.02)_0%,rgba(3,4,8,.12)_55%,rgba(3,4,8,.34)_100%)]
          "
        />

        {/* =================================================
            HERO CONTENT
        ================================================== */}

        <motion.div
          style={{
            y: heroY,
            opacity: heroOpacity,
          }}
          className="
            relative
            z-10
            mx-auto
            max-w-5xl
            px-6
            pb-10
            pt-16
            text-center
          "
        >

          {/* =================================================
              BRAND
          ================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 14,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
              delay: 0.35,
              ease: "easeOut",
            }}
            className="
              mx-auto
              mb-8
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-white/[0.12]
              bg-[#05070c]/[0.65]
              px-4
              py-2
              shadow-[0_10px_40px_rgba(0,0,0,.25)]
              backdrop-blur-xl
            "
          >

            <span
              className="
                flex
                h-6
                w-6
                items-center
                justify-center
                rounded-full
                bg-gradient-to-br
                from-cyan-400
                via-blue-500
                to-violet-500
                shadow-[0_0_20px_rgba(59,130,246,.35)]
              "
            >
              <Code2 className="h-3.5 w-3.5 text-white" />
            </span>

            <span className="text-sm font-semibold tracking-tight">
              Dykstra
            </span>

          </motion.div>

          {/* =================================================
              HEADING
          ================================================== */}

          <motion.h1
            initial={{
              opacity: 0,
              y: 28,
              filter: "blur(8px)",
            }}
            animate={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            }}
            transition={{
              duration: 1.15,
              delay: 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              text-[46px]
              font-black
              leading-[0.98]
              tracking-[-0.055em]
              drop-shadow-[0_8px_35px_rgba(0,0,0,.45)]
              sm:text-[66px]
              md:text-[82px]
              lg:text-[100px]
            "
          >
            One place to
            <br />

            <span
              className="
                bg-gradient-to-r
                from-cyan-300
                via-blue-400
                to-violet-400
                bg-clip-text
                text-transparent
                [background-size:200%_100%]
                animate-[gradientShift_6s_ease-in-out_infinite]
              "
            >
              become interview ready.
            </span>
          </motion.h1>

          {/* =================================================
              DESCRIPTION
          ================================================== */}

          <motion.p
            initial={{
              opacity: 0,
              y: 20,
              filter: "blur(5px)",
            }}
            animate={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            }}
            transition={{
              duration: 0.9,
              delay: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              mx-auto
              mt-8
              max-w-2xl
              text-[16px]
              leading-7
              text-white/75
              drop-shadow-[0_4px_18px_rgba(0,0,0,.6)]
              sm:text-lg
            "
          >
            Practice DSA, revise intelligently, simulate technical
            interviews and understand exactly where you stand.
          </motion.p>

          {/* =================================================
              CTA
          ================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 18,
              filter: "blur(5px)",
            }}
            animate={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            }}
            transition={{
              duration: 0.9,
              delay: 1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              mt-9
              flex
              flex-col
              items-center
              justify-center
              gap-3
              sm:flex-row
            "
          >

            <Link
              to="/signup"
              className="
                group
                relative
                flex
                h-12
                items-center
                gap-2
                overflow-hidden
                rounded-xl
                bg-gradient-to-r
                from-cyan-500
                via-blue-600
                to-violet-600
                px-6
                text-sm
                font-bold
                text-white
                shadow-[0_15px_45px_rgba(37,99,235,.30)]
                transition-all
                duration-300
                hover:scale-[1.025]
                hover:shadow-[0_20px_65px_rgba(59,130,246,.40)]
              "
            >

              <span
                className="
                  absolute
                  inset-y-0
                  -left-16
                  w-12
                  rotate-12
                  bg-white/20
                  blur-md
                  transition-transform
                  duration-700
                  group-hover:translate-x-[400px]
                "
              />

              <span className="relative">
                Start Preparing
              </span>

              <ArrowRight
                className="
                  relative
                  h-4
                  w-4
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />

            </Link>

            <Link
              to="/login"
              className="
                flex
                h-12
                items-center
                justify-center
                rounded-xl
                border
                border-white/[0.14]
                bg-[#05070c]/[0.55]
                px-6
                text-sm
                font-semibold
                text-white/90
                shadow-[0_10px_35px_rgba(0,0,0,.20)]
                backdrop-blur-xl
                transition-all
                duration-300
                hover:border-white/[0.22]
                hover:bg-white/[0.08]
                hover:text-white
              "
            >
              Sign in
            </Link>

          </motion.div>

          {/* =================================================
              BOTTOM STATEMENT
          ================================================== */}

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 1.25,
              duration: 0.8,
            }}
            className="
              mt-16
              flex
              items-center
              justify-center
              gap-2
              text-xs
              font-medium
              text-white
              drop-shadow-[0_3px_15px_rgba(0,0,0,.6)]
            "
          >

            <Sparkles className="h-3.5 w-3.5 text-violet-300" />

            Built for developers who want to prepare with purpose.

          </motion.div>

        </motion.div>

        {/* =================================================
            ONLY VERY BOTTOM FADE
        ================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            bottom-0
            left-0
            right-0
            h-28
            bg-gradient-to-t
            from-[#030408]
            to-transparent
          "
        />

      </section>

      {/* =====================================================
          PRODUCT INTRO
      ====================================================== */}

      <section className="relative px-6 pb-24 pt-12">

        <div className="mx-auto max-w-6xl text-center">

          <motion.p
            initial={{
              opacity: 0,
              y: 16,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.4,
            }}
            className="
              text-xs
              font-bold
              uppercase
              tracking-[0.24em]
              text-cyan-300
            "
          >
            One system
          </motion.p>

          <motion.h2
            initial={{
              opacity: 0,
              y: 18,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.4,
            }}
            transition={{
              delay: 0.08,
            }}
            className="
              mt-3
              text-4xl
              font-black
              tracking-tight
              sm:text-5xl
            "
          >
            Everything connected.
          </motion.h2>

          <motion.p
            initial={{
              opacity: 0,
              y: 16,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.4,
            }}
            transition={{
              delay: 0.16,
            }}
            className="
              mx-auto
              mt-5
              max-w-2xl
              text-base
              leading-7
              text-white/65
            "
          >
            Your preparation should not live in separate tools,
            spreadsheets and tabs.
          </motion.p>

        </div>

        <ScreenshotFrame
          src={img1}
          alt="Dykstra dashboard"
          className="
            mx-auto
            mt-14
            max-w-6xl
          "
        />

      </section>

      {/* =====================================================
          FEATURES
      ====================================================== */}

      <section className="space-y-28 px-6 py-24">

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

 {/* =====================================================
    COMMUNITY FEEDBACK
====================================================== */}

<section className="relative px-6 py-28">

  {/* Background glow */}

  <div
    aria-hidden
    className="
      pointer-events-none
      absolute
      left-1/2
      top-1/2
      h-[420px]
      w-[420px]
      -translate-x-1/2
      -translate-y-1/2
      rounded-full
      bg-violet-500/[0.07]
      blur-[140px]
    "
  />

  <div className="relative mx-auto max-w-5xl">

    {/* Heading */}

    <div className="text-center">

      <motion.p
        initial={{
          opacity: 0,
          y: 14,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.4,
        }}
        className="
          text-sm
          font-bold
          uppercase
          tracking-[0.24em]
          text-violet-300
        "
      >
        Community feedback
      </motion.p>

      <motion.h2
        initial={{
          opacity: 0,
          y: 18,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.4,
        }}
        transition={{
          delay: 0.08,
        }}
        className="
          mt-3
          text-4xl
          font-black
          tracking-tight
          sm:text-5xl
        "
      >
        Built with developers.
      </motion.h2>

      <motion.p
        initial={{
          opacity: 0,
          y: 16,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.4,
        }}
        transition={{
          delay: 0.16,
        }}
        className="
          mx-auto
          mt-5
          max-w-2xl
          text-[17px]
          leading-8
          text-white/65
          sm:text-lg
        "
      >
        We're just getting started. As developers use Dykstra,
        their experiences and feedback will appear here.
      </motion.p>

    </div>

    {/* Empty feedback state */}

    <motion.div
      initial={{
        opacity: 0,
        y: 25,
        scale: 0.98,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      viewport={{
        once: true,
        amount: 0.25,
      }}
      transition={{
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="
        relative
        mx-auto
        mt-12
        overflow-hidden
        rounded-[30px]
        border
        border-white/[0.09]
        bg-white/[0.025]
        px-7
        py-14
        text-center
        shadow-[0_30px_100px_rgba(0,0,0,.35)]
        backdrop-blur-xl
        sm:px-12
        sm:py-16
      "
    >

      {/* Top accent */}

      <div
        className="
          absolute
          left-1/2
          top-0
          h-px
          w-2/3
          -translate-x-1/2
          bg-gradient-to-r
          from-transparent
          via-violet-400/60
          to-transparent
        "
      />

      {/* Icon */}

      <motion.div
        animate={{
          y: [0, -4, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          mx-auto
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          border
          border-white/[0.08]
          bg-gradient-to-br
          from-cyan-400/[0.10]
          via-blue-500/[0.10]
          to-violet-500/[0.12]
          shadow-[0_10px_40px_rgba(59,130,246,.10)]
        "
      >
        <Sparkles className="h-6 w-6 text-violet-300" />
      </motion.div>

      <h3
        className="
          mt-7
          text-2xl
          font-bold
          tracking-tight
          text-white
          sm:text-3xl
        "
      >
        Be one of the first.
      </h3>

      <p
        className="
          mx-auto
          mt-4
          max-w-xl
          text-[17px]
          leading-8
          text-white/55
          sm:text-lg
        "
      >
        Tried Dykstra? Tell us what you think, what helped,
        and what you would love to see next.
      </p>

      {/* Feedback CTA */}

      <Link
        to="/feedback"
        className="
          group
          mt-8
          inline-flex
          h-11
          items-center
          gap-2
          rounded-xl
          border
          border-white/[0.10]
          bg-white/[0.045]
          px-5
          text-sm
          font-semibold
          text-white/90
          shadow-[0_10px_35px_rgba(0,0,0,.20)]
          transition-all
          duration-300
          hover:border-violet-400/30
          hover:bg-violet-500/[0.10]
          hover:text-white
        "
      >
        Share your feedback

        <ArrowRight
          className="
            h-4
            w-4
            transition-transform
            duration-300
            group-hover:translate-x-1
          "
        />
      </Link>

      {/* Decorative text */}

      <p
        className="
          mt-6
          text-sm
          text-white/30
        "
      >
        Real experiences. No manufactured testimonials.
      </p>

    </motion.div>

  </div>

</section>

      {/* =====================================================
          FAQ
      ====================================================== */}

      <section className="px-6 py-24">

        <div className="mx-auto max-w-4xl">

          <div className="text-center">

            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.24em]
                text-cyan-300
              "
            >
              Questions
            </p>

            <h2
              className="
                mt-3
                text-4xl
                font-black
                tracking-tight
                sm:text-5xl
              "
            >
              Frequently asked.
            </h2>

          </div>

          <div
            className="
              mt-12
              divide-y
              divide-white/[0.08]
              border-y
              border-white/[0.08]
            "
          >

            {faqs.map((faq, index) => {

              const active = activeFaq === index;

              return (
                <div key={faq.question}>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveFaq(
                        active ? null : index,
                      )
                    }
                    className="
                      flex
                      w-full
                      items-center
                      justify-between
                      gap-5
                      py-6
                      text-left
                    "
                  >

                    <span
                      className="
                        text-base
                        font-semibold
                        text-white
                        sm:text-lg
                      "
                    >
                      {faq.question}
                    </span>

                    <ChevronDown
                      className={`
                        h-5
                        w-5
                        shrink-0
                        text-white/45
                        transition-transform
                        duration-300
                        ${
                          active
                            ? "rotate-180 text-cyan-300"
                            : ""
                        }
                      `}
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

                    <p
                      className="
                        pb-6
                        pr-10
                        text-sm
                        leading-7
                        text-white/60
                        sm:text-base
                      "
                    >
                      {faq.answer}
                    </p>

                  </motion.div>

                </div>
              );
            })}

          </div>

        </div>

      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section className="relative overflow-hidden px-6 py-28">

        <div
          className="
            absolute
            left-1/2
            top-1/2
            h-[450px]
            w-[450px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-violet-500/[0.10]
            blur-[140px]
          "
        />

        <div className="relative mx-auto max-w-4xl text-center">

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
          >

            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.24em]
                text-violet-300
              "
            >
              Your next step
            </p>

            <h2
              className="
                mt-4
                text-5xl
                font-black
                tracking-[-0.04em]
                sm:text-6xl
              "
            >
              Your next interview

              <span
                className="
                  block
                  bg-gradient-to-r
                  from-cyan-300
                  via-blue-400
                  to-violet-400
                  bg-clip-text
                  text-transparent
                "
              >
                starts here.
              </span>
            </h2>

            <p
              className="
                mx-auto
                mt-6
                max-w-2xl
                text-base
                leading-7
                text-white/60
              "
            >
              Build the habits, skills and confidence that show up
              when the interview actually begins.
            </p>

            <Link
              to="/signup"
              className="
                group
                mt-9
                inline-flex
                h-12
                items-center
                gap-2
                rounded-xl
                bg-gradient-to-r
                from-cyan-500
                via-blue-600
                to-violet-600
                px-7
                text-sm
                font-bold
                text-white
                shadow-[0_15px_50px_rgba(59,130,246,.25)]
                transition-all
                duration-300
                hover:scale-[1.02]
              "
            >
              Start with Dykstra

              <ArrowRight
                className="
                  h-4
                  w-4
                  transition-transform
                  group-hover:translate-x-1
                "
              />

            </Link>

          </motion.div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

<footer
  className="
    border-t
    border-white/[0.07]
    px-6
    py-12
  "
>
  <div className="mx-auto max-w-6xl">

    <div
      className="
        grid
        gap-10
        md:grid-cols-[1.4fr_1fr_1fr_1fr]
      "
    >

      {/* BRAND */}
      <div>
        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-gradient-to-br
              from-cyan-400
              via-blue-500
              to-violet-500
            "
          >
            <Code2 className="h-4.5 w-4.5 text-white" />
          </div>

          <div>
            <p className="text-sm font-bold text-white">
              Dykstra
            </p>

            <p className="text-[11px] text-white/35">
              Interview preparation, connected.
            </p>
          </div>

        </div>

        <p
          className="
            mt-5
            max-w-sm
            text-sm
            leading-6
            text-white/45
          "
        >
          Practice. Revise. Interview. Improve.
        </p>

        <a
          href="https://github.com/Souvik34/Dykstra"
          target="_blank"
          rel="noreferrer"
          className="
            mt-5
            inline-flex
            items-center
            gap-2
            text-sm
            text-white/50
            transition
            hover:text-white
          "
        >
          <Github className="h-4 w-4" />
          GitHub
        </a>
      </div>


      {/* PRODUCT */}
      <div>

        <p
          className="
            text-xs
            font-bold
            uppercase
            tracking-[0.18em]
            text-white/55
          "
        >
          Product
        </p>

        <div className="mt-4 space-y-3">

          <Link
            to="/problems"
            className="
              block
              text-sm
              text-white/40
              transition
              hover:text-white
            "
          >
            Practice
          </Link>

          <Link
            to="/revisions"
            className="
              block
              text-sm
              text-white/40
              transition
              hover:text-white
            "
          >
            Revision
          </Link>

          <Link
            to="/interviews"
            className="
              block
              text-sm
              text-white/40
              transition
              hover:text-white
            "
          >
            Interviews
          </Link>

          <Link
            to="/dashboard"
            className="
              block
              text-sm
              text-white/40
              transition
              hover:text-white
            "
          >
            Dashboard
          </Link>

        </div>

      </div>


      {/* RESOURCES */}
      <div>

        <p
          className="
            text-xs
            font-bold
            uppercase
            tracking-[0.18em]
            text-white/55
          "
        >
          Resources
        </p>

        <div className="mt-4 space-y-3">

          {/* FAQ
          <Link
            to="/"
            hash="faq"
            className="
              block
              text-sm
              text-white/40
              transition
              hover:text-white
            "
          >
            FAQ
          </Link> */}

          {/* TERMS */}
          <Link
            to="/terms"
            className="
              block
              text-sm
              text-white/40
              transition
              hover:text-white
            "
          >
            Terms & Conditions
          </Link>

          {/* PRIVACY */}
          <Link
            to="/privacy"
            className="
              block
              text-sm
              text-white/40
              transition
              hover:text-white
            "
          >
            Privacy Policy
          </Link>

        </div>

      </div>


      {/* CONNECT */}
      <div>

        <p
          className="
            text-xs
            font-bold
            uppercase
            tracking-[0.18em]
            text-white/55
          "
        >
          Connect
        </p>

        <div className="mt-4 space-y-3">

          <a
            href="https://github.com/Souvik34/Dykstra"
            target="_blank"
            rel="noreferrer"
            className="
              block
              text-sm
              text-white/40
              transition
              hover:text-white
            "
          >
            GitHub
          </a>

          <Link
            to="/feedback"
            className="
              block
              text-sm
              text-white/40
              transition
              hover:text-white
            "
          >
            Feedback
          </Link>

          {/* <a
            href="mailto:support@dykstra.dev"
            className="
              block
              text-sm
              text-white/40
              transition
              hover:text-white
            "
          >
            Contact
          </a> */}

        </div>

      </div>

    </div>


    {/* BOTTOM */}
    <div
      className="
        mt-12
        flex
        flex-col
        gap-3
        border-t
        border-white/[0.07]
        pt-6
        text-xs
        text-white/30
        sm:flex-row
        sm:items-center
        sm:justify-between
      "
    >

      <span>
        © {new Date().getFullYear()} Dykstra
      </span>

      <span>
        Built for developers preparing for what comes next.
      </span>

      <span>
    Made with <span className="text-red-400/70">♥</span> by Souvik
  </span>

    </div>

  </div>
</footer>
      {/* =====================================================
          ANIMATIONS
      ====================================================== */}

      <style>{`
        @keyframes gradientShift {
          0%,
          100% {
            background-position: 0% 50%;
          }

          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>

    </main>
  );
}

/* =========================================================
   FEATURE SECTION
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
        x: feature.align === "left" ? -35 : 35,
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
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="flex items-center"
    >

      <div className="max-w-xl">

        <div
          className="
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-white/[0.09]
            bg-white/[0.03]
            px-3
            py-1.5
            text-[10px]
            font-bold
            tracking-[0.2em]
            text-white/60
          "
        >
          <Icon className="h-3.5 w-3.5 text-cyan-300" />
          {feature.eyebrow}
        </div>

        <h3
          className="
            mt-6
            text-4xl
            font-black
            leading-tight
            tracking-[-0.03em]
            sm:text-5xl
          "
        >
          {feature.title}
        </h3>

        <p
          className="
            mt-5
            text-base
            leading-7
            text-white/60
            sm:text-lg
          "
        >
          {feature.description}
        </p>

      </div>

    </motion.div>
  );

  const visualBlock = (
    <motion.div
      initial={{
        opacity: 0,
        x: feature.align === "left" ? 35 : -35,
        scale: 0.96,
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
        duration: 0.75,
        delay: 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <ScreenshotFrame
        src={feature.image}
        alt={feature.title}
      />
    </motion.div>
  );

  return (
    <div
      className={`
        grid
        gap-14
        lg:grid-cols-2
        lg:items-center
        ${index > 0 ? "pt-10" : ""}
      `}
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
  return (
    <motion.div
      whileHover={{
        y: -5,
        scale: 1.005,
      }}
      transition={{
        duration: 0.4,
        ease: "easeOut",
      }}
      className={`
        group
        relative
        overflow-hidden
        rounded-[26px]
        border
        border-white/[0.09]
        bg-[#090b11]
        shadow-[0_35px_100px_rgba(0,0,0,.45)]
        ${className}
      `}
    >

      {/* =================================================
          TOP CHROME
      ================================================== */}

      <div
        className="
          relative
          z-10
          flex
          h-10
          items-center
          gap-1.5
          border-b
          border-white/[0.06]
          bg-white/[0.025]
          px-4
        "
      >

       <div
  className="
    relative
    z-10
    flex
    h-10
    items-center
    gap-1.5
    border-b
    border-white/[0.06]
    bg-[#111318]/90
    px-4
    backdrop-blur-xl
  "
>
  <div className="flex items-center gap-1.5">
    <motion.span
      whileHover={{ scale: 1.2 }}
      className="
        h-2.5
        w-2.5
        rounded-full
        bg-[#ff5f57]
        shadow-[0_0_8px_rgba(255,95,87,.25)]
      "
    />

    <motion.span
      whileHover={{ scale: 1.2 }}
      className="
        h-2.5
        w-2.5
        rounded-full
        bg-[#febc2e]
        shadow-[0_0_8px_rgba(254,188,46,.22)]
      "
    />

    <motion.span
      whileHover={{ scale: 1.2 }}
      className="
        h-2.5
        w-2.5
        rounded-full
        bg-[#28c840]
        shadow-[0_0_8px_rgba(40,200,64,.22)]
      "
    />
  </div>

  <div
    className="
      ml-3
      h-2
      w-28
      rounded-full
      bg-white/[0.035]
    "
  />
</div>

        <div
          className="
            ml-3
            h-2
            w-28
            rounded-full
            bg-white/[0.035]
          "
        />

      </div>

      {/* =================================================
          IMAGE
      ================================================== */}

      <div className="relative overflow-hidden">

        <img
          src={src}
          alt={alt}
          className="
            block
            w-full
            object-cover
            transition-transform
            duration-1000
            ease-out
            group-hover:scale-[1.015]
          "
          loading="lazy"
        />

        {/* =================================================
            VERY LIGHT TOP GLASS
        ================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            top-0
            h-20
            bg-gradient-to-b
            from-[#030408]/30
            to-transparent
          "
        />

        {/* =================================================
            BOTTOM FADE — LIGHTER
        ================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-0
            h-28
            bg-gradient-to-t
            from-[#030408]/55
            via-[#030408]/15
            to-transparent
          "
        />

        {/* =================================================
            BOTTOM GLOW
        ================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            -bottom-24
            left-1/2
            h-48
            w-3/4
            -translate-x-1/2
            rounded-full
            bg-violet-500/[0.07]
            blur-[80px]
          "
        />

        {/* =================================================
            CYAN EDGE
        ================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-x-[15%]
            bottom-0
            h-px
            bg-gradient-to-r
            from-transparent
            via-cyan-400/20
            to-transparent
          "
        />

        {/* =================================================
            HOVER LIGHT
        ================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-r
            from-transparent
            via-white/[0.025]
            to-transparent
            opacity-0
            transition-opacity
            duration-700
            group-hover:opacity-100
          "
        />

      </div>

    </motion.div>
  );
}