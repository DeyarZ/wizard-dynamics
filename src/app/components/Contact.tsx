"use client";
import { useRef, useState } from "react";
import { askKai, type ChatMsg } from "../lib/kai";

type Bubble = { role: "kai" | "user"; html: string };

const QUICK = [
  { seed: "I want to build a mobile app.", label: "Building an app" },
  { seed: "I need help growing an existing product.", label: "Growing a product" },
  { seed: "I have a SaaS idea.", label: "SaaS idea" },
  { seed: "Just exploring — what do you charge?", label: "Pricing" },
];

const TOTAL_STEPS = 5;

function KaiIntake() {
  const [bubbles, setBubbles] = useState<Bubble[]>([
    {
      role: "kai",
      html: "Alright. I'm Kai — the third co-founder. Tell me what you're building in one line and I'll forward it to Deyar and Manuel with my notes. I move fast. <em>Start typing.</em>",
    },
  ]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [thinking, setThinking] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const send = async (txt: string) => {
    if (done || thinking) return;
    const escaped = escapeHtml(txt);
    const history: ChatMsg[] = [
      ...bubbles.map((b) => ({
        role: (b.role === "kai" ? "assistant" : "user") as "assistant" | "user",
        content: stripTags(b.html),
      })),
      { role: "user", content: txt },
    ];
    setBubbles((p) => [...p, { role: "user", html: escaped }]);
    const nextStep = Math.min(step + 1, TOTAL_STEPS);
    setStep(nextStep);
    setThinking(true);
    const reply = await askKai(history, "intake");
    setThinking(false);
    setBubbles((p) => [...p, { role: "kai", html: escapeHtml(reply) }]);
    if (nextStep >= TOTAL_STEPS) {
      setDone(true);
      setTimeout(() => {
        setBubbles((p) => [
          ...p,
          {
            role: "kai",
            html: `<em>routed.</em> deyar + manuel have it. expect a reply within 24h — usually faster. meanwhile, <a href="https://apps.wizarddynamics.com" style="color:var(--accent); text-decoration:underline;">see what we built</a>.`,
          },
        ]);
      }, 600);
    }
    setTimeout(() => {
      if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }, 0);
  };

  return (
    <div className="intake">
      <div className="intake-head">
        <span>{"/// kai.intake — i’ll route this to the founders"}</span>
        <span className="pill">live</span>
      </div>
      <div className="intake-body" ref={bodyRef}>
        {bubbles.map((b, i) => (
          <div className={"intake-bubble " + b.role} key={i}>
            <div className="who">{b.role === "kai" ? "kai ▸" : "you ▸"}</div>
            <div className="msg" dangerouslySetInnerHTML={{ __html: b.html }} />
          </div>
        ))}
        {thinking && (
          <div className="intake-bubble kai">
            <div className="who">kai ▸</div>
            <div className="msg"><span className="kai-cursor" /></div>
          </div>
        )}
      </div>
      <div className="intake-quick">
        {QUICK.map((q) => (
          <button key={q.seed} onClick={() => send(q.seed)}>{q.label}</button>
        ))}
      </div>
      <div className="intake-progress">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div className={"step" + (i < step ? " done" : "")} key={i} />
        ))}
      </div>
      <form
        className="intake-input"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          const v = input.trim();
          if (!v) return;
          setInput("");
          send(v);
        }}
      >
        <span className="prompt">you ▸</span>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="type a message…" autoComplete="off" />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function stripTags(s: string) {
  return s.replace(/<[^>]*>/g, "");
}

function ClassicForm() {
  const [chips, setChips] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<string>("");
  const labels = ["Build", "Grow", "Automate", "Partnership", "Something else"];
  return (
    <form
      className="contact-form"
      onSubmit={(e) => {
        e.preventDefault();
        setStatus("/// sending…");
        setTimeout(() => {
          setStatus("/// got it. Kai will route this within the hour.");
          (e.target as HTMLFormElement).reset();
          setChips({});
        }, 700);
      }}
    >
      <div className="field">
        <label>/ Your name</label>
        <input type="text" required placeholder="First last" name="name" />
      </div>
      <div className="field">
        <label>/ Email</label>
        <input type="email" required placeholder="you@company.com" name="email" />
      </div>
      <div className="field">
        <label>/ I&apos;m interested in</label>
        <div className="interest-chips">
          {labels.map((l) => (
            <div
              key={l}
              className={"chip" + (chips[l] ? " active" : "")}
              onClick={() => setChips((c) => ({ ...c, [l]: !c[l] }))}
            >
              {l}
            </div>
          ))}
        </div>
      </div>
      <div className="field">
        <label>/ Tell us what you&apos;re working on</label>
        <textarea required placeholder="One paragraph is plenty. We read fast." name="message" />
      </div>
      <div>
        <button type="submit" className="btn primary" data-hover="">
          Send it <span className="arrow">→</span>
        </button>
      </div>
      <div className="label" style={{ minHeight: 18 }}>{status}</div>
    </form>
  );
}

export default function Contact() {
  const [mode, setMode] = useState<"kai" | "form">("kai");
  return (
    <section className="contact" id="contact" data-screen-label="05 Contact">
      <div className="section-head">
        <span className="index">§05 / Contact</span>
        <span className="title">Direct line</span>
      </div>
      <h2 className="contact-head">
        Got something<br />
        <em>worth <span className="underline-swipe">building</span>?</em>
      </h2>

      <div className="intake-mode-toggle">
        <button className={mode === "kai" ? "on" : ""} onClick={() => setMode("kai")}>{"// Talk to Kai"}</button>
        <button className={mode === "form" ? "on" : ""} onClick={() => setMode("form")}>{"// Classic form"}</button>
      </div>

      <div className="contact-grid">
        <div>{mode === "kai" ? <KaiIntake /> : <ClassicForm />}</div>
        <aside className="contact-side">
          <div>
            <div className="contact-detail">
              <span className="label">/ Email</span>
              <a href="mailto:hello@wizarddynamics.com" data-hover="">hello@wizarddynamics.com</a>
            </div>
          </div>
          <div>
            <div className="contact-detail">
              <span className="label">/ Location</span>
              <em>Munich,</em> permanently shipping.
            </div>
          </div>
          <div>
            <div className="contact-detail">
              <span className="label">/ Reply time</span>
              <em>&lt;24h.</em> Usually much less.
            </div>
          </div>
          <p className="reply-promise">
            {"/// No discovery calls. No lengthy proposals. If the project fits, we’ll say so and send scope + price the same week."}
          </p>
        </aside>
      </div>
    </section>
  );
}
