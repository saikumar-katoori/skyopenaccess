import { Router } from "express";
import {
  createSubmission,
  deleteSubmission,
  listSubmissions,
  updateSubmissionStatus,
  downloadSubmissionManuscript
} from "../controllers/submissionController.js";
import { adminOnly, protect } from "../middlewares/auth.js";
import { submissionLimiter } from "../middlewares/rateLimiter.js";
import { manuscriptUpload } from "../middlewares/upload.js";

const router = Router();

router.post("/", submissionLimiter, manuscriptUpload.any(), createSubmission);
router.get("/", protect, adminOnly, listSubmissions);
router.get("/:id/download", protect, adminOnly, downloadSubmissionManuscript);
router.patch("/:id/status", protect, adminOnly, updateSubmissionStatus);
router.delete("/:id", protect, adminOnly, deleteSubmission);

export default router;
