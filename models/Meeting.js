import mongoose from "mongoose"

const meetingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String },
    audioPath: { type: String },
    audioUrl: { type: String },
    transcript: { type: String },
    translatedTranscript: { type: String },
    translatedLanguage: { type: String },
    summary: { type: String },
    keyPoints: [String],
    actionItems: [String],
    decisions: [String],
    sentiment: { type: String }, // positive, neutral, negative
    speakerData: [
      {
        speaker: String,
        speakingTime: Number,
        wordCount: Number,
      },
    ],
    keywords: [String],
    duration: { type: Number }, // in seconds
    language: { type: String, default: "en" },
    status: { type: String, enum: ["pending", "processing", "processed", "failed"], default: "pending" },
    processingError: { type: String },
    timestamps: [
      {
        time: Number,
        text: String,
        speaker: String,
      },
    ],
  },
  { timestamps: true },
)

export default mongoose.models.Meeting || mongoose.model("Meeting", meetingSchema)
