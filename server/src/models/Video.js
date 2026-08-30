import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    journal_id: { type: mongoose.Schema.Types.ObjectId, ref: "Journal", index: true },
    title: { type: String, required: true },
    youtube_url: { type: String, required: true },
    thumbnail_url: String,
    thumbnail_public_id: String
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const Video = mongoose.model("Video", videoSchema);
