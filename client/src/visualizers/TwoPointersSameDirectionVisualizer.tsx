import { useEffect, useState } from "react";

import Controls from "../anim/Controls";

import "./styles/two-pointers-same-direction.css";

function TwoPointersSameDirectionVisualizer({
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

  const step =
    steps[currentStep] || null;

  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, [result]);

  useEffect(() => {
    if (
      !isPlaying ||
      currentStep >= steps.length - 1
    ) {
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

  useEffect(() => {
    if (!soundEnabled || !step) {
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
        move: 720,
        skip: 300,
        "advance-read": 500,
        "advance-write": 620,
        complete: 900,
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
    if (
      currentStep >=
      steps.length - 1
    ) {
      setCurrentStep(0);
    }

    setIsPlaying(
      (previous) => !previous
    );
  };

  const next = () => {
    setIsPlaying(false);

    setCurrentStep(
      (previous) =>
        Math.min(
          previous + 1,
          steps.length - 1
        )
    );
  };

  const previous = () => {
    setIsPlaying(false);

    setCurrentStep(
      (previous) =>
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
        text:
          "Start the visualization to see how the two pointers move in the same direction.",
      };
    }

    switch (step.type) {
      case "start":
        return {
          title: "Initialize Two Pointers",
          text:
            "Both pointers start from the beginning. Read scans the array while Write marks the next position for a non-zero value.",
        };

      case "check":
        return {
          title: "Read the Current Value",
          text:
            `${step.value} is at the Read pointer. Check whether it should be kept or skipped.`,
        };

      case "skip":
        return {
          title: "Skip the Zero",
          text:
            "The Read pointer found a zero, so Write stays where it is. Read continues forward.",
        };

      case "move":
        return {
          title: "Move the Non-Zero Value",
          text:
            `${step.value} is non-zero, so move it to the position marked by Write.`,
        };

      case "advance-write":
        return {
          title: "Advance Write Pointer",
          text:
            "A non-zero value has been placed correctly. Move Write forward to the next available position.",
        };

      case "advance-read":
        return {
          title: "Advance Read Pointer",
          text:
            "Read moves forward to inspect the next element.",
        };

      case "complete":
        return {
          title: "Array Processed",
          text:
            "Read has scanned the entire array. All non-zero values are at the front and the zeroes have moved to the end.",
        };

      default:
        return {
          title: "Processing",
          text:
            "The algorithm is processing the current step.",
        };
    }
  };

  const explanation =
    getExplanation();

  const renderArray = () => {
    if (!step) return null;

    const array =
      step.array || [];

    return (
      <div className="same-direction-array">
        {array.map(
          (value, index) => {
            const isRead =
              index === step.read;

            const isWrite =
              index === step.write;

            const isZero =
              value === 0;

            let className =
              "same-direction-cell";

            if (isZero) {
              className +=
                " same-direction-zero";
            } else {
              className +=
                " same-direction-value";
            }

            if (isRead) {
              className +=
                " same-direction-read";
            }

            if (isWrite) {
              className +=
                " same-direction-write";
            }

            if (
              step.type ===
                "complete" &&
              value !== 0
            ) {
              className +=
                " same-direction-final";
            }

            return (
              <div
                className="same-direction-cell-wrapper"
                key={`${value}-${index}`}
              >
                <div className="same-direction-pointer-row">
                  {isRead && (
                    <span className="same-direction-read-pointer">
                      R
                    </span>
                  )}

                  {isWrite && (
                    <span className="same-direction-write-pointer">
                      W
                    </span>
                  )}
                </div>

                <div
                  className={
                    className
                  }
                >
                  {value}
                </div>

                <div className="same-direction-index">
                  {index}
                </div>
              </div>
            );
          }
        )}
      </div>
    );
  };

  return (
    <section className="same-direction-visualizer">
      <div className="same-direction-header">
        <div>
          <div className="same-direction-breadcrumb">
            Two Pointers
          </div>

          <h2>Same Direction</h2>

          <p>
            Example: Move Zeroes
          </p>
        </div>

        <div className="same-direction-step-badge">
          {step?.type || "ready"}
        </div>
      </div>

      <div className="same-direction-body">
        <div className="same-direction-canvas">
          <div className="same-direction-canvas-title">
            Current Array
          </div>

          {renderArray()}

          <div className="same-direction-pointer-info">
            <div className="same-direction-pointer-card read-card">
              <span className="pointer-letter">
                R
              </span>

              <div>
                <span>Read</span>

                <strong>
                  {step?.read ?? "-"}
                </strong>
              </div>
            </div>

            <div className="same-direction-pointer-card write-card">
              <span className="pointer-letter">
                W
              </span>

              <div>
                <span>Write</span>

                <strong>
                  {step?.write ?? "-"}
                </strong>
              </div>
            </div>
          </div>

          <div className="same-direction-legend">
            <div>
              <span className="legend-dot same-direction-cyan" />
              Read pointer
            </div>

            <div>
              <span className="legend-dot same-direction-pink" />
              Write pointer
            </div>

            <div>
              <span className="legend-dot same-direction-purple" />
              Non-zero value
            </div>

            <div>
              <span className="legend-dot same-direction-muted" />
              Zero
            </div>
          </div>
        </div>

        <aside className="same-direction-explanation">
          <div className="same-direction-explanation-label">
            What is happening?
          </div>

          <h3>
            {explanation.title}
          </h3>

          <p>
            {explanation.text}
          </p>

          {step && (
            <div className="same-direction-state">
              <div>
                <span>Read</span>

                <strong>
                  {step.read ?? "-"}
                </strong>
              </div>

              <div>
                <span>Write</span>

                <strong>
                  {step.write ?? "-"}
                </strong>
              </div>
            </div>
          )}

          <div className="same-direction-rule">
            <span>Pattern Rule</span>

            <p>
              <strong>Read</strong> scans every
              element.
              <br />
              <strong>Write</strong> marks where
              the next valid element belongs.
            </p>
          </div>
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

export default TwoPointersSameDirectionVisualizer;