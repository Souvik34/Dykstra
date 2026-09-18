import { useState } from "react";
import { Play } from "lucide-react";

function BinarySearchInput({ onVisualize }) {
  const [mode, setMode] =
    useState("array");

  const [arrayInput, setArrayInput] =
    useState(
      "2, 5, 8, 12, 16, 23, 31, 42"
    );

  const [target, setTarget] =
    useState("23");

  const [pilesInput, setPilesInput] =
    useState("3, 6, 7, 11");

  const [hours, setHours] =
    useState("8");

  const [error, setError] =
    useState("");

  const handleVisualize = () => {
    try {
      if (mode === "array") {
        const array = arrayInput
          .split(",")
          .map((value) =>
            Number(value.trim())
          );

        const searchTarget =
          Number(target);

        if (
          array.length === 0 ||
          array.some(
            (value) =>
              !Number.isFinite(value)
          )
        ) {
          throw new Error(
            "Enter a valid sorted array."
          );
        }

        for (
          let i = 1;
          i < array.length;
          i++
        ) {
          if (array[i] < array[i - 1]) {
            throw new Error(
              "The array must be sorted."
            );
          }
        }

        if (
          !Number.isFinite(searchTarget)
        ) {
          throw new Error(
            "Enter a valid target."
          );
        }

        setError("");

        onVisualize({
          mode: "array",
          array,
          target: searchTarget,
        });

        return;
      }

      const piles = pilesInput
        .split(",")
        .map((value) =>
          Number(value.trim())
        );

      const allowedHours =
        Number(hours);

      if (
        piles.length === 0 ||
        piles.some(
          (value) =>
            !Number.isInteger(value) ||
            value <= 0
        )
      ) {
        throw new Error(
          "Enter valid positive pile sizes."
        );
      }

      if (
        !Number.isInteger(
          allowedHours
        ) ||
        allowedHours <= 0
      ) {
        throw new Error(
          "Enter valid working hours."
        );
      }

      setError("");

      onVisualize({
        mode: "answer",
        piles,
        hours: allowedHours,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="input-card">
      <div className="input-heading">
        <div>
          <div className="eyebrow">
            BINARY SEARCH
          </div>

          <h1>
            Choose your search space
          </h1>

          <p>
            Visualize classic binary search
            or binary search on answer.
          </p>
        </div>

        <div className="input-icon">
          O(log N)
        </div>
      </div>

      {/* MODE */}

      <div className="binary-mode-tabs">
        <button
          className={
            mode === "array"
              ? "binary-mode active"
              : "binary-mode"
          }
          onClick={() =>
            setMode("array")
          }
        >
          Sorted Array
        </button>

        <button
          className={
            mode === "answer"
              ? "binary-mode active"
              : "binary-mode"
          }
          onClick={() =>
            setMode("answer")
          }
        >
          Binary Search on Answer
        </button>
      </div>

      {/* ARRAY SEARCH */}

      {mode === "array" && (
        <div className="binary-input-grid">
          <div className="binary-field wide">
            <label>
              SORTED ARRAY
            </label>

            <input
              value={arrayInput}
              onChange={(e) =>
                setArrayInput(
                  e.target.value
                )
              }
              placeholder="2, 5, 8, 12, 16, 23"
            />
          </div>

          <div className="binary-field">
            <label>
              TARGET
            </label>

            <input
              type="number"
              value={target}
              onChange={(e) =>
                setTarget(
                  e.target.value
                )
              }
              placeholder="23"
            />
          </div>
        </div>
      )}

      {/* ANSWER SEARCH */}

      {mode === "answer" && (
        <div className="binary-input-grid">
          <div className="binary-field wide">
            <label>
              BANANA PILES
            </label>

            <input
              value={pilesInput}
              onChange={(e) =>
                setPilesInput(
                  e.target.value
                )
              }
              placeholder="3, 6, 7, 11"
            />
          </div>

          <div className="binary-field">
            <label>
              HOURS
            </label>

            <input
              type="number"
              value={hours}
              onChange={(e) =>
                setHours(
                  e.target.value
                )
              }
              placeholder="8"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <button
        className="visualize-button binary-visualize"
        onClick={handleVisualize}
      >
        <Play
          size={18}
          fill="currentColor"
        />

        Visualize Binary Search
      </button>
    </div>
  );
}

export default BinarySearchInput;