"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import MeetingUpload from "@/components/meeting-upload"
import MeetingList from "@/components/meeting-list"

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    setUser(JSON.parse(userData))
    fetchMeetings(token)
  }, [router])

  const fetchMeetings = async (token) => {
    try {
      const res = await fetch("/api/meetings", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setMeetings(data.meetings || [])
      }
    } catch (err) {
      console.error("Error fetching meetings:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    router.push("/")
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">MN</span>
            </div>
            <span className="text-xl font-bold text-foreground">MeetNote</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/analytics"
              className="text-muted-foreground hover:text-foreground transition font-medium"
            >
              Analytics
            </Link>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground">Welcome, {user.name}</span>
            <button onClick={handleLogout} className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Meetings</h1>
          <p className="text-muted-foreground">Manage and review your recorded meetings</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <MeetingUpload onUpload={() => fetchMeetings(localStorage.getItem("authToken"))} />
          </div>

          {/* Meetings List */}
          <div className="lg:col-span-2">
            <MeetingList meetings={meetings} loading={loading} />
          </div>
        </div>
      </main>
    </div>
  )
}
