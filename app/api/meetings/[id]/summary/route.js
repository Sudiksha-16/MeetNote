import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Meeting from "@/models/Meeting";

export async function GET(req, context) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    // ✅ unwrap params properly
    const { id } = await context.params;

    const meeting = await Meeting.findOne({
      _id: id,
      userId: decoded.userId,
    });

    if (!meeting) {
      return Response.json({ error: "Meeting not found" }, { status: 404 });
    }

    if (!meeting.summary) {
      return Response.json({ error: "Summary not ready" }, { status: 400 });
    }

    return Response.json({
      summary: meeting.summary,
      keyPoints: meeting.keyPoints,
      actionItems: meeting.actionItems,
      decisions: meeting.decisions,
    });
  } catch (err) {
    console.error("Error fetching summary:", err);
    return Response.json({ error: "Failed to fetch summary" }, { status: 500 });
  }
}
