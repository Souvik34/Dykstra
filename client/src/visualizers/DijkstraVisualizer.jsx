import { useEffect, useState } from "react";
import Graph from "../anim/Graph";
import Controls from "../anim/Controls";
import Legend from "../anim/Legend";

function DijkstraVisualizer({
  graph,
  start,
  target,
  result,
}) {
  const [currentStep, setCurrentStep] =
    useState(0);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [soundEnabled, setSoundEnabled] =
    useState(true);

  const steps = result?.steps || [];

  const step =
    steps[currentStep] || null;

  /*
   * ---------------- SOUND ----------------
   */

  const playSound = (type) => {
    if (!soundEnabled) return;

    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContext) return;

    const context = new AudioContext();

    const oscillator =
      context.createOscillator();

    const gain =
      context.createGain();

    oscillator.connect(gain);
    gain.connect(context.destination);

    const frequencies = {
      visit: 420,
      explore: 300,
      relax: 620,
      path: 820,
    };

    oscillator.frequency.value =
      frequencies[type] || 400;

    oscillator.type =
      type === "path"
        ? "sine"
        : "triangle";

    gain.gain.setValueAtTime(
      0.0001,
      context.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      type === "path" ? 0.13 : 0.055,
      context.currentTime + 0.01
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      context.currentTime + 0.17
    );

    oscillator.start();

    oscillator.stop(
      context.currentTime + 0.18
    );
  };

  useEffect(() => {
    if (step) {
      playSound(step.type);
    }
    // Sound is intentionally triggered only
    // when the step changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  /*
   * ---------------- PLAYBACK ----------------
   */

  useEffect(() => {
    if (!isPlaying) return;

    if (
      currentStep >=
      steps.length - 1
    ) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStep(
        (previous) => previous + 1
      );
    }, 1500);

    return () => clearTimeout(timer);
  }, [
    isPlaying,
    currentStep,
    steps.length,
  ]);

  const playPause = () => {
    if (!steps.length) return;

    if (
      currentStep >=
      steps.length - 1
    ) {
      setCurrentStep(0);
      setIsPlaying(true);
      return;
    }

    setIsPlaying(
      (previous) => !previous
    );
  };

  const next = () => {
    setIsPlaying(false);

    setCurrentStep((previous) =>
      Math.min(
        previous + 1,
        steps.length - 1
      )
    );
  };

  const previous = () => {
    setIsPlaying(false);

    setCurrentStep((previous) =>
      Math.max(previous - 1, 0)
    );
  };

  const reset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  /*
   * ---------------- EXPLANATION ----------------
   */

  const getExplanation = () => {
    if (!step) {
      return {
        title: "Ready to begin",
        description:
          "Press Play or Next to start Dijkstra's algorithm.",
      };
    }

    if (step.type === "visit") {
      return {
        title: `Processing node ${step.node}`,
        description:
          step.node === start
            ? `We start at ${start}. Its distance is 0, so it is the first node we process.`
            : `${step.node} has the smallest known distance among the unvisited nodes, so we finalize it.`,
      };
    }

    if (step.type === "explore") {
      return {
        title: `Checking ${step.from} → ${step.to}`,
        description: `We are checking whether going through ${step.from} gives ${step.to} a shorter distance.`,
        calculation: `${step.distances[step.from]} + ${step.weight}`,
      };
    }

    if (step.type === "relax") {
      return {
        title: `Distance updated for ${step.to}`,
        description: `Going through ${step.from} gives ${step.to} a shorter route.`,
        calculation: `${step.distances[step.from]} + ${step.weight} = ${step.distance}`,
      };
    }

    if (step.type === "path") {
      return {
        title: "Shortest path found!",
        description:
          "The target has been reached. The highlighted purple route is the shortest path from the start.",
        calculation:
          step.path.join("  →  "),
      };
    }

    return {
      title: "Processing",
      description:
        "Dijkstra is working through the graph.",
    };
  };

  const explanation =
    getExplanation();

  return (
    <section className="visualizer-section">
      {/* ================= HEADER ================= */}

      <div className="visualizer-title">
        <div>
          <div className="eyebrow">
            VISUAL ALGORITHM
          </div>

          <h2>
            Dijkstra's Algorithm
          </h2>

          <p>
            Finding the shortest path from{" "}
            <strong>{start}</strong> to{" "}
            <strong>{target}</strong>
          </p>
        </div>

        <div className="complexity-badge">
          O((V + E) log V)
        </div>
      </div>

      {/* ================= MAIN ================= */}

      <div className="visualizer-main">
        {/* GRAPH */}

        <div className="graph-area">
          <div className="graph-container">
            <Graph
              graph={graph}
              step={step}
              start={start}
              target={target}
            />
          </div>

          <Legend />
        </div>

        {/* EXPLANATION */}

        <aside className="explanation-panel">
          <div className="step-label">
            STEP {steps.length ? currentStep + 1 : 0}
            <span>
              {" "}
              / {steps.length}
            </span>
          </div>

          <h3>
            {explanation.title}
          </h3>

          <p className="explanation-text">
            {explanation.description}
          </p>

          {explanation.calculation && (
            <div className="calculation-box">
              {explanation.calculation}
            </div>
          )}

          {/* DISTANCES */}

          {step?.distances && (
            <div className="distance-panel">
              <div className="panel-heading">
                DISTANCES
              </div>

              <div className="distance-grid">
                {Object.entries(
                  step.distances
                ).map(
                  ([node, distance]) => (
                    <div
                      className="distance-item"
                      key={node}
                    >
                      <span>
                        {node}
                      </span>

                      <strong>
                        {distance ===
                        Infinity
                          ? "∞"
                          : distance}
                      </strong>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* NEXT STEP */}

          {currentStep <
            steps.length - 1 &&
            steps.length > 0 && (
              <div className="next-step-box">
                <div className="next-step-icon">
                  →
                </div>

                <div>
                  <div className="next-step-label">
                    NEXT STEP
                  </div>

                  <div className="next-step-text">
                    {steps[
                      currentStep + 1
                    ]?.type === "visit"
                      ? `Process node ${steps[currentStep + 1]?.node}`
                      : steps[
                          currentStep + 1
                        ]?.type ===
                        "path"
                      ? "Show shortest path"
                      : `Check ${steps[currentStep + 1]?.from} → ${steps[currentStep + 1]?.to}`}
                  </div>
                </div>
              </div>
            )}
        </aside>
      </div>

      {/* ================= CONTROLS ================= */}

     <Controls
  isPlaying={isPlaying}
  onTogglePlay={playPause}
  onPrevious={previous}
  onNext={next}
  onReset={reset}
  currentStep={currentStep}
  totalSteps={steps.length}
  soundEnabled={soundEnabled}
  onToggleSound={() =>
    setSoundEnabled(
      (previous) => !previous
    )
  }
/>
    </section>
  );
}

export default DijkstraVisualizer;