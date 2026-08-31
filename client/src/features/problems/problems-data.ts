/* eslint-disable prettier/prettier */
export type Difficulty = "Easy" | "Medium" | "Hard";

export interface BackendProblem {
  id: number;
  title: string;
  question_link: string;
  difficulty: string;
  topic: string;
  tags: string;
  platform: string;
  updatedAt?: string;
}

export interface Problem {
  id: number;
  title: string;
  difficulty: Difficulty;
  topic: string;
  companies: string[];
  leetcodeUrl: string;
    updatedAt?: string;
}

// export const PROBLEMS: Problem[] = [
//   {
//     id: "two-sum",
//     title: "Two Sum",
//     difficulty: "Easy",
//     topic: "Arrays & Hashing",
//     companies: ["Google", "Amazon", "Apple"],
//     leetcodeUrl: "https://leetcode.com/problems/two-sum/",
//   },
//   {
//     id: "valid-anagram",
//     title: "Valid Anagram",
//     difficulty: "Easy",
//     topic: "Arrays & Hashing",
//     companies: ["Meta", "Bloomberg"],
//     leetcodeUrl: "https://leetcode.com/problems/valid-anagram/",
//   },
//   {
//     id: "group-anagrams",
//     title: "Group Anagrams",
//     difficulty: "Medium",
//     topic: "Arrays & Hashing",
//     companies: ["Amazon", "Uber"],
//     leetcodeUrl: "https://leetcode.com/problems/group-anagrams/",
//   },
//   {
//     id: "top-k-frequent-elements",
//     title: "Top K Frequent Elements",
//     difficulty: "Medium",
//     topic: "Arrays & Hashing",
//     companies: ["Amazon", "Facebook"],
//     leetcodeUrl: "https://leetcode.com/problems/top-k-frequent-elements/",
//   },
//   {
//     id: "product-of-array-except-self",
//     title: "Product of Array Except Self",
//     difficulty: "Medium",
//     topic: "Arrays & Hashing",
//     companies: ["Amazon", "Lyft"],
//     leetcodeUrl: "https://leetcode.com/problems/product-of-array-except-self/",
//   },
//   {
//     id: "valid-palindrome",
//     title: "Valid Palindrome",
//     difficulty: "Easy",
//     topic: "Two Pointers",
//     companies: ["Facebook", "Microsoft"],
//     leetcodeUrl: "https://leetcode.com/problems/valid-palindrome/",
//   },
//   {
//     id: "3sum",
//     title: "3Sum",
//     difficulty: "Medium",
//     topic: "Two Pointers",
//     companies: ["Amazon", "Adobe", "Google"],
//     leetcodeUrl: "https://leetcode.com/problems/3sum/",
//   },
//   {
//     id: "container-with-most-water",
//     title: "Container With Most Water",
//     difficulty: "Medium",
//     topic: "Two Pointers",
//     companies: ["Amazon", "Bloomberg"],
//     leetcodeUrl: "https://leetcode.com/problems/container-with-most-water/",
//   },
//   {
//     id: "best-time-to-buy-and-sell-stock",
//     title: "Best Time to Buy and Sell Stock",
//     difficulty: "Easy",
//     topic: "Sliding Window",
//     companies: ["Amazon", "Facebook", "Microsoft"],
//     leetcodeUrl: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
//   },
//   {
//     id: "longest-substring-without-repeating-characters",
//     title: "Longest Substring Without Repeating Characters",
//     difficulty: "Medium",
//     topic: "Sliding Window",
//     companies: ["Amazon", "Bloomberg", "Adobe"],
//     leetcodeUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
//   },
//   {
//     id: "valid-parentheses",
//     title: "Valid Parentheses",
//     difficulty: "Easy",
//     topic: "Stack",
//     companies: ["Amazon", "Google", "Microsoft"],
//     leetcodeUrl: "https://leetcode.com/problems/valid-parentheses/",
//   },
//   {
//     id: "daily-temperatures",
//     title: "Daily Temperatures",
//     difficulty: "Medium",
//     topic: "Stack",
//     companies: ["Amazon", "Google"],
//     leetcodeUrl: "https://leetcode.com/problems/daily-temperatures/",
//   },
//   {
//     id: "binary-search",
//     title: "Binary Search",
//     difficulty: "Easy",
//     topic: "Binary Search",
//     companies: ["Amazon", "Microsoft"],
//     leetcodeUrl: "https://leetcode.com/problems/binary-search/",
//   },
//   {
//     id: "search-in-rotated-sorted-array",
//     title: "Search in Rotated Sorted Array",
//     difficulty: "Medium",
//     topic: "Binary Search",
//     companies: ["Amazon", "Facebook", "Apple"],
//     leetcodeUrl: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
//   },
//   {
//     id: "reverse-linked-list",
//     title: "Reverse Linked List",
//     difficulty: "Easy",
//     topic: "Linked List",
//     companies: ["Amazon", "Microsoft", "Apple"],
//     leetcodeUrl: "https://leetcode.com/problems/reverse-linked-list/",
//   },
//   {
//     id: "merge-two-sorted-lists",
//     title: "Merge Two Sorted Lists",
//     difficulty: "Easy",
//     topic: "Linked List",
//     companies: ["Amazon", "Google"],
//     leetcodeUrl: "https://leetcode.com/problems/merge-two-sorted-lists/",
//   },
//   {
//     id: "linked-list-cycle",
//     title: "Linked List Cycle",
//     difficulty: "Easy",
//     topic: "Linked List",
//     companies: ["Amazon", "Microsoft"],
//     leetcodeUrl: "https://leetcode.com/problems/linked-list-cycle/",
//   },
//   {
//     id: "invert-binary-tree",
//     title: "Invert Binary Tree",
//     difficulty: "Easy",
//     topic: "Trees",
//     companies: ["Google", "Amazon"],
//     leetcodeUrl: "https://leetcode.com/problems/invert-binary-tree/",
//   },
//   {
//     id: "maximum-depth-of-binary-tree",
//     title: "Maximum Depth of Binary Tree",
//     difficulty: "Easy",
//     topic: "Trees",
//     companies: ["Amazon", "LinkedIn"],
//     leetcodeUrl: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
//   },
//   {
//     id: "binary-tree-level-order-traversal",
//     title: "Binary Tree Level Order Traversal",
//     difficulty: "Medium",
//     topic: "Trees",
//     companies: ["Amazon", "Bloomberg", "Facebook"],
//     leetcodeUrl: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
//   },
//   {
//     id: "number-of-islands",
//     title: "Number of Islands",
//     difficulty: "Medium",
//     topic: "Graphs",
//     companies: ["Amazon", "Google", "Facebook"],
//     leetcodeUrl: "https://leetcode.com/problems/number-of-islands/",
//   },
//   {
//     id: "course-schedule",
//     title: "Course Schedule",
//     difficulty: "Medium",
//     topic: "Graphs",
//     companies: ["Amazon", "Google"],
//     leetcodeUrl: "https://leetcode.com/problems/course-schedule/",
//   },
//   {
//     id: "climbing-stairs",
//     title: "Climbing Stairs",
//     difficulty: "Easy",
//     topic: "Dynamic Programming",
//     companies: ["Amazon", "Adobe"],
//     leetcodeUrl: "https://leetcode.com/problems/climbing-stairs/",
//   },
//   {
//     id: "coin-change",
//     title: "Coin Change",
//     difficulty: "Medium",
//     topic: "Dynamic Programming",
//     companies: ["Amazon", "Goldman Sachs"],
//     leetcodeUrl: "https://leetcode.com/problems/coin-change/",
//   },
//   {
//     id: "longest-increasing-subsequence",
//     title: "Longest Increasing Subsequence",
//     difficulty: "Medium",
//     topic: "Dynamic Programming",
//     companies: ["Amazon", "Microsoft"],
//     leetcodeUrl: "https://leetcode.com/problems/longest-increasing-subsequence/",
//   },
//   {
//     id: "word-break",
//     title: "Word Break",
//     difficulty: "Medium",
//     topic: "Dynamic Programming",
//     companies: ["Amazon", "Google", "Facebook"],
//     leetcodeUrl: "https://leetcode.com/problems/word-break/",
//   },
//   {
//     id: "trapping-rain-water",
//     title: "Trapping Rain Water",
//     difficulty: "Hard",
//     topic: "Two Pointers",
//     companies: ["Amazon", "Google", "Apple"],
//     leetcodeUrl: "https://leetcode.com/problems/trapping-rain-water/",
//   },
//   {
//     id: "median-of-two-sorted-arrays",
//     title: "Median of Two Sorted Arrays",
//     difficulty: "Hard",
//     topic: "Binary Search",
//     companies: ["Google", "Apple", "Adobe"],
//     leetcodeUrl: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
//   },
//   {
//     id: "word-ladder",
//     title: "Word Ladder",
//     difficulty: "Hard",
//     topic: "Graphs",
//     companies: ["Amazon", "Facebook"],
//     leetcodeUrl: "https://leetcode.com/problems/word-ladder/",
//   },
//   {
//     id: "merge-k-sorted-lists",
//     title: "Merge K Sorted Lists",
//     difficulty: "Hard",
//     topic: "Linked List",
//     companies: ["Amazon", "Google", "Uber"],
//     leetcodeUrl: "https://leetcode.com/problems/merge-k-sorted-lists/",
//   },
// ];

// export const TOPICS = Array.from(new Set(PROBLEMS.map((p) => p.topic))).sort();
// export const COMPANIES = Array.from(new Set(PROBLEMS.flatMap((p) => p.companies))).sort();
