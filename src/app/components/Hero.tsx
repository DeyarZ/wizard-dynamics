"use client";
import { useEffect, useState } from "react";

const SWAP1 = ["apps", "SaaS", "content", "brands", "growth", "ideas"];
const SWAP2 = ["obsessively", "ruthlessly", "daily", "silently", "fearlessly"];

function useCycle(words: string[], interval: number) {
  const [i, setI] = useState(0);
  const [active, setActive] = useState(true);
  useEffect(() => {
    const id = setInterval(() => {
      setActive(false);
      setTimeout(() => {
        setI((prev) => (prev + 1) % words.length);
        setActive(true);
      }, 260);
    }, interval);
    return () => clearInterval(id);
  }, [words, interval]);
  return { word: words[i], active };
}

function useClock() {
  const [v, setV] = useState("--:--:-- CET");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setV(d.toLocaleTimeString("en-GB", { timeZone: "Europe/Berlin", hour12: false }) + " CET");
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return v;
}

export default function Hero() {
  const a = useCycle(SWAP1, 2600);
  const b = useCycle(SWAP2, 3200);
  const clock = useClock();

  return (
    <section className="hero" id="hero" data-screen-label="01 Hero">
      <div>
        <div className="hero-top">
          <div className="hero-kicker">
            {"/// Munich-based product studio."}<br />
            We build, we ship, we optimize — and the numbers do the talking.
          </div>
          <div className="hero-meta">
            <div><span className="live">Kai online</span></div>
            <div style={{ marginTop: 4 }}><span>{clock}</span></div>
          </div>
        </div>

        <h1 className="hero-headline display breathe">
          <span className="line">
            We ship{" "}
            <span className={"swap" + (a.active ? " active" : "")} data-hover="">
              {a.word}
            </span>.
          </span>
          <span className="line">
            Optimize{" "}
            <span className={"swap" + (b.active ? " active" : "")} data-hover="">
              {b.word}
            </span>.
          </span>
          <span className="line italic">Let numbers talk.</span>
        </h1>
      </div>

      <div className="hero-bottom">
        <p className="statement">
          Apps. SaaS. Content. <em>Whatever needs building.</em> Two founders, one AI, zero meetings — shipping faster than studios five times our size.
        </p>
        <div className="hero-cta-group">
          <a href="https://apps.wizarddynamics.com" className="btn primary" data-hover="">
            See what we built <span className="arrow">→</span>
          </a>
          <a href="#contact" className="btn" data-hover="">Work with us</a>
        </div>
      </div>
    </section>
  );
}
