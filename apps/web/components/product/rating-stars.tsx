import { Star } from "lucide-react";

import { starFillFractions } from "@/lib/format";

export function RatingStars({ rating }: { rating: number }) {
  const fractions = starFillFractions(rating);

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`Rated ${rating} out of 5`}
    >
      {fractions.map((fraction, index) => (
        <span key={index} className="relative inline-block size-3.5">
          <Star className="absolute inset-0 size-3.5 text-muted-foreground/40" />
          <span
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${fraction * 100}%` }}
          >
            <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
          </span>
        </span>
      ))}
    </div>
  );
}
