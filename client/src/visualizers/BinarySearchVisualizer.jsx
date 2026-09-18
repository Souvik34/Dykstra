import { useEffect, useState } from "react";
import Controls from "../anim/Controls";

function BinarySearchVisualizer({
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

  const isArrayMode =
    data.mode === "array";

  /*
   * SOUND
   */

  const playSound = (type) => {
    if (!soundEnabled) return;

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

    oscillator.connect(gain);
    gain.connect(
      context.destination
    );

    const frequencies = {
      start: 350,
      check: 420,
      "move-left": 300,
      "move-right": 520,
      "new-range": 380,
      possible: 650,
      impossible: 280,
      found: 820,
      "not-found": 220,
    };

    oscillator.frequency.value =
      frequencies[type] || 400;

    oscillator.type =
      type === "found"
        ? "sine"
        : "triangle";

    gain.gain.setValueAtTime(
      0.0001,
      context.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      type === "found"
        ? 0.13
        : 0.055,
      context.currentTime + 0.01
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      context.currentTime + 0.15
    );

    oscillator.start();

    oscillator.stop(
      context.currentTime + 0.16
    );
  };

  useEffect(() => {
    if (step) {
      playSound(step.type);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  /*
   * PLAYBACK
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
        (previous) =>
          previous + 1
      );
    }, 1500);

    return () =>
      clearTimeout(timer);
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
   * EXPLANATION
   */

  const getExplanation = () => {
    if (!step) {
      return {
        title: "Ready to begin",
        description:
          "Press Play or Next to start.",
      };
    }

    if (isArrayMode) {
      if (step.type === "start") {
        return {
          title:
            "Start binary search",
          description:
            "We begin with the entire sorted array as our search space.",
          calculation: `L = ${step.left}   M = ${step.mid}   R = ${step.right}`,
        };
      }

      if (step.type === "check") {
        return {
          title:
            `Check ${step.value}`,
          description:
            `Compare the middle value ${step.value} with the target ${step.target}.`,
          calculation: `${step.value} ${step.value === step.target ? "=" : step.value < step.target ? "<" : ">"} ${step.target}`,
        };
      }

      if (
        step.type ===
        "move-right"
      ) {
        return {
          title:
            "Search the right half",
          description:
            `${step.value} is smaller than the target, so everything from L through M can be eliminated.`,
          calculation: `L = M + 1 = ${step.mid + 1}`,
        };
      }

      if (
        step.type ===
        "move-left"
      ) {
        return {
          title:
            "Search the left half",
          description:
            `${step.value} is larger than the target, so everything from M through R can be eliminated.`,
          calculation: `R = M - 1 = ${step.mid - 1}`,
        };
      }

      if (
        step.type ===
        "new-range"
      ) {
        return {
          title:
            "New search range",
          description:
            "The search space has been cut roughly in half.",
          calculation: `L = ${step.left}   M = ${step.mid}   R = ${step.right}`,
        };
      }

      if (step.type === "found") {
        return {
          title:
            "Target found!",
          description:
            `The target ${step.target} is located at index ${step.index}.`,
          calculation: `array[${step.index}] = ${step.target}`,
        };
      }

      return {
        title:
          "Target not found",
        description:
          "The search space is empty, so the target does not exist in the array.",
      };
    }

    /*
     * ANSWER SEARCH
     */

    if (step.type === "check") {
      return {
        title:
          `Try answer = ${step.mid}`,
        description:
          `Can Koko finish all bananas at a speed of ${step.mid} bananas per hour?`,
        calculation: `${step.requiredHours} hours needed ≤ ${step.allowedHours} hours allowed`,
      };
    }

    if (
      step.type === "possible"
    ) {
      return {
        title:
          "This answer works",
        description:
          `A speed of ${step.mid} is enough to finish within the allowed time. We can try an even smaller answer.`,
        calculation: `R = M - 1 = ${step.mid - 1}`,
      };
    }

    if (
      step.type === "impossible"
    ) {
      return {
        title:
          "This answer is too small",
        description:
          `A speed of ${step.mid} requires ${step.requiredHours} hours, which is more than the allowed ${step.allowedHours} hours.`,
        calculation: `L = M + 1 = ${step.mid + 1}`,
      };
    }

    if (step.type === "found") {
      return {
        title:
          "Minimum answer found!",
        description:
          `The minimum eating speed is ${step.answer} bananas per hour.`,
        calculation: `Answer = ${step.answer}`,
      };
    }

    return {
      title:
        "Binary search on answer",
      description:
        "We are searching the possible answer range.",
    };
  };

  const explanation =
    getExplanation();

  /*
   * ARRAY VIEW
   */

  const renderArray = () => {
    const array = data.array;

    return (
      <div className="binary-array">
        {array.map(
          (value, index) => {
            const eliminated =
              step?.eliminated &&
              index >=
                step.eliminated[0] &&
              index <=
                step.eliminated[1];

            const isMid =
              index === step?.mid;

            const isFound =
              step?.type ===
                "found" &&
              index ===
                step.index;

            const isTarget =
              value ===
              data.target;

            let className =
              "binary-cell";

            if (eliminated)
              className +=
                " binary-eliminated";

            if (isMid)
              className +=
                " binary-mid";

            if (isTarget)
              className +=
                " binary-target";

            if (isFound)
              className +=
                " binary-found";

            return (
              <div
                key={`${value}-${index}`}
                className="binary-cell-wrapper"
              >
                <div
                  className={
                    className
                  }
                >
                  {value}
                </div>

                <div className="index-label">
                  {index}
                </div>

                {index ===
                  step?.left && (
                  <div className="pointer pointer-left">
                    L
                  </div>
                )}

                {index ===
                  step?.mid && (
                  <div className="pointer pointer-mid">
                    M
                  </div>
                )}

                {index ===
                  step?.right && (
                  <div className="pointer pointer-right">
                    R
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>
    );
  };

  /*
   * ANSWER VIEW
   */

  const renderAnswerSearch = () => {
    if (!step) return null;

    const min =
      Math.min(
        1,
        step.left ?? 1
      );

    const max =
      Math.max(
        step.right ?? 1,
        step.mid ?? 1,
        data.piles
          ? Math.max(...data.piles)
          : 1
      );

    const values = [];

    const range = max - min;

    const count =
      Math.min(12, range + 1);

    const increment =
      range /
      Math.max(count - 1, 1);

    for (
      let i = 0;
      i < count;
      i++
    ) {
      values.push(
        Math.round(
          min +
            increment * i
        )
      );
    }

    return (
      <div className="answer-search">
        <div className="answer-range">
          {values.map(
            (value) => {
              const isMid =
                value ===
                step.mid;

              const isAnswer =
                value ===
                step.answer &&
                step.answer !==
                  undefined;

              return (
                <div
                  key={value}
                  className={`answer-value ${
                    isMid
                      ? "answer-mid"
                      : ""
                  } ${
                    isAnswer
                      ? "answer-current"
                      : ""
                  }`}
                >
                  {value}
                </div>
              );
            }
          )}
        </div>

        <div className="answer-labels">
          <span>
            L = {step.left}
          </span>

          <span>
            M = {step.mid}
          </span>

          <span>
            R = {step.right}
          </span>
        </div>

        <div className="answer-info">
          <div>
            <span>
              CANDIDATE
            </span>

            <strong>
              {step.mid}
            </strong>
          </div>

          <div>
            <span>
              HOURS NEEDED
            </span>

            <strong>
              {step.requiredHours ??
                "-"}
            </strong>
          </div>

          <div>
            <span>
              HOURS ALLOWED
            </span>

            <strong>
              {step.allowedHours}
            </strong>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="visualizer-section">
      <div className="visualizer-title">
        <div>
          <div className="eyebrow">
            VISUAL ALGORITHM
          </div>

          <h2>
            Binary Search
          </h2>

          <p>
            {isArrayMode
              ? `Searching for ${data.target}`
              : "Binary Search on Answer — Koko Eating Bananas"}
          </p>
        </div>

        <div className="complexity-badge">
          O(log N)
        </div>
      </div>

      <div className="binary-visualizer-body">
        <div className="binary-canvas">
          {isArrayMode
            ? renderArray()
            : renderAnswerSearch()}
        </div>

        <aside className="explanation-panel">
          <div className="step-label">
            STEP{" "}
            {steps.length
              ? currentStep + 1
              : 0}

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
              {
                explanation.calculation
              }
            </div>
          )}

          {isArrayMode && (
            <div className="binary-legend">
              <div>
                <span className="legend-dot legend-blue" />
                Search space
              </div>

              <div>
                <span className="legend-dot legend-yellow" />
                Middle
              </div>

              <div>
                <span className="legend-dot legend-pink" />
                Target
              </div>

              <div>
                <span className="legend-dot legend-purple" />
                Found
              </div>
            </div>
          )}

          {!isArrayMode && (
            <div className="binary-answer-status">
              <span>
                SEARCHING POSSIBLE ANSWERS
              </span>

              <strong>
                {step.left} →{" "}
                {step.right}
              </strong>
            </div>
          )}
        </aside>
      </div>

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

export default BinarySearchVisualizer;