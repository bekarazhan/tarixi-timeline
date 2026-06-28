/* TarixiTimeline — Legend */

const { useMemo, useState, useRef } = React;

const KIND_META = {
  subject: { label: 'Участники', color: '#a0aec0' },
  event:   { label: 'События',   color: '#5fd49a' },
  era:     { label: 'Периоды',   color: '#94a3b8' },
};

const PALETTE = [
  '#ef5a6a','#f7903a','#fbbf24','#5fd49a',
  '#38bdf8','#818cf8','#da77f2','#63e6be',
];

// ── Инлайн-создание тега (Google Calendar style) ──────────────
function LegendTagCreator({ facetId, onAdd }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PALETTE[0]);
  const inputRef = useRef();

  const reset = () => { setOpen(false); setName(''); setColor(PALETTE[0]); };
  const commit = () => {
    if (!name.trim()) return;
    onAdd({ id: 'custom-' + Date.now(), name: name.trim(), facet: facetId, color, system: false });
    reset();
  };

  if (!open) return (
    <button className="legend-tag-add" onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 0); }}>
      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
        <path d="M4.5 1v7M1 4.5h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      {window.t('addTag')}
    </button>
  );

  return (
    <div className="legend-tag-creator">
      <input ref={inputRef} className="legend-tag-input" value={name}
        onChange={e => setName(e.target.value)} placeholder={window.t('tagNamePlaceholder')}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') reset(); }}
      />
      <div className="legend-tag-palette">
        {PALETTE.map(c => (
          <button key={c} className={`legend-tag-color ${color === c ? 'on' : ''}`}
            style={{ background: c }} onClick={() => setColor(c)} />
        ))}
      </div>
      <div className="legend-tag-creator-foot">
        <button className="legend-tag-cancel" onClick={reset}>{window.t('cancel')}</button>
        <button className="legend-tag-ok" disabled={!name.trim()} onClick={commit}>{window.t('create')}</button>
      </div>
    </div>
  );
}

// ── Главный компонент ─────────────────────────────────────────
function Legend({
  activeTags, onToggleTag,
  activeKinds, onToggleKind,
  items, allTags, onAddTag,
}) {
  allTags = allTags || window.TAG_CATALOG;

  const tagCounts = useMemo(() => {
    const c = {};
    items.forEach(it => it.tags.forEach(id => { c[id] = (c[id] || 0) + 1; }));
    return c;
  }, [items]);

  const kindCounts = useMemo(() => ({
    subject: items.filter(i => i.kind === 'subject').length,
    event:   items.filter(i => i.kind === 'event').length,
    era:     items.filter(i => i.kind === 'era').length,
  }), [items]);

  const domainTags = allTags.filter(t => t.facet === 'domain');

  return (
    <aside className="legend">

      {/* ── Тип объекта ──────────────────────────────── */}
      <div className="legend-facet">
        <div className="legend-section-title">{window.t('objectType')}</div>
        {['subject', 'event', 'era'].map(k => {
          const m = KIND_META[k];
          const on = activeKinds.has(k);
          return (
            <div key={k} className="legend-item" data-off={!on} onClick={() => onToggleKind(k)}>
              <span className={`legend-swatch kind-${k}`} style={{ '--c': m.color }}></span>
              <span className="legend-label">{window.t('kind.' + k)}</span>
              <span className="legend-count">{kindCounts[k]}</span>
            </div>
          );
        })}
      </div>

      {/* ── Теги ─────────────────────────── */}
      <div className="legend-facet">
        <div className="legend-section-title">{window.t('tags')}</div>
        {domainTags.map(tag => {
          const on = activeTags.has(tag.id);
          return (
            <div key={tag.id} className="legend-item" data-off={!on} onClick={() => onToggleTag(tag.id)}>
              <span className="legend-swatch period" style={{ background: tag.color }}></span>
              <span className="legend-label">{tag.name}</span>
              <span className="legend-count">{tagCounts[tag.id] || 0}</span>
            </div>
          );
        })}
        {onAddTag && <LegendTagCreator facetId="domain" onAdd={onAddTag} />}
      </div>

      <div className="legend-foot">
        <div className="legend-foot-row">
          <span>{window.t('objectsInBase')}</span>
          <span>{items.length}</span>
        </div>
      </div>
    </aside>
  );
}

window.Legend = Legend;
