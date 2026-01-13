import { connectDB } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import User from "@/models/User"
import jwt from "jsonwebtoken"

export async function POST(req) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectDB()

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return Response.json({ error: "Email already exists" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)
    const user = new User({ name, email, password: hashedPassword })
    await user.save()

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "7d",
    })

    return Response.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (err) {
    console.error("Signup error:", err)
    return Response.json({ error: "Signup failed" }, { status: 500 })
  }
}
