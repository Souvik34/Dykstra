/* eslint-disable prettier/prettier */
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Topbar } from "./topbar";

import { RevisionGate } from "@/features/dashboard/revision-gate";
import revisionService from "@/services/revisionService";
import type { RevisionItem } from "@/services/revisionService";

export function DashboardShell({ children }: { children: ReactNode }) {
  const [blocked, setBlocked] = useState<boolean>(false);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
const pathname = useRouterState({
  select: (state) => state.location.pathname,
});

  useEffect(() => {
    const loadRevisions = async () => {
      try {
        setLoading(true);

        const res = await revisionService.getDueRevisions();

        setBlocked(res.blocked);
        setRevisions(res.revisions);
      } catch (err) {
        console.error("revision check failed", err);
        setBlocked(false);
        setRevisions([]);
      } finally {
        setLoading(false);
      }
    };

    loadRevisions();

    // optional auto-refresh so system stays consistent
    
  }, []);

  if (loading) return null; // or a loader if you want

const isLocked = blocked && pathname !== "/revisions";
// const isLocked = true && pathname !== "/revisions";

  return (
    <>
     <RevisionGate
  blocked={isLocked}
  revisions={revisions}
  onStartRevision={() => navigate({ to: "/revisions" })}
/>

      <SidebarProvider defaultOpen>
        <div className="flex min-h-screen w-full bg-background">

       
          <div className={isLocked ? "pointer-events-none opacity-40 select-none" : ""}>
            <AppSidebar />
          </div>

          <SidebarInset className="flex min-w-0 flex-1 flex-col">

        
            <div className={isLocked ? "pointer-events-none opacity-40" : ""}>
              <Topbar />
            </div>

         
            <main
              className={`flex-1 px-4 py-6 md:px-8 md:py-8 ${
                isLocked ? "pointer-events-none select-none opacity-40" : ""
              }`}
            >
              <div className="mx-auto w-full max-w-7xl animate-fade-in-up">
                {children}
              </div>
            </main>

          </SidebarInset>
        </div>
      </SidebarProvider>
    </>
  );
}