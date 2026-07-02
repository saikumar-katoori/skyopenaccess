import { cloudinary } from "../config/cloudinary.js";
import mongoose from "mongoose";
import { ArchiveArticle } from "../models/ArchiveArticle.js";
import { ArchiveVolume } from "../models/ArchiveVolume.js";
import { Article } from "../models/Article.js";
import { ArticleInPress } from "../models/ArticleInPress.js";
import { BoardMember } from "../models/BoardMember.js";
import { CurrentIssue } from "../models/CurrentIssue.js";
import { CurrentIssueArticle } from "../models/CurrentIssueArticle.js";
import { IndexingLogo } from "../models/IndexingLogo.js";
import { Ppt } from "../models/Ppt.js";
import { Testimonial } from "../models/Testimonial.js";
import { Video } from "../models/Video.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary.js";
import { InfoTable } from "../models/InfoTable.js";

const parseIds = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return value.split(",").map((v) => v.trim()).filter(Boolean);
    }
  }
  return [];
};

const safeDestroy = async (publicId, resourceType) => {
  if (!publicId) return;
  try {
    if (resourceType === "raw" || resourceType === "image") {
      await Promise.all([
        cloudinary.uploader.destroy(publicId, { resource_type: "raw" }).catch(() => {}),
        cloudinary.uploader.destroy(publicId, { resource_type: "image" }).catch(() => {})
      ]);
    } else {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to destroy Cloudinary resource:", err.message);
  }
};

const getValidatedObjectId = (id, resourceLabel = "Resource") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error(`Invalid ${resourceLabel} id`);
    err.statusCode = 400;
    throw err;
  }
  return id;
};

export const listArticles = asyncHandler(async (req, res) => {
  const query = req.query.journal_id ? { journal_id: req.query.journal_id } : {};
  const articles = await Article.find(query).sort({ createdAt: -1 });
  res.status(200).json({ articles });
});

export const getArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(getValidatedObjectId(req.params.id, "article"));
  if (!article) return res.status(404).json({ message: "Article not found" });
  res.status(200).json({ article });
});

export const createArticle = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.file?.buffer) {
    const upload = await uploadBufferToCloudinary(req.file.buffer, {
      folder: "journals/articles",
      resource_type: "image"
    });
    payload.pdf_url = upload.secure_url;
    payload.pdf_public_id = upload.public_id;
    payload.format = req.file.mimetype;
  }
  const article = await Article.create(payload);
  res.status(201).json({ article });
});

export const updateArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(getValidatedObjectId(req.params.id, "article"));
  if (!article) return res.status(404).json({ message: "Article not found" });

  Object.assign(article, req.body);
  if (req.file?.buffer) {
    const upload = await uploadBufferToCloudinary(req.file.buffer, {
      folder: "journals/articles",
      resource_type: "raw"
    });
    await safeDestroy(article.pdf_public_id, "raw");
    article.pdf_url = upload.secure_url;
    article.pdf_public_id = upload.public_id;
    article.format = req.file.mimetype;
  }
  await article.save();
  res.status(200).json({ article });
});

export const deleteArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(getValidatedObjectId(req.params.id, "article"));
  if (!article) return res.status(404).json({ message: "Article not found" });
  await safeDestroy(article.pdf_public_id, "raw");
  await ArticleInPress.deleteMany({ article_id: article._id });
  await article.deleteOne();
  res.status(200).json({ message: "Article deleted" });
});

export const listArticlesInPress = asyncHandler(async (req, res) => {
  const query = req.query.journal_id ? { journal_id: req.query.journal_id } : {};
  const inPressLinks = await ArticleInPress.find(query).populate("article_id");
  const articles = inPressLinks.map(link => link.article_id).filter(Boolean);
  res.status(200).json({ articles });
});

export const createArticleInPress = asyncHandler(async (req, res) => {
  const { journal_id, article_id } = req.body;
  
  if (!article_id) {
    return res.status(400).json({ message: "article_id is required" });
  }

  // Check if article already marked as in press
  const existing = await ArticleInPress.findOne({ article_id });
  if (existing) {
    return res.status(400).json({ message: "Article is already marked as in press" });
  }

  const inPress = await ArticleInPress.create({ journal_id, article_id });
  await inPress.populate("article_id");
  res.status(201).json({ inPress });
});

export const deleteArticleInPress = asyncHandler(async (req, res) => {
  const inPress = await ArticleInPress.findById(getValidatedObjectId(req.params.id, "article in press"));
  if (!inPress) return res.status(404).json({ message: "Article in press not found" });
  await inPress.deleteOne();
  res.status(200).json({ message: "Article removed from in press" });
});

export const listBoardMembers = asyncHandler(async (req, res) => {
  const query = req.query.journal_id ? { journal_id: req.query.journal_id } : {};
  const members = await BoardMember.find(query).sort({ createdAt: -1 });
  res.status(200).json({ members });
});

export const getBoardMember = asyncHandler(async (req, res) => {
  const member = await BoardMember.findById(getValidatedObjectId(req.params.id, "board member"));
  if (!member) return res.status(404).json({ message: "Board member not found" });
  res.status(200).json({ member });
});

export const createBoardMember = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.file?.buffer) {
    const upload = await uploadBufferToCloudinary(req.file.buffer, {
      folder: "journals/board-members",
      resource_type: "image"
    });
    payload.image_url = upload.secure_url;
    payload.image_public_id = upload.public_id;
  }
  const member = await BoardMember.create(payload);
  res.status(201).json({ member });
});

export const updateBoardMember = asyncHandler(async (req, res) => {
  const member = await BoardMember.findById(getValidatedObjectId(req.params.id, "board member"));
  if (!member) return res.status(404).json({ message: "Board member not found" });

  Object.assign(member, req.body);
  if (req.file?.buffer) {
    const upload = await uploadBufferToCloudinary(req.file.buffer, {
      folder: "journals/board-members",
      resource_type: "image"
    });
    await safeDestroy(member.image_public_id, "image");
    member.image_url = upload.secure_url;
    member.image_public_id = upload.public_id;
  }

  await member.save();
  res.status(200).json({ member });
});

export const deleteBoardMember = asyncHandler(async (req, res) => {
  const member = await BoardMember.findById(getValidatedObjectId(req.params.id, "board member"));
  if (!member) return res.status(404).json({ message: "Board member not found" });
  await safeDestroy(member.image_public_id, "image");
  await member.deleteOne();
  res.status(200).json({ message: "Board member deleted" });
});

const attachIssueArticles = async (issues) => {
  return Promise.all(
    issues.map(async (issue) => {
      const obj = issue.toObject();
      obj.volume_items = [];
      obj.article_items = [];

      if (obj.archive_volume_ids?.length) {
        const volumes = await ArchiveVolume.find({ _id: { $in: obj.archive_volume_ids } }).sort({
          year: -1,
          createdAt: -1
        });

        obj.volume_items = await attachArchiveArticles(volumes);
        obj.article_items = obj.volume_items.flatMap((volume) => volume.article_items || []);
      } else {
        const issueIds = [issue._id];
        const links = await CurrentIssueArticle.find({ issue_id: { $in: issueIds } }).populate("article_id");
        obj.article_items = links.map((link) => link.article_id).filter(Boolean);

        if (!obj.article_items.length) {
          const issueText = String(obj.volume_title || "").toLowerCase();
          const yearMatch = issueText.match(/\b(19|20)\d{2}\b/);
          const archiveVolumes = await ArchiveVolume.find(
            obj.journal_id ? { journal_id: obj.journal_id } : {}
          ).sort({ year: -1, createdAt: -1 });

          const matchedVolumes = archiveVolumes.filter((volume) => {
            const volumeTitle = String(volume.volume_title || "").toLowerCase();
            return (
              issueText.includes(volumeTitle) ||
              volumeTitle.includes(issueText) ||
              (yearMatch && String(volume.year) === yearMatch[0])
            );
          });

          if (matchedVolumes.length) {
            obj.volume_items = await attachArchiveArticles(matchedVolumes);
            obj.article_items = obj.volume_items.flatMap((volume) => volume.article_items || []);
          }
        }
      }

      return obj;
    })
  );
};

export const listCurrentIssues = asyncHandler(async (req, res) => {
  const query = req.query.journal_id ? { journal_id: req.query.journal_id } : {};
  const issues = await CurrentIssue.find(query).sort({ createdAt: -1 });
  const hydrated = await attachIssueArticles(issues);
  res.status(200).json({ issues: hydrated });
});

export const getCurrentIssue = asyncHandler(async (req, res) => {
  const issue = await CurrentIssue.findById(getValidatedObjectId(req.params.id, "current issue"));
  if (!issue) return res.status(404).json({ message: "Current issue not found" });
  const hydrated = await attachIssueArticles([issue]);
  res.status(200).json({ issue: hydrated[0] });
});

export const createCurrentIssue = asyncHandler(async (req, res) => {
  const archive_volume_ids = parseIds(req.body.archive_volume_ids || []);
  const issue = await CurrentIssue.create({
    journal_id: req.body.journal_id,
    volume_title: req.body.volume_title,
    archive_volume_ids
  });

  const hydrated = await attachIssueArticles([issue]);
  res.status(201).json({ issue: hydrated[0] });
});

export const updateCurrentIssue = asyncHandler(async (req, res) => {
  const issue = await CurrentIssue.findById(getValidatedObjectId(req.params.id, "current issue"));
  if (!issue) return res.status(404).json({ message: "Current issue not found" });

  if (req.body.volume_title) issue.volume_title = req.body.volume_title;
  
  if (Object.prototype.hasOwnProperty.call(req.body, "archive_volume_ids")) {
    const archive_volume_ids = parseIds(req.body.archive_volume_ids || []);
    issue.archive_volume_ids = archive_volume_ids;
  }
  
  await issue.save();

  const hydrated = await attachIssueArticles([issue]);
  res.status(200).json({ issue: hydrated[0] });
});

export const deleteCurrentIssue = asyncHandler(async (req, res) => {
  const issue = await CurrentIssue.findById(getValidatedObjectId(req.params.id, "current issue"));
  if (!issue) return res.status(404).json({ message: "Current issue not found" });
  await issue.deleteOne();
  res.status(200).json({ message: "Current issue deleted" });
});

const attachArchiveArticles = async (volumes) => {
  const volumeIds = volumes.map((v) => v._id);
  const links = await ArchiveArticle.find({ volume_id: { $in: volumeIds } }).populate("article_id");
  const map = new Map();
  links.forEach((link) => {
    const key = String(link.volume_id);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(link.article_id);
  });
  return volumes.map((volume) => ({
    ...volume.toObject(),
    article_items: map.get(String(volume._id)) || []
  }));
};

export const listArchiveVolumes = asyncHandler(async (req, res) => {
  const query = req.query.journal_id ? { journal_id: req.query.journal_id } : {};
  const volumes = await ArchiveVolume.find(query).sort({ year: -1, createdAt: -1 });
  const hydrated = await attachArchiveArticles(volumes);
  res.status(200).json({ volumes: hydrated });
});

export const getArchiveVolume = asyncHandler(async (req, res) => {
  const volume = await ArchiveVolume.findById(getValidatedObjectId(req.params.id, "archive volume"));
  if (!volume) return res.status(404).json({ message: "Archive volume not found" });
  const hydrated = await attachArchiveArticles([volume]);
  res.status(200).json({ volume: hydrated[0] });
});

export const createArchiveVolume = asyncHandler(async (req, res) => {
  const volume = await ArchiveVolume.create({
    journal_id: req.body.journal_id,
    year: req.body.year,
    volume_title: req.body.volume_title
  });

  const article_ids = parseIds(req.body.article_ids);
  if (article_ids.length) {
    await ArchiveArticle.insertMany(
      article_ids.map((article_id) => ({ volume_id: volume._id, article_id }))
    );
  }

  const hydrated = await attachArchiveArticles([volume]);
  res.status(201).json({ volume: hydrated[0] });
});

export const updateArchiveVolume = asyncHandler(async (req, res) => {
  const volume = await ArchiveVolume.findById(getValidatedObjectId(req.params.id, "archive volume"));
  if (!volume) return res.status(404).json({ message: "Archive volume not found" });

  if (req.body.journal_id) volume.journal_id = req.body.journal_id;
  if (req.body.year) volume.year = req.body.year;
  if (req.body.volume_title) volume.volume_title = req.body.volume_title;
  await volume.save();

  if (Object.prototype.hasOwnProperty.call(req.body, "article_ids")) {
    const article_ids = parseIds(req.body.article_ids);
    await ArchiveArticle.deleteMany({ volume_id: volume._id });
    if (article_ids.length) {
      await ArchiveArticle.insertMany(
        article_ids.map((article_id) => ({ volume_id: volume._id, article_id }))
      );
    }
  }

  const hydrated = await attachArchiveArticles([volume]);
  res.status(200).json({ volume: hydrated[0] });
});

export const deleteArchiveVolume = asyncHandler(async (req, res) => {
  const volume = await ArchiveVolume.findById(getValidatedObjectId(req.params.id, "archive volume"));
  if (!volume) return res.status(404).json({ message: "Archive volume not found" });
  await ArchiveArticle.deleteMany({ volume_id: volume._id });
  await volume.deleteOne();
  res.status(200).json({ message: "Archive volume deleted" });
});

export const listVideos = asyncHandler(async (req, res) => {
  const query = req.query.journal_id ? { journal_id: req.query.journal_id } : {};
  const videos = await Video.find(query).sort({ created_at: -1 });
  res.status(200).json({ videos });
});

export const getVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(getValidatedObjectId(req.params.id, "video"));
  if (!video) return res.status(404).json({ message: "Video not found" });
  res.status(200).json({ video });
});

export const createVideo = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.file?.buffer) {
    const upload = await uploadBufferToCloudinary(req.file.buffer, {
      folder: "journals/videos/thumbnails",
      resource_type: "image"
    });
    payload.thumbnail_url = upload.secure_url;
    payload.thumbnail_public_id = upload.public_id;
  }
  const video = await Video.create(payload);
  res.status(201).json({ video });
});

export const updateVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(getValidatedObjectId(req.params.id, "video"));
  if (!video) return res.status(404).json({ message: "Video not found" });

  Object.assign(video, req.body);
  if (req.file?.buffer) {
    const upload = await uploadBufferToCloudinary(req.file.buffer, {
      folder: "journals/videos/thumbnails",
      resource_type: "image"
    });
    await safeDestroy(video.thumbnail_public_id, "image");
    video.thumbnail_url = upload.secure_url;
    video.thumbnail_public_id = upload.public_id;
  }

  await video.save();
  res.status(200).json({ video });
});

export const deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(getValidatedObjectId(req.params.id, "video"));
  if (!video) return res.status(404).json({ message: "Video not found" });
  await safeDestroy(video.thumbnail_public_id, "image");
  await video.deleteOne();
  res.status(200).json({ message: "Video deleted" });
});

export const listPpts = asyncHandler(async (req, res) => {
  const query = req.query.journal_id ? { journal_id: req.query.journal_id } : {};
  const ppts = await Ppt.find(query).sort({ created_at: -1 });
  res.status(200).json({ ppts });
});

export const getPpt = asyncHandler(async (req, res) => {
  const ppt = await Ppt.findById(getValidatedObjectId(req.params.id, "ppt"));
  if (!ppt) return res.status(404).json({ message: "PPT not found" });
  res.status(200).json({ ppt });
});

export const createPpt = asyncHandler(async (req, res) => {
  const pptFile = req.files?.file?.[0];
  const thumbnailFile = req.files?.thumbnail?.[0];

  if (!pptFile) {
    return res.status(400).json({ message: "PPT/PDF file is required" });
  }

  const upload = await uploadBufferToCloudinary(pptFile.buffer, {
    folder: "journals/ppts",
    resource_type: "raw"
  });

  const payload = {
    ...req.body,
    file_url: upload.secure_url,
    file_public_id: upload.public_id,
    format: pptFile.mimetype
  };

  if (thumbnailFile) {
    const thumbUpload = await uploadBufferToCloudinary(thumbnailFile.buffer, {
      folder: "journals/ppts/thumbnails",
      resource_type: "image"
    });
    payload.thumbnail_url = thumbUpload.secure_url;
    payload.thumbnail_public_id = thumbUpload.public_id;
  }

  const ppt = await Ppt.create(payload);
  res.status(201).json({ ppt });
});

export const updatePpt = asyncHandler(async (req, res) => {
  const ppt = await Ppt.findById(getValidatedObjectId(req.params.id, "ppt"));
  if (!ppt) return res.status(404).json({ message: "PPT not found" });

  Object.assign(ppt, req.body);

  const pptFile = req.files?.file?.[0];
  const thumbnailFile = req.files?.thumbnail?.[0];

  if (pptFile) {
    const upload = await uploadBufferToCloudinary(pptFile.buffer, {
      folder: "journals/ppts",
      resource_type: "raw"
    });
    await safeDestroy(ppt.file_public_id, "raw");
    ppt.file_url = upload.secure_url;
    ppt.file_public_id = upload.public_id;
    ppt.format = pptFile.mimetype;
  }

  if (thumbnailFile) {
    const thumbUpload = await uploadBufferToCloudinary(thumbnailFile.buffer, {
      folder: "journals/ppts/thumbnails",
      resource_type: "image"
    });
    await safeDestroy(ppt.thumbnail_public_id, "image");
    ppt.thumbnail_url = thumbUpload.secure_url;
    ppt.thumbnail_public_id = thumbUpload.public_id;
  }

  await ppt.save();
  res.status(200).json({ ppt });
});

export const deletePpt = asyncHandler(async (req, res) => {
  const ppt = await Ppt.findById(getValidatedObjectId(req.params.id, "ppt"));
  if (!ppt) return res.status(404).json({ message: "PPT not found" });
  await safeDestroy(ppt.file_public_id, "raw");
  await safeDestroy(ppt.thumbnail_public_id, "image");
  await ppt.deleteOne();
  res.status(200).json({ message: "PPT deleted" });
});

export const listTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find().sort({ created_at: -1 });
  res.status(200).json({ testimonials });
});

export const getTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(getValidatedObjectId(req.params.id, "testimonial"));
  if (!testimonial) return res.status(404).json({ message: "Testimonial not found" });
  res.status(200).json({ testimonial });
});

export const createTestimonial = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.file?.buffer) {
    const upload = await uploadBufferToCloudinary(req.file.buffer, {
      folder: "journals/testimonials",
      resource_type: "image"
    });
    payload.image_url = upload.secure_url;
    payload.image_public_id = upload.public_id;
  }
  const testimonial = await Testimonial.create(payload);
  res.status(201).json({ testimonial });
});

export const updateTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(getValidatedObjectId(req.params.id, "testimonial"));
  if (!testimonial) return res.status(404).json({ message: "Testimonial not found" });
  Object.assign(testimonial, req.body);
  if (req.file?.buffer) {
    const upload = await uploadBufferToCloudinary(req.file.buffer, {
      folder: "journals/testimonials",
      resource_type: "image"
    });
    await safeDestroy(testimonial.image_public_id, "image");
    testimonial.image_url = upload.secure_url;
    testimonial.image_public_id = upload.public_id;
  }
  await testimonial.save();
  res.status(200).json({ testimonial });
});

export const deleteTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(getValidatedObjectId(req.params.id, "testimonial"));
  if (!testimonial) return res.status(404).json({ message: "Testimonial not found" });
  await safeDestroy(testimonial.image_public_id, "image");
  await testimonial.deleteOne();
  res.status(200).json({ message: "Testimonial deleted" });
});

export const listIndexingLogos = asyncHandler(async (req, res) => {
  const query = req.query.journal_id ? { journal_id: req.query.journal_id } : {};
  const indexingLogos = await IndexingLogo.find(query).sort({ createdAt: -1 });
  res.status(200).json({ indexingLogos });
});

export const getIndexingLogo = asyncHandler(async (req, res) => {
  const indexingLogo = await IndexingLogo.findById(getValidatedObjectId(req.params.id, "indexing logo"));
  if (!indexingLogo) return res.status(404).json({ message: "Indexing logo not found" });
  res.status(200).json({ indexingLogo });
});

export const createIndexingLogo = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.file?.buffer) {
    const upload = await uploadBufferToCloudinary(req.file.buffer, {
      folder: "journals/indexing-logos",
      resource_type: "image"
    });
    payload.image_url = upload.secure_url;
    payload.image_public_id = upload.public_id;
  }
  const indexingLogo = await IndexingLogo.create(payload);
  res.status(201).json({ indexingLogo });
});

export const updateIndexingLogo = asyncHandler(async (req, res) => {
  const indexingLogo = await IndexingLogo.findById(getValidatedObjectId(req.params.id, "indexing logo"));
  if (!indexingLogo) return res.status(404).json({ message: "Indexing logo not found" });

  Object.assign(indexingLogo, req.body);
  if (req.file?.buffer) {
    const upload = await uploadBufferToCloudinary(req.file.buffer, {
      folder: "journals/indexing-logos",
      resource_type: "image"
    });
    await safeDestroy(indexingLogo.image_public_id, "image");
    indexingLogo.image_url = upload.secure_url;
    indexingLogo.image_public_id = upload.public_id;
  }

  await indexingLogo.save();
  res.status(200).json({ indexingLogo });
});

export const deleteIndexingLogo = asyncHandler(async (req, res) => {
  const indexingLogo = await IndexingLogo.findById(getValidatedObjectId(req.params.id, "indexing logo"));
  if (!indexingLogo) return res.status(404).json({ message: "Indexing logo not found" });
  await safeDestroy(indexingLogo.image_public_id, "image");
  await indexingLogo.deleteOne();
  res.status(200).json({ message: "Indexing logo deleted" });
});

export const getInfoTable = asyncHandler(async (req, res) => {
  const journalId = req.params.journal_id || req.query.journal_id;
  // if (!journalId) return res.status(400).json({ message: "journal_id is required" });
  const infoTable = await InfoTable.findOne({ journal_id: getValidatedObjectId(journalId, "journal") });
  // if (!infoTable) return res.status(404).json({ message: "Info table not found for this journal" });
  res.status(200).json({ infoTable });
});

export const updateInfoTable = asyncHandler(async (req, res) => {
  const journal_id = getValidatedObjectId(req.body.journal_id || req.query.journal_id, "journal");
  let infoTable = await InfoTable.findOne({ journal_id });
  const fields = {
    abbrevation: req.body.abbrevation || "",
    issn: req.body.issn || "",
    editor_in_chief: req.body.editor_in_chief || "",
    publishing_frequency: req.body.publishing_frequency || "",
    impact_factor: req.body.impact_factor || "",
    publication_type: req.body.publication_type || "",
    publishing_model: req.body.publishing_model || "",
    journal_category: req.body.journal_category || "",
    email: req.body.email || "",
    alternate_email: req.body.alternate_email || ""
  };

  const leftLogoFile = req.files?.left_logo?.[0];
  const rightLogoFile = req.files?.right_logo?.[0];

  if (leftLogoFile) {
    const upload = await uploadBufferToCloudinary(leftLogoFile.buffer, {
      folder: "journals/info-table/logos",
      resource_type: "image"
    });
    if (infoTable?.left_logo_public_id) {
      await safeDestroy(infoTable.left_logo_public_id, "image");
    }
    fields.left_logo_url = upload.secure_url;
    fields.left_logo_public_id = upload.public_id;
  }

  if (rightLogoFile) {
    const upload = await uploadBufferToCloudinary(rightLogoFile.buffer, {
      folder: "journals/info-table/logos",
      resource_type: "image"
    });
    if (infoTable?.right_logo_public_id) {
      await safeDestroy(infoTable.right_logo_public_id, "image");
    }
    fields.right_logo_url = upload.secure_url;
    fields.right_logo_public_id = upload.public_id;
  }

  if (!infoTable) {
    infoTable = await InfoTable.create({ journal_id, ...fields });
  } else {
    Object.assign(infoTable, fields);
    await infoTable.save();
  }
  res.status(200).json({ infoTable });
});

export const deleteInfoTable = asyncHandler(async (req, res) => {
  const journal_id = getValidatedObjectId(req.body.journal_id || req.query.journal_id || req.params.journal_id, "journal");
  const infoTable = await InfoTable.findOne({ journal_id });
  if (!infoTable) return res.status(404).json({ message: "Info table not found for this journal" });
  if (infoTable.left_logo_public_id) {
    await safeDestroy(infoTable.left_logo_public_id, "image");
  }
  if (infoTable.right_logo_public_id) {
    await safeDestroy(infoTable.right_logo_public_id, "image");
  }
  await infoTable.deleteOne();
  res.status(200).json({ message: "Info table deleted for this journal" });
});