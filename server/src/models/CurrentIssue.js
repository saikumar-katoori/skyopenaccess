import mongoose from "mongoose";

const currentIssueSchema = new mongoose.Schema(
  {
    journal_id: { type: mongoose.Schema.Types.ObjectId, ref: "Journal", required: true, index: true },
    volume_title: { type: String, required: true },
    archive_volume_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "ArchiveVolume" }]
  },
  { timestamps: true }
);

export const CurrentIssue = mongoose.model("CurrentIssue", currentIssueSchema);
