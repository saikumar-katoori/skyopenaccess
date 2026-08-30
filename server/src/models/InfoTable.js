import mongoose from "mongoose";

const infoTableSchema = new mongoose.Schema({
    journal_id: { type: mongoose.Schema.Types.ObjectId, ref: "Journal", required: true },
    abbrevation: { type: String},
    issn: { type: String},
    editor_in_chief: { type: String},
    publishing_frequency: { type: String},
    impact_factor: { type: String},
    publication_type: { type: String},
    publishing_model: { type: String},
    journal_category: { type: String},
    email: { type: String},
    alternate_email: { type: String },
    left_logo_url: { type: String },
    left_logo_public_id: { type: String },
    right_logo_url: { type: String },
    right_logo_public_id: { type: String }

});
export const InfoTable = mongoose.model("InfoTable", infoTableSchema);