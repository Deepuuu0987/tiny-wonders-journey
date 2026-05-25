import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import heroBaby from "@/assets/hero-baby.jpg";
import { FloatingDecor } from "@/components/FloatingDecor";
import { AlbumCard } from "@/components/AlbumCard";
import { monthAlbums, eventAlbums } from "@/data/albums";
import { useTheme } from "@/components/ThemeProvider";
import { ArrowRight, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Little Wonders — A Beautiful Journey of Growing Up" },
      { name: "description", content: "From first smile to first birthday — a magical baby memory journey told month by month." },
      { property: "og:title", content: "Little Wonders — A Beautiful Journey of Growing Up" },
      { property: "og:description", content: "From first smile to first birthday." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  const { setTheme } = useTheme();
  useEffect(() => { setTheme("default"); }, [setTheme]);

  return (
    <>
      <FloatingDecor variant="mixed" density={18} />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBaby} alt="Baby surrounded by clouds and balloons" width={1920} height={1080} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/10 to-background" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <span className="inline-block px-4 py-1.5 rounded-full bg-card/70 backdrop-blur border text-xs font-medium tracking-wide uppercase animate-fade-up">
            ✨ A storybook of our little one
          </span>
          <h1 className="mt-6 font-display text-5xl sm:text-7xl md:text-8xl font-semibold leading-[1.05] text-gradient animate-fade-up" style={{ animationDelay: "120ms" }}>
            A Beautiful Journey<br/>of Growing Up
          </h1>
          <p className="mt-6 text-lg md:text-xl text-foreground/80 max-w-xl mx-auto animate-fade-up" style={{ animationDelay: "240ms" }}>
            From first smile to first birthday
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3 animate-fade-up" style={{ animationDelay: "360ms" }}>
            <Link to="/albums" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-primary-foreground font-medium shadow-dreamy hover:scale-105 transition">
              Open the album <ArrowRight className="size-4" />
            </Link>
            <Link to="/videos" className="inline-flex items-center gap-2 rounded-full bg-card border px-6 py-3 font-medium hover:bg-accent transition">
              Watch moments
            </Link>
          </div>
        </div>
        <ChevronDown className="absolute bottom-8 left-1/2 -translate-x-1/2 size-6 text-foreground/60 animate-float" />
      </section>

      {/* MONTH JOURNEY */}
      <section className="relative py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12 animate-fade-up">
            <p className="text-sm uppercase tracking-widest text-primary font-medium">Month by Month</p>
            <h2 className="mt-2 font-display text-4xl md:text-5xl font-semibold">Twelve tiny chapters</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Each month opens a new world — pink clouds, starry skies, teddies, rainbows and more.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {monthAlbums.map((a, i) => <AlbumCard key={a.slug} album={a} index={i} />)}
          </div>
        </div>
      </section>

      {/* EVENTS */}
      <section className="relative py-20 px-4 sm:px-6 bg-hero-gradient">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12 animate-fade-up">
            <p className="text-sm uppercase tracking-widest text-primary font-medium">Special Days</p>
            <h2 className="mt-2 font-display text-4xl md:text-5xl font-semibold">Big little moments</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {eventAlbums.map((a, i) => <AlbumCard key={a.slug} album={a} index={i} />)}
          </div>
        </div>
      </section>
    </>
  );
}
