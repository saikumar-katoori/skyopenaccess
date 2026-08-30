import mongoose from "mongoose";

const archiveVolumeSchema = new mongoose.Schema(
  {
    journal_id: { type: mongoose.Schema.Types.ObjectId, ref: "Journal", required: true, index: true },
    current_issue_id: { type: mongoose.Schema.Types.ObjectId, ref: "CurrentIssue", index: true },
    year: { type: Number, min: 1950, max: 2100 },
    volume_title: { type: String, required: true }
  },
  { timestamps: true }
);

export const ArchiveVolume = mongoose.model("ArchiveVolume", archiveVolumeSchema);
//update