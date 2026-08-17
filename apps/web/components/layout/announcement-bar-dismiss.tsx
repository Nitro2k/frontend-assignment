"use client";

import { X } from "lucide-react";
import { useState } from "react";

export function AnnouncementBarDismiss({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative flex items-center justify-center bg-black px-10 py-2.5 text-center text-xs text-white">
      {children}
      <button
        type="button"
        aria-label="Dismiss announcement"
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-white/80 hover:text-white"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
