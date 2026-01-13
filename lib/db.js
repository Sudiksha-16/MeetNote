import mongoose from "mongoose"

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/aimeeting"
    console.log("🔗 Connecting to MongoDB:", uri)

    cached.promise = mongoose
      .connect(uri, opts)
      .then((mongoose) => {
        console.log("✅ MongoDB connected successfully")
        return mongoose
      })
      .catch((err) => {
        console.error("❌ MongoDB connection failed:", err)
        throw err
      })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}
