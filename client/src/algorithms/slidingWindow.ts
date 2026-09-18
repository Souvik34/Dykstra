export type MaxSumStep = {
  type: "start" | "add" | "new-max" | "check" | "remove" | "complete";
  left: number;
  right: number;
  windowSum: number;
  maxSum: number | null;
  bestStart: number;
  bestEnd: number;
  array: number[];

  addedIndex?: number;
  addedValue?: number;
  removedIndex?: number;
  removedValue?: number;
};

export type MaxSumResult = {
  steps: MaxSumStep[];
  maxSum: number;
  start: number;
  end: number;
};

export function maxSumSubarrayOfSizeK(
  array: number[],
  k: number,
): MaxSumResult {
  const steps: MaxSumStep[] = [];

  let left = 0;
  let right = 0;
  let windowSum = 0;
  let maxSum = -Infinity;
  let bestStart = 0;
  let bestEnd = -1;

  steps.push({
    type: "start",
    left: 0,
    right: -1,
    windowSum: 0,
    maxSum: null,
    bestStart: 0,
    bestEnd: -1,
    array: [...array],
  });

  while (right < array.length) {
    windowSum += array[right];

    steps.push({
      type: "add",
      left,
      right,
      addedIndex: right,
      addedValue: array[right],
      windowSum,
      maxSum: maxSum === -Infinity ? null : maxSum,
      bestStart,
      bestEnd,
      array: [...array],
    });

    if (right - left + 1 === k) {
      if (windowSum > maxSum) {
        maxSum = windowSum;
        bestStart = left;
        bestEnd = right;

        steps.push({
          type: "new-max",
          left,
          right,
          windowSum,
          maxSum,
          bestStart,
          bestEnd,
          array: [...array],
        });
      } else {
        steps.push({
          type: "check",
          left,
          right,
          windowSum,
          maxSum,
          bestStart,
          bestEnd,
          array: [...array],
        });
      }

      windowSum -= array[left];

      steps.push({
        type: "remove",
        left,
        right,
        removedIndex: left,
        removedValue: array[left],
        windowSum,
        maxSum,
        bestStart,
        bestEnd,
        array: [...array],
      });

      left++;
    }

    right++;
  }

  steps.push({
    type: "complete",
    left: bestStart,
    right: bestEnd,
    windowSum: maxSum,
    maxSum,
    bestStart,
    bestEnd,
    array: [...array],
  });

  return {
    steps,
    maxSum,
    start: bestStart,
    end: bestEnd,
  };
}


export type MinSizeStep = {
  type: "add" | "valid" | "new-min" | "remove" | "complete";
  left: number;
  right: number;
  windowSum: number;
  target: number;
  minLength: number | null;
  bestStart: number;
  bestEnd: number;
  array: number[];

  addedIndex?: number;
  addedValue?: number;
  removedIndex?: number;
  removedValue?: number;
  currentLength?: number;
};

export type MinSizeResult = {
  steps: MinSizeStep[];
  minLength: number;
  start: number;
  end: number;
};

export function minSizeSubarraySum(
  array: number[],
  target: number,
): MinSizeResult {
  const steps: MinSizeStep[] = [];

  let left = 0;
  let windowSum = 0;

  let minLength = Infinity;
  let bestStart = -1;
  let bestEnd = -1;

  for (
    let right = 0;
    right < array.length;
    right++
  ) {
    windowSum += array[right];

    steps.push({
      type: "add",
      left,
      right,
      addedIndex: right,
      addedValue: array[right],
      windowSum,
      target,
      minLength:
        minLength === Infinity ? null : minLength,
      bestStart,
      bestEnd,
      array: [...array],
    });

    while (windowSum >= target) {
      const currentLength =
        right - left + 1;

      steps.push({
        type: "valid",
        left,
        right,
        windowSum,
        target,
        currentLength,
        minLength:
          minLength === Infinity ? null : minLength,
        bestStart,
        bestEnd,
        array: [...array],
      });

      if (currentLength < minLength) {
        minLength = currentLength;
        bestStart = left;
        bestEnd = right;

        steps.push({
          type: "new-min",
          left,
          right,
          windowSum,
          target,
          currentLength,
          minLength,
          bestStart,
          bestEnd,
          array: [...array],
        });
      }

      windowSum -= array[left];

      steps.push({
        type: "remove",
        left,
        right,
        removedIndex: left,
        removedValue: array[left],
        windowSum,
        target,
        currentLength,
        minLength,
        bestStart,
        bestEnd,
        array: [...array],
      });

      left++;
    }
  }

  if (minLength === Infinity) {
    steps.push({
      type: "complete",
      left: 0,
      right: -1,
      windowSum: 0,
      target,
      minLength: null,
      bestStart: -1,
      bestEnd: -1,
      array: [...array],
    });

    return {
      steps,
      minLength: -1,
      start: -1,
      end: -1,
    };
  }

  steps.push({
    type: "complete",
    left: bestStart,
    right: bestEnd,
    windowSum,
    target,
    minLength,
    bestStart,
    bestEnd,
    array: [...array],
  });

  return {
    steps,
    minLength,
    start: bestStart,
    end: bestEnd,
  };
}


export type LongestSubstringStep = {
  type:
    | "start"
    | "inspect"
    | "duplicate"
    | "move-left"
    | "new-max"
    | "update"
    | "complete";

  left: number;
  right: number;
  char: string | null;
  currentLength: number;
  maxLength: number;
  bestStart: number;
  bestEnd: number;
  lastSeen: Record<string, number>;
  string: string;

  previousIndex?: number;
  longestSubstring?: string;
};

export type LongestSubstringResult = {
  steps: LongestSubstringStep[];
  maxLength: number;
  longestSubstring: string;
  start: number;
  end: number;
};

export function longestSubstringWithoutRepeating(
  string: string,
): LongestSubstringResult {
  const steps: LongestSubstringStep[] = [];

  let left = 0;
  let maxLength = 0;
  let bestStart = 0;
  let bestEnd = -1;

  const lastSeen = new Map<string, number>();

  steps.push({
    type: "start",
    left: 0,
    right: -1,
    char: null,
    currentLength: 0,
    maxLength: 0,
    bestStart: 0,
    bestEnd: -1,
    lastSeen: {},
    string,
  });

  for (
    let right = 0;
    right < string.length;
    right++
  ) {
    const char = string[right];

    steps.push({
      type: "inspect",
      left,
      right,
      char,
      currentLength: right - left + 1,
      maxLength,
      bestStart,
      bestEnd,
      lastSeen: Object.fromEntries(lastSeen),
      string,
    });

    if (
      lastSeen.has(char) &&
      lastSeen.get(char)! >= left
    ) {
      const previousIndex = lastSeen.get(char)!;

      steps.push({
        type: "duplicate",
        left,
        right,
        char,
        previousIndex,
        currentLength: right - left + 1,
        maxLength,
        bestStart,
        bestEnd,
        lastSeen: Object.fromEntries(lastSeen),
        string,
      });

      left = previousIndex + 1;

      steps.push({
        type: "move-left",
        left,
        right,
        char,
        previousIndex,
        currentLength: right - left + 1,
        maxLength,
        bestStart,
        bestEnd,
        lastSeen: Object.fromEntries(lastSeen),
        string,
      });
    }

    lastSeen.set(char, right);

    const currentLength =
      right - left + 1;

    if (currentLength > maxLength) {
      maxLength = currentLength;
      bestStart = left;
      bestEnd = right;

      steps.push({
        type: "new-max",
        left,
        right,
        char,
        currentLength,
        maxLength,
        bestStart,
        bestEnd,
        lastSeen: Object.fromEntries(lastSeen),
        string,
      });
    } else {
      steps.push({
        type: "update",
        left,
        right,
        char,
        currentLength,
        maxLength,
        bestStart,
        bestEnd,
        lastSeen: Object.fromEntries(lastSeen),
        string,
      });
    }
  }

  const longestSubstring = string.substring(
    bestStart,
    bestEnd + 1,
  );

  steps.push({
    type: "complete",
    left: bestStart,
    right: bestEnd,
    currentLength: maxLength,
    maxLength,
    bestStart,
    bestEnd,
    longestSubstring,
    lastSeen: Object.fromEntries(lastSeen),
    string,
  });

  return {
    steps,
    maxLength,
    longestSubstring,
    start: bestStart,
    end: bestEnd,
  };
}