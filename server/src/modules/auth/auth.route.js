import express from "express";
import passport from "passport";

import {
  signUp,
  signIn,
  signOut,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  googleCallback,

} from "./auth.controller.js";
import feedbackRoutes from "./feedback/feedback.routes.js";


import { authLimiter } from "../../middlewares/rateLimit.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use("/feedback", feedbackRoutes);
router.post("/signup", authLimiter, signUp);
router.post("/signin", authLimiter, signIn);
router.post("/signout", authLimiter, signOut);
router.post("/refresh", authLimiter, refreshAccessToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "https://dykstra.in/login",
    session: false,
  }),
  googleCallback
);



export default router;