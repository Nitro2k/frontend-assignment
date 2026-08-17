"use client";

import { useEffect, useRef } from "react";

const ROOT_MARGIN_PX = 400;

export function useIntersectionObserver(
  onIntersect: () => void,
  enabled: boolean,
) {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const onIntersectRef = useRef(onIntersect);
  onIntersectRef.current = onIntersect;

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onIntersectRef.current();
      },
      { rootMargin: `${ROOT_MARGIN_PX}px` },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const target = targetRef.current;
    if (!target) return;

    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;
    if (target.getBoundingClientRect().top <= viewportHeight + ROOT_MARGIN_PX) {
      onIntersectRef.current();
    }
  }, [enabled]);

  return targetRef;
}
