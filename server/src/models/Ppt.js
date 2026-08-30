import mongoose from "mongoose";

const pptSchema = new mongoose.Schema(
  {
    journal_id: { type: mongoose.Schema.Types.ObjectId, ref: "Journal", index: true },
    title: { type: String, required: true },
    file_url: String,
    file_public_id: String,
    format: String,
    thumbnail_url: String,
    thumbnail_public_id: String
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const Ppt = mongoose.model("Ppt", pptSchema);
