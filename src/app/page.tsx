import BootSequence from "./components/BootSequence";
import Nav from "./components/Nav";
import CustomCursor from "./components/CustomCursor";
import GridBackdrop from "./components/GridBackdrop";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import Manifesto from "./components/Manifesto";
import WhatWeDo from "./components/WhatWeDo";
import Stats from "./components/Stats";
import Team from "./components/Team";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Tweaks from "./components/Tweaks";

export default function Page() {
  return (
    <>
      <BootSequence />
      <GridBackdrop />
      <CustomCursor />
      <Nav />

      <main className="shell">
        <Hero />
      </main>

      <Marquee />

      <Manifesto
        index="01 of 03"
        lines={[
          <>We don&apos;t do <em>discovery calls.</em></>,
          <><span className="strike">proposals</span>. <span className="strike">retainers</span>. <span className="strike">kickoffs</span>.</>,
        ]}
        sub="/// You pitch us in one email. We reply yes or no the same day. If yes, scope + price by Friday. If no, honest reasons. That's it."
        label="M1 Manifesto"
      />

      <main className="shell">
        <WhatWeDo />
        <Stats />
      </main>

      <Manifesto
        index="02 of 03"
        lines={[<>Ship in <em>weeks.</em></>, <>Or <em>refund</em> you.</>]}
        sub="/// 3 weeks from signed to shipped, or your money back. We mean it. We've never had to refund."
        label="M2 Manifesto"
      />

      <main className="shell">
        <Team />
      </main>

      <Manifesto
        index="03 of 03"
        lines={[
          <>Two founders.</>,
          <>One <em>AI.</em></>,
          <>Zero <span className="strike">meetings</span>.</>,
        ]}
        sub="/// Kai runs ops, analytics, automation — and occasionally this website. Try him. He talks back."
        label="M3 Manifesto"
      />

      <main className="shell">
        <Contact />
      </main>

      <div className="shell">
        <Footer />
      </div>

      <Tweaks />
    </>
  );
}
