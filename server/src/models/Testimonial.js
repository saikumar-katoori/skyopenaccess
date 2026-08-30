import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    description: { type: String, required: true },
    image_url: String,
    image_public_id: String
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const Testimonial = mongoose.model("Testimonial", testimonialSchema);
