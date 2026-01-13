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

    const { searchParams } = new URL(req.url)
    const meetingId = searchParams.get("meetingId")

    if (!meetingId) {
      return Response.json({ error: "Missing meetingId" }, { status: 400 })
    }

    await connectDB()

    const meeting = await Meeting.findOne({
      _id: meetingId,
      userId: decoded.userId,
    })

    if (!meeting) {
      return Response.json({ error: "Meeting not found" }, { status: 404 })
    }

    console.log("Analyzing sentiment for meeting:", meetingId)
    const sentiment = analyzeSentimentFromTranscript(meeting.transcript)

    meeting.sentiment = sentiment.overall
    await meeting.save()

    console.log("Sentiment analysis result:", sentiment.overall)

    return Response.json({ sentiment })
  } catch (err) {
    console.error("Sentiment analysis error:", err)
    return Response.json({ error: "Sentiment analysis failed" }, { status: 500 })
  }
}

function analyzeSentimentFromTranscript(transcript) {
  if (!transcript) {
    return {
      overall: "neutral",
      positiveIndicators: 0,
      negativeIndicators: 0,
      confidence: 0,
    }
  }

  // Extended word lists for better sentiment detection
  const positiveWords = [
    "excellent",
    "great",
    "fantastic",
    "good",
    "approved",
    "success",
    "perfect",
    "amazing",
    "wonderful",
    "completed",
    "achieved",
    "accomplished",
    "brilliant",
    "outstanding",
    "impressive",
    "satisfied",
    "happy",
    "pleased",
    "positive",
    "resolved",
  ]

  const negativeWords = [
    "issue",
    "problem",
    "failed",
    "error",
    "blocker",
    "concern",
    "critical",
    "bad",
    "terrible",
    "awful",
    "poor",
    "negative",
    "delayed",
    "urgent",
    "stuck",
    "frustrated",
    "disappointed",
    "worried",
    "risky",
    "unclear",
  ]

  const lowerTranscript = transcript.toLowerCase()

  // Count word occurrences
  const positiveCount = positiveWords.filter((word) => lowerTranscript.includes(word)).length
  const negativeCount = negativeWords.filter((word) => lowerTranscript.includes(word)).length

  // Determine overall sentiment
  let overall = "neutral"
  if (positiveCount > negativeCount && positiveCount > 0) {
    overall = "positive"
  } else if (negativeCount > positiveCount && negativeCount > 0) {
    overall = "negative"
  }

  // Calculate confidence (0-100)
  const totalIndicators = positiveCount + negativeCount
  let confidence = 0
  if (totalIndicators > 0) {
    confidence = Math.min((Math.abs(positiveCount - negativeCount) / totalIndicators) * 100, 100)
  }

  console.log(
    "[v0] Sentiment breakdown - Positive:",
    positiveCount,
    "Negative:",
    negativeCount,
    "Confidence:",
    confidence,
  )

  return {
    overall,
    positiveIndicators: positiveCount,
    negativeIndicators: negativeCount,
    confidence: Math.round(confidence),
  }
}
