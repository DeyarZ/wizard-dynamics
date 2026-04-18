import type { ReactNode } from "react";

type Props = {
  index: string;
  lines: ReactNode[];
  sub: string;
  label: string;
};

export default function Manifesto({ index, lines, sub, label }: Props) {
  return (
    <section className="manifesto" data-screen-label={label}>
      <div className="manifesto-inner">
        <div className="manifesto-index">{"/// Manifesto · "}{index}</div>
        {lines.map((ln, i) => (
          <div className="manifesto-line" key={i}>{ln}</div>
        ))}
        <div className="manifesto-sub">{sub}</div>
      </div>
    </section>
  );
}
