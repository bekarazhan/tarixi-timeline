/* TarixiTimeline — Detail panel */

function DetailPanel({ item, onClose, onSelect, onEdit, allItems }) {
  // храним последний показанный item — чтобы при закрытии анимация ушла плавно
  const [shown, setShown] = React.useState(item);
  React.useEffect(() => {
    if (item) setShown(item);
  }, [item]);
  const cur = item || shown;
  const open = !!item;

  if (!cur) {
    return (
      <aside className="detail" data-open="false" aria-hidden="true"></aside>
    );
  }

  const primaryTag = window.primaryTagOf(cur);
  const color = primaryTag?.color || 'var(--text-2)';

  const isSubject = cur.kind === 'subject';
  const isEra = cur.kind === 'era';

  const title = cur.name;
  const yrs = (() => {
    const [s, e] = window.itemRange(cur);
    if (isSubject && cur.lifeSpan) return cur.lifeSpan;
    if (s === e) return window.formatYear(s);
    return `${window.formatYearShort(s)} — ${window.formatYearShort(e)}`;
  })();

  const contemps = window.findContemporaries(cur, allItems, 10);
  const region = window.itemRegion(cur) === 'kz' ? 'Казахстан' : 'Мир';

  const [s, e] = window.itemRange(cur);
  const facts = isSubject
    ? allItems
        .filter(o => o.kind === 'event' && o.start >= cur.start && o.start <= cur.end)
        .filter(o => window.itemRegion(o) === window.itemRegion(cur) || o.tags.includes('event'))
        .slice(0, 4)
    : [];

  return (
    <aside className="detail" data-open={open} aria-hidden={!open}>
      <button className="detail-close" onClick={onClose} aria-label="Закрыть">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      </button>

      <div className="detail-hero" style={{ '--c': color }}>
        <div className="detail-cat">
          <span className="dot"></span>
          {primaryTag?.name || '—'} · {region}
        </div>
        <h2 className="detail-title">{title}</h2>
        <div className="detail-meta">
          <div><span style={{ color: 'var(--text-3)' }}>{isSubject ? 'Годы жизни' : isEra ? 'Период' : 'Год'}</span>{' '}<span className="val">{yrs}</span></div>
          {isEra && (
            <div><span style={{ color: 'var(--text-3)' }}>Длительность</span>{' '}<span className="val">{Math.abs(e - s)} лет</span></div>
          )}
        </div>
      </div>

      <div className="detail-body" style={{ '--c': color }}>
        <section>
          <div className="detail-section-title">Описание</div>
          <p className="detail-desc">{cur.desc}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            {onEdit && (
              <button className="detail-cta" style={{ background: color }} onClick={() => onEdit(cur)}>
                Редактировать
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M8.5 1.5l2 2-6 6H2.5v-2l6-6z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
        </section>

        {facts.length > 0 && (
          <section>
            <div className="detail-section-title">При его жизни</div>
            <div className="detail-facts">
              {facts.map(f => (
                <div className="detail-fact" key={f.id} onClick={() => onSelect(f)} style={{ cursor: 'pointer' }}>
                  <div className="detail-fact-yr">{window.formatYearShort(f.start)}</div>
                  <div>{f.name}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="detail-section-title">Современники</div>
          {contemps.length === 0 && (
            <div className="detail-empty">Никто не пересекается по годам в нашем датасете</div>
          )}
          <div className="detail-contemps">
            {contemps.map(c => {
              const pt = window.primaryTagOf(c);
              return (
                <div key={c.id} className="detail-contemp" onClick={() => onSelect(c)}>
                  <div className="detail-contemp-swatch" style={{ background: pt?.color || 'var(--text-2)' }}></div>
                  <div className="detail-contemp-body">
                    <div className="detail-contemp-name">{c.name}</div>
                    <div className="detail-contemp-meta">
                      {window.itemRegion(c) === 'kz' ? 'Казахстан' : 'Мир'} · {pt?.name || ''}
                    </div>
                  </div>
                  <div className="detail-contemp-yr">{c.lifeSpan || ''}</div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </aside>
  );
}

window.DetailPanel = DetailPanel;
