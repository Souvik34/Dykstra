import {
  createBroadcastService,
} from "./broadcast.service.js";


export const createBroadcast = async (
  req,
  res,
  next
) => {
  try {
    const {
      title,
      message,
      sendEmail = false,
    } = req.body;

    const result =
      await createBroadcastService({
        title,
        message,
        sendEmail,
        createdBy: req.user.id,
      });

    res.status(201).json({
      success: true,
      message: "Broadcast published successfully",
      data: result,
    });

  } catch (error) {
    next(error);
  }
};