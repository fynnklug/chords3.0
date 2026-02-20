"use client";

import useSWR from "swr";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, Music, Clock, ListMusic } from "lucide-react";

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

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/login";
  };

  if (isPending) {
    return (
      <div className="px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="size-12 rounded-full" />
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
      <header className="sticky top-0 z-30 bg-background">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-lg font-semibold">Profil</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="size-4 mr-1.5" />
            Abmelden
          </Button>
        </div>
        <Separator />
      </header>

      <div className="px-4 py-6 flex flex-col gap-6">
        {/* User info */}
        {user && (
          <div className="flex items-center gap-3">
            <Avatar className="size-12">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback>
                {user.name?.charAt(0)?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-sm text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex items-center justify-center size-9 rounded-md bg-muted">
                <Music className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold font-mono leading-none">
                  {stats?.totalSung ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Gesungen
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex items-center justify-center size-9 rounded-md bg-muted">
                <ListMusic className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold font-mono leading-none">
                  {stats?.totalPlaylists ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Playlisten
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent songs */}
        <div>
          <h2 className="text-sm font-semibold flex items-center gap-1.5 mb-3">
            <Clock className="size-4 text-muted-foreground" />
            Zuletzt gesungen
          </h2>
          {!stats?.recentSongs?.length ? (
            <p className="text-sm text-muted-foreground">
              Noch keine Lieder gesungen.
            </p>
          ) : (
            <Card>
              <CardContent className="p-0">
                {stats.recentSongs.map((item, i) => (
                  <div key={item.id}>
                    <div className="flex items-center gap-3 px-4 py-2.5">
                      <div className="flex items-center justify-center size-8 shrink-0 rounded-md bg-muted">
                        <Music className="size-3.5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {item.title}
                        </p>
                        {item.artist && (
                          <p className="text-xs text-muted-foreground truncate">
                            {item.artist}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono shrink-0">
                        {new Date(item.sungAt).toLocaleDateString("de-DE", {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </p>
                    </div>
                    {i < stats.recentSongs.length - 1 && (
                      <Separator className="ml-16" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
