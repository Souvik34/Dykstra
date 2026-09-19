import express from "express";
import {
    getPublicStatsController
} from "./publicStats.controller.js";

const router = express.Router();

router.get("/", getPublicStatsController);

export default router;