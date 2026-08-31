/* eslint-disable prettier/prettier */
import { useMemo, useState, useEffect} from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import interviewService from "@/services/interviewService";
import { useInterviewSocket } from "@/socket/useInterviewSocket";
import { requireAuth } from "@/lib/route-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  CodeEditor,
  STARTER_CODE,
  SUPPORTED_LANGUAGES,
  type SupportedLanguageId,
} from "@/features/editor/code-editor";
import AIInterviewerPanel from "@/features/interview/ai-interviewer-panel";


export const Route = createFileRoute("/workspace/$sessionId")({
  beforeLoad: ({ location }) => requireAuth(location),
  head: () => ({
    meta: [
      { title: "Interview Workspace · Dykstra" },
      {
        name: "description",
        content:
          "Live DSA workspace with Monaco editor and AI interviewer interruptions.",
      },
    ],
  }),
  component: WorkspacePage,
});

function WorkspacePage() {
  const { joinInterview } = useInterviewSocket()!;
 const { sessionId } = Route.useParams();
  const [problem, setProblem] = useState<any>(null);
const [loading, setLoading] = useState(true);
const navigate = useNavigate();
const [endDialogOpen, setEndDialogOpen] = useState(false);
const [endingInterview, setEndingInterview] = useState(false);


useEffect(() => {
const loadInterview = async () => {
    try {

        const data =
            await interviewService.getById(sessionId);

        setProblem(data.firstQuestion);
        setLanguage(data.session.language);
        setCode(data.firstQuestion.starterCode);

    } catch (err) {

        console.error(err);

    } finally {

        setLoading(false);

    }
};

 loadInterview();
}, [sessionId]);

  const [language, setLanguage] = useState<SupportedLanguageId>("python");
  const [code, setCode] = useState<string>(STARTER_CODE.python);
  const [submitting, setSubmitting] = useState(false);

  const onLanguageChange = (value: string) => {
    const next = value as SupportedLanguageId;
    setLanguage(next);
    setCode(STARTER_CODE[next]);
  };

  // const onSubmit = async () => {
  //   setSubmitting(true);
  //   const t = toast.loading("Submitting your solution…");
  //   try {
  //     await problemService
  //       .submitSolution?.(problemId, { language, code })
  //       .catch(() => null);
  //     toast.success("Solution submitted!", { id: t });
  //   } catch (err: any) {
  //     toast.error(err?.message ?? "Submission failed", { id: t });
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

const onSubmit = async () => {

  try {

    setSubmitting(true);
const response =
  await interviewService.submitAIResponse(
    sessionId,
    {
      message: "I have completed my implementation.",
      code,
      isSubmission: true,
    }
  );
console.log(response);

  } catch (err) {

    console.error(err);

  } finally {

    setSubmitting(false);

  }

};

const onEndInterview = async () => {
  try {
    setEndingInterview(true);

    await interviewService.endInterview(sessionId);

    await navigate({
      to: "/interview/$sessionId/report",
      params: {
        sessionId,
      },
    });
  } catch (err) {
    console.error(err);

    toast.error(
      "Failed to generate interview report."
    );

    // Allow the user to try again
    setEndingInterview(false);
  }
};
  if (loading) {
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

  if (!problem) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Problem not found.</p>
          <Link to="/problems" className="mt-3 inline-block text-sm text-primary hover:underline">
            Back to problems
          </Link>
        </div>
      </div>
    );
  }

  const difficultyTone =
    problem.difficulty === "Easy"
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      : problem.difficulty === "Medium"
      ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
      : "bg-rose-500/15 text-rose-400 border-rose-500/30";

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Topbar */}
      <header className="flex items-center justify-between border-b border-border/60 bg-card/40 px-4 py-3">
        <div className="flex items-center gap-3">
          
     
          <span className="text-sm font-medium">{problem.title}</span>
          <Badge variant="outline" className={difficultyTone}>
            {problem.difficulty}
          </Badge>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            {problem.topic}
          </Badge>
        </div>

    <AlertDialog
  open={endDialogOpen}
  onOpenChange={(open) => {
    // Don't allow the dialog to close while report is generating
    if (endingInterview) return;

    setEndDialogOpen(open);
  }}
>
  <AlertDialogTrigger asChild>
    <Button
      variant="destructive"
      size="sm"
      onClick={() => setEndDialogOpen(true)}
    >
      End Interview
    </Button>
  </AlertDialogTrigger>

  <AlertDialogContent
    onEscapeKeyDown={(event) => {
      if (endingInterview) {
        event.preventDefault();
      }
    }}
    onPointerDownOutside={(event) => {
      if (endingInterview) {
        event.preventDefault();
      }
    }}
  >
    <AlertDialogHeader>
      <AlertDialogTitle>
        End Interview?
      </AlertDialogTitle>

      <AlertDialogDescription>
        This will permanently end the interview.

        Your performance report will be generated immediately.

        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>

    <AlertDialogFooter>
      <AlertDialogCancel
        disabled={endingInterview}
      >
        Continue Interview
      </AlertDialogCancel>

      <AlertDialogAction
        disabled={endingInterview}
        onClick={(event) => {
          /*
           * IMPORTANT:
           * Prevent Radix AlertDialog from automatically
           * closing the modal.
           */
          event.preventDefault();

          onEndInterview();
        }}
      >
        {endingInterview
          ? "Generating Report..."
          : "End Interview"}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
      </header>

      {/* 3-pane grid */}
      <div className="grid flex-1 min-h-0 grid-cols-1 lg:grid-cols-[1fr_1.2fr_320px]">
        {/* Left: problem statement */}
        <section className="min-h-0 overflow-y-auto border-r border-border/60 p-5">
          {/* <h1 className="text-lg font-semibold">{problem.title}</h1> */}
       <div className="mt-2 flex flex-wrap gap-2">
  <Badge variant="outline">
    {problem.topic}
  </Badge>

  <Badge variant="secondary">
    {problem.difficulty}
  </Badge>

{problem.expectedConcepts?.map((tag:string)=>(
    <Badge key={tag}>
        {tag}
    </Badge>
))}
</div>

          <h2 className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Problem Statement
          </h2>
         <p className="mt-2 text-sm leading-relaxed text-foreground/90">
    {problem.problem}
</p>

          <h2 className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Constraints
          </h2>
         <ul className="mt-2 list-disc pl-5">
    {problem.constraints?.map((constraint: string) => (
        <li key={constraint}>{constraint}</li>
    ))}
</ul>

          <h2 className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Examples
          </h2>
        <div className="mt-2 space-y-4">
    {problem.examples?.map((example: any, index: number) => (
        <div
            key={index}
            className="rounded-lg border border-border/60 bg-card/60 p-3 text-sm"
        >
            <p className="font-semibold">Input</p>
            <pre>{example.input}</pre>

            <p className="mt-2 font-semibold">Output</p>
            <pre>{example.output}</pre>

            <p className="mt-2 font-semibold">Explanation</p>
            <p>{example.explanation}</p>
        </div>
    ))}
</div>
        </section>

        {/* Middle: editor */}
        <section className="flex min-h-0 flex-col">
          <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-card/30 px-3 py-2">
            <Select value={language} onValueChange={onLanguageChange}>
              <SelectTrigger className="h-8 w-[160px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button size="sm" onClick={onSubmit} disabled={submitting} className="gap-2">
              {submitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              Submit code
            </Button>
          </div>
          <div className="min-h-0 flex-1">
           <CodeEditor
    language={language}
    value={code}
    onChange={(value) => {
        // console.log("EDITOR:", value);
        setCode(value);
    }}
/>
          </div>
        </section>

        {/* Right: AI interviewer */}
 {/* Right: AI interviewer */}
<section className="min-h-0 flex flex-col border-l border-border/60">
  <AIInterviewerPanel
    sessionId={sessionId}
    language={language}
    code={code}
  />
</section>
      </div>
    </div>
  );
}
