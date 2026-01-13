import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Meeting from "@/models/Meeting";
import { answerMeetingQuestion } from "@/lib/audio-processor";

export async function POST(req, { params }) {
  try {
    await connectDB();

    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    const { id } = await params;

    const { question } = await req.json();
    if (!question || !question.trim()) {
      return Response.json({ error: "Question is required" }, { status: 400 });
    }

    const meeting = await Meeting.findOne({
      _id: id,
      userId: decoded.userId,
    });

    if (!meeting) {
      return Response.json({ error: "Meeting not found" }, { status: 404 });
    }

    // 🔥 Get answer from LLM
    const answer = await answerMeetingQuestion({ question, meeting });

    return Response.json({ success: true, answer });
  } catch (err) {
    console.error("Q&A error:", err);
    return Response.json({ success: false, error: "Failed to answer question" }, { status: 500 });
  }
}



