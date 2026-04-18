export default function Nav() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <a href="#" className="logo" data-hover="">
          <span className="logo-mark">w</span>
          <span>Wizard Dynamics</span>
        </a>
        <div className="nav-links">
          <a href="#wwd" data-hover="">Work</a>
          <a href="#team" data-hover="">Team</a>
          <a href="https://apps.wizarddynamics.com" data-hover="">Apps ↗</a>
          <a href="#contact" className="nav-cta" data-hover="">Get in touch</a>
        </div>
      </div>
    </nav>
  );
}
