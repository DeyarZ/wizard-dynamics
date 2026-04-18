"use client";
import { useRef, useState } from "react";
import { askKai, type ChatMsg } from "../lib/kai";

type Line = { role: "sys" | "user" | "ai"; text: string };

const SUGGEST = [
  { ask: "What does Wizard Dynamics actually do?", label: "What do you actually do?" },
  { ask: "How do you ship so fast without meetings?", label: "How do you ship so fast?" },
  { ask: "Why should I hire Wizard Dynamics instead of an agency?", label: "Why hire you?" },
  { ask: "Tell me something honest about working here.", label: "Be honest about the work" },
];

export default function KaiTerminal() {
  const [lines, setLines] = useState<Line[]>([
    { role: "sys", text: "// session opened · kai v4.2 · munich" },
    { role: "ai", text: "Hey. I'm Kai — the third co-founder. Ask me about the studio, how we ship, or anything else. I'll be blunt." },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const ask = async (q: string) => {
    if (thinking) return;
    const history: ChatMsg[] = [
      ...lines.filter((l) => l.role !== "sys").map((l) => ({
        role: (l.role === "ai" ? "assistant" : "user") as "user" | "assistant",
        content: l.text,
      })),
      { role: "user", content: q },
    ];
    setLines((prev) => [...prev, { role: "user", text: q }]);
    setThinking(true);
    const reply = await askKai(history, "chat");
    setLines((prev) => [...prev, { role: "ai", text: reply }]);
    setThinking(false);
    setTimeout(() => {
      if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }, 0);
  };

  return (
    <div className="kai-terminal">
      <div className="kai-term-head">
        <span>{"/// kai.chat — ask the third co-founder"}</span>
        <div className="dots"><span /><span /><span /></div>
      </div>
      <div className="kai-term-body" ref={bodyRef}>
        {lines.map((l, i) => (
          <div className={"kai-line " + l.role} key={i}>
            {l.role !== "sys" && <span className="prompt">{l.role === "user" ? "you ▸" : "kai ▸"}</span>}{" "}
            <span className="text">{l.text}</span>
          </div>
        ))}
        {thinking && <div className="kai-line ai"><span className="prompt">kai ▸</span> <span className="kai-cursor" /></div>}
      </div>
      <div className="kai-suggest">
        {SUGGEST.map((s) => (
          <button key={s.ask} onClick={() => ask(s.ask)}>{s.label}</button>
        ))}
      </div>
      <form
        className="kai-term-input"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          const v = input.trim();
          if (!v) return;
          setInput("");
          ask(v);
        }}
      >
        <span className="prompt">you ▸</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ask kai anything…"
          autoComplete="off"
        />
      </form>
    </div>
  );
}
