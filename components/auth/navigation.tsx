"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { UserNav } from "./user-nav";

/**
 * Navigation Component
 * 
 * Main navigation bar with conditional rendering based on authentication state.
 * 
 * Unauthenticated state:
 * - Shows Logo, SOS link, and UserNav (Login/Register buttons)
 * - All feature navigation links are hidden
 * 
 * Authenticated state:
 * - Shows Logo and full navigation menu (Home, Profile, Live, SOS, Book Darshan, Routes, Forecast)
 * - Shows Admin link for admin users
 * - Shows UserNav with user menu
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 5.2
 */
export function Navigation() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.userType === "admin";
  const isAuthenticated = status === "authenticated" && !!session;

  // Debug logging
  console.log('[Navigation] Status:', status, 'Session:', session, 'IsAuthenticated:', isAuthenticated);

  return (
    <nav className="bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl sm:text-2xl font-bold text-primary">
          ||🕉️|| ShraddhaSecure
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-6 text-sm items-center">
          {!isAuthenticated ? (
            <>
              {/* Unauthenticated: Show only SOS link and UserNav (Login/Register) */}
              <Link href="/sos" className="text-red-600 hover:text-red-700 font-semibold transition">
                SOS
              </Link>
              <UserNav />
            </>
          ) : (
            <>
              {/* Authenticated: Show full navigation */}
              <Link href="/" className="hover:text-primary transition">Home</Link>
              <Link href="/profile" className="hover:text-primary transition">Profile</Link>
              <Link href="/heatmap" className="hover:text-primary transition">Live</Link>
              <Link href="/sos" className="hover:text-primary transition">SOS</Link>
              <Link href="/darshan" className="hover:text-primary transition">Book Darshan</Link>
              <Link href="/routes" className="hover:text-primary transition">Routes</Link>
              <Link href="/forecast" className="hover:text-primary transition">Forecast</Link>
              {isAdmin && (
                <Link href="/admin" className="hover:text-primary transition font-semibold text-primary">
                  Admin
                </Link>
              )}
              <UserNav />
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden gap-3 text-xs items-center">
          {!isAuthenticated ? (
            <>
              {/* Unauthenticated: Show only SOS link and UserNav (Login/Register) */}
              <Link href="/sos" className="text-red-600 hover:text-red-700 font-semibold transition">
                SOS
              </Link>
              <UserNav />
            </>
          ) : (
            <>
              {/* Authenticated: Show condensed navigation for mobile */}
              <Link href="/" className="hover:text-primary transition">Home</Link>
              <Link href="/profile" className="hover:text-primary transition">Profile</Link>
              <Link href="/heatmap" className="hover:text-primary transition">Live</Link>
              <Link href="/sos" className="hover:text-primary transition">SOS</Link>
              <Link href="/darshan" className="hover:text-primary transition">Book</Link>
              <Link href="/routes" className="hover:text-primary transition">Routes</Link>
              <Link href="/forecast" className="hover:text-primary transition">Forecast</Link>
              {isAdmin && (
                <Link href="/admin" className="hover:text-primary transition font-semibold text-primary">
                  Admin
                </Link>
              )}
              <UserNav />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
