'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Clock, AlertTriangle, Users, BarChart3, Settings, Menu, X, Accessibility, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/admin/logout-button'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Clock, label: 'Slots', href: '/admin/slots' },
  { icon: AlertTriangle, label: 'Alerts', href: '/admin/alerts' },
  { icon: Accessibility, label: 'Accessibility', href: '/admin/accessibility' },
  { icon: Activity, label: 'Performance', href: '/admin/performance' },
  { icon: Users, label: 'Volunteers', href: '/admin/volunteers' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transition-all duration-300 lg:relative ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 space-y-8">
          {/* Logo */}
          <Link href="/admin" className="flex items-center gap-2 text-xl font-bold text-foreground">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-sidebar-primary-foreground text-sm font-bold">
              SA
            </div>
            <span className="hidden sm:inline">ShraddhaSecure</span>
          </Link>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-card/50 border-b border-border/50 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div>Admin Panel</div>
            <LogoutButton />
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
              A
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </div>
    </div>
  )
}
