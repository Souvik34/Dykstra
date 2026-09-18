import { useState } from "react";

import BinarySearchVisualizer from "./BinarySearchVisualizer";
import DijkstraVisualizer from "./DijkstraVisualizer";
import SlidingWindowVisualizer from "./SlidingWindowVisualizer";
import TwoPointersVisualizer from "./TwoPointersVisualizer";

import "../index.css";

function VisualizerPage() {
  const [selectedAlgorithm, setSelectedAlgorithm] =
    useState("binary-search");

  return (
    <div className="visualizer-page">
      <div className="visualizer-sidebar">
        <button
          onClick={() => setSelectedAlgorithm("binary-search")}
          className={
            selectedAlgorithm === "binary-search"
              ? "active"
              : ""
          }
        >
          Binary Search
        </button>

        <button
          onClick={() => setSelectedAlgorithm("dijkstra")}
          className={
            selectedAlgorithm === "dijkstra"
              ? "active"
              : ""
          }
        >
          Dijkstra
        </button>

        <button
          onClick={() => setSelectedAlgorithm("sliding-window")}
          className={
            selectedAlgorithm === "sliding-window"
              ? "active"
              : ""
          }
        >
          Sliding Window
        </button>

        <button
          onClick={() => setSelectedAlgorithm("two-pointers")}
          className={
            selectedAlgorithm === "two-pointers"
              ? "active"
              : ""
          }
        >
          Two Pointers
        </button>
      </div>

      <div className="visualizer-content">
        {selectedAlgorithm === "binary-search" && (
          <BinarySearchVisualizer />
        )}

        {selectedAlgorithm === "dijkstra" && (
          <DijkstraVisualizer />
        )}

        {selectedAlgorithm === "sliding-window" && (
          <SlidingWindowVisualizer />
        )}

        {selectedAlgorithm === "two-pointers" && (
          <TwoPointersVisualizer />
        )}
      </div>
    </div>
  );
}

export default VisualizerPage;