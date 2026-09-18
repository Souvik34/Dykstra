export type BinarySearchAnswerStep = {
  type:
    | "check"
    | "possible"
    | "impossible"
    | "found";
  left: number;
  mid: number;
  right: number;
  answer: number;
  speed: number;
  piles: number[];
  requiredHours?: number;
  allowedHours: number;
  possible?: boolean;
};

export type BinarySearchAnswerResult = {
  steps: BinarySearchAnswerStep[];
  answer: number;
};

export function binarySearchAnswer(
  piles: number[],
  hours: number,
): BinarySearchAnswerResult {
  const steps: BinarySearchAnswerStep[] = [];

  let left = 1;
  let right = Math.max(...piles);

  let answer = right;

  const canFinish = (speed: number): boolean => {
    let requiredHours = 0;

    for (const pile of piles) {
      requiredHours += Math.ceil(
        pile / speed,
      );
    }

    return requiredHours <= hours;
  };

  while (left <= right) {
    const mid = Math.floor(
      (left + right) / 2,
    );

    let requiredHours = 0;

    for (const pile of piles) {
      requiredHours += Math.ceil(
        pile / mid,
      );
    }

    const possible =
      requiredHours <= hours;

    steps.push({
      type: "check",
      left,
      mid,
      right,
      answer,
      speed: mid,
      requiredHours,
      allowedHours: hours,
      possible,
      piles: [...piles],
    });

    if (possible) {
      answer = mid;

      steps.push({
        type: "possible",
        left,
        mid,
        right,
        answer: mid,
        speed: mid,
        requiredHours,
        allowedHours: hours,
        piles: [...piles],
      });

      right = mid - 1;
    } else {
      steps.push({
        type: "impossible",
        left,
        mid,
        right,
        answer,
        speed: mid,
        requiredHours,
        allowedHours: hours,
        piles: [...piles],
      });

      left = mid + 1;
    }
  }

  steps.push({
    type: "found",
    left,
    mid: answer,
    right,
    answer,
    speed: answer,
    piles: [...piles],
    allowedHours: hours,
  });

  return {
    steps,
    answer,
  };
}