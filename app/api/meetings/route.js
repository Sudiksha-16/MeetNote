import { connectDB } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import Meeting from "@/models/Meeting"

export async function GET(req) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1]
    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return Response.json({ error: "Invalid token" }, { status: 401 })
    }

    await connectDB()

    const meetings = await Meeting.find({ userId: decoded.userId }).sort({ createdAt: -1 })

    return Response.json({ meetings })
  } catch (err) {
    console.error("Error fetching meetings:", err)
    return Response.json({ error: "Failed to fetch meetings" }, { status: 500 })
  }
}
