import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Meeting from "@/models/Meeting";

// 🔹 GET /api/meetings/[id]
export async function GET(req, { params }) {
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

    // ✅ params is a Promise in this new API — must await it
    const { id } = await params;

    if (!id) {
      return Response.json({ error: "Meeting ID missing" }, { status: 400 });
    }

    const meeting = await Meeting.findOne({
      _id: id,
      userId: decoded.userId,
    });

    if (!meeting) {
      return Response.json({ error: "Meeting not found" }, { status: 404 });
    }

    return Response.json({ meeting });
  } catch (err) {
    console.error("Error fetching meeting:", err);
    return Response.json({ error: "Failed to fetch meeting" }, { status: 500 });
  }
}

// 🔹 DELETE /api/meetings/[id]
export async function DELETE(req, { params }) {
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

    // ✅ same here
    const { id } = await params;

    if (!id) {
      return Response.json({ error: "Meeting ID missing" }, { status: 400 });
    }

    const deleted = await Meeting.findOneAndDelete({
      _id: id,
      userId: decoded.userId,
    });

    if (!deleted) {
      return Response.json({ error: "Meeting not found" }, { status: 404 });
    }

    return Response.json({ success: true, message: "Meeting deleted" });
  } catch (err) {
    console.error("Error deleting meeting:", err);
    return Response.json({ error: "Failed to delete meeting" }, { status: 500 });
  }
}
