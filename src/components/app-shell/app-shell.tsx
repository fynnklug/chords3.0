"use client";

import { useState, useCallback, useRef } from "react";
import { BottomNav, type TabId } from "./bottom-nav";
import { SearchView } from "@/components/views/search-view";
import { SingView } from "@/components/views/sing-view";
import { PlaylistsView } from "@/components/views/playlists-view";
import { ProfileView } from "@/components/views/profile-view";
import { motion, AnimatePresence } from "framer-motion";

export interface SongMeta {
  id: number;
  slug: string;
  title: string;
  artist: string | null;
  category: string | null;
  createdAt: string;
}

const tabOrder: TabId[] = ["search", "sing", "playlists", "profile"];

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>("search");
  const [currentSong, setCurrentSong] = useState<SongMeta | null>(null);
  const prevTabRef = useRef<TabId>("search");

  const handleTabChange = useCallback(
    (tab: TabId) => {
      prevTabRef.current = activeTab;
      setActiveTab(tab);
    },
    [activeTab]
  );

  const handleSingNow = useCallback(
    (song: SongMeta) => {
      setCurrentSong(song);
      prevTabRef.current = activeTab;
      setActiveTab("sing");
    },
    [activeTab]
  );

  const handleOpenSong = useCallback(
    (song: SongMeta) => {
      setCurrentSong(song);
      prevTabRef.current = activeTab;
      setActiveTab("sing");
    },
    [activeTab]
  );

  const direction =
    tabOrder.indexOf(activeTab) > tabOrder.indexOf(prevTabRef.current) ? 1 : -1;

  return (
    <div className="flex min-h-svh flex-col overflow-hidden">
      <main className="flex-1 relative pb-16">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={activeTab}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full"
          >
            {activeTab === "search" && (
              <SearchView onSingNow={handleSingNow} />
            )}
            {activeTab === "sing" && <SingView song={currentSong} />}
            {activeTab === "playlists" && (
              <PlaylistsView onOpenSong={handleOpenSong} />
            )}
            {activeTab === "profile" && <ProfileView />}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
