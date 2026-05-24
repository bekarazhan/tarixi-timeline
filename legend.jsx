/* TarixiTimeline — Legend */

const { useMemo, useState, useRef } = React;

const KIND_META = {
  subject: { label: 'Субъекты', color: '#cbd1e1' },
  event:   { label: 'События',  color: '#5fd49a' },
  era:     { label: 'Эпохи',    color: '#38bdf8' },
};

const PALETTE = [
  '#ef5a6a','#f7903a','#fbbf24','#5fd49a',
  '#38bdf8','#818cf8','#da77f2','#63e6be',
];

// ── Инлайн-создание тега (стиль Google Calendar) ──────────────
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
      тег
    </button>
  );

  return (
    <div className="legend-tag-creator">
      <input
        ref={inputRef}
        className="legend-tag-input"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Название"
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') reset(); }}
      />
      <div className="legend-tag-palette">
        {PALETTE.map(c => (
          <button
            key={c}
            className={`legend-tag-color ${color === c ? 'on' : ''}`}
            style={{ background: c }}
            onClick={() => setColor(c)}
          />
        ))}
      </div>
      <div className="legend-tag-creator-foot">
        <button className="legend-tag-cancel" onClick={reset}>Отмена</button>
        <button className="legend-tag-ok" disabled={!name.trim()} onClick={commit}>Создать</button>
      </div>
    </div>
  );
}

// ── Главный компонент ─────────────────────────────────────────
function Legend({ activeTags, onToggleTag, activeKinds, onToggleKind, items, allTags, onAddTag }) {
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

  // Счётчик по subkind (для субъектов)
  const subkindCounts = useMemo(() => {
    const c = {};
    items.filter(i => i.kind === 'subject').forEach(i => {
      const sk = i.subkind || 'person';
      c[sk] = (c[sk] || 0) + 1;
    });
    return c;
  }, [items]);

  const domainTags = allTags.filter(t => t.facet === 'domain');
  const placeTags  = allTags.filter(t => t.facet === 'place');

  const activeDomainCount = domainTags.filter(t => activeTags.has(t.id)).length;
  const activePlaceCount  = placeTags.filter(t => activeTags.has(t.id)).length;

  return (
    <aside className="legend">

      {/* ── Тип объекта ──────────────────────────────── */}
      <div className="legend-facet">
        <div className="legend-section-title">Тип объекта</div>
        {['subject', 'event', 'era'].map(k => {
          const m = KIND_META[k];
          const on = activeKinds.has(k);
          return (
            <div key={k}>
              <div className="legend-item" data-off={!on} onClick={() => onToggleKind(k)}>
                <span className="legend-swatch point" style={{ background: m.color, color: m.color }}></span>
                <span className="legend-label">{m.label}</span>
                <span className="legend-count">{kindCounts[k]}</span>
              </div>
              {/* Субкинды — только для субъектов, только когда включены */}
              {k === 'subject' && on && Object.keys(subkindCounts).map(sk => {
                const meta = (window.SUBKIND_META || {})[sk];
                return (
                  <div key={sk} className="legend-subkind">
                    <span className="legend-subkind-icon">{meta?.icon || '·'}</span>
                    <span className="legend-subkind-label">{meta?.label || sk}</span>
                    <span className="legend-count">{subkindCounts[sk]}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* ── Область ──────────────────────────────────── */}
      <div className="legend-facet">
        <div className="legend-section-title" style={{ display: 'flex', alignItems: 'center' }}>
          <span>Область</span>
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em' }}>
            {activeDomainCount}/{domainTags.length}
          </span>
        </div>
        {domainTags.map(tag => {
          const on = activeTags.has(tag.id);
          return (
            <div key={tag.id} className="legend-item" data-off={!on}
              onClick={() => onToggleTag(tag.id)}
              title={`${tag.name} — клик чтобы скрыть/показать`}
            >
              <span className="legend-swatch point" style={{ background: tag.color, color: tag.color }}></span>
              <span className="legend-label">{tag.name}</span>
              <span className="legend-count">{tagCounts[tag.id] || 0}</span>
            </div>
          );
        })}
        {onAddTag && <LegendTagCreator facetId="domain" onAdd={onAddTag} />}
      </div>

      {/* ── Место ────────────────────────────────────── */}
      <div className="legend-facet">
        <div className="legend-section-title" style={{ display: 'flex', alignItems: 'center' }}>
          <span>Место</span>
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em' }}>
            {activePlaceCount}/{placeTags.length}
          </span>
        </div>
        {placeTags.map(tag => {
          const on = activeTags.has(tag.id);
          return (
            <div key={tag.id} className="legend-item" data-off={!on}
              onClick={() => onToggleTag(tag.id)}
              title={`${tag.name} — клик чтобы скрыть/показать`}
            >
              <span className="legend-swatch point" style={{ background: tag.color, color: tag.color }}></span>
              <span className="legend-label">{tag.name}</span>
              <span className="legend-count">{tagCounts[tag.id] || 0}</span>
            </div>
          );
        })}
        {onAddTag && <LegendTagCreator facetId="place" onAdd={onAddTag} />}
      </div>

      <div className="legend-foot">
        <div className="legend-foot-row">
          <span>Объектов в базе</span>
          <span>{items.length}</span>
        </div>
      </div>
    </aside>
  );
}

window.Legend = Legend;
