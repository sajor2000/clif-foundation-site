"use client";

import { useEffect, useState } from "react";

const CHAPTERS = [
  { id: "ch-title", n: "00", title: "Title" },
  { id: "ch-federation", n: "01", title: "Federation" },
  { id: "ch-tables", n: "02", title: "Tables" },
  { id: "ch-programs", n: "03", title: "Programs" },
  { id: "ch-close", n: "04", title: "Start" },
] as const;

function chapterAtMidline(): string {
  const mid = window.innerHeight * 0.42;
  for (const c of CHAPTERS) {
    const el = document.getElementById(c.id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (r.top <= mid && r.bottom >= mid) return c.id;
  }
  // Fallback: nearest section top above midline
  let best: (typeof CHAPTERS)[number]["id"] = CHAPTERS[0].id;
  let bestTop = -Infinity;
  for (const c of CHAPTERS) {
    const el = document.getElementById(c.id);
    if (!el) continue;
    const top = el.getBoundingClientRect().top;
    if (top <= mid && top > bestTop) {
      bestTop = top;
      best = c.id;
    }
  }
  return best;
}

export function ChapterFolio() {
  const [current, setCurrent] = useState<string>(CHAPTERS[0].id);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setCurrent(chapterAtMidline());
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const onInk = current === "ch-federation";

  return (
    <nav
      className="sc-folio"
      aria-label="Chapter folio"
      data-ink={onInk ? "true" : "false"}
    >
      {CHAPTERS.map((c) => (
        <div
          key={c.id}
          className="sc-folio__item"
          data-current={current === c.id ? "true" : "false"}
        >
          <span className="sc-folio__n">{c.n}</span>
          <span className="sc-folio__t">{c.title}</span>
        </div>
      ))}
    </nav>
  );
}
