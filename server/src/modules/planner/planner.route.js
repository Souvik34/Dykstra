import express from "express";

import {
  getCurrentPlan,
  generateDraft,
  savePlan,
  addItem,
  updateItem,
  deleteItem,
  getSuggestions,
  getProgress,
  getLeaves,
  setLeave,
  removeLeave,
} from "./planner.controller.js";
import * as plannerController from "./planner.controller.js";
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
  "/items",
  protect,
  addItem
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
  protect,
  plannerController.getSuggestions
);
router.get("/leaves", protect, getLeaves);
router.post("/leaves", protect, setLeave);
router.delete("/leaves", protect, removeLeave);
router.get(
  "/:planId/progress",
  protect,
  getProgress
);


export default router;