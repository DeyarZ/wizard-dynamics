"use client";
import { useEffect, useRef } from "react";
import KaiTerminal from "./KaiTerminal";

function Portrait({ initials, mono }: { initials: string; mono?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const p = ref.current, i = inner.current;
    if (!p || !i) return;
    const onMove = (e: MouseEvent) => {
      const r = p.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 40;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 40;
      i.style.transform = `translate(${x}px, ${y}px)`;
    };
    const onLeave = () => { if (i) i.style.transform = "translate(0,0)"; };
    p.addEventListener("mousemove", onMove);
    p.addEventListener("mouseleave", onLeave);
    return () => {
      p.removeEventListener("mousemove", onMove);
      p.removeEventListener("mouseleave", onLeave);
    };
  }, []);
  return (
    <div className="founder-portrait" ref={ref}>
      <span
        className="initials"
        ref={inner}
        style={mono ? { fontFamily: "var(--font-mono)", fontSize: "clamp(56px,10vw,120px)", fontStyle: "normal", letterSpacing: "-0.05em" } : undefined}
      >
        {initials}
      </span>
    </div>
  );
}

export default function Team() {
  return (
    <section className="team" id="team" data-screen-label="04 Team">
      <div className="section-head">
        <span className="index">§04 / Team</span>
        <span className="title">Two founders. One AI.</span>
      </div>
      <h2 className="team-headline">Two founders.<br /><em>One AI.</em><br />Zero meetings.</h2>
      <p className="team-sub">
        {"/// Deyar builds products, scales them, breaks things, fixes them before anyone notices."}<br />
        {"/// Manuel does the same from the other side of the table."}<br />
        {"/// Kai — the AI co-founder — runs operations, analytics, and automation. Doesn’t sleep, occasionally has opinions."}
      </p>

      <div className="team-grid">
        <div className="founder" data-hover="">
          <Portrait initials="DZ" />
          <div className="founder-meta">
            <div className="name">Deyar Zakir</div>
            <div className="role">Co-founder / Builder</div>
            <div className="bio">Builds products, scales them, breaks things, fixes them before anyone notices.</div>
          </div>
        </div>
        <div className="founder" data-hover="">
          <Portrait initials="MW" />
          <div className="founder-meta">
            <div className="name">Manuel Worlitzer</div>
            <div className="role">Co-founder / Operator</div>
            <div className="bio">Same thing — from the other side of the table. Between the two of them, every base is covered.</div>
          </div>
        </div>
        <div className="founder kai" data-hover="">
          <Portrait initials="/kai" mono />
          <div className="founder-meta">
            <div className="name">Kai</div>
            <div className="role">AI Co-founder / Always on</div>
            <div className="bio">Runs operations, analytics, and automation. Doesn&apos;t sleep, doesn&apos;t complain, occasionally has opinions. Try him below.</div>
          </div>
        </div>
      </div>

      <KaiTerminal />
    </section>
  );
}
