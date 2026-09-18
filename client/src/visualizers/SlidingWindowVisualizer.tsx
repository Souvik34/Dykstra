import { useEffect, useState } from "react";
import Controls from "../anim/Controls";

function SlidingWindowVisualizer({
  data,
  result,
}) {
  const { steps } = result;

  const [currentStep, setCurrentStep] =
    useState(0);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [soundEnabled, setSoundEnabled] =
    useState(true);

  const step = steps[currentStep];

  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, [data, result]);

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
        (previous) =>
          previous + 1
      );
    }, 1500);

    return () => clearTimeout(timer);
  }, [
    isPlaying,
    currentStep,
    steps.length,
  ]);

  const playSound = (type) => {
    if (!soundEnabled) return;

    try {
      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioContext) return;

      const context =
        new AudioContext();

      const oscillator =
        context.createOscillator();

      const gain =
        context.createGain();

      const frequency = {
        add: 320,
        inspect: 320,
        valid: 430,
        check: 360,
        remove: 260,
        duplicate: 200,
        "new-max": 560,
        "new-min": 560,
        "move-left": 280,
        complete: 720,
      };

      oscillator.frequency.value =
        frequency[type] || 320;

      oscillator.type = "sine";

      gain.gain.setValueAtTime(
        0.035,
        context.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        0.001,
        context.currentTime + 0.12
      );

      oscillator.connect(gain);
      gain.connect(
        context.destination
      );

      oscillator.start();

      oscillator.stop(
        context.currentTime + 0.12
      );
    } catch {
      // Sound is optional.
    }
  };

  useEffect(() => {
    if (currentStep === 0) return;

    playSound(
      steps[currentStep].type
    );
  }, [currentStep]);

  const nextStep = () => {
    setCurrentStep((previous) =>
      Math.min(
        previous + 1,
        steps.length - 1
      )
    );
  };

  const previousStep = () => {
    setCurrentStep((previous) =>
      Math.max(previous - 1, 0)
    );
  };

  const reset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const togglePlay = () => {
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

  const isArrayProblem =
    data.problem === "max-sum" ||
    data.problem === "min-sum";

  const getArray =
    data.array || [];

  const getExplanation = () => {
    if (
      data.problem === "max-sum"
    ) {
      switch (step.type) {
        case "start":
          return "Start with an empty window. We will maintain exactly K elements.";

        case "add":
          return `Add ${step.addedValue} to the window. Current sum = ${step.windowSum}.`;

        case "new-max":
          return `This window has the largest sum so far: ${step.maxSum}.`;

        case "check":
          return `The window sum is ${step.windowSum}. Compare it with the current maximum ${step.maxSum}.`;

        case "remove":
          return `Remove ${step.removedValue} from the left because the window must remain size K.`;

        case "complete":
          return `Finished. The maximum sum is ${step.maxSum}.`;

        default:
          return "";
      }
    }

    if (
      data.problem === "min-sum"
    ) {
      switch (step.type) {
        case "add":
          return `Expand the window by adding ${step.addedValue}. Current sum = ${step.windowSum}.`;

        case "valid":
          return `The window sum ${step.windowSum} has reached the target ${step.target}. Try shrinking it.`;

        case "new-min":
          return `A smaller valid window was found. Its length is ${step.minLength}.`;

        case "remove":
          return `Remove ${step.removedValue} from the left and see whether the window is still valid.`;

        case "complete":
          if (step.minLength === null) {
            return "No subarray can reach the target.";
          }

          return `Finished. The minimum valid window has length ${step.minLength}.`;

        default:
          return "";
      }
    }

    switch (step.type) {
      case "start":
        return "Start with an empty window.";

      case "inspect":
        return `Inspect '${step.char}' and expand the window to the right.`;

      case "duplicate":
        return `'${step.char}' already exists inside the current window, so the left pointer must move.`;

      case "move-left":
        return `Move L to index ${step.left}. The window now contains unique characters.`;

      case "new-max":
        return `A new longest substring was found: "${step.string.substring(
          step.left,
          step.right + 1
        )}".`;

      case "update":
        return `Add '${step.char}' to the window. Current length = ${step.currentLength}.`;

      case "complete":
        return `Finished. The longest substring is "${step.longestSubstring}" with length ${step.maxLength}.`;

      default:
        return "";
    }
  };

  const getArrayCellClass = (
    index
  ) => {
    let className =
      "window-cell";

    if (
      step.left <= index &&
      index <= step.right
    ) {
      className +=
        " window-active";
    }

    if (
      index === step.left
    ) {
      className +=
        " window-left-cell";
    }

    if (
      index === step.right
    ) {
      className +=
        " window-current";
    }

    if (
      step.type === "new-max" &&
      index >= step.bestStart &&
      index <= step.bestEnd
    ) {
      className +=
        " window-best";
    }

    if (
      step.type === "new-min" &&
      index >= step.bestStart &&
      index <= step.bestEnd
    ) {
      className +=
        " window-best";
    }

    if (
      step.type === "complete" &&
      index >= step.bestStart &&
      index <= step.bestEnd
    ) {
      className +=
        " window-final";
    }

    return className;
  };

  const renderArray = () => (
    <div className="window-array">
      {getArray.map(
        (value, index) => (
          <div
            className="window-cell-wrapper"
            key={index}
          >
            <div className="window-pointer-area">
              {step.left ===
                index && (
                <span className="window-pointer left">
                  L
                </span>
              )}

              {step.right ===
                index && (
                <span className="window-pointer right">
                  R
                </span>
              )}
            </div>

            <div
              className={getArrayCellClass(
                index
              )}
            >
              {value}
            </div>

            <span className="window-index">
              {index}
            </span>
          </div>
        )
      )}
    </div>
  );

  const renderString = () => (
    <div className="window-array">
      {data.string
        .split("")
        .map(
          (char, index) => {
            let className =
              "window-cell";

            if (
              step.left <= index &&
              index <= step.right
            ) {
              className +=
                " window-active";
            }

            if (
              index === step.right
            ) {
              className +=
                " window-current";
            }

            if (
              step.type ===
                "duplicate" &&
              index ===
                step.previousIndex
            ) {
              className +=
                " window-duplicate";
            }

            if (
              step.type ===
                "complete" &&
              index >=
                step.bestStart &&
              index <=
                step.bestEnd
            ) {
              className +=
                " window-final";
            }

            return (
              <div
                className="window-cell-wrapper"
                key={index}
              >
                <div className="window-pointer-area">
                  {step.left ===
                    index && (
                    <span className="window-pointer left">
                      L
                    </span>
                  )}

                  {step.right ===
                    index && (
                    <span className="window-pointer right">
                      R
                    </span>
                  )}
                </div>

                <div
                  className={className}
                >
                  {char}
                </div>

                <span className="window-index">
                  {index}
                </span>
              </div>
            );
          }
        )}
    </div>
  );

  const currentWindow =
    step.left <= step.right
      ? isArrayProblem
        ? getArray
            .slice(
              step.left,
              step.right + 1
            )
            .join(", ")
        : data.string.substring(
            step.left,
            step.right + 1
          )
      : "—";

  const resultText =
    data.problem === "max-sum"
      ? step.maxSum ?? "—"
      : data.problem === "min-sum"
      ? step.minLength ?? "—"
      : step.maxLength ?? 0;

  return (<section className="window-visualizer">
      <div className="window-visualizer-header">
        <div>
          <h2>
            Sliding Window Visualization
          </h2>

          <p>
            {data.problem ===
              "max-sum" &&
              "Maximum Sum Subarray of Size K"}

            {data.problem ===
              "min-sum" &&
              "Minimum Size Subarray Sum"}

            {data.problem ===
              "unique-string" &&
              "Longest Substring Without Repeating Characters"}
          </p>
        </div>

       <div className="window-step-counter">
          Step {currentStep + 1} /{" "}
          {steps.length}
        </div>
      </div>

    <div className="window-visualizer-body">
        <div className="window-canvas">

          {isArrayProblem
            ? renderArray()
            : renderString()}

          <div className="window-info">
            <div className="window-info-card">
              <span>
                Current Window
              </span>

              <strong>
                {currentWindow}
              </strong>
            </div>

            <div className="window-info-card">
              <span>
                {data.problem ===
                "max-sum"
                  ? "Window Sum"
                  : data.problem ===
                    "min-sum"
                  ? "Window Sum"
                  : "Window Length"}
              </span>

              <strong>
                {data.problem ===
                "max-sum"
                  ? step.windowSum
                  : data.problem ===
                    "min-sum"
                  ? step.windowSum
                  : step.currentLength}
              </strong>
            </div>

            <div className="window-info-card">
              <span>
                {data.problem ===
                "max-sum"
                  ? "Maximum Sum"
                  : data.problem ===
                    "min-sum"
                  ? "Minimum Length"
                  : "Maximum Length"}
              </span>

              <strong>
                {resultText}
              </strong>
            </div>
          </div>

          {data.problem ===
            "unique-string" &&
            step.lastSeen && (
              <div className="seen-container">
                <h3>
                  Last Seen Index
                </h3>

                <div className="seen-list">
                  {Object.entries(
                    step.lastSeen
                  ).map(
                    ([char, index]) => (
                      <div
                        className="seen-item"
                        key={char}
                      >
                        <span>
                          {char}
                        </span>

                        <strong>
                          {index}
                        </strong>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          <div className="window-legend">
            <div>
              <span className="legend-box window-blue" />
              Current Window
            </div>

            <div>
              <span className="legend-box window-yellow" />
              Current Element
            </div>

            <div>
              <span className="legend-box window-red" />
              Duplicate
            </div>

            <div>
              <span className="legend-box window-purple" />
              Best Answer
            </div>
          </div>
        </div>

     <div className="window-explanation">
  <div className="window-explanation-header">
    <span className="window-explanation-eyebrow">
      STEP EXPLANATION
    </span>
    <h3>What's happening?</h3>
  </div>

  <div className="window-explanation-card">
    <div className="window-explanation-icon">
      {step.type === "complete" ? "✓" : "→"}
    </div>

    <p>{getExplanation()}</p>
  </div>

  <div className="window-state-card">
    <div className="window-state-header">
      <span>Window State</span>
      <span className="window-state-type">
        {step.type}
      </span>
    </div>

    <div className="window-state-grid">
      <div className="window-state-item">
        <span>Left</span>
        <strong>{step.left}</strong>
      </div>

      <div className="window-state-item">
        <span>Right</span>
        <strong>{step.right}</strong>
      </div>

      {data.problem === "max-sum" && (
        <div className="window-state-item">
          <span>K</span>
          <strong>{data.k}</strong>
        </div>
      )}

      {data.problem === "min-sum" && (
        <div className="window-state-item">
          <span>Target</span>
          <strong>{data.target}</strong>
        </div>
      )}

      {data.problem === "unique-string" && (
        <div className="window-state-item">
          <span>Length</span>
          <strong>{step.currentLength}</strong>
        </div>
      )}
    </div>
  </div>
</div>
      </div>

      <Controls
        currentStep={currentStep}
        totalSteps={steps.length}
        isPlaying={isPlaying}
        soundEnabled={soundEnabled}
        onNext={nextStep}
        onPrevious={previousStep}
        onReset={reset}
        onTogglePlay={togglePlay}
        onToggleSound={() =>
          setSoundEnabled(
            (previous) => !previous
          )
        }
      />
    </section>
  );
}

export default SlidingWindowVisualizer;