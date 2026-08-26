
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Password reset email
 */
export const sendPasswordResetEmail = async (to, token) => {
 const resetLink = `https://dykstra.in/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Password Reset Request</h2>

        <p>
          You requested a password reset for your Dykstra account.
        </p>

        <p>
          Click the button below to create a new password:
        </p>

        <p>
          <a
            href="${resetLink}"
            style="
              display: inline-block;
              padding: 10px 18px;
              background: #2563eb;
              color: #ffffff;
              text-decoration: none;
              border-radius: 6px;
            "
          >
            Reset Password
          </a>
        </p>

        <p>
          This link expires in 15 minutes.
        </p>

        <p>
          If you did not request this, you can safely ignore this email.
        </p>

        <hr />

        <p style="color: #777;">
          Dykstra Account Security
        </p>
      </div>
    `,
  });
};


/**
 * Bug report email
 */
export const sendBugReportEmail = async ({
  description,
  page,
}) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: "souviksural22@gmail.com",
    subject: `Dykstra Bug Report — ${page}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Dykstra Bug Report</h2>

        <p>
          <strong>Page:</strong>
          ${page}
        </p>

        <p>
          <strong>Description:</strong>
        </p>

        <div
          style="
            padding: 14px;
            background: #f5f5f5;
            border-radius: 8px;
            white-space: pre-wrap;
          "
        >
          ${description}
        </div>

        <hr />

        <p style="color: #777;">
          This bug report was submitted from Dykstra.
        </p>
      </div>
    `,
  });
};


/**
 * Feedback / review email
 *
 * This is prepared for the future review system.
 * The frontend does not need to use this yet.
 */
export const sendFeedbackEmail = async ({
  rating,
  message,
  page,
}) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: "souviksural22@gmail.com",
    subject: `Dykstra Feedback — ${rating}/5`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Dykstra Feedback</h2>

        <p>
          <strong>Rating:</strong>
          ${rating}/5
        </p>

        <p>
          <strong>Page:</strong>
          ${page}
        </p>

        <p>
          <strong>Message:</strong>
        </p>

        <div
          style="
            padding: 14px;
            background: #f5f5f5;
            border-radius: 8px;
            white-space: pre-wrap;
          "
        >
          ${message}
        </div>

        <hr />

        <p style="color: #777;">
          This feedback was submitted from Dykstra.
        </p>
      </div>
    `,
  });
};
