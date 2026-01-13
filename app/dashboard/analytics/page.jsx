"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("authToken")
        const res = await fetch("/api/meetings", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.ok) {
          const data = await res.json()
          const meetings = data.meetings || []

          const totalMeetings = meetings.length
          const processedMeetings = meetings.filter((m) => m.status === "processed").length
          const totalMinutes = meetings.reduce((sum, m) => sum + (m.duration || 0), 0) / 60
          const avgMeetingLength = totalMeetings > 0 ? Math.round(totalMinutes / totalMeetings) : 0

          const sentimentCounts = {
            positive: meetings.filter((m) => m.sentiment === "positive").length,
            neutral: meetings.filter((m) => m.sentiment === "neutral").length,
            negative: meetings.filter((m) => m.sentiment === "negative").length,
          }

          const totalKeyPoints = meetings.reduce((sum, m) => sum + (m.keyPoints?.length || 0), 0)
          const totalActionItems = meetings.reduce((sum, m) => sum + (m.actionItems?.length || 0), 0)

          setStats({
            totalMeetings,
            processedMeetings,
            totalMinutes: Math.round(totalMinutes),
            avgMeetingLength,
            sentimentCounts,
            totalKeyPoints,
            totalActionItems,
            meetings,
          })
        }
      } catch (err) {
        console.error("Error fetching stats:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const maxSentiment = Math.max(
    stats.sentimentCounts.positive,
    stats.sentimentCounts.neutral,
    stats.sentimentCounts.negative,
    1,
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-primary hover:text-primary/80 flex items-center gap-1 transition"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-xl font-bold text-foreground">Analytics & Insights</h1>
          <div className="w-20"></div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {stats && (
          <>
            {/* Key Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-card border border-border rounded-xl p-6">
                <p className="text-xs font-medium text-muted-foreground mb-2">Total Meetings</p>
                <p className="text-4xl font-bold text-foreground">{stats.totalMeetings}</p>
                <p className="text-xs text-muted-foreground mt-2">{stats.processedMeetings} processed</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <p className="text-xs font-medium text-muted-foreground mb-2">Total Meeting Time</p>
                <p className="text-4xl font-bold text-foreground">{stats.totalMinutes}</p>
                <p className="text-xs text-muted-foreground mt-2">minutes</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <p className="text-xs font-medium text-muted-foreground mb-2">Avg Meeting Length</p>
                <p className="text-4xl font-bold text-foreground">{stats.avgMeetingLength}</p>
                <p className="text-xs text-muted-foreground mt-2">minutes</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <p className="text-xs font-medium text-muted-foreground mb-2">Completion Rate</p>
                <p className="text-4xl font-bold text-foreground">
                  {stats.totalMeetings > 0 ? Math.round((stats.processedMeetings / stats.totalMeetings) * 100) : 0}%
                </p>
                <p className="text-xs text-muted-foreground mt-2">processed</p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Sentiment Distribution */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-bold text-foreground mb-6">Sentiment Distribution</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Positive</span>
                      <span className="text-sm font-bold text-primary">{stats.sentimentCounts.positive}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${(stats.sentimentCounts.positive / maxSentiment) * 100 || 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Neutral</span>
                      <span className="text-sm font-bold text-yellow-500">{stats.sentimentCounts.neutral}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{
                          width: `${(stats.sentimentCounts.neutral / maxSentiment) * 100 || 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Negative</span>
                      <span className="text-sm font-bold text-red-500">{stats.sentimentCounts.negative}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${(stats.sentimentCounts.negative / maxSentiment) * 100 || 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meeting Stats Summary */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-bold text-foreground mb-6">Meeting Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-border">
                    <span className="text-sm text-muted-foreground">Total Key Points</span>
                    <span className="text-2xl font-bold text-primary">{stats.totalKeyPoints}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-border">
                    <span className="text-sm text-muted-foreground">Total Action Items</span>
                    <span className="text-2xl font-bold text-accent">{stats.totalActionItems}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg per Meeting</span>
                    <span className="text-sm text-foreground">
                      {Math.round(
                        (stats.totalKeyPoints + stats.totalActionItems) / Math.max(stats.processedMeetings, 1),
                      )}{" "}
                      items
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Summary */}
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="bg-card border border-border rounded-xl p-6">
                <p className="text-xs font-medium text-muted-foreground mb-2">Avg Key Points</p>
                <p className="text-4xl font-bold text-primary">
                  {Math.round(stats.totalKeyPoints / Math.max(stats.processedMeetings, 1))}
                </p>
                <p className="text-xs text-muted-foreground mt-2">per meeting</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <p className="text-xs font-medium text-muted-foreground mb-2">Avg Action Items</p>
                <p className="text-4xl font-bold text-accent">
                  {Math.round(stats.totalActionItems / Math.max(stats.processedMeetings, 1))}
                </p>
                <p className="text-xs text-muted-foreground mt-2">per meeting</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <p className="text-xs font-medium text-muted-foreground mb-2">Processing Status</p>
                <p className="text-4xl font-bold text-foreground">
                  {stats.totalMeetings > 0 ? Math.round((stats.processedMeetings / stats.totalMeetings) * 100) : 0}%
                </p>
                <p className="text-xs text-muted-foreground mt-2">complete</p>
              </div>
            </div>

            {/* Recent Meetings Table */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-6">Recent Meetings</h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Title</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Duration</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Sentiment</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Items</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.meetings.slice(0, 10).map((meeting) => (
                      <tr
                        key={meeting._id}
                        className="border-b border-border hover:bg-muted/50 transition cursor-pointer"
                        onClick={() => router.push(`/meeting/${meeting._id}`)}
                      >
                        <td className="py-3 px-4 text-sm text-foreground">{meeting.title}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {new Date(meeting.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-foreground">
                          {Math.floor((meeting.duration || 0) / 60)}m
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary capitalize">
                            {meeting.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm capitalize text-foreground">{meeting.sentiment || "-"}</td>
                        <td className="py-3 px-4 text-sm text-foreground">
                          {(meeting.actionItems?.length || 0) + (meeting.keyPoints?.length || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
