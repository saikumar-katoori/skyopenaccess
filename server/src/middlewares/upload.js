import multer from "multer";

const storage = multer.memoryStorage();

const manuscriptTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

const documentTypes = [
  ...manuscriptTypes,
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation"
];

const imageTypes = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

export const manuscriptUpload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // Only validate manuscript files, allow other fields
    if (file.fieldname === "manuscript") {
      if (!manuscriptTypes.includes(file.mimetype)) {
        return cb(new Error("Only .doc, .docx and .pdf files are allowed"));
      }
    }
    cb(null, true);
  }
});

export const imageUpload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!imageTypes.includes(file.mimetype)) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  }
});

export const documentUpload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!documentTypes.includes(file.mimetype)) {
      return cb(new Error("Only doc/docx/pdf/ppt/pptx files are allowed"));
    }
    cb(null, true);
  }
});

export const pptUpload = multer({
  storage,
  limits: { fileSize: 40 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "file") {
      if (!documentTypes.includes(file.mimetype)) {
        return cb(new Error("Only doc/docx/pdf/ppt/pptx files are allowed for PPT"));
      }
    } else if (file.fieldname === "thumbnail") {
      if (!imageTypes.includes(file.mimetype)) {
        return cb(new Error("Only image files are allowed for thumbnail"));
      }
    }
    cb(null, true);
  }
});
