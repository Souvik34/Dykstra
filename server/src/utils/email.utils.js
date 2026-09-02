
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.resend.com",
  port: 465,
  secure: true,
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
    from: `Dykstra <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Reset your Dykstra password",
    html: `
      <div style="
        margin: 0;
        padding: 40px 16px;
        background: #0a0a0f;
        font-family: Arial, Helvetica, sans-serif;
        color: #e5e7eb;
      ">
        <div style="
          max-width: 560px;
          margin: 0 auto;
          background: #111118;
          border: 1px solid #272733;
          border-radius: 14px;
          overflow: hidden;
        ">

          <!-- Header -->
          <div style="
            padding: 28px 32px;
            border-bottom: 1px solid #272733;
          ">
            <div style="
              font-size: 22px;
              font-weight: 700;
              color: #ffffff;
            ">
              Dykstra
            </div>

            <div style="
              margin-top: 5px;
              font-size: 12px;
              color: #71717a;
            ">
              Track. Revise. Prepare.
            </div>
          </div>

          <!-- Content -->
          <div style="padding: 32px;">

            <h1 style="
              margin: 0 0 16px;
              font-size: 24px;
              line-height: 1.3;
              color: #ffffff;
            ">
              Reset your password
            </h1>

            <p style="
              margin: 0 0 16px;
              font-size: 15px;
              line-height: 1.7;
              color: #a1a1aa;
            ">
              We received a request to reset the password for your
              Dykstra account.
            </p>

            <p style="
              margin: 0 0 24px;
              font-size: 15px;
              line-height: 1.7;
              color: #a1a1aa;
            ">
              Click the button below to choose a new password and
              regain access to your account.
            </p>

            <!-- Button -->
            <div style="margin: 28px 0;">
              <a
                href="${resetLink}"
                style="
                  display: inline-block;
                  padding: 13px 22px;
                  background: linear-gradient(
                    135deg,
                    #06b6d4,
                    #3b82f6,
                    #8b5cf6
                  );
                  color: #ffffff;
                  text-decoration: none;
                  font-size: 14px;
                  font-weight: 600;
                  border-radius: 8px;
                "
              >
                Reset Password
              </a>
            </div>

            <!-- Expiry -->
            <div style="
              margin: 24px 0;
              padding: 14px 16px;
              background: #18181f;
              border: 1px solid #272733;
              border-radius: 8px;
            ">
              <p style="
                margin: 0;
                font-size: 13px;
                line-height: 1.6;
                color: #a1a1aa;
              ">
                <strong style="color: #e5e7eb;">
                  This link expires in 15 minutes.
                </strong>
                For your security, the link can only be used once.
              </p>
            </div>

            <!-- Fallback link -->
            <p style="
              margin: 24px 0 8px;
              font-size: 13px;
              color: #71717a;
            ">
              If the button doesn't work, copy and paste this link
              into your browser:
            </p>

            <p style="
              margin: 0;
              font-size: 12px;
              line-height: 1.6;
              word-break: break-all;
            ">
              <a
                href="${resetLink}"
                style="color: #60a5fa; text-decoration: none;"
              >
                ${resetLink}
              </a>
            </p>

            <!-- Security notice -->
            <div style="
              margin-top: 28px;
              padding-top: 24px;
              border-top: 1px solid #272733;
            ">
              <p style="
                margin: 0;
                font-size: 13px;
                line-height: 1.7;
                color: #71717a;
              ">
                If you didn't request a password reset, you can safely
                ignore this email. Your password will remain unchanged.
              </p>

              <p style="
                margin: 14px 0 0;
                font-size: 13px;
                line-height: 1.7;
                color: #71717a;
              ">
                Having trouble with your account or the reset link?
                Contact us at
                <a
                  href="mailto:contact@dykstra.in"
                  style="color: #60a5fa; text-decoration: none;"
                >
                  contact@dykstra.in
                </a>.
              </p>
            </div>

          </div>

          <!-- Footer -->
          <div style="
            padding: 20px 32px;
            background: #0d0d13;
            border-top: 1px solid #272733;
          ">
            <p style="
              margin: 0;
              font-size: 12px;
              line-height: 1.6;
              color: #52525b;
            ">
              This is an automated security email from Dykstra.
              Please do not reply directly to this message.
            </p>

            <p style="
              margin: 8px 0 0;
              font-size: 12px;
              color: #52525b;
            ">
              © ${new Date().getFullYear()} Dykstra
            </p>
          </div>

        </div>
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
    from: `Dykstra <${process.env.EMAIL_FROM}>`,
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
    from: `Dykstra <${process.env.EMAIL_FROM}>`,
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
export const sendRevisionReminderEmail = async ({
  to,
  name,
  pendingCount,
}) => {
  await transporter.sendMail({
    from: `Dykstra <${process.env.EMAIL_FROM}>`,
    to,
    subject: `You have ${pendingCount} revision${pendingCount > 1 ? "s" : ""} waiting on Dykstra`,
    html: `
      <div style="
        margin: 0;
        padding: 40px 16px;
        background: #0a0a0f;
        font-family: Arial, Helvetica, sans-serif;
        color: #e5e7eb;
      ">
        <div style="
          max-width: 560px;
          margin: 0 auto;
          background: #111118;
          border: 1px solid #272733;
          border-radius: 14px;
          overflow: hidden;
        ">

          <div style="
            padding: 28px 32px;
            border-bottom: 1px solid #272733;
          ">
            <div style="
              font-size: 22px;
              font-weight: 700;
              color: #ffffff;
            ">
              Dykstra
            </div>

            <div style="
              margin-top: 5px;
              font-size: 12px;
              color: #71717a;
            ">
              Track. Revise. Prepare.
            </div>
          </div>

          <div style="padding: 32px;">

            <h1 style="
              margin: 0 0 16px;
              font-size: 24px;
              line-height: 1.3;
              color: #ffffff;
            ">
              Your revisions are waiting
            </h1>

            <p style="
              margin: 0 0 16px;
              font-size: 15px;
              line-height: 1.7;
              color: #a1a1aa;
            ">
              Hi ${name || "there"},
            </p>

            <p style="
              margin: 0 0 24px;
              font-size: 15px;
              line-height: 1.7;
              color: #a1a1aa;
            ">
              You have
              <strong style="color: #ffffff;">
                ${pendingCount} pending revision${pendingCount > 1 ? "s" : ""}
              </strong>
              waiting for you on Dykstra.
            </p>

            <div style="margin: 28px 0;">
              <a
                href="https://dykstra.in/revisions"
                style="
                  display: inline-block;
                  padding: 13px 22px;
                  background: linear-gradient(
                    135deg,
                    #06b6d4,
                    #3b82f6,
                    #8b5cf6
                  );
                  color: #ffffff;
                  text-decoration: none;
                  font-size: 14px;
                  font-weight: 600;
                  border-radius: 8px;
                "
              >
                Complete Revisions
              </a>
            </div>

            <p style="
              margin: 24px 0 0;
              font-size: 13px;
              line-height: 1.7;
              color: #71717a;
            ">
              Revisions are an important part of retaining what you've
              learned. Complete them before continuing with Dykstra.
            </p>

          </div>

          <div style="
            padding: 20px 32px;
            background: #0d0d13;
            border-top: 1px solid #272733;
          ">
            <p style="
              margin: 0;
              font-size: 12px;
              color: #52525b;
            ">
              You're receiving this email because you have pending
              revisions on Dykstra.
            </p>

            <p style="
              margin: 8px 0 0;
              font-size: 12px;
              color: #52525b;
            ">
              © ${new Date().getFullYear()} Dykstra
            </p>
          </div>

        </div>
      </div>
    `,
  });
};