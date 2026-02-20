"use client";

import { cn } from "@/lib/utils";
import { Search, Mic, ListMusic, User } from "lucide-react";

export type TabId = "search" | "sing" | "playlists" | "profile";

const tabs: { id: TabId; label: string; icon: typeof Search }[] = [
  { id: "search", label: "Suche", icon: Search },
  { id: "sing", label: "Singen", icon: Mic },
  { id: "playlists", label: "Playlisten", icon: ListMusic },
  { id: "profile", label: "Profil", icon: User },
];

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      role="tablist"
      aria-label="Hauptnavigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80"
    >
      <div className="flex h-16 items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(id)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-1 text-[11px] font-medium transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "size-5 transition-all",
                  isActive && "scale-105"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
