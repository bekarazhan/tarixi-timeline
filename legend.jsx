/* TarixiTimeline — Legend (панель фильтров на тегах) */

const { useMemo } = React;

function Legend({ activeTags, onToggleTag, items, allTags }) {
  allTags = allTags || window.TAG_CATALOG;
  const counts = useMemo(() => {
    const c = {};
    items.forEach(it => it.tags.forEach(id => { c[id] = (c[id] || 0) + 1; }));
    return c;
  }, [items]);

  return (
    <aside className="legend">

      {/* facet-grouped tags */}
      {Object.values(window.FACETS).map(facet => {
        const facetTags = allTags.filter(t => t.facet === facet.id);
        const activeCount = facetTags.filter(t => activeTags.has(t.id)).length;
        return (
          <div key={facet.id} className="legend-facet">
            <div className="legend-section-title" style={{ display: 'flex', alignItems: 'center' }}>
              <span>{facet.name}</span>
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em' }}>
                {activeCount}/{facetTags.length}
              </span>
            </div>
            {facetTags.map(tag => {
              const on = activeTags.has(tag.id);
              return (
                <div
                  key={tag.id}
                  className="legend-item"
                  data-off={!on}
                  onClick={() => onToggleTag(tag.id)}
                  title={`${tag.name} — клик чтобы скрыть/показать`}
                >
                  <span className="legend-swatch point" style={{ background: tag.color, color: tag.color }}></span>
                  <span className="legend-label">{tag.name}</span>
                  <span className="legend-count">{counts[tag.id] || 0}</span>
                </div>
              );
            })}
          </div>
        );
      })}

      <div className="legend-foot">
        <div className="legend-foot-row">
          <span>Период исследования</span>
          <span>~45 000 лет</span>
        </div>
        <div className="legend-foot-row">
          <span>Объектов</span>
          <span>{items.length}</span>
        </div>
        <div className="legend-foot-row" style={{ color: 'var(--text-2)', fontStyle: 'italic', marginTop: 4 }}>
          <span>Тяни ←→ для года, ↑↓ для строк</span>
        </div>
      </div>
    </aside>
  );
}

window.Legend = Legend;
