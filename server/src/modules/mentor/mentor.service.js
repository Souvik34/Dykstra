import redisClient from "../../config/redis.js";

import {
    getTopicStrengthRepo,
    getStrongTopicsRepo,
    getDifficultyDistributionRepo,
    getTopicDistributionRepo,
    getRecentActivityRepo
} from "../dashboard/dashboard.repository.js";
import {
    getMentorProblemsRepo,
    getMentorProblemsByIdsRepo
} from "../problems/problems.repository.js";
import {
    generateMentorAdvice
} from "./mentor.ai.service.js";

import {
    findFocusTopic,
    calculateTopicScore
} from "./topicScore.js";

export const getMentorRecommendation = async (userId) => {
    const snapshotCacheKey = `mentor-snapshot:${userId}`;

    const cachedSnapshot =
        await redisClient.get(snapshotCacheKey);

    const existingSnapshot = cachedSnapshot
        ? JSON.parse(cachedSnapshot)
        : null;

    const existingPlan =
        existingSnapshot?.mentorPlan;

    const planProblemIds =
        (existingPlan?.problemIds || []).map(Number);

    const completedProblemIds =
        (existingPlan?.completedProblemIds || []).map(Number);

    const planCompleted =
        planProblemIds.length > 0 &&
        planProblemIds.every((id) =>
            completedProblemIds.includes(id)
        );

    /*
    =====================================================
    ACTIVE PLAN
    =====================================================
    */

    if (existingPlan && !planCompleted) {

        console.log("MENTOR ACTIVE PLAN - REUSING AI");

        const remainingProblemIds =
            planProblemIds.filter(
                (id) =>
                    !completedProblemIds.includes(id)
            );

        const mentorProblems =
            await getMentorProblemsByIdsRepo(
                remainingProblemIds
            );

        return {
            ...existingSnapshot,

            mentorProblems,

            mentorPlan: {
                ...existingPlan,

                // IMPORTANT:
                // Never shrink the original plan.
                problemIds: planProblemIds,

                completedProblemIds,
            },
        };
    }

    /*
    =====================================================
    NEW PLAN REQUIRED
    =====================================================
    */

    console.log(
        "MENTOR PLAN COMPLETE - GENERATING NEW PLAN"
    );

    const [
        topicStrength,
        strongTopics,
        difficulty,
        topics,
        recentActivity
    ] = await Promise.all([
        getTopicStrengthRepo(userId),
        getStrongTopicsRepo(userId),
        getDifficultyDistributionRepo(userId),
        getTopicDistributionRepo(userId),
        getRecentActivityRepo(userId)
    ]);

    const rankedTopics = topicStrength
        .map((topic) =>
            calculateTopicScore(topic)
        )
        .sort(
            (a, b) => a.score - b.score
        );

    let focusTopic = null;
    let mentorProblems = [];

    for (const topic of rankedTopics) {

        const problems =
            await getMentorProblemsRepo(
                userId,
                topic.topic,
                5
            );

        if (problems.length > 0) {

            focusTopic = topic;
            mentorProblems = problems;

            break;
        }
    }

    /*
    =====================================================
    RECOMMENDATION
    =====================================================
    */

    let recommendation;

    if (!focusTopic) {

        recommendation = {

            title: "Start your DSA journey",

            summary:
                "Begin solving problems to unlock personalized guidance.",

            priority: "Getting Started",

            actions: [
                "Practice arrays and strings",
                "Build daily solving habit"
            ]
        };

    } else if (
        focusTopic.type === "coverage_gap"
    ) {

        recommendation = {

            title:
                `Explore ${focusTopic.topic}`,

            summary:
                `You have limited practice in ${focusTopic.topic}. Build more exposure before evaluating mastery.`,

            priority:
                focusTopic.topic,

            confidence:
                focusTopic.confidence,

            actions: [

                `Solve beginner ${focusTopic.topic} problems`,

                `Learn common ${focusTopic.topic} patterns`,

                `Add this topic to your revision cycle`
            ]
        };

    } else {

        recommendation = {

            title:
                `Improve ${focusTopic.topic}`,

            summary:
                `You have practiced ${focusTopic.topic}, but your performance needs improvement.`,

            priority:
                focusTopic.topic,

            confidence:
                focusTopic.confidence,

            actions: [
                "Review mistakes",
                "Solve medium level problems",
                "Attempt timed practice"
            ]
        };
    }

    /*
    =====================================================
    AI PROFILE
    =====================================================
    */

    const aiProfile = {

        recommendation,

        focusTopic,

        strongTopics:
            strongTopics.slice(0, 3),

        difficulty,

        recentProblems:
            recentActivity.slice(0, 5),

        topics:
            topics.slice(0, 5),

        mentorProblems:
            mentorProblems.map(
                (problem) => ({
                    id: problem.id,
                    title: problem.title,
                    difficulty: problem.difficulty,
                    topic: problem.topic
                })
            )
    };

    /*
    =====================================================
    GEMINI
    =====================================================
    */

    console.log(
        "MENTOR AI GENERATING NEW PLAN"
    );

    const aiAdvice =
        await generateMentorAdvice(
            aiProfile
        );

    /*
    =====================================================
    SAVE NEW PLAN
    =====================================================
    */

    const newProblemIds =
        mentorProblems.map(
            (problem) => Number(problem.id)
        );

    const snapshot = {

        recommendation,

        aiAdvice,

        mentorProblems,

        profile: {

            focusTopic,

            strongTopics,

            difficulty,

            topics,

            recentActivity
        },

        mentorPlan: {

            topic:
                focusTopic?.topic ?? null,

            // THIS NEVER CHANGES UNTIL PLAN IS COMPLETE
            problemIds:
                newProblemIds,

            // ALWAYS EMPTY FOR A NEW PLAN
            completedProblemIds: []
        }
    };

    await redisClient.set(
        snapshotCacheKey,
        JSON.stringify(snapshot)
    );

    return snapshot;
};

export const completeMentorProblem = async (
  userId,
  problemId
) => {
  const snapshotCacheKey = `mentor-snapshot:${userId}`;

  console.log("========== MENTOR COMPLETION ==========");
  console.log("USER:", userId);
  console.log("PROBLEM:", problemId);

  const cached = await redisClient.get(snapshotCacheKey);

  console.log("MENTOR SNAPSHOT EXISTS:", !!cached);

  if (!cached) {
    throw new Error("No active mentor plan");
  }

  const snapshot = JSON.parse(cached);

  const plan = snapshot.mentorPlan;
const planProblemIds =
    (plan.problemIds || []).map(Number);

plan.completedProblemIds =
    (plan.completedProblemIds || [])
        .map(Number)
        .filter((id) =>
            planProblemIds.includes(id)
        );
  console.log("MENTOR PLAN:", plan);

  if (!planProblemIds.includes(Number(problemId))) {
    throw new Error(
        "Problem is not part of the current mentor plan"
    );
}

  if (!plan.completedProblemIds) {
    plan.completedProblemIds = [];
  }

  if (
    !plan.completedProblemIds.includes(
        Number(problemId)
    )
) {
    plan.completedProblemIds.push(
        Number(problemId)
    );
}

  snapshot.mentorPlan = plan;

  await redisClient.set(
    snapshotCacheKey,
    JSON.stringify(snapshot)
  );
await redisClient.del(`dashboard:${userId}`);
  console.log(
    "UPDATED COMPLETED IDS:",
    plan.completedProblemIds
  );

  console.log("========================================");

  return snapshot.mentorPlan;
};