/* TarixiTimeline — Legend */

const { useMemo } = React;

const KIND_META = {
  person: { label: 'Личности',  color: '#cbd1e1' },
  event:  { label: 'События',   color: '#5fd49a' },
  period: { label: 'Периоды',   color: '#38bdf8' },
};

function Legend({ activeTags, onToggleTag, activeKinds, onToggleKind, items, allTags, onEpochJump }) {
  allTags = allTags || window.TAG_CATALOG;

  // Счётчик по тег-id
  const tagCounts = useMemo(() => {
    const c = {};
    items.forEach(it => it.tags.forEach(id => { c[id] = (c[id] || 0) + 1; }));
    return c;
  }, [items]);

  // Счётчик по kind
  const kindCounts = useMemo(() => ({
    person: items.filter(i => i.kind === 'person').length,
    event:  items.filter(i => i.kind === 'event').length,
    period: items.filter(i => i.kind === 'period').length,
  }), [items]);

  const domainTags = allTags.filter(t => t.facet === 'domain');
  const placeTags  = allTags.filter(t => t.facet === 'place');

  const activeDomainCount = domainTags.filter(t => activeTags.has(t.id)).length;
  const activePlaceCount  = placeTags.filter(t => activeTags.has(t.id)).length;

  return (
    <aside className="legend">

      {/* ── Тип объекта ──────────────────────────────── */}
      <div className="legend-facet">
        <div className="legend-section-title">Тип объекта</div>
        {['person', 'event', 'period'].map(k => {
          const m = KIND_META[k];
          const on = activeKinds.has(k);
          return (
            <div key={k} className="legend-item" data-off={!on} onClick={() => onToggleKind(k)}>
              <span className="legend-swatch point" style={{ background: m.color, color: m.color }}></span>
              <span className="legend-label">{m.label}</span>
              <span className="legend-count">{kindCounts[k]}</span>
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
      </div>

      {/* ── Быстрый переход по эпохам ─────────────────── */}
      {onEpochJump && (
        <div className="legend-facet">
          <div className="legend-section-title">Быстрый переход</div>
          {window.EPOCH_PRESETS.map(ep => (
            <div key={ep.id} className="legend-epoch" style={{ '--ec': ep.color }}
              onClick={() => onEpochJump(ep.start, ep.end)}
              title={`${ep.name}: ${ep.start} — ${ep.end}`}
            >
              <span className="legend-epoch-bar"></span>
              <span className="legend-epoch-name">{ep.name}</span>
              <span className="legend-epoch-yrs">{ep.start < 0 ? `${-ep.start} до н.э.` : ep.start}–{ep.end}</span>
            </div>
          ))}
        </div>
      )}

      <div className="legend-foot">
        <div className="legend-foot-row">
          <span>Объектов в базе</span>
          <span>{items.length}</span>
        </div>
        <div className="legend-foot-row" style={{ color: 'var(--text-2)', fontStyle: 'italic', marginTop: 4 }}>
          <span>Тяни ←→ · ⌘+scroll для зума</span>
        </div>
      </div>
    </aside>
  );
}

window.Legend = Legend;
