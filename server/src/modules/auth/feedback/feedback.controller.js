import {
  sendBugReportEmail,
} from "../../../utils/email.utils.js";

import {
  createReview,
  getApprovedReviews,
} from "./feedback.repository.js";

export const reportBug = async (req, res, next) => {
  try {
    const { description, page } = req.body;

    if (!description?.trim()) {
      return res.status(400).json({
        message: "Bug description is required",
      });
    }

    await sendBugReportEmail({
      description: description.trim(),
      page: page || "Unknown page",
      userEmail: req.user.email,
        userId: req.user.id,
    });

    return res.status(200).json({
      message: "Bug report sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const submitReview = async (req, res, next) => {
  try {
    const {
      name,
      role,
      rating,
      review,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    if (!review?.trim()) {
      return res.status(400).json({
        message: "Review is required",
      });
    }

    const savedReview = await createReview({
      name: name.trim(),
      role: role?.trim() || null,
      rating: Number(rating),
      review: review.trim(),
    });

    return res.status(201).json({
      message: "Review submitted successfully",
      review: savedReview,
    });
  } catch (error) {
    next(error);
  }
};

export const fetchApprovedReviews = async (req, res, next) => {
  try {
    const reviews = await getApprovedReviews();

    return res.status(200).json({
      reviews,
    });
  } catch (error) {
    next(error);
  }
};