"use client";

import { cn } from "@/lib/utils";
import { Search, Mic, ListMusic, User } from "lucide-react";

export type TabId = "search" | "sing" | "playlists" | "profile";

const tabs: { id: TabId; label: string; icon: typeof Search }[] = [
  { id: "search", label: "Suche", icon: Search },
  { id: "sing", label: "Singen", icon: Mic },
  { id: "playlists", label: "Listen", icon: ListMusic },
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
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background"
    >
      <div className="flex h-14 items-center justify-around pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(id)}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-1 text-[11px] font-medium",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="size-5" strokeWidth={isActive ? 2 : 1.5} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
