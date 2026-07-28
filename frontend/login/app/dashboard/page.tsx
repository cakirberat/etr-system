"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader, type DashboardTab } from "@/components/dashboard-header"
import { Dashboard } from "@/components/dashboard"
import { type NotificationItem } from "@/components/notifications-panel"
import { isAuthenticated } from "@/lib/api"

export default function DashboardPage() {
  const router = useRouter()
  const [username, setUsername] = useState("Admin")
  const [uploadTrigger, setUploadTrigger] = useState(0)
  const [ready, setReady] = useState(false)
  const [activeTab, setActiveTab] = useState<DashboardTab>("dataset")
  const [searchQuery, setSearchQuery] = useState("")
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/")
      return
    }
    const stored = localStorage.getItem("username")
    if (stored) setUsername(stored)
    setReady(true)
    setNotifications([
      {
        id: "welcome",
        type: "info",
        message: "AKO GRUP Veri Konsolu'na hoş geldiniz.",
        time: new Date(),
      },
    ])
  }, [router])

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Oturum doğrulanıyor…
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <DashboardHeader
        username={username}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onUploadClick={() => setUploadTrigger((n) => n + 1)}
        notifications={notifications}
        notificationsOpen={notificationsOpen}
        onNotificationsOpenChange={setNotificationsOpen}
        onClearNotifications={() => setNotifications([])}
      />
      <Dashboard
        activeTab={activeTab}
        searchQuery={searchQuery}
        uploadTrigger={uploadTrigger}
        onNotify={setNotifications}
      />
    </main>
  )
}
