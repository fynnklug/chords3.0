"use client";

import { useState, useCallback } from "react";
import { BottomNav, type TabId } from "./bottom-nav";
import { SearchView } from "@/components/views/search-view";
import { SingView } from "@/components/views/sing-view";
import { PlaylistsView } from "@/components/views/playlists-view";
import { ProfileView } from "@/components/views/profile-view";

export interface Song {
  id: number;
  title: string;
  artist: string | null;
  content: string | null;
  createdAt: Date;
}

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>("search");
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  const handleSingNow = useCallback((song: Song) => {
    setCurrentSong(song);
    setActiveTab("sing");
  }, []);

  const handleOpenSong = useCallback((song: Song) => {
    setCurrentSong(song);
    setActiveTab("sing");
  }, []);

  return (
    <div className="flex min-h-svh flex-col">
      <main className="flex-1 pb-16">
        <div className={activeTab === "search" ? "block" : "hidden"}>
          <SearchView onSingNow={handleSingNow} />
        </div>
        <div className={activeTab === "sing" ? "block" : "hidden"}>
          <SingView song={currentSong} />
        </div>
        <div className={activeTab === "playlists" ? "block" : "hidden"}>
          <PlaylistsView onOpenSong={handleOpenSong} />
        </div>
        <div className={activeTab === "profile" ? "block" : "hidden"}>
          <ProfileView />
        </div>
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
