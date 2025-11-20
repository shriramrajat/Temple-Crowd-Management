"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { LogoutButton } from "./logout-button";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/**
 * User Navigation Component
 * 
 * Displays user menu with profile and logout options for authenticated users.
 * Shows login/register buttons for unauthenticated users.
 * 
 * Requirements: 6.2, 6.4
 */
export function UserNav() {
  const { data: session, status } = useSession();

  // Show nothing while loading
  if (status === "loading") {
    return null;
  }

  // Show login/register for unauthenticated users
  if (status === "unauthenticated" || !session) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/login">Login</Link>
        </Button>
        <Button size="sm" asChild className="bg-primary hover:bg-primary/90">
          <Link href="/register">Register</Link>
        </Button>
      </div>
    );
  }

  // Show admin menu for admin users
  if (session.user?.userType === "admin") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-red-600 text-white">
                A
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Admin</p>
              <p className="text-xs leading-none text-muted-foreground">
                {session.user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/admin" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Admin Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-red-600 focus:text-red-600"
            onSelect={(e) => {
              e.preventDefault();
            }}
          >
            <LogoutButton
              variant="ghost"
              size="sm"
              showIcon={true}
              showConfirmation={true}
              className="w-full justify-start p-0 h-auto font-normal text-red-600 hover:text-red-600 hover:bg-transparent"
            >
              Logout
            </LogoutButton>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Only show user menu for pilgrim users
  if (session.user?.userType !== "pilgrim") {
    return null;
  }

  const userInitials = session.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : session.user?.email?.[0]?.toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session.user?.name || "Pilgrim"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/darshan/my-bookings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>My Bookings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onSelect={(e) => {
            e.preventDefault();
          }}
        >
          <LogoutButton
            variant="ghost"
            size="sm"
            showIcon={true}
            showConfirmation={true}
            className="w-full justify-start p-0 h-auto font-normal text-red-600 hover:text-red-600 hover:bg-transparent"
          >
            Logout
          </LogoutButton>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
