import express from "express";

import {
  getCurrentPlan,
  generateDraft,
  savePlan,
  updateItem,
  deleteItem,
  getProgress,
} from "./planner.controller.js";

import {
  protect,
} from "../../middlewares/auth.middleware.js";


const router =
  express.Router();


router.get(
  "/",
  protect,
  getCurrentPlan
);


router.post(
  "/draft",
  protect,
  generateDraft
);


router.post(
  "/",
  protect,
  savePlan
);


router.put(
  "/items/:itemId",
  protect,
  updateItem
);


router.delete(
  "/items/:itemId",
  protect,
  deleteItem
);

router.get(
  "/suggestions",
  plannerController.getSuggestions
);

router.get(
  "/:planId/progress",
  protect,
  getProgress
);


export default router;