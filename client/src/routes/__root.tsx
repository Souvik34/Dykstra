/* eslint-disable prettier/prettier */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import { BugReportButton } from "@/components/bug-report/BugReportButton";
import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { InterviewSocketProvider } from "@/socket/interviewSocketProvider";

/* =========================================================
   QUERY CLIENT
========================================================= */

const queryClient = new QueryClient();

/* =========================================================
   404
========================================================= */

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">
          404
        </h1>

        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="mt-6">
          <Link
            to="/"
            className="
              inline-flex
              items-center
              justify-center
              rounded-md
              bg-primary
              px-4
              py-2
              text-sm
              font-medium
              text-primary-foreground
              transition-colors
              hover:bg-primary/90
            "
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ERROR
========================================================= */

function ErrorComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  console.error(error);

  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head
          back home.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="
              inline-flex
              items-center
              justify-center
              rounded-md
              bg-primary
              px-4
              py-2
              text-sm
              font-medium
              text-primary-foreground
              transition-colors
              hover:bg-primary/90
            "
          >
            Try again
          </button>

          <a
            href="/"
            className="
              inline-flex
              items-center
              justify-center
              rounded-md
              border
              border-input
              bg-background
              px-4
              py-2
              text-sm
              font-medium
              text-foreground
              transition-colors
              hover:bg-accent
            "
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ROOT ROUTE
========================================================= */

export const Route =
  createRootRouteWithContext<{
    queryClient: QueryClient;
  }>()({
    head: () => ({
      meta: [
        {
          charSet: "utf-8",
        },

        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },

     {
  title: "Dykstra — DSA Tracking, Focused Revision & AI Interviews",
},

{
  name: "description",
  content:
    "Dykstra is a DSA tracker with focused revision and AI-powered technical interview preparation.",
},
        {
          name: "author",
          content: "Dykstra",
        },

       {
  property: "og:title",
  content: "Dykstra",
},

{
  property: "og:description",
  content:
    "Dykstra is a DSA tracker with focused revision and AI-powered technical interview preparation.",
},

        {
          property: "og:type",
          content: "website",
        },

        {
          name: "twitter:card",
          content: "summary",
        },
      ],

      links: [
  {
    rel: "stylesheet",
    href: appCss,
  },
  {
    rel: "icon",
    type: "image/svg+xml",
    href: "/favicon.svg",
  },
],

  scripts: [
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Dykstra",
        alternateName: "dykstra.in",
        url: "https://dykstra.in/",
      }),
    },
  ],
    }),

    shellComponent: RootShell,

    component: RootComponent,

    notFoundComponent: NotFoundComponent,

    errorComponent: ErrorComponent,
  });

/* =========================================================
   HTML SHELL
========================================================= */

function RootShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>

      <body>
        {children}

        <Scripts />
      </body>
    </html>
  );
}

/* =========================================================
   ROOT COMPONENT
========================================================= */

function RootComponent() {
  const location = useLocation();

  const pathname = location.pathname.toLowerCase();

  // Hide bug report widget during an active interview workspace
  const isLiveInterview = pathname.startsWith("/workspace/");

  return (
    <QueryClientProvider client={queryClient}>
      <InterviewSocketProvider>
        <Outlet />

        {!isLiveInterview && <BugReportButton />}
      </InterviewSocketProvider>

      <Toaster
        richColors
        position="top-right"
        theme="dark"
      />
    </QueryClientProvider>
  );
}