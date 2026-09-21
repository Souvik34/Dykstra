import * as plannerService from "./planner.service.js";


/*
|--------------------------------------------------------------------------
| Get current week's plan
|--------------------------------------------------------------------------
*/

export const getCurrentPlan = async (
  req,
  res
) => {
  try {
    const userId =
      req.user.id;

    const {
      weekStart,
    } = req.query;


    if (!weekStart) {
      return res.status(400).json({
        success: false,
        message:
          "weekStart is required",
      });
    }


    const plan =
      await plannerService.getPlan(
        userId,
        weekStart
      );


    return res.json({
      success: true,
      data: plan,
    });
  } catch (err) {
    console.error(
      "GET PLANNER ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


/*
|--------------------------------------------------------------------------
| Generate draft
|--------------------------------------------------------------------------
*/

export const generateDraft = async (
  req,
  res
) => {
  try {
    const userId =
      req.user.id;


    const {
      weekStart,
      goalCount,
      topics,
      difficulties,
      mentorProblemIds,
    } = req.body;


    if (
      !weekStart ||
      !goalCount ||
      !Array.isArray(topics) ||
      topics.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "weekStart, goalCount and topics are required",
      });
    }


    const draft =
      await plannerService
        .generateWeeklyDraft({
          userId,
          weekStart,
          goalCount:
            Number(goalCount),
          topics,
          difficulties:
            Array.isArray(
              difficulties
            )
              ? difficulties
              : [],
          mentorProblemIds:
            Array.isArray(
              mentorProblemIds
            )
              ? mentorProblemIds
              : [],
        });


    return res.json({
      success: true,
      data: draft,
    });
  } catch (err) {
    console.error(
      "GENERATE PLANNER DRAFT ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


/*
|--------------------------------------------------------------------------
| Save weekly plan
|--------------------------------------------------------------------------
*/

export const savePlan = async (
  req,
  res
) => {
  try {
    const userId =
      req.user.id;


    const {
      weekStart,
      weekEnd,
      goalCount,
      items,
    } = req.body;


    if (
      !weekStart ||
      !weekEnd ||
      !goalCount ||
      !Array.isArray(items)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "weekStart, weekEnd, goalCount and items are required",
      });
    }


    const plan =
      await plannerService
        .saveWeeklyPlan({
          userId,
          weekStart,
          weekEnd,
          goalCount:
            Number(goalCount),
          items,
        });


    return res.json({
      success: true,
      data: plan,
    });
  } catch (err) {
    console.error(
      "SAVE PLANNER ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| Add item to planner
|--------------------------------------------------------------------------
*/

export const addItem = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    const {
      weekStart,
      problemId,
      plannedDate,
      position,
      source,
    } = req.body;

    if (
      !weekStart ||
      !problemId ||
      !plannedDate ||
      position === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "weekStart, problemId, plannedDate and position are required",
      });
    }

    const item =
      await plannerService.addPlanItem({
        userId,
        weekStart,
        problemId: Number(problemId),
        plannedDate,
        position: Number(position),
        source: source || "USER",
      });

    return res.json({
      success: true,
      data: item,
    });
  } catch (err) {
    console.error(
      "ADD PLANNER ITEM ERROR:",
      err
    );

    const message =
      err.message || "";

    const status =
      message
        .toLowerCase()
        .includes("past") ||
      message
        .toLowerCase()
        .includes("unauthorized")
        ? 403
        : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};
/*
|--------------------------------------------------------------------------
| Move / update item
|--------------------------------------------------------------------------
*/

export const updateItem = async (
  req,
  res
) => {
  try {
    const userId =
      req.user.id;

    const itemId =
      Number(
        req.params.itemId
      );


    const {
      plannedDate,
      position,
    } = req.body;


    if (
      !plannedDate ||
      position === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "plannedDate and position are required",
      });
    }


    const item =
      await plannerService
        .updatePlanItem({
          userId,
          itemId,
          plannedDate,
          position:
            Number(position),
        });


    return res.json({
      success: true,
      data: item,
    });
  } catch (err) {
    console.error(
      "UPDATE PLANNER ITEM ERROR:",
      err
    );


    const status =
      err.message
        ?.toLowerCase()
        .includes(
          "unauthorized"
        )
        ? 403
        : 500;


    return res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};


/*
|--------------------------------------------------------------------------
| Delete item
|--------------------------------------------------------------------------
*/

export const deleteItem = async (
  req,
  res
) => {
  try {
    const userId =
      req.user.id;

    const itemId =
      Number(
        req.params.itemId
      );


    await plannerService
      .deletePlanItem({
        userId,
        itemId,
      });


    return res.json({
      success: true,
      message:
        "Planner item removed",
    });
  } catch (err) {
    console.error(
      "DELETE PLANNER ITEM ERROR:",
      err
    );


    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


/*
|--------------------------------------------------------------------------
| Progress
|--------------------------------------------------------------------------
*/

export const getProgress = async (
  req,
  res
) => {
  try {
    const userId =
      req.user.id;

    const planId =
      Number(
        req.params.planId
      );


    const progress =
      await plannerService
        .getPlanProgress({
          userId,
          planId,
        });


    return res.json({
      success: true,
      data: progress,
    });
  } catch (err) {
    console.error(
      "GET PLANNER PROGRESS ERROR:",
      err
    );


    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      topic,
      difficulties,
    } = req.query;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "topic is required",
      });
    }

    const difficultyList =
      difficulties
        ? String(difficulties)
            .split(",")
            .map((item) =>
              item.trim().toLowerCase()
            )
            .filter(Boolean)
        : [];

    const suggestions =
      await plannerService.getSuggestions({
        userId,
        topic,
        difficulties:
          difficultyList,
      });

    return res.json({
      success: true,
      data: suggestions,
    });
  } catch (err) {
    console.error(
      "GET PLANNER SUGGESTIONS ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};