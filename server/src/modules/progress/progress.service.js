import {
  getUserProgressRepo,
  insertSolvedProblemRepo,
  updateConfidenceRepo,
} from "./progress.repository.js";
import redisClient from "../../config/redis.js";

import { calculateConfidenceScore } from "../../utils/confidenceScore.js";

export const getUserProgressService = async (userId) => {
  if (!userId) {
    throw new Error("Valid userId is required");
  }

  return await getUserProgressRepo(userId);
};

export const addSolvedProblemService = async (
  userId,
  problemId,
  difficulty,
  timeTaken
) => {
  if (!userId || !problemId || !difficulty) {
    throw new Error("Invalid input for solved problem");
  }

  await insertSolvedProblemRepo(
    userId,
    problemId,
    difficulty,
    timeTaken
  );

  const confidence = calculateConfidenceScore({
    difficulty,
    timeTaken,
  });

  await updateConfidenceRepo(
    userId,
    problemId,
    confidence
  );
  await redisClient.del(`dashboard:${userId}`);
};