import { connectDB } from "@/lib/db"
import Meeting from "@/models/Meeting"

export async function POST(req) {
  try {
    const { meetingId, transcript, keyPoints, actionItems, decisions, summary } = await req.json()

    if (!meetingId) {
      return Response.json({ error: "Missing meetingId" }, { status: 400 })
    }

    await connectDB()

    const meeting = await Meeting.findByIdAndUpdate(
      meetingId,
      {
        transcript,
        summary,
        keyPoints: keyPoints || [],
        actionItems: actionItems || [],
        decisions: decisions || [],
        status: "processed",
      },
      { new: true },
    )

    if (!meeting) {
      return Response.json({ error: "Meeting not found" }, { status: 404 })
    }

    return Response.json({ success: true, meeting })
  } catch (err) {
    console.error("Webhook error:", err)
    return Response.json({ error: "Processing failed" }, { status: 500 })
  }
}
