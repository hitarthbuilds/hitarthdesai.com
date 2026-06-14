import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Fixed instrument-style HUD across the top. Now also the site's primary nav
// (identity → home, Writing → blog). Live IST clock is client-only (renders a
// static placeholder in SSR/no-JS).
export function StatusBar() {
  const [clock, setClock] = useState('—— ——');

  useEffect(() => {
    const fmt = () =>
      new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Kolkata',
      }).format(new Date());
    setClock(fmt());
    const id = setInterval(() => setClock(fmt()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="statusbar">
      <Link to="/" className="sb-id">HITARTH DESAI</Link>
      <span className="sb-mid">AI SYSTEMS ENGINEER</span>
      <span className="sb-right">
        <Link to="/blog" className="sb-link">WRITING</Link>
        <span className="sb-clock">{clock} IST</span>
        <span className="sb-status">
          <span className="sb-dot" /> OPEN TO ROLES
        </span>
      </span>
    </header>
  );
}
