export default function WhatWeDo() {
  const cells = [
    {
      num: "01 / Build",
      title: "Build.",
      desc: "iOS, Android, SaaS — whatever the opportunity demands. Concept to revenue in weeks, not quarters.",
      tags: ["Swift", "React", "Supabase", "Stripe"],
    },
    {
      num: "02 / Grow",
      title: "Grow.",
      desc: "Paid acquisition, organic, content, ASO. 15K followers and 1M+ views didn't happen by accident.",
      tags: ["Performance", "ASO", "Content", "Analytics"],
    },
    {
      num: "03 / Automate",
      title: "Automate.",
      desc: "We built an AI co-founder instead of hiring. That should tell you everything about how we think.",
      tags: ["Kai", "Ops", "Agents", "Scale"],
    },
  ];
  return (
    <section className="wwd" id="wwd" data-screen-label="02 What we do">
      <div className="section-head">
        <span className="index">§02 / Capabilities</span>
        <span className="title">What we actually do</span>
      </div>
      <h2 className="display" style={{ fontSize: "clamp(44px, 6vw, 96px)", margin: "30px 0 60px", maxWidth: "20ch" }}>
        Three things. <em>Done relentlessly.</em>
      </h2>
      <div className="wwd-grid">
        {cells.map((c) => (
          <div className="wwd-cell" data-hover="" key={c.num}>
            <div className="wwd-num">{c.num}</div>
            <div>
              <h3 className="wwd-title">{c.title}</h3>
              <p className="wwd-desc">{c.desc}</p>
              <div className="wwd-tags">
                {c.tags.map((t) => (
                  <span className="wwd-tag" key={t}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
