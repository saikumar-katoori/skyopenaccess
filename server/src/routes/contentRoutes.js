import { Router } from "express";
import {
  createArchiveVolume,
  createArticle,
  createArticleInPress,
  createBoardMember,
  createCurrentIssue,
  createIndexingLogo,
  createPpt,
  createTestimonial,
  createVideo,
  deleteArchiveVolume,
  deleteArticle,
  deleteArticleInPress,
  deleteBoardMember,
  deleteCurrentIssue,
  deleteIndexingLogo,
  deletePpt,
  deleteTestimonial,
  deleteVideo,
  getArchiveVolume,
  getArticle,
  getBoardMember,
  getCurrentIssue,
  getIndexingLogo,
  getPpt,
  getTestimonial,
  getVideo,
  listArchiveVolumes,
  listArticles,
  listArticlesInPress,
  listBoardMembers,
  listCurrentIssues,
  listIndexingLogos,
  listPpts,
  listTestimonials,
  listVideos,
  updateArchiveVolume,
  updateArticle,
  updateBoardMember,
  updateCurrentIssue,
  updateIndexingLogo,
  updatePpt,
  updateTestimonial,
  updateVideo,
  getInfoTable,
  updateInfoTable,
  deleteInfoTable
} from "../controllers/contentController.js";
import { adminOnly, protect } from "../middlewares/auth.js";
import { documentUpload, imageUpload, pptUpload } from "../middlewares/upload.js";

const router = Router();

router.get("/articles", listArticles);
router.get("/articles/:id", getArticle);
router.post("/articles", protect, adminOnly, documentUpload.single("file"), createArticle);
router.put("/articles/:id", protect, adminOnly, documentUpload.single("file"), updateArticle);
router.delete("/articles/:id", protect, adminOnly, deleteArticle);

router.get("/articles-in-press", listArticlesInPress);
router.post("/articles-in-press", protect, adminOnly, createArticleInPress);
router.delete("/articles-in-press/:id", protect, adminOnly, deleteArticleInPress);

router.get("/board-members", listBoardMembers);
router.get("/board-members/:id", getBoardMember);
router.post("/board-members", protect, adminOnly, imageUpload.single("image"), createBoardMember);
router.put("/board-members/:id", protect, adminOnly, imageUpload.single("image"), updateBoardMember);
router.delete("/board-members/:id", protect, adminOnly, deleteBoardMember);

router.get("/current-issues", listCurrentIssues);
router.get("/current-issues/:id", getCurrentIssue);
router.post("/current-issues", protect, adminOnly, createCurrentIssue);
router.put("/current-issues/:id", protect, adminOnly, updateCurrentIssue);
router.delete("/current-issues/:id", protect, adminOnly, deleteCurrentIssue);

router.get("/archive-volumes", listArchiveVolumes);
router.get("/archive-volumes/:id", getArchiveVolume);
router.post("/archive-volumes", protect, adminOnly, createArchiveVolume);
router.put("/archive-volumes/:id", protect, adminOnly, updateArchiveVolume);
router.delete("/archive-volumes/:id", protect, adminOnly, deleteArchiveVolume);

router.get("/videos", listVideos);
router.get("/videos/:id", getVideo);
router.post("/videos", protect, adminOnly, imageUpload.single("thumbnail"), createVideo);
router.put("/videos/:id", protect, adminOnly, imageUpload.single("thumbnail"), updateVideo);
router.delete("/videos/:id", protect, adminOnly, deleteVideo);

router.get("/ppts", listPpts);
router.get("/ppts/:id", getPpt);
router.post("/ppts", protect, adminOnly, pptUpload.fields([{ name: "file", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]), createPpt);
router.put("/ppts/:id", protect, adminOnly, pptUpload.fields([{ name: "file", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]), updatePpt);
router.delete("/ppts/:id", protect, adminOnly, deletePpt);

router.get("/testimonials", listTestimonials);
router.get("/testimonials/:id", getTestimonial);
router.post("/testimonials", protect, adminOnly, imageUpload.single("image"), createTestimonial);
router.put("/testimonials/:id", protect, adminOnly, imageUpload.single("image"), updateTestimonial);
router.delete("/testimonials/:id", protect, adminOnly, deleteTestimonial);

router.get("/indexing-logos", listIndexingLogos);
router.get("/indexing-logos/:id", getIndexingLogo);
router.post("/indexing-logos", protect, adminOnly, imageUpload.single("image"), createIndexingLogo);
router.put("/indexing-logos/:id", protect, adminOnly, imageUpload.single("image"), updateIndexingLogo);
router.delete("/indexing-logos/:id", protect, adminOnly, deleteIndexingLogo);

router.get("/info-table/:journal_id", getInfoTable);
router.get("/info-table", getInfoTable);
router.post("/info-table", protect, adminOnly, imageUpload.fields([{ name: "left_logo", maxCount: 1 }, { name: "right_logo", maxCount: 1 }]), updateInfoTable);
router.put("/info-table", protect, adminOnly, imageUpload.fields([{ name: "left_logo", maxCount: 1 }, { name: "right_logo", maxCount: 1 }]), updateInfoTable);
router.delete("/info-table/:journal_id", protect, adminOnly, deleteInfoTable);
router.delete("/info-table", protect, adminOnly, deleteInfoTable);

export default router;
