"use client"

import { useState } from "react"
import Link from "next/link"

export default function HomePage() {
  const [isHovering, setIsHovering] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">MN</span>
            </div>
            <span className="text-xl font-bold text-foreground">MeetNote</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="px-4 py-2 text-foreground hover:text-primary transition">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Transform Meetings into <span className="text-primary">Actionable Insights</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              MeetNote uses advanced AI to automatically transcribe, summarize, and analyze your meetings. Get key
              points, action items, and decisions in seconds.
            </p>
            <div className="flex gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition"
              >
                Get Started Free
              </Link>
              <button className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Feature Preview */}
          <div
            className="bg-card border border-border rounded-xl p-8 shadow-lg"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg p-6 aspect-square flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
                  <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </div>
                <p className="text-muted-foreground">Upload audio or record live</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {[
            { icon: "🎙️", title: "Live Recording", desc: "Record meetings directly in your browser" },
            { icon: "✨", title: "AI Summaries", desc: "Automatic key points and action items" },
            { icon: "📊", title: "Analytics", desc: "Speaker time, sentiment, keywords" },
            { icon: "🌐", title: "Translation", desc: "Multi-language support" },
            { icon: "📥", title: "Export", desc: "PDF, DOCX, and TXT formats" },
            { icon: "🔒", title: "Secure", desc: "End-to-end encryption" },
          ].map((feature, idx) => (
            <div key={idx} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}