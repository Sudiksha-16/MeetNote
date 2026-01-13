import { connectDB } from "@/lib/db"
import Meeting from "@/models/Meeting"
import { translateText } from "@/lib/audio-processor"

export async function POST(req) {
  try {
    const { meetingId, targetLanguage } = await req.json()

    if (!meetingId || !targetLanguage) {
      return Response.json({ error: "Missing meetingId or targetLanguage" }, { status: 400 })
    }

    await connectDB()

    const meeting = await Meeting.findById(meetingId)

    if (!meeting || !meeting.transcript) {
      return Response.json({ error: "Meeting or transcript not found" }, { status: 404 })
    }

    console.log(`[Translate] Translating meeting ${meetingId} to ${targetLanguage}...`)

    const translatedTranscript = await translateText(meeting.transcript, targetLanguage)
    const translatedSummary = await translateText(meeting.summary, targetLanguage)

    // ✅ Save both
    meeting.translatedTranscript = translatedTranscript
    meeting.translatedSummary = translatedSummary  
    meeting.translatedLanguage = targetLanguage

    await meeting.save()

    return Response.json({
      success: true,
      translatedTranscript,
      translatedSummary,
    })

  } catch (err) {
    console.error("[Translate] Error:", err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
