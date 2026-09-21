import {
  createFileRoute,
} from "@tanstack/react-router";

import PlannerPage from "@/features/planner/PlannerPage";

export const Route = createFileRoute(
  "/planner",
)({
  component: PlannerPage,
});