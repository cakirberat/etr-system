import { DashboardHeader } from "@/components/dashboard-header"
import { Dashboard } from "@/components/dashboard"

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <DashboardHeader />
      <Dashboard />
    </main>
  )
}
