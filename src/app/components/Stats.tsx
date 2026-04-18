"use client";
import { useEffect, useRef, useState } from "react";

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [v, setV] = useState(0);
  const started = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting && !started.current) {
            started.current = true;
            const dur = 1400;
            const t0 = performance.now();
            const step = (t: number) => {
              const p = Math.min(1, (t - t0) / dur);
              const e = 1 - Math.pow(1 - p, 3);
              setV(target * e);
              if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          }
        });
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  const display = target < 10 ? v.toFixed(0) : Math.round(v).toString();
  return <span ref={ref}>{display}{suffix}</span>;
}

export default function Stats() {
  return (
    <section className="stats" id="stats" data-screen-label="03 Stats">
      <div className="section-head">
        <span className="index">§03 / Proof</span>
        <span className="title">Live counters. No asterisks.</span>
      </div>
      <h2 className="stats-intro"><em>Receipts,</em> not decks.</h2>
      <div className="stats-grid">
        <div className="stat">
          <div className="stat-num"><Counter target={100} suffix="+" /></div>
          <div className="stat-label">Apps built</div>
        </div>
        <div className="stat">
          <div className="stat-num">$<Counter target={210} suffix="K+" /></div>
          <div className="stat-label">ARR</div>
        </div>
        <div className="stat">
          <div className="stat-num"><Counter target={1} suffix="M+" /></div>
          <div className="stat-label">Views</div>
        </div>
        <div className="stat">
          <div className="stat-num"><Counter target={15} suffix="K+" /></div>
          <div className="stat-label">Followers</div>
        </div>
      </div>
    </section>
  );
}
