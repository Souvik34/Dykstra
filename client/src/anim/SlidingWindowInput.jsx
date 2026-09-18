import { useEffect, useState } from "react";

function SlidingWindowInput({
  selectedProblem,
  onVisualize,
}) {
  const [array, setArray] =
    useState(
      "2, 1, 5, 1, 3, 2"
    );

  const [k, setK] =
    useState("3");

  const [target, setTarget] =
    useState("7");

  const [string, setString] =
    useState("abcabcbb");

  const [error, setError] =
    useState("");

  useEffect(() => {
    setError("");
  }, [selectedProblem]);

  const parseArray = () => {
    const values = array
      .split(",")
      .map((value) =>
        value.trim()
      )
      .filter(Boolean)
      .map(Number);

    if (
      values.length === 0 ||
      values.some(
        (value) =>
          !Number.isFinite(value)
      )
    ) {
      setError(
        "Enter a valid comma-separated array."
      );

      return null;
    }

    return values;
  };

  const handleVisualize = () => {
    setError("");

    if (
      selectedProblem ===
      "max-sum"
    ) {
      const values =
        parseArray();

      if (!values) return;

      const windowSize =
        Number(k);

      if (
        !Number.isInteger(
          windowSize
        ) ||
        windowSize <= 0 ||
        windowSize >
          values.length
      ) {
        setError(
          "K must be a positive integer not larger than the array length."
        );

        return;
      }

      onVisualize({
        problem: "max-sum",
        array: values,
        k: windowSize,
      });

      return;
    }

    if (
      selectedProblem ===
      "min-sum"
    ) {
      const values =
        parseArray();

      if (!values) return;

      if (
        values.some(
          (value) =>
            value <= 0
        )
      ) {
        setError(
          "This problem requires positive numbers."
        );

        return;
      }

      const targetValue =
        Number(target);

      if (
        !Number.isFinite(
          targetValue
        ) ||
        targetValue <= 0
      ) {
        setError(
          "Target must be positive."
        );

        return;
      }

      onVisualize({
        problem: "min-sum",
        array: values,
        target:
          targetValue,
      });

      return;
    }

    if (
      selectedProblem ===
      "unique-string"
    ) {
      const value =
        string.trim();

      if (!value) {
        setError(
          "Enter a string."
        );

        return;
      }

      if (
        value.length > 30
      ) {
        setError(
          "Keep the string within 30 characters."
        );

        return;
      }

      onVisualize({
        problem:
          "unique-string",
        string: value,
      });
    }
  };

  const getTitle = () => {
    if (
      selectedProblem ===
      "max-sum"
    ) {
      return "Maximum Sum Subarray of Size K";
    }

    if (
      selectedProblem ===
      "min-sum"
    ) {
      return "Minimum Size Subarray Sum";
    }

    return "Longest Substring Without Repeating Characters";
  };

  const getDescription =
    () => {
      if (
        selectedProblem ===
        "max-sum"
      ) {
        return "Find the maximum sum of any subarray of size K.";
      }

      if (
        selectedProblem ===
        "min-sum"
      ) {
        return "Find the minimum-length subarray whose sum is at least the target.";
      }

      return "Find the longest substring containing no duplicate characters.";
    };

  return (
   <section className="window-input-card">
      <div className="window-input-title-row">
        <div>
        <div className="window-input-breadcrumb">
            Sliding Window
          </div>

          <h1>{getTitle()}</h1>

          <p>
            {getDescription()}
          </p>
        </div>

        <div className="window-complexity-badge">
          O(n)
        </div>
      </div>

      {selectedProblem ===
        "max-sum" && (
        <div className="window-input-grid">
         <div className="window-input-field">
            <label>
              Array
            </label>

            <input
              value={array}
              onChange={(e) =>
                setArray(
                  e.target.value
                )
              }
              placeholder="2, 1, 5, 1, 3, 2"
            />
          </div>

       <div className="window-input-field small">
            <label>K</label>

            <input
              type="number"
              min="1"
              value={k}
              onChange={(e) =>
                setK(
                  e.target.value
                )
              }
            />
          </div>
        </div>
      )}

      {selectedProblem ===
        "min-sum" && (
        <div className="window-input-grid">
          <div className="window-input-field">
            <label>
              Positive Array
            </label>

            <input
              value={array}
              onChange={(e) =>
                setArray(
                  e.target.value
                )
              }
              placeholder="2, 3, 1, 2, 4, 3"
            />
          </div>

          <div className="window-input-field small">
            <label>
              Target
            </label>

            <input
              type="number"
              min="1"
              value={target}
              onChange={(e) =>
                setTarget(
                  e.target.value
                )
              }
            />
          </div>
        </div>
      )}

      {selectedProblem ===
        "unique-string" && (
        <div className="window-input-grid">
          <div className="window-input-field">
            <label>
              String
            </label>

            <input
              value={string}
              onChange={(e) =>
                setString(
                  e.target.value
                )
              }
              placeholder="abcabcbb"
            />
          </div>
        </div>
      )}

      {error && (
       <div className="window-input-error">
          {error}
        </div>
      )}

      <button
        className="window-visualize-button"
        onClick={
          handleVisualize
        }
      >
        Visualize Algorithm
      </button>
    </section>
  );
}

export default SlidingWindowInput;