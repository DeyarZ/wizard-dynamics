export default function Footer() {
  return (
    <footer className="footer">
      <div>
        <div className="colo">wizard dynamics<em>.</em></div>
        <div style={{ marginTop: 8, opacity: 0.7 }}>© 2026 · Munich · Shipping since day one</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div><a href="https://apps.wizarddynamics.com" data-hover="">apps ↗</a></div>
        <div style={{ marginTop: 6 }}><a href="#" data-hover="">app store ↗</a></div>
        <div style={{ marginTop: 6, opacity: 0.5 }}>made by humans + kai</div>
      </div>
    </footer>
  );
}
