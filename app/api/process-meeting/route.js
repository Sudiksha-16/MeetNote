import { connectDB } from "@/lib/db";
import Meeting from "@/models/Meeting";
import { transcribeAudio, generateSummary, translateText } from "@/lib/audio-processor";

export async function POST(req) {
  try {
    // Connect to DB
    await connectDB();

    // Get meetingId from body
    const { meetingId } = await req.json();
    if (!meetingId) {
      throw new Error("meetingId is required");
    }

    // Find meeting
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      throw new Error("Meeting not found");
    }

    console.log("[process-meeting] Processing meeting for file:", meeting.audioPath);

    // 1️⃣ Transcribe audio with Whisper (local model)
    const transcription = await transcribeAudio(meeting.audioPath);
    console.log("[process-meeting] TRANSCRIPTION OBJECT:", transcription);

    // 1.5️⃣ Compute duration from Whisper timestamps
    let durationSeconds = 0;
    if (transcription.timestamps && transcription.timestamps.length > 0) {
      const lastSegment = transcription.timestamps[transcription.timestamps.length - 1];
      durationSeconds = typeof lastSegment.end === "number" ? lastSegment.end : 0;
    }
    console.log("[process-meeting] CALCULATED DURATION (sec):", durationSeconds);

    // 2️⃣ Generate structured summary with Gemma via Ollama
    const summaryData = await generateSummary(transcription.transcript);
    console.log("[process-meeting] Summary object received:", summaryData);

    // 3️⃣ (Optional) Translate transcript to target language (you’re already doing this)
    const translatedTranscript = await translateText(
      transcription.transcript,
      meeting.language || "en"
    );
    console.log("[process-meeting] Translation complete to:", meeting.language || "en");

    // 4️⃣ Save all fields to the Meeting document
    meeting.transcript = transcription.transcript;
    meeting.summary = summaryData.summary;              // text summary
    meeting.keyPoints = summaryData.keyPoints || [];
    meeting.actionItems = summaryData.actionItems || [];
    meeting.decisions = summaryData.decisions || [];
    meeting.status = "processed";
    meeting.language = transcription.language || "en";

    // ✅ Save duration (in seconds, rounded)
    meeting.duration = Math.round(durationSeconds);

    await meeting.save();

    console.log("[process-meeting] Summary + duration saved successfully!");

    // 5️⃣ Return response
    return new Response(
      JSON.stringify({
        success: true,
        transcript: transcription.transcript,
        summary: summaryData,     // you’re returning the full structured summary
        meetingId: meeting._id,
        duration: meeting.duration,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[process-meeting] Error processing meeting:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
