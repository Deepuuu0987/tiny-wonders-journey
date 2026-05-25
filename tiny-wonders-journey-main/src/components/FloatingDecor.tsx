import { useMemo } from "react";

interface Props {
  variant?: "stars" | "balloons" | "clouds" | "confetti" | "mixed";
  density?: number;
}

const colors = ["#fbcfe8", "#bae6fd", "#bbf7d0", "#fde68a", "#ddd6fe", "#fecaca"];

export function FloatingDecor({ variant = "mixed", density = 14 }: Props) {
  const items = useMemo(() => {
    return Array.from({ length: density }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 6,
      duration: 6 + Math.random() * 8,
      size: 16 + Math.random() * 32,
      color: colors[i % colors.length],
      kind: variant === "mixed"
        ? (["star","balloon","cloud"] as const)[i % 3]
        : variant === "stars" ? "star"
        : variant === "balloons" ? "balloon"
        : variant === "confetti" ? "confetti" : "cloud",
    }));
  }, [variant, density]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {items.map((it) => {
        const style = {
          left: `${it.left}%`,
          top: `${it.top}%`,
          width: it.size,
          height: it.size,
          color: it.color,
          animationDelay: `${it.delay}s`,
          animationDuration: `${it.duration}s`,
        } as React.CSSProperties;

        if (it.kind === "star") {
          return (
            <svg key={it.id} viewBox="0 0 24 24" className="absolute animate-twinkle" style={style}>
              <path fill="currentColor" d="M12 2l2.4 6.9L22 9.3l-5.6 4.6L18.5 22 12 18l-6.5 4 2.1-8.1L2 9.3l7.6-.4z"/>
            </svg>
          );
        }
        if (it.kind === "balloon") {
          return (
            <div key={it.id} className="absolute animate-float-slow" style={style}>
              <svg viewBox="0 0 40 60" className="w-full h-full">
                <ellipse cx="20" cy="22" rx="16" ry="20" fill={it.color} opacity="0.9"/>
                <path d="M20 42 L18 48 L22 48 Z" fill={it.color}/>
                <path d="M20 48 Q24 54 18 60" stroke={it.color} strokeWidth="1" fill="none"/>
              </svg>
            </div>
          );
        }
        if (it.kind === "confetti") {
          return (
            <div key={it.id} className="absolute animate-confetti rounded-sm"
              style={{ ...style, background: it.color, height: it.size * 0.4 }} />
          );
        }
        return (
          <div key={it.id} className="absolute animate-float" style={style}>
            <svg viewBox="0 0 64 40" className="w-full h-full">
              <path d="M16 28 Q8 28 8 20 Q8 12 18 14 Q20 6 30 8 Q38 4 44 12 Q56 12 56 22 Q56 32 46 32 L18 32 Q12 32 16 28Z"
                fill={it.color} opacity="0.7"/>
            </svg>
          </div>
        );
      })}
    </div>
  );
}
