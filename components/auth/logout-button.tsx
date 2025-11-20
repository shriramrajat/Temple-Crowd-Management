"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface LogoutButtonProps {
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  showConfirmation?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Logout Button Component
 * 
 * Handles user logout with optional confirmation dialog.
 * Integrates NextAuth signOut function and clears session cookies.
 * 
 * Requirements: 6.1, 6.2, 6.3
 */
export function LogoutButton({
  variant = "outline",
  size = "sm",
  showIcon = true,
  showConfirmation = true,
  className = "",
  children,
}: LogoutButtonProps) {
  const handleLogout = async () => {
    try {
      // Sign out using NextAuth - this will:
      // 1. Invalidate the current session token (Requirement 6.1)
      // 2. Clear authentication cookies (Requirement 6.3)
      // 3. Redirect to login page (Requirement 6.2)
      await signOut({ 
        callbackUrl: "/login",
        redirect: true,
      });
      
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  const buttonContent = (
    <Button
      variant={variant}
      size={size}
      onClick={showConfirmation ? undefined : handleLogout}
      className={`gap-2 ${className}`}
    >
      {showIcon && <LogOut className="h-4 w-4" />}
      {children || "Logout"}
    </Button>
  );

  if (!showConfirmation) {
    return buttonContent;
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {buttonContent}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to log out? You will need to sign in again to access your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout}>
            Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
