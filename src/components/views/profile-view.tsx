"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { useSession, signOut } from "@/lib/auth-client";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, Music, Clock, ListMusic, Sun, Moon } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface HistoryItem {
  id: number;
  title: string;
  artist: string | null;
  sungAt: string;
}

interface Stats {
  totalSung: number;
  totalPlaylists: number;
  recentSongs: HistoryItem[];
}

export function ProfileView() {
  const { data: session, isPending } = useSession();
  const { data: stats } = useSWR<Stats>(
    session ? "/api/profile/stats" : null,
    fetcher
  );
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/login";
  };

  if (isPending) {
    return (
      <div className="px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="size-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </div>
    );
  }

  const user = session?.user;

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 border-b border-border/20 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Profil
          </h1>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* User info */}
        {user && (
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="size-14 border border-border/20">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback className="text-lg bg-card text-foreground">
                {user.name?.charAt(0)?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-base font-semibold truncate text-foreground">
                {user.name}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        )}

        <Separator className="mb-6 bg-border/20" />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-3 rounded-xl border border-border/20 p-3">
            <div className="flex items-center justify-center size-9 rounded-lg border border-border/20 bg-card">
              <Music className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-semibold font-mono text-foreground">
                {stats?.totalSung ?? 0}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Gesungen
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border/20 p-3">
            <div className="flex items-center justify-center size-9 rounded-lg border border-border/20 bg-card">
              <ListMusic className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-semibold font-mono text-foreground">
                {stats?.totalPlaylists ?? 0}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Playlisten
              </p>
            </div>
          </div>
        </div>

        {/* Recent songs */}
        <div className="mb-6">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-2">
            <Clock className="size-3" />
            Zuletzt gesungen
          </h2>
          {!stats?.recentSongs?.length ? (
            <p className="text-xs text-muted-foreground">
              Noch keine Lieder gesungen.
            </p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {stats.recentSongs.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl p-2"
                >
                  <div className="flex items-center justify-center size-8 shrink-0 rounded-lg border border-border/20 bg-card">
                    <Music className="size-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate text-foreground">
                      {item.title}
                    </p>
                    {item.artist && (
                      <p className="text-xs text-muted-foreground truncate">
                        {item.artist}
                      </p>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground/50 font-mono shrink-0">
                    {new Date(item.sungAt).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator className="mb-6 bg-border/20" />

        {/* Settings */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-xl border border-border/20 p-3">
            <div className="flex items-center gap-3">
              {dark ? (
                <Moon className="size-4 text-muted-foreground" />
              ) : (
                <Sun className="size-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium text-foreground">
                Dark Mode
              </span>
            </div>
            <Switch checked={dark} onCheckedChange={toggleTheme} />
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-xl border border-border/20 p-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="size-4" />
            Abmelden
          </button>
        </div>
      </div>
    </div>
  );
}
