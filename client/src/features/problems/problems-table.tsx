/* eslint-disable prettier/prettier */

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { createPortal } from "react-dom";
import {
  Bookmark,
  BookmarkCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  FileText,
  Flame,
  RotateCcw,
  Search,
  Target,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";
import { useProblemsStore } from "@/store/problems-store";

import type {
  Problem,
  BackendProblem,
  Difficulty,
  ProblemsResponse
} from "./problems-data";

import problemService from "../../services/problemService";
import revisionService from "@/services/revisionService";
import { NotesDialog } from "./notes-dialog";
import { toast } from "sonner";

/* =========================================================
   CONSTANTS
========================================================= */

const LIMIT = 50;

const ACCORDION_STORAGE_KEY =
  "Dykstra-problems-open-topics";

const difficultyClasses: Record<Difficulty, string> = {
  Easy:
    "border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-300",

  Medium:
    "border-amber-400/30 bg-amber-400/[0.08] text-amber-300",

  Hard:
    "border-red-400/30 bg-red-400/[0.08] text-red-300",
};

/* =========================================================
   HELPERS
========================================================= */

const formatDifficulty = (d?: string): Difficulty => {
  if (!d) return "Easy";

  const value = d.toLowerCase();

  if (value === "easy") return "Easy";
  if (value === "medium") return "Medium";
  if (value === "hard") return "Hard";

  return "Easy";
};

const getTopicKey = (topic?: string) =>
  topic?.trim() || "General";

/* =========================================================
   COMPONENT
========================================================= */

export function ProblemsTable() {
  const navigate = useNavigate();

  const searchParams = useSearch({
    from: "/problems",
  });

  const roadmapMode = searchParams.source === "roadmap";

  const roadmapIds = useMemo(
    () =>
      searchParams.ids
        ? searchParams.ids
            .split(",")
            .map(Number)
            .filter(Boolean)
        : [],
    [searchParams.ids],
  );

  /* =======================================================
     STORE
  ======================================================= */

  const byId = useProblemsStore((s) => s.byId);

  const startProblem = useProblemsStore(
    (s) => s.startProblem,
  );

  const activeProblemId = useProblemsStore(
    (s) => s.activeProblemId,
  );

  const removeStartedProblem = useProblemsStore(
    (s) => s.removeStartedProblem,
  );

  const clearActiveProblem = useProblemsStore(
    (s) => s.clearActiveProblem,
  );

  const markSolved = useProblemsStore(
    (s) => s.markSolved,
  );

  const startedProblems = useProblemsStore(
    (s) => s.startedProblems,
  );

  const toggleRevision = useProblemsStore(
    (s) => s.toggleRevision,
  );

  const toggleBookmark = useProblemsStore(
    (s) => s.toggleBookmark,
  );

  const hydrateSolved = useProblemsStore(
    (s) => s.hydrateSolved,
  );

  const hydrateBookmarks = useProblemsStore(
    (s) => s.hydrateBookmarks,
  );

  const hydrateNotes = useProblemsStore(
    (s) => s.hydrateNotes,
  );

  const hydrateRevision = useProblemsStore(
    (s) => s.hydrateRevision,
  );

  /* =======================================================
     LOCAL STATE
  ======================================================= */

  const [query, setQuery] = useState("");

  const [topic, setTopic] =
    useState<string>("all");

  const [difficulty, setDifficulty] =
    useState<string>("all");

  const [status, setStatus] =
    useState<string>("all");
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const [notesFor, setNotesFor] =
    useState<Problem | null>(null);

  const [problems, setProblems] =
    useState<Problem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [warningProblem, setWarningProblem] =
    useState<Problem | null>(null);

  /*
   * null means:
   * We haven't restored the user's preference yet.
   */
  const [openTopics, setOpenTopics] =
    useState<string[] | null>(null);

  /* =======================================================
     RESTORE ACCORDION STATE
  ======================================================= */

  useEffect(() => {
    try {
      const stored = localStorage.getItem(
        ACCORDION_STORAGE_KEY,
      );

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setOpenTopics(parsed);
          return;
        }
      }

      /*
       * No previous preference:
       * first topic will be opened after data loads.
       */
      setOpenTopics(null);
    } catch (error) {
      console.error(
        "Failed to restore accordion state:",
        error,
      );

      setOpenTopics(null);
    }
  }, []);

  /* =======================================================
     SAVE ACCORDION STATE
  ======================================================= */

  useEffect(() => {
    if (openTopics === null) return;

    localStorage.setItem(
      ACCORDION_STORAGE_KEY,
      JSON.stringify(openTopics),
    );
  }, [openTopics]);

  /* =======================================================
     BODY LOCK FOR WARNING MODAL
  ======================================================= */

  useEffect(() => {
    document.body.style.overflow = warningProblem
      ? "hidden"
      : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [warningProblem]);

  /* =======================================================
     REVISION GATE
  ======================================================= */

  useEffect(() => {
    const checkRevisionGate = async () => {
      try {
        const res =
          await revisionService.getDueRevisions();

        if (res.blocked) {
          toast.warning(
            "Complete your pending revisions before continuing.",
          );

          window.location.href = "/revisions";
        }
      } catch (error) {
        console.error(
          "Revision gate check failed:",
          error,
        );
      }
    };

    checkRevisionGate();
  }, []);

  /* =======================================================
     LOAD ALL PROBLEMS
     
     Backend still paginates internally.
     UI does NOT.
  ======================================================= */

  useEffect(() => {
    let ignore = false;

    const loadAllProblems = async () => {
      try {
        setLoading(true);

        let data: BackendProblem[] = [];

        /* =================================================
           ROADMAP MODE
        ================================================= */

        if (
          roadmapMode &&
          roadmapIds.length > 0
        ) {
          const roadmapProblems =
            await Promise.all(
              roadmapIds.map((id) =>
                problemService.getById(id),
              ),
            );

          data =
            roadmapProblems.filter(Boolean);
        }

        /* =================================================
           NORMAL MODE
           
           Fetch every backend page.
        ================================================= */

        else {
          let currentPage = 1;

          while (true) {
          const response = await problemService.list({
  page: currentPage,
  limit: LIMIT,
});

data.push(...response.problems);

if (currentPage === 1) {
  setLastUpdated(response.lastUpdated);
}

if (response.problems.length < LIMIT) {
  break;
}

            currentPage++;
          }
        }

        /* =================================================
           USER PROGRESS
        ================================================= */

        const [
          progress,
          bookmarks,
          notes,
          revisions,
        ] = await Promise.all([
          problemService.getProgress(),
          problemService.getBookmarks(),
          problemService.getNotes(),
          revisionService.getAllRevisions(),
        ]);

        const solvedIds = progress.map(
          (p: { problem_id: number }) =>
            p.problem_id,
        );

        hydrateSolved(solvedIds);

        hydrateBookmarks(
          bookmarks.map(
            (b: { problem_id: number }) =>
              b.problem_id,
          ),
        );

        hydrateNotes(notes);

        hydrateRevision(
          revisions.revisions
            .filter(
              (r) => !r.is_completed,
            )
            .map(
              (r) => r.problem_id,
            ),
        );

        /* =================================================
           MAP BACKEND → UI
        ================================================= */

        const mappedProblems: Problem[] =
          data.map((p) => ({
            id: p.id,
            title: p.title,
            difficulty: formatDifficulty(
              p.difficulty,
            ),
            topic: p.topic,
            companies: [],
            leetcodeUrl:
              p.question_link,
             updatedAt: p.updatedAt,
              
          }));

        if (!ignore) {
          setProblems(mappedProblems);
        }
      } catch (error) {
        console.error(
          "Failed to load problems:",
          error,
        );

        if (!ignore) {
          setProblems([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadAllProblems();

    return () => {
      ignore = true;
    };
  }, [
    roadmapMode,
    roadmapIds,
    hydrateSolved,
    hydrateBookmarks,
    hydrateNotes,
    hydrateRevision,
  ]);

  /* =======================================================
     FILTERED PROBLEMS
  ======================================================= */

  const filtered = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase();

    return problems.filter((p) => {
      if (
        normalizedQuery &&
        !p.title
          .toLowerCase()
          .includes(normalizedQuery)
      ) {
        return false;
      }

      if (
        topic !== "all" &&
        getTopicKey(p.topic) !== topic
      ) {
        return false;
      }

      if (
        difficulty !== "all" &&
        p.difficulty !== difficulty
      ) {
        return false;
      }

      const st = byId[p.id];

      if (
        status === "solved" &&
        !st?.solved
      ) {
        return false;
      }

      if (
        status === "unsolved" &&
        st?.solved
      ) {
        return false;
      }

      if (
        status === "revision" &&
        !st?.revision
      ) {
        return false;
      }

      if (
        status === "bookmarked" &&
        !st?.bookmarked
      ) {
        return false;
      }

      return true;
    });
  }, [
    problems,
    query,
    topic,
    difficulty,
    status,
    byId,
  ]);

  /* =======================================================
     GROUP BY TOPIC
  ======================================================= */

  const groupedProblems = useMemo(() => {
    const groups = new Map<
      string,
      Problem[]
    >();

    filtered.forEach((problem) => {
      const key = getTopicKey(
        problem.topic,
      );

      if (!groups.has(key)) {
        groups.set(key, []);
      }

      groups
        .get(key)!
        .push(problem);
    });

    return Array.from(
      groups.entries(),
    );
  }, [filtered]);

  /* =======================================================
     INITIAL FIRST CARD
  ======================================================= */

  useEffect(() => {
    if (
      openTopics !== null ||
      groupedProblems.length === 0
    ) {
      return;
    }

    setOpenTopics([
      groupedProblems[0][0],
    ]);
  }, [
    groupedProblems,
    openTopics,
  ]);

  /* =======================================================
     TOGGLE TOPIC
  ======================================================= */

  const toggleTopic = (
    topicName: string,
  ) => {
    setOpenTopics((current) => {
      const existing =
        current ?? [];

      if (
        existing.includes(topicName)
      ) {
        return existing.filter(
          (topic) =>
            topic !== topicName,
        );
      }

      return [
        ...existing,
        topicName,
      ];
    });
  };

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    const total =
      problems.length;

    let solved = 0;
    let revision = 0;
    let bookmarked = 0;
    let easy = 0;
    let medium = 0;
    let hard = 0;

    problems.forEach((p) => {
      const st = byId[p.id];

      if (st?.solved) solved++;
      if (st?.revision) revision++;
      if (st?.bookmarked) bookmarked++;

      if (p.difficulty === "Easy")
        easy++;

      if (p.difficulty === "Medium")
        medium++;

      if (p.difficulty === "Hard")
        hard++;
    });

    return {
      total,
      solved,
      revision,
      bookmarked,
      easy,
      medium,
      hard,
      pct: total
        ? Math.round(
            (solved / total) * 100,
          )
        : 0,
    };
  }, [
    problems,
    byId,
  ]);

  /* =======================================================
     OPEN PROBLEM
  ======================================================= */

 const handleOpenProblem = async (p: Problem) => {
  const alreadySolved = !!byId[p.id]?.solved;

  /* =================================================
     MENTOR / ROADMAP MODE
  ================================================= */

  if (roadmapMode) {
    try {
      /*
       * -----------------------------------------------
       * ALREADY SOLVED
       *
       * This problem was solved before the mentor
       * recommended it.
       *
       * We can complete the mentor item immediately.
       * -----------------------------------------------
       */

      if (alreadySolved) {
        await problemService.completeMentorProblem(
          p.id
        );

        toast.success(
          "Mentor problem completed"
        );

        window.open(
          p.leetcodeUrl,
          "_blank"
        );

        return;
      }

      /*
       * -----------------------------------------------
       * NEW / UNSOLVED MENTOR PROBLEM
       *
       * DO NOT complete the mentor item here.
       *
       * Start it normally so the backend creates:
       *
       * problem_attempts -> STARTED
       *
       * Then the user solves it and checks the
       * solved checkbox.
       * -----------------------------------------------
       */

      await problemService.startProblem(p.id);

      startProblem(p.id);

      window.open(
        p.leetcodeUrl,
        "_blank"
      );

      return;
    } catch (error: any) {
      console.error(
        "Mentor problem start failed:",
        error
      );

      /*
       * Existing active problem
       */
      if (
        error?.response?.status === 403
      ) {
        const blockedProblemId =
          error?.response?.data?.problemId;

        if (blockedProblemId) {
          startProblem(blockedProblemId);

          const previous =
            problems.find(
              (item) =>
                String(item.id) ===
                String(blockedProblemId)
            );

          if (previous) {
            setWarningProblem(
              previous
            );

            return;
          }
        }

        toast.error(
          "You already have a problem in progress."
        );

        return;
      }

      toast.error(
        "Failed to start mentor problem"
      );

      return;
    }
  }

  /* =================================================
     ALREADY SOLVED — NORMAL MODE
  ================================================= */

  if (alreadySolved) {
    window.open(
      p.leetcodeUrl,
      "_blank"
    );

    return;
  }

  /* =================================================
     ANOTHER ACTIVE PROBLEM — NORMAL MODE
  ================================================= */

  if (
    activeProblemId &&
    activeProblemId !== String(p.id) &&
    !byId[activeProblemId]?.solved
  ) {
    const previous =
      problems.find(
        (item) =>
          String(item.id) ===
          String(activeProblemId)
      );

    if (previous) {
      setWarningProblem(previous);
      return;
    }
  }

  /* =================================================
     START NORMAL PROBLEM
  ================================================= */

  try {
    await problemService.startProblem(
      p.id
    );

    startProblem(p.id);

    window.open(
      p.leetcodeUrl,
      "_blank"
    );
  } catch (error: any) {
    console.error(
      "Start problem failed:",
      error
    );

    if (
      error?.response?.status === 403
    ) {
      const blockedProblemId =
        error?.response?.data?.problemId;

      if (!blockedProblemId) {
        toast.error(
          "You already have a problem in progress."
        );

        return;
      }

      startProblem(
        blockedProblemId
      );

      const previous =
        problems.find(
          (item) =>
            String(item.id) ===
            String(
              blockedProblemId
            )
        );

      if (previous) {
        setWarningProblem(
          previous
        );

        return;
      }

      try {
        const previous =
          await problemService.getById(
            blockedProblemId
          );

        const mappedPrevious: Problem = {
          id: previous.id,
          title: previous.title,
          difficulty:
            formatDifficulty(
              previous.difficulty
            ),
          topic: previous.topic,
          companies: [],
          leetcodeUrl:
            previous.question_link,
        };

        setWarningProblem(
          mappedPrevious
        );

        return;
      } catch (fetchError) {
        console.error(
          "Failed to fetch blocked problem:",
          fetchError
        );

        toast.error(
          "Could not load the active problem."
        );
      }
    }

    toast.error(
      "Failed to start problem"
    );
  }
};

  /* =======================================================
     SOLVE
  ======================================================= */

 const handleSolve = async (
  p: Problem,
) => {
  try {
    const problemId = String(p.id);

    const startTime =
      startedProblems[problemId];

    const timeTaken = startTime
      ? Math.floor(
          (Date.now() - startTime) / 60000,
        )
      : 0;

    await problemService.markSolved(
      p.id,
      p.difficulty,
      timeTaken,
    );

    markSolved(p.id);
    removeStartedProblem(p.id);
    clearActiveProblem();

    toast.success(
      "Problem marked as solved",
    );
  } catch (error: any) {
    console.error(
      "Solve failed response:",
      error?.response?.data,
    );

    console.error(
      "Solve failed status:",
      error?.response?.status,
    );

    toast.error(
      error?.response?.data?.message ||
        "Failed to mark problem as solved",
    );
  }
};

  /* =======================================================
     MENTOR COMPLETE
  ======================================================= */

  const handleMentorComplete =
    async (p: Problem) => {
      try {
        await problemService.markSolved(
          p.id,
          p.difficulty,
          0,
        );

        toast.success(
          "Mentor problem completed",
        );
      } catch (error) {
        console.error(
          "Mentor completion failed:",
          error,
        );

        toast.error(
          "Failed to complete mentor problem",
        );
      }
    };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="glass animate-pulse rounded-3xl border border-white/10 p-7">
          <div className="h-8 w-48 rounded-lg bg-white/10" />
          <div className="mt-4 h-5 w-96 max-w-full rounded bg-white/[0.06]" />

          <div className="mt-8 h-3 w-full rounded-full bg-white/[0.06]" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-2xl border border-white/10 bg-white/[0.025]"
            />
          ))}
        </div>
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="space-y-7">
      {/* ===================================================
          HEADER
      ================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 16,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.55,
          ease: [
            0.22,
            1,
            0.36,
            1,
          ],
        }}
        className="
          relative
          overflow-hidden
          rounded-3xl
          border
          border-white/[0.12]
          bg-[#090b10]
          p-7
          shadow-[0_20px_60px_rgba(0,0,0,0.28)]
        "
      >
        {/* Ambient line */}

        <motion.div
          className="
            pointer-events-none
            absolute
            -left-20
            top-0
            h-px
            w-80
            bg-gradient-to-r
            from-transparent
            via-blue-400/60
            to-transparent
          "
          animate={{
            x: [
              "-20%",
              "450%",
            ],
            opacity: [
              0,
              1,
              0,
            ],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatDelay: 4,
            ease: "easeInOut",
          }}
        />

        <div className="relative flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/[0.08] px-3.5 py-1.5 text-sm font-medium text-blue-300">
              <Target className="h-4 w-4" />
              DSA Roadmap
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Problems
            </h1>

            <p className="mt-2 max-w-2xl text-base leading-7 text-zinc-300">
              Practice, track and revise your
              problems topic by topic.
            </p>
          </div>

          {/* =================================================
              GLOBAL STATS
          ================================================= */}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <OverviewStat
              value={`${stats.solved}/${stats.total}`}
              label="Solved"
              icon={CheckCircle2}
              iconClass="text-emerald-400"
            />

            <OverviewStat
              value={`${stats.pct}%`}
              label="Progress"
              icon={Target}
              iconClass="text-blue-400"
            />

            <OverviewStat
              value={stats.revision}
              label="Revision"
              icon={RotateCcw}
              iconClass="text-amber-400"
            />

            <OverviewStat
              value={stats.bookmarked}
              label="Saved"
              icon={Bookmark}
              iconClass="text-violet-400"
            />
          </div>
   {lastUpdated && (
  <div className="mt-3 flex justify-end">
    <span className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-xs text-zinc-400">
      Last updated ·{" "}
      {new Date(lastUpdated).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}
    </span>
  </div>
)}
        </div>

        {/* =================================================
            DIFFICULTY BREAKDOWN
        ================================================= */}

        <div className="relative mt-7 flex flex-wrap gap-3">
          <DifficultyStat
            label="Easy"
            value={stats.easy}
            className="text-emerald-300"
          />

          <DifficultyStat
            label="Medium"
            value={stats.medium}
            className="text-amber-300"
          />

          <DifficultyStat
            label="Hard"
            value={stats.hard}
            className="text-red-300"
          />
        </div>

        {/* =================================================
            PROGRESS BAR
        ================================================= */}

        <div className="relative mt-7">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-300">
              Overall progress
            </span>

            <span className="text-sm font-semibold text-white">
              {stats.pct}%
            </span>
          </div>

          <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.07]">
            <motion.div
              initial={{
                width: 0,
              }}
              animate={{
                width: `${stats.pct}%`,
              }}
              transition={{
                duration: 1.1,
                ease: [
                  0.22,
                  1,
                  0.36,
                  1,
                ],
              }}
              className="h-full rounded-full"
              style={{
                background:
                  "var(--gradient-primary)",
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* ===================================================
          FILTERS
      ================================================== */}

      <div className="grid gap-3 lg:grid-cols-12">
        <div className="relative lg:col-span-5">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />

          <Input
            placeholder="Search problems..."
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            className="
              h-12
              border-white/[0.12]
              bg-[#0b0d12]
              pl-11
              text-base
              text-white
              placeholder:text-zinc-500
              focus:border-blue-400/50
            "
          />
        </div>

        <FilterSelect
          className="h-12 lg:col-span-2"
          value={topic}
          onChange={setTopic}
          placeholder="Topic"
          options={[
            {
              value: "all",
              label: "All topics",
            },
            ...Array.from(
              new Set(
                problems.map((p) =>
                  getTopicKey(
                    p.topic,
                  ),
                ),
              ),
            ).map((t) => ({
              value: t,
              label: t,
            })),
          ]}
        />

        <FilterSelect
          className="h-12 lg:col-span-2"
          value={difficulty}
          onChange={setDifficulty}
          placeholder="Difficulty"
          options={[
            {
              value: "all",
              label: "All difficulty",
            },
            {
              value: "Easy",
              label: "Easy",
            },
            {
              value: "Medium",
              label: "Medium",
            },
            {
              value: "Hard",
              label: "Hard",
            },
          ]}
        />

        <FilterSelect
          className="h-12 lg:col-span-2"
          value={status}
          onChange={setStatus}
          placeholder="Status"
          options={[
            {
              value: "all",
              label: "Any status",
            },
            {
              value: "solved",
              label: "Solved",
            },
            {
              value: "unsolved",
              label: "Unsolved",
            },
            {
              value: "revision",
              label: "For revision",
            },
            {
              value: "bookmarked",
              label: "Bookmarked",
            },
          ]}
        />

        <Button
          variant="outline"
          className="
            h-12
            border-white/[0.12]
            bg-white/[0.025]
            text-zinc-200
            hover:bg-white/[0.07]
          "
          onClick={() => {
            setQuery("");
            setTopic("all");
            setDifficulty("all");
            setStatus("all");
          }}
        >
          <X className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>

      {/* ===================================================
          TOPIC CARDS
      ================================================== */}

      <div className="space-y-4">
        {groupedProblems.map(
          (
            [topicName, topicProblems],
            topicIndex,
          ) => {
            const isOpen =
              openTopics?.includes(
                topicName,
              ) ?? false;

            const solvedCount =
              topicProblems.filter(
                (p) =>
                  byId[p.id]
                    ?.solved,
              ).length;

            const progress =
              topicProblems.length
                ? Math.round(
                    (solvedCount /
                      topicProblems.length) *
                      100,
                  )
                : 0;

            return (
              <motion.div
                key={topicName}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay:
                    topicIndex * 0.035,
                  duration: 0.45,
                }}
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/[0.13]
                  bg-[#090b10]
                  shadow-[0_12px_40px_rgba(0,0,0,0.18)]
                "
              >
                {/* =================================================
                    TOPIC HEADER
                ================================================= */}

                <button
                  type="button"
                  onClick={() =>
                    toggleTopic(
                      topicName,
                    )
                  }
                  className="
                    group
                    flex
                    w-full
                    items-center
                    gap-4
                    p-5
                    text-left
                    transition-colors
                    duration-300
                    hover:bg-white/[0.035]
                  "
                >
                  {/* Number */}

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-blue-400/20
                      bg-blue-400/[0.07]
                      text-sm
                      font-bold
                      text-blue-300
                    "
                  >
                    {String(
                      topicIndex + 1,
                    ).padStart(
                      2,
                      "0",
                    )}
                  </div>

                  {/* Title */}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-semibold text-white">
                        {topicName}
                      </h2>

                      <span className="rounded-full border border-white/[0.11] bg-white/[0.04] px-2.5 py-1 text-sm font-medium text-zinc-300">
                        {
                          topicProblems.length
                        }{" "}
                        problems
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-1.5 max-w-[180px] flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                        <motion.div
                          initial={{
                            width: 0,
                          }}
                          animate={{
                            width: `${progress}%`,
                          }}
                          transition={{
                            duration: 0.8,
                          }}
                          className="h-full rounded-full"
                          style={{
                            background:
                              "var(--gradient-primary)",
                          }}
                        />
                      </div>

                      <span className="text-sm font-medium text-zinc-300">
                        {solvedCount}/
                        {
                          topicProblems.length
                        }{" "}
                        solved
                      </span>
                    </div>
                  </div>

                  {/* Difficulty mini breakdown */}

                  <div className="hidden items-center gap-2 md:flex">
                    <TopicDifficulty
                      problems={
                        topicProblems
                      }
                      difficulty="Easy"
                    />

                    <TopicDifficulty
                      problems={
                        topicProblems
                      }
                      difficulty="Medium"
                    />

                    <TopicDifficulty
                      problems={
                        topicProblems
                      }
                      difficulty="Hard"
                    />
                  </div>

                  {/* Chevron */}

                  <motion.div
                    animate={{
                      rotate: isOpen
                        ? 180
                        : 0,
                    }}
                    transition={{
                      duration: 0.25,
                      ease: [
                        0.22,
                        1,
                        0.36,
                        1,
                      ],
                    }}
                    className="shrink-0 text-zinc-400"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </motion.div>
                </button>

                {/* =================================================
                    PROBLEM LIST
                ================================================= */}

                <AnimatePresence
                  initial={false}
                >
                  {isOpen && (
                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0,
                      }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 0.32,
                        ease: [
                          0.22,
                          1,
                          0.36,
                          1,
                        ],
                      }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-white/[0.09] p-3 md:p-4">
                        <div className="space-y-2">
                          {topicProblems.map(
                            (
                              problem,
                              problemIndex,
                            ) => (
                              <ProblemRow
                                key={
                                  problem.id
                                }
                                problem={
                                  problem
                                }
                                index={
                                  problemIndex
                                }
                                state={
                                  byId[
                                    problem
                                      .id
                                  ]
                                }
                                roadmapMode={
                                  roadmapMode
                                }
                                onOpen={() =>
                                  handleOpenProblem(
                                    problem,
                                  )
                                }
                                onSolve={() =>
                                  handleSolve(
                                    problem,
                                  )
                                }
                                onMentorComplete={() =>
                                  handleMentorComplete(
                                    problem,
                                  )
                                }
                                onRevision={async () => {
                                  try {
                                    const st =
                                      byId[
                                        problem
                                          .id
                                      ];

                                    if (
                                      !st?.solved
                                    ) {
                                      toast.error(
                                        "Solve the problem before adding it to your revision queue.",
                                      );

                                      return;
                                    }

                                    if (
                                      st?.revision
                                    ) {
                                      toast.info(
                                        "Already added to revision queue",
                                      );

                                      return;
                                    }

                                    await revisionService.addRevision(
                                      problem.id,
                                    );

                                    toggleRevision(
                                      problem.id,
                                    );

                                    toast.success(
                                      "Added to revision queue",
                                    );
                                  } catch (error) {
                                    console.error(
                                      "Revision toggle failed:",
                                      error,
                                    );

                                    toast.error(
                                      "Failed to add problem to revision queue.",
                                    );
                                  }
                                }}
                                onBookmark={async () => {
                                  try {
                                    const st =
                                      byId[
                                        problem
                                          .id
                                      ];

                                    if (
                                      st?.bookmarked
                                    ) {
                                      await problemService.removeBookmark(
                                        problem.id,
                                      );
                                    } else {
                                      await problemService.addBookmark(
                                        problem.id,
                                      );
                                    }

                                    toggleBookmark(
                                      problem.id,
                                    );
                                  } catch (error) {
                                    console.error(
                                      error,
                                    );

                                    toast.error(
                                      "Failed to update bookmark",
                                    );
                                  }
                                }}
                                onNotes={() =>
                                  setNotesFor(
                                    problem,
                                  )
                                }
                              />
                            ),
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          },
        )}

        {/* Empty */}

        {groupedProblems.length === 0 && (
          <div className="rounded-2xl border border-white/[0.12] bg-[#090b10] py-16 text-center">
            <Search className="mx-auto h-8 w-8 text-zinc-500" />

            <h3 className="mt-4 text-lg font-semibold text-white">
              No problems found
            </h3>

            <p className="mt-2 text-base text-zinc-400">
              Try changing your filters or
              search query.
            </p>
          </div>
        )}
      </div>

      {/* ===================================================
          NOTES
      ================================================== */}

      <NotesDialog
        problem={notesFor}
        open={!!notesFor}
        onOpenChange={(open) => {
          if (!open) {
            setNotesFor(null);
          }
        }}
      />

      {/* ===================================================
          ACTIVE PROBLEM WARNING
      ================================================== */}

      {warningProblem &&
        createPortal(
          <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.94,
                y: 10,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              className="
                w-full
                max-w-md
                rounded-3xl
                border
                border-white/[0.14]
                bg-[#0b0d12]
                p-7
                shadow-[0_30px_100px_rgba(0,0,0,0.55)]
              "
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/[0.08]">
                  <Flame className="h-5 w-5 text-amber-400" />
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Problem already in progress
                  </h2>

                  <p className="mt-2 text-base leading-7 text-zinc-300">
                    You started{" "}
                    <span className="font-semibold text-white">
                      "{warningProblem.title}"
                    </span>
                    . Finish it before
                    starting another problem.
                  </p>
                </div>
              </div>

              <div className="mt-7 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-white/[0.13] bg-white/[0.03] text-zinc-200"
                  onClick={() =>
                    setWarningProblem(
                      null,
                    )
                  }
                >
                  Cancel
                </Button>

                <Button
                  className="flex-1"
                  onClick={() => {
                    window.open(
                      warningProblem.leetcodeUrl,
                      "_blank",
                    );

                    setWarningProblem(
                      null,
                    );
                  }}
                >
                  Continue Previous
                </Button>
              </div>
            </motion.div>
          </div>,
          document.body,
        )}
    </div>
  );
}

/* =========================================================
   PROBLEM ROW
========================================================= */

function ProblemRow({
  problem,
  index,
  state,
  roadmapMode,
  onOpen,
  onSolve,
  onMentorComplete,
  onRevision,
  onBookmark,
  onNotes,
}: {
  problem: Problem;
  index: number;
  state: any;
  roadmapMode: boolean;
  onOpen: () => void;
  onSolve: () => void;
  onMentorComplete: () => void;
  onRevision: () => void;
  onBookmark: () => void;
  onNotes: () => void;
}) {
  const solved = !!state?.solved;

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: -8,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        delay: index * 0.015,
        duration: 0.3,
      }}
      whileHover={{
        x: 2,
      }}
      className={cn(
        `
          group
          flex
          flex-col
          gap-4
          rounded-xl
          border
          px-4
          py-4
          transition-all
          duration-300
          md:flex-row
          md:items-center
        `,
        solved
          ? "border-emerald-400/20 bg-emerald-400/[0.025]"
          : "border-white/[0.10] bg-white/[0.018] hover:border-blue-400/25 hover:bg-blue-400/[0.025]",
      )}
    >
      {/* Number */}

      <div
        className={cn(
          "hidden w-8 shrink-0 text-center text-sm font-semibold md:block",
          solved
            ? "text-emerald-400"
            : "text-zinc-500",
        )}
      >
        {String(index + 1).padStart(
          2,
          "0",
        )}
      </div>

      {/* Checkbox */}

      <Checkbox
        checked={solved}
        disabled={
          solved && !roadmapMode
        }
        onCheckedChange={() => {
          if (
            roadmapMode &&
            solved
          ) {
            onMentorComplete();
            return;
          }

          if (solved) return;

          onSolve();
        }}
        className="h-5 w-5 shrink-0"
        aria-label="Mark solved"
      />

      {/* Problem */}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "text-base font-semibold leading-6",
              solved
                ? "text-zinc-300"
                : "text-white",
            )}
          >
            {problem.title}
          </span>

          {solved && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-2 py-0.5 text-sm font-medium text-emerald-300">
              <Check className="h-3.5 w-3.5" />
              Solved
            </span>
          )}

          {state?.revision && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/[0.08] px-2 py-0.5 text-sm font-medium text-amber-300">
              <RotateCcw className="h-3.5 w-3.5" />
              Revision
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-md border px-2.5 py-1 text-sm font-medium",
              difficultyClasses[
                problem.difficulty
              ],
            )}
          >
            {problem.difficulty}
          </span>

          <span className="text-sm text-zinc-400">
            {problem.topic ||
              "General"}
          </span>

          
        </div>
      </div>

      {/* Actions */}

      <div className="flex items-center gap-1 border-t border-white/[0.07] pt-3 md:border-0 md:pt-0">
        <IconAction
          title={
            state?.revision
              ? "Remove from revision"
              : "Mark for revision"
          }
          active={
            !!state?.revision
          }
          onClick={onRevision}
        >
          <RotateCcw className="h-[18px] w-[18px]" />
        </IconAction>

        <IconAction
          title={
            state?.bookmarked
              ? "Remove bookmark"
              : "Bookmark"
          }
          active={
            !!state?.bookmarked
          }
          onClick={onBookmark}
        >
          {state?.bookmarked ? (
            <BookmarkCheck className="h-[18px] w-[18px]" />
          ) : (
            <Bookmark className="h-[18px] w-[18px]" />
          )}
        </IconAction>

        <IconAction
          title={
            state?.notes
              ? "Edit notes"
              : "Add notes"
          }
          active={!!state?.notes}
          onClick={onNotes}
        >
          <FileText className="h-[18px] w-[18px]" />
        </IconAction>

        <Button
          variant="ghost"
          size="icon"
          title="Open on LeetCode"
          onClick={onOpen}
          className="
            ml-1
            h-9
            w-9
            text-zinc-400
            transition-all
            hover:bg-blue-400/[0.08]
            hover:text-blue-300
          "
        >
          <ExternalLink className="h-[18px] w-[18px]" />
        </Button>
      </div>
    </motion.div>
  );
}

/* =========================================================
   OVERVIEW STAT
========================================================= */

function OverviewStat({
  value,
  label,
  icon: Icon,
  iconClass,
}: {
  value: string | number;
  label: string;
  icon: any;
  iconClass: string;
}) {
  return (
    <div className="min-w-[105px] rounded-xl border border-white/[0.11] bg-white/[0.025] px-4 py-3">
      <div className="flex items-center gap-2">
        <Icon
          className={cn(
            "h-4 w-4",
            iconClass,
          )}
        />

        <span className="text-sm font-medium text-zinc-400">
          {label}
        </span>
      </div>

      <div className="mt-1 text-xl font-bold text-white">
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   DIFFICULTY STAT
========================================================= */

function DifficultyStat({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/[0.09] bg-white/[0.025] px-3 py-2">
      <span
        className={cn(
          "text-sm font-semibold",
          className,
        )}
      >
        {label}
      </span>

      <span className="text-sm font-medium text-zinc-300">
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   TOPIC DIFFICULTY
========================================================= */

function TopicDifficulty({
  problems,
  difficulty,
}: {
  problems: Problem[];
  difficulty: Difficulty;
}) {
  const count =
    problems.filter(
      (p) =>
        p.difficulty ===
        difficulty,
    ).length;

  if (!count) return null;

  const className =
    difficulty === "Easy"
      ? "text-emerald-300 border-emerald-400/20 bg-emerald-400/[0.06]"
      : difficulty ===
          "Medium"
        ? "text-amber-300 border-amber-400/20 bg-amber-400/[0.06]"
        : "text-red-300 border-red-400/20 bg-red-400/[0.06]";

  return (
    <span
      className={cn(
        "rounded-md border px-2 py-1 text-sm font-medium",
        className,
      )}
    >
      {count}
    </span>
  );
}

/* =========================================================
   ICON ACTION
========================================================= */

function IconAction({
  children,
  title,
  active,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      title={title}
      onClick={onClick}
      className={cn(
        "h-9 w-9 text-zinc-400 transition-all duration-200",
        "hover:bg-white/[0.07] hover:text-white",
        active &&
          "bg-blue-400/[0.08] text-blue-300",
      )}
    >
      {children}
    </Button>
  );
}

/* =========================================================
   FILTER SELECT
========================================================= */

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: {
    value: string;
    label: string;
  }[];
  className?: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={onChange}
    >
      <SelectTrigger
        className={cn(
          "border-white/[0.12] bg-[#0b0d12] text-base text-zinc-200",
          className,
        )}
      >
        <SelectValue
          placeholder={placeholder}
        />
      </SelectTrigger>

      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="text-base"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}