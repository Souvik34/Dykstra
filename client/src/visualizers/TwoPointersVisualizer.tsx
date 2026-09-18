import { useEffect, useState } from "react";
import Controls from "../anim/Controls";
import "./styles/two-pointers.css";

function TwoPointersVisualizer({
  data,
  result,
}) {
  const [currentStep, setCurrentStep] =
    useState(0);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [soundEnabled, setSoundEnabled] =
    useState(true);

  const steps = result?.steps || [];
  const step = steps[currentStep] || null;

  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, [result]);

  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStep((previous) => previous + 1);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length]);

  useEffect(() => {
    if (
      !soundEnabled ||
      !step
    ) {
      return;
    }

    playSound(step.type);
  }, [currentStep, soundEnabled]);

  const playSound = (type) => {
    try {
      const context =
        new (
          window.AudioContext ||
          window.webkitAudioContext
        )();

      const oscillator =
        context.createOscillator();

      const gain =
        context.createGain();

      const frequencies = {
        start: 350,
        check: 440,
        "move-left": 520,
        "move-right": 320,
        "new-range": 380,
        found: 820,
        "not-found": 220,
      };

      oscillator.frequency.value =
        frequencies[type] || 400;

      oscillator.type = "sine";

      gain.gain.setValueAtTime(
        0.05,
        context.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        0.001,
        context.currentTime + 0.12
      );

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start();
      oscillator.stop(
        context.currentTime + 0.12
      );
    } catch {
      // Ignore browser audio errors.
    }
  };

  const playPause = () => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0);
    }

    setIsPlaying((previous) => !previous);
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

  const getExplanation = () => {
    if (!step) {
      return {
        title: "Ready",
        text: "Start the visualization to see how the two pointers move.",
      };
    }

    switch (step.type) {
      case "start":
        return {
          title: "Initialize Two Pointers",
          text: "Place one pointer at the beginning and the other at the end of the sorted array.",
        };

      case "check":
        return {
          title: "Check the Current Pair",
          text: `${step.leftValue} + ${step.rightValue} = ${step.sum}. Compare this sum with the target ${step.target}.`,
        };

      case "move-left":
        return {
          title: "Move Left Pointer",
          text: `${step.sum} is smaller than ${step.target}, so we need a larger value. Move the left pointer to the right.`,
        };

      case "move-right":
        return {
          title: "Move Right Pointer",
          text: `${step.sum} is greater than ${step.target}, so we need a smaller value. Move the right pointer to the left.`,
        };

      case "new-range":
        return {
          title: "New Search Range",
          text: "The pointers have moved. The next pair will be checked inside the remaining range.",
        };

      case "found":
        return {
          title: "Pair Found",
          text: `${step.leftValue} + ${step.rightValue} = ${step.target}. The target pair has been found.`,
        };

      case "not-found":
        return {
          title: "No Pair Found",
          text: "The two pointers crossed without finding a pair whose sum equals the target.",
        };

      default:
        return {
          title: "Processing",
          text: "The algorithm is processing the current step.",
        };
    }
  };

  const explanation =
    getExplanation();

  const renderArray = () => {
    if (!step) return null;

    const array = step.array || [];

    return (
      <div className="two-pointer-array">
        {array.map((value, index) => {
          const isLeft =
            index === step.left;

          const isRight =
            index === step.right;

          const isFound =
            step.type === "found" &&
            (index === step.left ||
              index === step.right);

          const isOutside =
            step.left !== null &&
            step.right !== null &&
            (index < step.left ||
              index > step.right);

          let className =
            "two-pointer-cell";

          if (isOutside) {
            className +=
              " two-pointer-outside";
          }

          if (
            isLeft ||
            isRight
          ) {
            className +=
              " two-pointer-active";
          }

          if (isFound) {
            className +=
              " two-pointer-found";
          }

          return (
            <div
              className="two-pointer-cell-wrapper"
              key={`${value}-${index}`}
            >
              <div className="two-pointer-pointer-row">
                {isLeft && (
                  <span className="two-pointer-left-pointer">
                    L
                  </span>
                )}

                {isRight && (
                  <span className="two-pointer-right-pointer">
                    R
                  </span>
                )}
              </div>

              <div className={className}>
                {value}
              </div>

              <div className="two-pointer-index">
                {index}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <section className="two-pointer-visualizer">
      <div className="two-pointer-visualizer-header">
        <div>
          <div className="two-pointer-visualizer-breadcrumb">
            Two Pointers
          </div>

          <h2>
            Opposite Ends
          </h2>

          <p>
            Example: Two Sum II — Input Array Is
            Sorted
          </p>
        </div>

        <div className="two-pointer-step-badge">
          {step?.type || "ready"}
        </div>
      </div>

      <div className="two-pointer-visualizer-body">
        <div className="two-pointer-canvas">
          <div className="two-pointer-canvas-title">
            Current Array
          </div>

          {renderArray()}

          {step && (
            <div className="two-pointer-calculation">
              {step.leftValue !== undefined &&
                step.rightValue !== undefined && (
                  <>
                    <span>
                      {step.leftValue}
                    </span>

                    <span className="two-pointer-operator">
                      +
                    </span>

                    <span>
                      {step.rightValue}
                    </span>

                    <span className="two-pointer-operator">
                      =
                    </span>

                    <strong>
                      {step.sum}
                    </strong>
                  </>
                )}
            </div>
          )}

          {step?.target !== undefined && (
            <div className="two-pointer-target">
              Target:{" "}
              <strong>
                {step.target}
              </strong>
            </div>
          )}

          <div className="two-pointer-legend">
            <div>
              <span className="legend-dot two-pointer-blue" />
              Current range
            </div>

            <div>
              <span className="legend-dot two-pointer-yellow" />
              Active pointer
            </div>

            <div>
              <span className="legend-dot two-pointer-purple" />
              Found pair
            </div>
          </div>
        </div>

        <aside className="two-pointer-explanation">
          <div className="two-pointer-explanation-label">
            What is happening?
          </div>

          <h3>
            {explanation.title}
          </h3>

          <p>
            {explanation.text}
          </p>

          {step?.left !== undefined &&
            step?.right !== undefined && (
              <div className="two-pointer-state">
                <div>
                  <span>Left</span>
                  <strong>
                    {step.left}
                  </strong>
                </div>

                <div>
                  <span>Right</span>
                  <strong>
                    {step.right}
                  </strong>
                </div>
              </div>
            )}
        </aside>
      </div>

      <Controls
        currentStep={currentStep}
        totalSteps={steps.length}
        isPlaying={isPlaying}
        soundEnabled={soundEnabled}
        onNext={next}
        onPrevious={previous}
        onReset={reset}
        onTogglePlay={playPause}
        onToggleSound={() =>
          setSoundEnabled(
            (previous) => !previous
          )
        }
      />
    </section>
  );
}

export default TwoPointersVisualizer;