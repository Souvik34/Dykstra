import express from "express";

import {
  reportBug,
  submitReview,
  fetchApprovedReviews,
} from "./feedback.controller.js";
import { protect } from "../../../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/bug", protect, reportBug);

router.post("/review", submitReview);

router.get("/reviews", fetchApprovedReviews);

export default router;