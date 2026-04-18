"use client";
import { useEffect, useState } from "react";

type Tweaks = {
  variation: "editorial" | "brutalist" | "dark";
  accent: "lime" | "magenta" | "orange" | "blue";
  showCursorReact: boolean;
};

const DEFAULTS: Tweaks = {
  variation: "editorial",
  accent: "magenta",
  showCursorReact: true,
};

export default function TweaksPanel() {
  const [t, setT] = useState<Tweaks>(DEFAULTS);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-variation", t.variation);
    html.setAttribute("data-accent", t.accent);
  }, [t]);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (!e.data) return;
      if (e.data.type === "__activate_edit_mode") setOpen(true);
      if (e.data.type === "__deactivate_edit_mode") setOpen(false);
    };
    window.addEventListener("message", onMsg);
    try { window.parent.postMessage({ type: "__edit_mode_available" }, "*"); } catch {}
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const set = <K extends keyof Tweaks>(k: K, v: Tweaks[K]) => {
    setT((prev) => ({ ...prev, [k]: v }));
    try {
      window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { [k]: v } }, "*");
    } catch {}
  };

  return (
    <div className={"tweaks" + (open ? " on" : "")}>
      <h4>{"/// Tweaks"}</h4>
      <div className="row">
        <label>Variation</label>
        <div className="opts">
          {(["editorial", "brutalist", "dark"] as const).map((v) => (
            <div key={v} className={"opt" + (t.variation === v ? " on" : "")} onClick={() => set("variation", v)}>
              {v}
            </div>
          ))}
        </div>
      </div>
      <div className="row">
        <label>Accent</label>
        <div className="opts">
          {([
            { v: "lime", c: "#D6FF3E" },
            { v: "magenta", c: "#FF4EE0" },
            { v: "orange", c: "#FF6A1A" },
            { v: "blue", c: "#4E8CFF" },
          ] as const).map((s) => (
            <div
              key={s.v}
              className={"swatch" + (t.accent === s.v ? " on" : "")}
              style={{ background: s.c }}
              onClick={() => set("accent", s.v)}
            />
          ))}
        </div>
      </div>
      <div className="row">
        <label>Cursor react</label>
        <div className="opts">
          {[true, false].map((v) => (
            <div
              key={String(v)}
              className={"opt" + (t.showCursorReact === v ? " on" : "")}
              onClick={() => set("showCursorReact", v)}
            >
              {v ? "On" : "Off"}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
