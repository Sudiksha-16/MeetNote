import { connectDB } from "@/lib/db"
import { verifyPassword } from "@/lib/auth"
import User from "@/models/User"
import jwt from "jsonwebtoken"

export async function POST(req) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return Response.json({ error: "Missing email or password" }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({ email })
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return Response.json({ error: "Invalid password" }, { status: 401 })
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "7d",
    })

    return Response.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (err) {
    console.error("Login error:", err)
    return Response.json({ error: "Login failed" }, { status: 500 })
  }
}
