/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import VisualizerPage from "@/visualizers/VisualizerPage";

export const Route = createFileRoute("/visualizer")({
  component: VisualizerPage,
});