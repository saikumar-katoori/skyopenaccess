import { Journal } from "../models/Journal.js";
import { Submission } from "../models/Submission.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSubmissionStatusEmail, sendNewSubmissionNotificationEmail } from "../utils/mailer.js";
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary.js";

const parseJournalIds = (journalIdsRaw) => {
  if (Array.isArray(journalIdsRaw)) return journalIdsRaw;
  if (typeof journalIdsRaw === "string") {
    try {
      const parsed = JSON.parse(journalIdsRaw);
      return Array.isArray(parsed) ? parsed : [journalIdsRaw];
    } catch {
      return journalIdsRaw.split(",").map((id) => id.trim()).filter(Boolean);
    }
  }
  return [];
};

export const createSubmission = asyncHandler(async (req, res) => {
  const {
    full_name,
    email,
    article_type,
    manuscript_title,
    country,
    abstract
  } = req.body;

  const manuscriptFile = req.files?.find(f => f.fieldname === "manuscript");
  if (!manuscriptFile?.buffer) {
    return res.status(400).json({ message: "Manuscript file is required" });
  }

  const journal_ids = parseJournalIds(req.body.journal_ids);
  if (!journal_ids.length) {
    return res.status(400).json({ message: "At least one journal must be selected" });
  }

  const journalsCount = await Journal.countDocuments({ _id: { $in: journal_ids } });
  if (journalsCount !== journal_ids.length) {
    return res.status(400).json({ message: "One or more selected journals are invalid" });
  }

  // Upload manuscript to Cloudinary
  const upload = await uploadBufferToCloudinary(manuscriptFile.buffer, {
    folder: "submissions/manuscripts",
    resource_type: "raw"
  });

  const submission = await Submission.create({
    full_name,
    email,
    article_type,
    manuscript_title,
    journal_ids,
    country,
    abstract,
    manuscript_url: upload.secure_url,
    manuscript_public_id: upload.public_id,
    manuscript_format: manuscriptFile.mimetype
  });

  const selectedJournals = await Journal.find({ _id: { $in: journal_ids } }, "title");
  const journalNames = selectedJournals.map((j) => j.title).join(", ");

  try {
    await sendSubmissionStatusEmail({
      to: submission.email,
      authorName: submission.full_name,
      title: submission.manuscript_title,
      status: submission.status
    });
  } catch (emailErr) {
    // eslint-disable-next-line no-console
    console.error("Failed to send submission received email", emailErr.message);
  }

  try {
    await sendNewSubmissionNotificationEmail(submission, journalNames);
  } catch (emailErr) {
    // eslint-disable-next-line no-console
    console.error("Failed to send new submission admin notification email", emailErr.message);
  }

  res.status(201).json({
    message: "Submission received successfully",
    submission_id: submission._id,
    status: submission.status
  });
});

export const listSubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find()
    .populate("journal_ids", "title slug")
    .sort({ createdAt: -1 });

  res.status(200).json({ submissions });
});

export const updateSubmissionStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const submission = await Submission.findById(req.params.id);

  if (!submission) return res.status(404).json({ message: "Submission not found" });

  const previous = submission.status;
  submission.status = status;
  await submission.save();

  if (previous !== status) {
    try {
      await sendSubmissionStatusEmail({
        to: submission.email,
        authorName: submission.full_name,
        title: submission.manuscript_title,
        status
      });
    } catch (emailErr) {
      // eslint-disable-next-line no-console
      console.error("Failed to send status update email", emailErr.message);
    }
  }

  res.status(200).json({ message: "Submission status updated", submission });
});

export const deleteSubmission = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id);
  if (!submission) return res.status(404).json({ message: "Submission not found" });

  // Delete from Cloudinary if public_id exists
  if (submission.manuscript_public_id) {
    try {
      const { cloudinary } = await import("../config/cloudinary.js");
      await Promise.all([
        cloudinary.uploader.destroy(submission.manuscript_public_id, { resource_type: "raw" }).catch(() => {}),
        cloudinary.uploader.destroy(submission.manuscript_public_id, { resource_type: "image" }).catch(() => {})
      ]);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to delete file from Cloudinary", err.message);
    }
  }

  await submission.deleteOne();
  res.status(200).json({ message: "Submission deleted" });
});

export const downloadSubmissionManuscript = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id);
  if (!submission) return res.status(404).json({ message: "Submission not found" });

  if (!submission.manuscript_url) {
    return res.status(404).json({ message: "Manuscript file not found" });
  }

  // Return the Cloudinary URL so client can use Google Drive viewer
  res.json({ url: submission.manuscript_url });
});
