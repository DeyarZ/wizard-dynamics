export default function Marquee() {
  const items = [
    "100+ apps", "$210K ARR", "1M views", "15K followers",
    "Zero meetings", "Munich", "100+ apps", "$210K ARR",
    "1M views", "15K followers",
  ];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {items.map((t, i) => (
          <span key={i}>
            <span>{t}</span>
            <span className="sep italic">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
