import { useEffect, useState } from 'react';

// Fixed instrument-style HUD across the top: identity readout + live IST clock +
// availability status. The clock is client-only (renders a static placeholder in
// SSR/no-JS). Pure chrome — all real content lives below and is independent of it.
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
    <header className="statusbar" aria-hidden="true">
      <span className="sb-id">HITARTH&nbsp;DESAI</span>
      <span className="sb-mid">AI&nbsp;SYSTEMS&nbsp;ENGINEER</span>
      <span className="sb-right">
        <span className="sb-clock">{clock} IST</span>
        <span className="sb-status">
          <span className="sb-dot" /> OPEN TO ROLES
        </span>
      </span>
    </header>
  );
}
