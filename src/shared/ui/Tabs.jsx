import { useId, useState } from 'react';

/** Accessible tabs. tabs: [{ id, label, content }]. Arrow keys move between tabs. */
export function Tabs({ tabs, initial }) {
  const base = useId();
  const [active, setActive] = useState(initial || tabs[0]?.id);
  const onKey = (e, i) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    const next = tabs[(i + dir + tabs.length) % tabs.length];
    setActive(next.id);
    document.getElementById(`${base}-tab-${next.id}`)?.focus();
  };
  const current = tabs.find((t) => t.id === active) || tabs[0];
  return (
    <div className="tabs">
      <div role="tablist" className="tablist">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            id={`${base}-tab-${t.id}`}
            role="tab"
            type="button"
            aria-selected={t.id === current.id}
            aria-controls={`${base}-panel-${t.id}`}
            tabIndex={t.id === current.id ? 0 : -1}
            className="tab"
            onClick={() => setActive(t.id)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${base}-panel-${current.id}`} aria-labelledby={`${base}-tab-${current.id}`} className="tabpanel">
        {current.content}
      </div>
    </div>
  );
}
