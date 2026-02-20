"use client";

import { useState, useCallback } from "react";
import { BottomNav, type TabId } from "./bottom-nav";
import { SearchView } from "@/components/views/search-view";
import { SingView } from "@/components/views/sing-view";
import { PlaylistsView } from "@/components/views/playlists-view";
import { ProfileView } from "@/components/views/profile-view";

export interface SongMeta {
  id: number;
  slug: string;
  title: string;
  artist: string | null;
  category: string | null;
  createdAt: string;
}

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>("search");
  const [currentSong, setCurrentSong] = useState<SongMeta | null>(null);

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
  }, []);

  const handleSingNow = useCallback((song: SongMeta) => {
    setCurrentSong(song);
    setActiveTab("sing");
  }, []);

  const handleOpenSong = useCallback((song: SongMeta) => {
    setCurrentSong(song);
    setActiveTab("sing");
  }, []);

  return (
    <div className="flex min-h-svh flex-col">
      <main className="flex-1 pb-14">
        {activeTab === "search" && <SearchView onSingNow={handleSingNow} />}
        {activeTab === "sing" && <SingView song={currentSong} />}
        {activeTab === "playlists" && (
          <PlaylistsView onOpenSong={handleOpenSong} />
        )}
        {activeTab === "profile" && <ProfileView />}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
