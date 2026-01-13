import { connectDB } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import Meeting from "@/models/Meeting"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(req) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1]
    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return Response.json({ error: "Invalid token" }, { status: 401 })
    }

    const formData = await req.formData()
    const audio = formData.get("audio")
    const title = formData.get("title")
    const description = formData.get("description")

    if (!audio || !title) {
      return Response.json({ error: "Missing audio or title" }, { status: 400 })
    }

    const uploadsDir = path.join(process.cwd(), "public/uploads")
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (err) {
      console.log("Uploads directory already exists")
    }

    // Save audio file
    const buffer = await audio.arrayBuffer()
    const filename = `${Date.now()}-${Buffer.from(Math.random().toString()).toString("base64").substring(0, 8)}-${title.replace(/\s+/g, "-").substring(0, 20)}`
    const filepath = path.join(uploadsDir, filename)

    await writeFile(filepath, Buffer.from(buffer))

    await connectDB()

    const meeting = new Meeting({
      userId: decoded.userId,
      title,
      description,
      audioPath: `/uploads/${filename}`,
      status: "pending",
    })

    await meeting.save()

    // Trigger background processing
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/process-meeting`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingId: meeting._id.toString() }),
    }).catch((err) => console.error("Failed to trigger processing:", err))

    return Response.json({ meeting, success: true })
  } catch (err) {
    console.error("Upload error:", err)
    return Response.json({ error: "Upload failed" }, { status: 500 })
  }
}
