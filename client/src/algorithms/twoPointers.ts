export type TwoPointersStep = {
  type:
    | "start"
    | "check"
    | "found"
    | "move-left"
    | "move-right"
    | "new-range"
    | "not-found";

  array: number[];
  left: number;
  right: number;
  target: number;

  leftValue?: number;
  rightValue?: number;
  sum?: number;
  reason?: string;
};

export type TwoPointersResult = {
  steps: TwoPointersStep[];
  found: boolean;
  indices: [number, number] | [];
};

export function twoPointers(
  array: number[],
  target: number,
): TwoPointersResult {
  const steps: TwoPointersStep[] = [];

  let left = 0;
  let right = array.length - 1;

  steps.push({
    type: "start",
    array: [...array],
    left,
    right,
    target,
  });

  while (left < right) {
    const leftValue = array[left];
    const rightValue = array[right];
    const sum = leftValue + rightValue;

    steps.push({
      type: "check",
      array: [...array],
      left,
      right,
      leftValue,
      rightValue,
      sum,
      target,
    });

    if (sum === target) {
      steps.push({
        type: "found",
        array: [...array],
        left,
        right,
        leftValue,
        rightValue,
        sum,
        target,
      });

      return {
        steps,
        found: true,
        indices: [left, right],
      };
    }

    if (sum < target) {
      steps.push({
        type: "move-left",
        array: [...array],
        left,
        right,
        leftValue,
        rightValue,
        sum,
        target,
        reason: "Sum is smaller than target",
      });

      left++;
    } else {
      steps.push({
        type: "move-right",
        array: [...array],
        left,
        right,
        leftValue,
        rightValue,
        sum,
        target,
        reason: "Sum is greater than target",
      });

      right--;
    }

    if (left < right) {
      steps.push({
        type: "new-range",
        array: [...array],
        left,
        right,
        target,
      });
    }
  }

  steps.push({
    type: "not-found",
    array: [...array],
    left,
    right,
    target,
  });

  return {
    steps,
    found: false,
    indices: [],
  };
}