/* eslint-disable prettier/prettier */

import { useState } from "react";

import AlgorithmSidebar from "@/anim/AlgorithmSidebar";

import GraphInput from "@/anim/GraphInput";
import BinarySearchInput from "@/anim/BinarySearchInput";
import SlidingWindowInput from "@/anim/SlidingWindowInput";
import TwoPointersInput from "@/anim/TwoPointersInput";
import TwoPointersSameDirectionInput from "@/anim/TwoPointersSameDirectionInput";

import DijkstraVisualizer from "./DijkstraVisualizer";
import BinarySearchVisualizer from "./BinarySearchVisualizer";
import SlidingWindowVisualizer from "./SlidingWindowVisualizer";
import TwoPointersVisualizer from "./TwoPointersVisualizer";
import TwoPointersSameDirectionVisualizer from "./TwoPointersSameDirectionVisualizer";

import { dijkstra } from "@/algorithms/dijkstra";
import { binarySearch } from "@/algorithms/binarySearch";
import { binarySearchAnswer } from "@/algorithms/binarySearchAnswer";

import {
  maxSumSubarrayOfSizeK,
  minSizeSubarraySum,
  longestSubstringWithoutRepeating,
} from "@/algorithms/slidingWindow";

import { twoPointersSameDirection } from "@/algorithms/twoPointersSameDirection";
import { twoPointers } from "@/algorithms/twoPointers";

import "../index.css";

function VisualizerPage() {
  const [algorithm, setAlgorithm] = useState("binary-search");

  const [visualization, setVisualization] = useState<any>(null);

  const [twoPointerPattern, setTwoPointerPattern] =
    useState("opposite-ends");

  const handleSelectAlgorithm = (selected: string) => {
    setAlgorithm(selected);
    setVisualization(null);
  };

  const handleTwoPointersSameDirection = (data: any) => {
    const result = twoPointersSameDirection(data.array);

    setVisualization({
      type: "two-pointers-same-direction",
      data,
      result,
    });
  };

  const handleDijkstra = (
    graph: any,
    start: string,
    target: string,
  ) => {
    const result = dijkstra(graph, start, target);

    setVisualization({
      type: "dijkstra",
      graph,
      start,
      target,
      result,
    });
  };

  const handleBinarySearch = (data: any) => {
    let result;

    if (data.mode === "array") {
      result = binarySearch(data.array, data.target);
    } else {
      result = binarySearchAnswer(data.piles, data.hours);
    }

    setVisualization({
      type: "binary-search",
      data,
      result,
    });
  };

  const handleSlidingWindow = (data: any) => {
    let result;

    if (data.problem === "max-sum") {
      result = maxSumSubarrayOfSizeK(
        data.array,
        data.k,
      );
    }

    if (data.problem === "min-sum") {
      result = minSizeSubarraySum(
        data.array,
        data.target,
      );
    }

    if (data.problem === "unique-string") {
      result = longestSubstringWithoutRepeating(
        data.string,
      );
    }

    setVisualization({
      type: "sliding-window",
      data,
      result,
    });
  };

  const handleTwoPointers = (data: any) => {
    let result;

    if (data.pattern === "opposite-ends") {
      result = twoPointers(
        data.array,
        data.target,
      );
    }

    setVisualization({
      type: "two-pointers",
      data,
      result,
    });
  };

  const getSlidingProblem = () => {
    if (algorithm === "sliding-window-fixed") {
      return "max-sum";
    }

    if (algorithm === "sliding-window-variable") {
      return "min-sum";
    }

    if (algorithm === "sliding-window-frequency") {
      return "unique-string";
    }

    return null;
  };

  return (
    <main className="visualizer-app">
      <AlgorithmSidebar
        selectedAlgorithm={algorithm}
        onSelect={handleSelectAlgorithm}
      />

      <section className="visualizer-workspace">
        {algorithm === "binary-search" && (
          <>
            <BinarySearchInput
              onVisualize={handleBinarySearch}
            />

            {visualization?.type === "binary-search" && (
              <BinarySearchVisualizer
                data={visualization.data}
                result={visualization.result}
              />
            )}
          </>
        )}

        {algorithm === "dijkstra" && (
          <>
            <GraphInput
              onVisualize={handleDijkstra}
            />

            {visualization?.type === "dijkstra" && (
              <DijkstraVisualizer
                graph={visualization.graph}
                start={visualization.start}
                target={visualization.target}
                result={visualization.result}
              />
            )}
          </>
        )}

        {algorithm.startsWith("sliding-window") && (
          <>
            <SlidingWindowInput
              selectedProblem={getSlidingProblem()}
              onVisualize={handleSlidingWindow}
            />

            {visualization?.type === "sliding-window" && (
              <SlidingWindowVisualizer
                data={visualization.data}
                result={visualization.result}
              />
            )}
          </>
        )}

        {algorithm === "two-pointers" && (
          <>
            <TwoPointersInput
              selectedPattern={twoPointerPattern}
              onVisualize={handleTwoPointers}
            />

            {visualization?.type === "two-pointers" && (
              <TwoPointersVisualizer
                data={visualization.data}
                result={visualization.result}
              />
            )}
          </>
        )}

        {algorithm === "two-pointers-same-direction" && (
          <>
            <TwoPointersSameDirectionInput
              onVisualize={
                handleTwoPointersSameDirection
              }
            />

            {visualization?.type ===
              "two-pointers-same-direction" && (
              <TwoPointersSameDirectionVisualizer
                data={visualization.data}
                result={visualization.result}
              />
            )}
          </>
        )}

        {[
          "bfs",
          "dfs",
          "merge-sort",
          "quick-sort",
          "heap-sort",
          "dp",
        ].includes(algorithm) && (
          <div className="coming-soon-page">
            <h1>Coming Soon</h1>

            <p>
              This visualization is part of the roadmap.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

export default VisualizerPage;