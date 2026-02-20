"use client";

import { cn } from "@/lib/utils";
import { Search, Mic, ListMusic, User } from "lucide-react";
import { motion } from "framer-motion";

export type TabId = "search" | "sing" | "playlists" | "profile";

const tabs: { id: TabId; label: string; icon: typeof Search }[] = [
  { id: "search", label: "SUCHE", icon: Search },
  { id: "sing", label: "SINGEN", icon: Mic },
  { id: "playlists", label: "LISTEN", icon: ListMusic },
  { id: "profile", label: "PROFIL", icon: User },
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
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/20 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40"
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
                "relative flex flex-1 flex-col items-center gap-1 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/70"
              )}
            >
              <div className="relative">
                <Icon
                  className="size-5"
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-foreground"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 35,
                    }}
                  />
                )}
              </div>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
