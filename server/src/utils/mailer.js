import https from "node:https";
import { env } from "../config/env.js";

const isMailgunConfigured = Boolean(env.mailgun.apiKey && env.mailgun.domain);

let didWarnMailgunMissing = false;

const sendMailgunEmail = async ({ to, subject, html, text }) => {
  if (!isMailgunConfigured) {
    if (!didWarnMailgunMissing) {
      // eslint-disable-next-line no-console
      console.warn("Mailgun is not configured. Email delivery is disabled.");
      didWarnMailgunMissing = true;
    }
    return false;
  }

  const { apiKey, domain, from } = env.mailgun;
  const postData = new URLSearchParams({
    from,
    to,
    subject,
    html: html || "",
    text: text || ""
  }).toString();

  const auth = Buffer.from(`api:${apiKey}`).toString("base64");

  return new Promise((resolve, reject) => {
    const req = https.request(
      `https://api.mailgun.net/v3/${domain}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData)
        }
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(true);
          } else {
            reject(new Error(`Mailgun error: ${res.statusCode} - ${data}`));
          }
        });
      }
    );

    req.on("error", (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
};

const statusText = {
  received: "Received",
  under_review: "Under Review",
  accepted: "Accepted",
  published: "Published"
};

export const sendSubmissionStatusEmail = async ({ to, authorName, title, status }) => {
  if (!statusText[status]) return;

  const subject = `Manuscript ${statusText[status]}: ${title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1d1d1d;">
      <h2>Journal Submission Update</h2>
      <p>Dear ${authorName},</p>
      <p>Your manuscript <strong>${title}</strong> status has been updated to <strong>${statusText[status]}</strong>.</p>
      <p>Thank you for publishing with us.</p>
      <p style="margin-top: 20px;">Regards,<br/>Editorial Team</p>
    </div>
  `;

  try {
    await sendMailgunEmail({
      to,
      subject,
      html
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to send submission status email to ${to}: ${err.message}`);
  }
};

export const sendAdminVerificationEmail = async ({ to, adminName, code }) => {
  try {
    await sendMailgunEmail({
      to,
      subject: "Verify your admin Gmail",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1d1d1d;">
          <h2>Admin Email Verification</h2>
          <p>Hello ${adminName},</p>
          <p>Your verification code is <strong>${code}</strong>.</p>
          <p>This code expires in 10 minutes.</p>
        </div>
      `
    });
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to send admin verification email: ${err.message}`);
    return false;
  }
};

export const sendAdminTwoFactorCodeEmail = async ({ to, adminName, code }) => {
  try {
    await sendMailgunEmail({
      to,
      subject: "Your admin login verification code",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1d1d1d;">
          <h2>Two-Factor Authentication</h2>
          <p>Hello ${adminName},</p>
          <p>Your one-time login code is <strong>${code}</strong>.</p>
          <p>This code expires in 10 minutes.</p>
        </div>
      `
    });
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to send admin 2FA email: ${err.message}`);
    return false;
  }
};

export const sendForgotPasswordEmail = async ({ to, adminName, code }) => {
  try {
    await sendMailgunEmail({
      to,
      subject: "Reset your admin password",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1d1d1d;">
          <h2>Admin Password Reset Verification</h2>
          <p>Hello ${adminName},</p>
          <p>You have requested a password reset. Your verification code is <strong>${code}</strong>.</p>
          <p>This code expires in 10 minutes.</p>
          <p>If you did not request this, you can ignore this email.</p>
        </div>
      `
    });
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to send admin password reset email: ${err.message}`);
    return false;
  }
};

export const toDriveViewerUrl = (url) => {
  if (!url) return "";
  const isPdf = url.toLowerCase().split('?')[0].endsWith('.pdf') || url.includes('/image/upload/');
  if (isPdf) {
    return url;
  }
  const encoded = encodeURIComponent(url);
  return `https://drive.google.com/viewerng/viewer?url=${encoded}`;
};

export const sendNewSubmissionNotificationEmail = async (submission, journalNames) => {
  const subject = `New Manuscript Submitted: ${submission.manuscript_title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1d1d1d; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
      <h2 style="color: #25855a; border-bottom: 2px solid #25855a; padding-bottom: 10px;">New Manuscript Submission</h2>
      <p>A new manuscript has been submitted through the online submission page.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr style="background-color: #f9f9f9;">
          <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd; width: 30%;">Author Name</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${submission.full_name}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd;">Author Email</td>
          <td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${submission.email}">${submission.email}</a></td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd;">Article Type</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${submission.article_type}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd;">Manuscript Title</td>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>${submission.manuscript_title}</strong></td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd;">Target Journal(s)</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${journalNames}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd;">Country</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${submission.country}</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd;">Abstract</td>
          <td style="padding: 8px; border: 1px solid #ddd; white-space: pre-wrap;">${submission.abstract || "N/A"}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd;">Manuscript File</td>
          <td style="padding: 8px; border: 1px solid #ddd;"><a href="${toDriveViewerUrl(submission.manuscript_url)}" target="_blank" style="background-color: #25855a; color: white; padding: 6px 12px; text-decoration: none; border-radius: 4px; display: inline-block;">Download / View Manuscript</a></td>
        </tr>
      </table>
      
      <p style="margin-top: 25px; font-size: 0.85em; color: #777; text-align: center; border-top: 1px solid #eee; padding-top: 15px;">
        This is an automated notification from Sky Open Access.
      </p>
    </div>
  `;

  try {
    await sendMailgunEmail({
      to: "skyopenaccess@gmail.com",
      subject,
      html
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to send admin notification email: ${err.message}`);
  }
};
