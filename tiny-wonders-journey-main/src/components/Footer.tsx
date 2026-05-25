import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative z-10 mt-20 py-10 text-center text-sm text-muted-foreground">
      <p className="inline-flex items-center gap-1.5">
        Made with <Heart className="size-4 text-primary fill-primary" /> for our little wonder
      </p>
    </footer>
  );
}
