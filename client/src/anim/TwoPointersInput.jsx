import { useEffect, useState } from "react";

function TwoPointersInput({
  selectedPattern,
  onVisualize,
}) {
  const [array, setArray] = useState(
    "1, 2, 3, 4, 6, 8, 9"
  );

  const [target, setTarget] = useState("10");

  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
  }, [selectedPattern]);

  const parseArray = () => {
    const values = array
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .map(Number);

    if (
      values.length < 2 ||
      values.some(
        (value) => !Number.isFinite(value)
      )
    ) {
      setError(
        "Enter a valid array with at least two numbers."
      );

      return null;
    }

    return values;
  };

  const handleVisualize = () => {
    setError("");

    const values = parseArray();

    if (!values) return;

    if (
      selectedPattern === "opposite-ends"
    ) {
      for (let i = 1; i < values.length; i++) {
        if (values[i] < values[i - 1]) {
          setError(
            "For this pattern, the array must be sorted."
          );

          return;
        }
      }

      const targetValue = Number(target);

      if (
        !Number.isFinite(targetValue)
      ) {
        setError(
          "Enter a valid target."
        );

        return;
      }

      onVisualize({
        pattern: "opposite-ends",
        example:
          "Two Sum II — Input Array Is Sorted",
        array: values,
        target: targetValue,
      });
    }
  };

  return (
    <section className="two-pointer-input">
      <div className="two-pointer-input-header">
        <div>
          <div className="two-pointer-breadcrumb">
            Two Pointers
          </div>

          <h1>
            Opposite Ends
          </h1>

          <p>
            Move two pointers from opposite
            ends of a sorted array based on
            the current result.
          </p>
        </div>

        <div className="two-pointer-complexity">
          O(n)
        </div>
      </div>

      <div className="two-pointer-pattern-info">
        <div>
          <span className="two-pointer-label">
            Pattern
          </span>

          <strong>
            Opposite Ends
          </strong>
        </div>

        <div>
          <span className="two-pointer-label">
            Example Problem
          </span>

          <strong>
            Two Sum II — Input Array Is Sorted
          </strong>
        </div>
      </div>

      <div className="two-pointer-input-grid">
        <div className="two-pointer-field">
          <label>Sorted Array</label>

          <input
            value={array}
            onChange={(e) =>
              setArray(e.target.value)
            }
            placeholder="1, 2, 3, 4, 6, 8, 9"
          />
        </div>

        <div className="two-pointer-field two-pointer-small">
          <label>Target</label>

          <input
            type="number"
            value={target}
            onChange={(e) =>
              setTarget(e.target.value)
            }
          />
        </div>
      </div>

      {error && (
        <div className="two-pointer-error">
          {error}
        </div>
      )}

      <button
        className="two-pointer-visualize-button"
        onClick={handleVisualize}
      >
        Visualize Pattern
      </button>
    </section>
  );
}

export default TwoPointersInput;