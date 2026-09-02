import redisClient from "../../config/redis.js";

import { getDueRevisionsRepo } from "../revision/revision.repository.js";
import {
  getWeakTopicRepo,
  getStrongTopicsRepo,
  getRecommendedProblemsRepo,
  getDailySolveRepo,
  getTopicDistributionRepo,
  getDifficultyDistributionRepo,
  getRecentActivityRepo,
} from "./dashboard.repository.js";
import { getMentorRecommendation } from "../mentor/mentor.service.js";

const calculateStreak = (dailyData) => {
  if (!dailyData.length) {
    return {
      streak: 0,
      longestStreak: 0,
    };
  }

  const dates = dailyData
    .map((d) => String(d.date).slice(0, 10))
    .sort();

  let longestStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(`${dates[i - 1]}T00:00:00`);
    const curr = new Date(`${dates[i]}T00:00:00`);

    const diffDays =
      Math.round(
        (curr - prev) / (1000 * 60 * 60 * 24)
      );

    if (diffDays === 1) {
      currentRun++;
      longestStreak = Math.max(
        longestStreak,
        currentRun
      );
    } else if (diffDays > 1) {
      currentRun = 1;
    }
  }

  // Get today's date using the server's local calendar date.
  const today = new Date();
  const todayString =
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const lastDate = dates[dates.length - 1];

  
  const streak =
    lastDate === todayString
      ? currentRun
      : 0;

  return {
    streak,
    longestStreak,
  };
};

export const getDashboardService = async (userId) => {
 if (!userId) {
    throw new Error("Valid userId is required");
}

  const cacheKey = `dashboard:${userId}`;


  const cached = await redisClient.get(cacheKey);
  if (cached) {
    console.log("DASHBOARD CACHE HIT");
    return JSON.parse(cached);
  }

  console.log("DASHBOARD CACHE MISS");
console.log("Before Promise.all");
const [
    revisions,
    dailySolve,
    topicDist,
    difficultyDist,
    strongTopics,
    recentActivity,
] = await Promise.all([
    getDueRevisionsRepo(userId),
    getDailySolveRepo(userId),
    getTopicDistributionRepo(userId),
    getDifficultyDistributionRepo(userId),
    getStrongTopicsRepo(userId),
    getRecentActivityRepo(userId),
]);
console.log("After Promise.all");
const mentor = await getMentorRecommendation(userId);
console.log(mentor);
 const focusTopic = mentor?.focusTopic || null;

const weakTopic = focusTopic?.topic || null;

const recommendedProblems =
    await getRecommendedProblemsRepo(weakTopic);
console.log("DAILY SOLVE DATA:", dailyData);
  const { streak, longestStreak } = calculateStreak(dailySolve);

 
const totalSolved =
    dailySolve.reduce(
        (acc, day) => acc + Number(day.count),
        0
    );

const easy = Number(
    difficultyDist.find(d => d.difficulty === "Easy")?.count || 0
);

const medium = Number(
    difficultyDist.find(d => d.difficulty === "Medium")?.count || 0
);

const hard = Number(
    difficultyDist.find(d => d.difficulty === "Hard")?.count || 0
);

    let readiness = 0;

readiness += Math.min(totalSolved / 5, 40);

readiness += Math.min(streak * 2, 20);

readiness += Math.min(
    revisions.length === 0
        ? 20
        : Math.max(20 - revisions.length, 5),
    20
);

readiness += Math.min(hard * 5,20);

readiness = Math.min(
    Math.round(readiness),
    100
);

const response = {

    stats: {

        solved: totalSolved,

       easy,
medium,
hard,

        revisionPending: revisions.length,

        streak,

        longestStreak,

    },
    readiness: {

    score: readiness,

    level:
        readiness >= 90
            ? "Excellent"

            : readiness >= 75
            ? "Strong Candidate"

            : readiness >= 60
            ? "Interview Ready"

            : readiness >= 40
            ? "Developing"

            : "Beginner"

},

    revision: {

        dueCount: revisions.length,

        items: revisions,

    },

      focusTopic,

    recommendedProblems,
strongTopics,
    analytics: {

        dailySolve,

        topicDistribution: topicDist,

        difficultyDistribution: difficultyDist,
        
      },
      recentActivity,
      recommendation: mentor.recommendation,

aiAdvice: mentor.aiAdvice,

mentorProblems: mentor.mentorProblems,
profile: mentor.profile,

};

  await redisClient.setEx(
    cacheKey,
    300, 
    JSON.stringify(response)
  );

  return response;
};