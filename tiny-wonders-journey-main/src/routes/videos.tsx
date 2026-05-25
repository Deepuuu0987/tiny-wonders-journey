import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FloatingDecor } from "@/components/FloatingDecor";
import { VideoPlayer } from "@/components/VideoPlayer";
import { fetchVideos, getYoutubeId } from "@/lib/queries";
import { useTheme } from "@/components/ThemeProvider";

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title: "Video Memories — Little Wonders" },
      { name: "description", content: "Watch precious video moments from our baby's first year." },
      { property: "og:title", content: "Video Memories — Little Wonders" },
      { property: "og:url", content: "/videos" },
    ],
    links: [{ rel: "canonical", href: "/videos" }],
  }),
  component: VideosPage,
});

function VideosPage() {
  const { setTheme } = useTheme();
  useEffect(() => { setTheme("sky"); return () => setTheme("default"); }, [setTheme]);

  const { data: videos = [] } = useQuery({ queryKey: ["videos"], queryFn: fetchVideos });

  return (
    <>
      <FloatingDecor variant="stars" density={20} />
      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center animate-fade-up">
            <p className="text-sm uppercase tracking-widest text-primary font-medium">Moving Memories</p>
            <h1 className="mt-2 font-display text-5xl md:text-6xl font-semibold text-gradient">Video Gallery</h1>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Press play and relive the giggles.</p>
          </div>
          {videos.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">No videos yet 🎬</p>
          ) : (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              {videos.map((v, i) => (
                <div key={v.id} className="animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <VideoPlayer youtubeId={getYoutubeId(v.youtube_url)} title={v.title} />
                  <div className="mt-3 px-1">
                    <h3 className="font-display text-xl font-semibold">{v.title}</h3>
                    {v.description && <p className="text-sm text-muted-foreground">{v.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
