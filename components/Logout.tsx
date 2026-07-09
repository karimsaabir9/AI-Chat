"use client";

import { useState } from "react";
import { signOut } from "@/lib/auth-client";
import { LogOut, Loader2 } from "lucide-react";

const Logout = () => {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    // Hard navigation so every client cache (session, router) is dropped
    // and the browser history entry for /dashboard is replaced.
    window.location.replace("/signin");
  };

  return (
    <button
      className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
      onClick={handleSignOut}
      disabled={isSigningOut}
    >
      {isSigningOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      Sign out
    </button>
  );
};

export default Logout;
