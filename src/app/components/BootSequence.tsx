"use client";
import { useEffect, useRef } from "react";

const LINES: { t: number; cls?: string; html: string }[] = [
  { t: 60, html: '<span class="c-dim">// wizarddynamics.sys v4.2 — munich</span>' },
  { t: 120, cls: "ok", html: 'mounting founders... <span class="c-acc">2 detected</span>' },
  { t: 180, html: '<span class="c-dim">deyar.zakir   — builder    — online</span>' },
  { t: 120, html: '<span class="c-dim">manuel.worlitzer — operator   — online</span>' },
  { t: 260, cls: "ok", html: 'spinning up kai... <span class="c-acc">ai co-founder ready</span>' },
  { t: 180, html: '<span class="c-dim">apps in production: <span class="c-acc">103</span></span>' },
  { t: 120, html: '<span class="c-dim">arr: <span class="c-acc">$240,180</span></span>' },
  { t: 180, cls: "warn", html: 'no meetings scheduled. <span class="c-acc">ever.</span>' },
  { t: 300, cls: "ok", html: 'booting wizarddynamics.com... <span class="c-acc">ready</span>' },
];

export default function BootSequence() {
  const rootRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const tsRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (sessionStorage.getItem("wd_booted")) {
      el.classList.add("gone");
      return;
    }

    const clockInt = setInterval(() => {
      if (tsRef.current) {
        tsRef.current.textContent = new Date().toLocaleTimeString("en-GB", { hour12: false });
      }
    }, 250);

    let i = 0;
    let cancelled = false;
    function push() {
      if (cancelled) return;
      if (i >= LINES.length) {
        setTimeout(() => {
          el!.classList.add("gone");
          sessionStorage.setItem("wd_booted", "1");
          clearInterval(clockInt);
        }, 400);
        return;
      }
      const ln = LINES[i++];
      const d = document.createElement("div");
      d.className = "boot-line" + (ln.cls ? " " + ln.cls : "");
      d.innerHTML = ln.html;
      logRef.current?.appendChild(d);
      setTimeout(push, ln.t);
    }
    push();

    return () => {
      cancelled = true;
      clearInterval(clockInt);
    };
  }, []);

  const skip = () => {
    rootRef.current?.classList.add("gone");
    sessionStorage.setItem("wd_booted", "1");
  };

  return (
    <div className="boot" ref={rootRef}>
      <div className="boot-head">
        <span>{"// wizarddynamics.sys — boot"}</span>
        <span ref={tsRef}>--:--:--</span>
      </div>
      <div className="boot-log" ref={logRef} />
      <button className="boot-skip" onClick={skip}>skip ▸</button>
    </div>
  );
}
