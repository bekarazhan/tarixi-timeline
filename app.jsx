/* TarixiTimeline — App (точка входа) */

const { useState, useEffect, useMemo, useCallback, useRef } = React;

// Палитра для пользовательских тегов
const CUSTOM_COLORS = [
  '#ff6b6b','#ffa94d','#ffd43b','#69db7c',
  '#4dabf7','#da77f2','#f783ac','#63e6be',
];

// Все фасеты открытые — пользователь может добавлять теги в любой

// ── Создание нового тега прямо в форме ─────────────────────────
function InlineTagCreator({ facetId, onAdd }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(CUSTOM_COLORS[0]);
  const inputRef = useRef();

  const reset = () => { setOpen(false); setName(''); setColor(CUSTOM_COLORS[0]); };

  const commit = () => {
    if (!name.trim()) return;
    onAdd({ id: 'custom-' + Date.now(), name: name.trim(), facet: facetId, color, system: false });
    reset();
  };

  if (!open) return (
    <button className="cm-tag cm-tag-new" onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 0); }}>
      + свой
    </button>
  );

  return (
    <div className="cm-tag-creator">
      <input
        ref={inputRef}
        className="cm-input cm-input-sm"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Название тега"
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') reset(); }}
      />
      <div className="cm-colors">
        {CUSTOM_COLORS.map(c => (
          <button key={c} className={`cm-color ${color === c ? 'on' : ''}`}
            style={{ background: c }} onClick={() => setColor(c)} />
        ))}
      </div>
      <div className="cm-tag-creator-foot">
        <button className="cm-tag-creator-cancel" onClick={reset}>отмена</button>
        <button className="cm-btn primary cm-btn-sm" disabled={!name.trim()} onClick={commit}>Создать</button>
      </div>
    </div>
  );
}

// ── Форма создания объекта ──────────────────────────────────────
function CreateModal({ onClose, onSave, allTags, onAddTag }) {
  const [kind, setKind]   = useState('event');
  const [name, setName]   = useState('');
  const [start, setStart] = useState('');
  const [end,   setEnd]   = useState('');
  const [selTags, setSelTags] = useState(['world', 'event']);
  const [desc, setDesc]   = useState('');

  const toggleTag = (id) => setSelTags(prev =>
    prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
  );

  // Создать новый тег и сразу выбрать его
  const handleNewTag = (tag) => {
    onAddTag(tag);
    setSelTags(prev => [...prev, tag.id]);
  };

  const valid = name.trim() && start && selTags.some(id => ['kz','world','asia'].includes(id));

  const handleSave = () => {
    if (!valid) return;
    const s = parseInt(start);
    const e = kind === 'event' ? s : parseInt(end || start);
    onSave({
      id: 'user-' + Date.now(),
      kind,
      name: name.trim(),
      tags: selTags,
      start: s, end: e,
      lifeSpan: kind === 'person' ? `${start} — ${end || start}` : undefined,
      desc: desc.trim(),
    });
    onClose();
  };

  const byFacet = ['role', 'type', 'place', 'theme'].map(fid => ({
    facet: window.FACETS[fid],
    tags:  allTags.filter(t => t.facet === fid),
  }));

  return (
    <div className="cm-overlay" onClick={onClose}>
      <div className="cm" onClick={e => e.stopPropagation()}>
        <div className="cm-head">
          <span>Новый объект</span>
          <button className="cm-close" onClick={onClose}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="cm-body">
          <div className="cm-field">
            <label className="cm-label">Тип объекта</label>
            <div className="cm-seg">
              {[['event','Событие'],['person','Личность'],['period','Период']].map(([v,l]) => (
                <button key={v} className={kind===v ? 'active' : ''} onClick={() => setKind(v)}>{l}</button>
              ))}
            </div>
          </div>

          <div className="cm-field">
            <label className="cm-label">Название</label>
            <input className="cm-input" value={name} onChange={e => setName(e.target.value)} placeholder="Например: Битва при Шайхи"/>
          </div>

          <div className="cm-row">
            <div className="cm-field">
              <label className="cm-label">{kind==='person' ? 'Год рождения' : 'Начало'}</label>
              <input className="cm-input" type="number" value={start} onChange={e => setStart(e.target.value)} placeholder="-500"/>
            </div>
            {kind !== 'event' && (
              <div className="cm-field">
                <label className="cm-label">{kind==='person' ? 'Год смерти' : 'Конец'}</label>
                <input className="cm-input" type="number" value={end} onChange={e => setEnd(e.target.value)} placeholder="500"/>
              </div>
            )}
          </div>

          <div className="cm-field">
            <label className="cm-label">
              Теги <span className="cm-hint">— нужен хотя бы один тег места</span>
            </label>
            <div className="cm-tags-grid">
              {byFacet.map(({ facet, tags }) => (
                <div key={facet.id} className="cm-tag-facet">
                  <div className="cm-tag-facet-name">{facet.name}</div>
                  <div className="cm-tag-list">
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        className={`cm-tag ${selTags.includes(tag.id) ? 'on' : ''}`}
                        style={{ '--tc': tag.color }}
                        onClick={() => toggleTag(tag.id)}
                      >{tag.name}</button>
                    ))}
                    <InlineTagCreator facetId={facet.id} onAdd={handleNewTag} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cm-field">
            <label className="cm-label">Описание <span className="cm-hint">— необязательно</span></label>
            <textarea className="cm-textarea" value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Краткое описание события…"/>
          </div>
        </div>

        <div className="cm-foot">
          <button className="cm-btn ghost" onClick={onClose}>Отмена</button>
          <button className="cm-btn primary" onClick={handleSave} disabled={!valid}>Добавить</button>
        </div>
      </div>
    </div>
  );
}

function HeaderSearch({ items, onSelect }) {
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const Q = q.toLowerCase();
    return items
      .filter(it => {
        const lbl = (window.itemLabel(it) || '').toLowerCase();
        return lbl.includes(Q);
      })
      .slice(0, 8);
  }, [q, items]);

  return (
    <div className="header-search" onBlur={() => setTimeout(() => setFocused(false), 150)} onFocus={() => setFocused(true)}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
      <input
        type="text"
        placeholder="Найти личность, событие, эпоху…"
        value={q}
        onChange={e => setQ(e.target.value)}
      />
      {focused && results.length > 0 && (
        <div className="header-search-results">
          {results.map(r => {
            const pt = window.primaryTagOf(r);
            const [s, e] = window.itemRange(r);
            return (
              <div key={r.id} className="header-search-result"
                onMouseDown={() => { onSelect(r); setQ(''); setFocused(false); }}
              >
                <span className="dot" style={{ background: pt?.color || 'var(--text-2)' }}></span>
                <div>
                  <div>{window.itemLabel(r)}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-3)' }}>
                    {pt?.name || ''} · {window.itemRegion(r) === 'kz' ? 'KZ' : 'World'}
                  </div>
                </div>
                <span className="yr">{window.formatYearShort(s)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// маленький превью-чип для radio с маленькими цветными точками
function VibeChip({ name, dots }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ display: 'inline-flex', gap: 2 }}>
        {dots.map((d, i) => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: '50%', background: d,
          }}></span>
        ))}
      </span>
      {name}
    </span>
  );
}

function App() {
  const [t, setTweak] = window.useTweaks(window.TWEAK_DEFAULTS || TWEAK_DEFAULTS);
  const [selected, setSelected] = useState(null);
  const [activeTags, setActiveTags] = useState(() =>
    new Set(window.TAG_CATALOG.map(t => t.id))
  );
  const [view, setViewState] = useState({ start: -500, end: 2030 });
  const [legendHidden, setLegendHidden] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [items, setItems] = useState(() => window.ALL_ITEMS);
  const [customTags, setCustomTags] = useState([]);

  const allTags = useMemo(() => [...window.TAG_CATALOG, ...customTags], [customTags]);

  const showWorld = allTags
    .filter(t => t.facet === 'place' && t.id !== 'kz')
    .some(t => activeTags.has(t.id));

  const setView = useCallback((start, end) => {
    setViewState({ start, end });
  }, []);

  const handleCreate = useCallback((item) => {
    setItems(prev => [...prev, item]);
  }, []);

  const handleAddTag = useCallback((tag) => {
    window.TAG_MAP[tag.id] = tag;
    window.TAG_CATALOG.push(tag); // чтобы isItemVisible учитывал кастомные теги
    setCustomTags(prev => [...prev, tag]);
    setActiveTags(prev => new Set([...prev, tag.id]));
  }, []);

  // apply vibe + density on body
  useEffect(() => {
    document.body.dataset.vibe = t.vibe || 'data';
    document.body.dataset.density = t.density;
  }, [t.vibe, t.density]);

  const handleSelect = useCallback((item) => {
    setSelected(item);
    const [s, e] = window.itemRange(item);
    const mid = (s + e) / 2;
    const span = view.end - view.start;
    if (mid < view.start || mid > view.end) {
      const ns = Math.max(-42000, mid - span / 2);
      const ne = Math.min(2030, mid + span / 2);
      setView(ns, ne);
    }
  }, [view, setView]);

  const handleSelectAndZoom = useCallback((item) => {
    if (item.kind === 'period') {
      const pad = (item.end - item.start) * 0.15;
      setView(item.start - pad, item.end + pad);
    }
    setSelected(item);
  }, [setView]);

  const handleToggleTag = (tagId) => {
    setActiveTags(prev => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId); else next.add(tagId);
      return next;
    });
  };

  const rowHeight = t.density === 'compact' ? 18 : t.density === 'spacious' ? 32 : 22;

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="brand-mark"></div>
          <div className="brand-name">TarixiTimeline <span>· навигатор истории</span></div>
        </div>

        <div className="header-spacer"></div>

        <HeaderSearch items={items} onSelect={handleSelect} />

        <button className="btn-create" onClick={() => setCreateOpen(true)}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Добавить
        </button>
      </header>

      {createOpen && (
        <CreateModal
          onClose={() => setCreateOpen(false)}
          onSave={handleCreate}
          allTags={allTags}
          onAddTag={handleAddTag}
        />
      )}

      <div className="main" data-legend-hidden={legendHidden}>
        {!legendHidden && (
          <window.Legend
            activeTags={activeTags}
            onToggleTag={handleToggleTag}
            items={items}
            allTags={allTags}
          />
        )}

        <div className="tl-container">
          <window.Timeline
            items={items}
            activeTags={activeTags}
            showWorld={showWorld}
            selected={selected}
            onSelect={handleSelectAndZoom}
            density={t.density}
            scaleMode={t.timeMode || 'real'}
            colorLogic={t.colorLogic || 'category'}
            viewStart={view.start}
            viewEnd={view.end}
            setView={setView}
            rowHeight={rowHeight}
            showConnections={t.showConnections}
          />
          {t.showMinimap && (
            <window.Minimap
              items={items}
              viewStart={view.start}
              viewEnd={view.end}
              setView={setView}
              showWorld={showWorld}
            />
          )}
        </div>

        <window.DetailPanel
          item={selected}
          onClose={() => setSelected(null)}
          onSelect={handleSelect}
          allItems={items}
        />
      </div>

      <window.TweaksPanel>
        <window.TweakSection label="Vibe — настроение интерфейса" />
        <window.TweakRadio
          label="Визуальный язык"
          value={t.vibe || 'data'}
          options={[
            { value: 'data',          label: 'Data' },
            { value: 'archive',       label: 'Archive' },
            { value: 'constellation', label: 'Cosmos' },
          ]}
          onChange={(v) => setTweak('vibe', v)}
        />

        <window.TweakSection label="Цветовая логика — что кодируют цвета" />
        <window.TweakRadio
          label="Раскраска"
          value={t.colorLogic || 'primary'}
          options={[
            { value: 'primary', label: 'Тег' },
            { value: 'role',    label: 'Роль' },
            { value: 'place',   label: 'Место' },
            { value: 'mono',    label: 'Моно' },
          ]}
          onChange={(v) => setTweak('colorLogic', v)}
        />

        <window.TweakSection label="Подача времени — как растягивается шкала" />
        <window.TweakRadio
          label="Шкала"
          value={t.timeMode || 'real'}
          options={[
            { value: 'real',   label: 'Лента' },
            { value: 'equal',  label: 'Эпохи' },
            { value: 'recent', label: 'Сейчас' },
          ]}
          onChange={(v) => setTweak('timeMode', v)}
        />

        <window.TweakSection label="Слои и компоновка" />
        <window.TweakRadio
          label="Плотность"
          value={t.density}
          options={['compact', 'normal', 'spacious']}
          onChange={(v) => setTweak('density', v)}
        />
        <window.TweakToggle
          label="Мини-карта"
          value={t.showMinimap}
          onChange={(v) => setTweak('showMinimap', v)}
        />

        <window.TweakSection label="Быстрая навигация по эпохам" />
        {window.EPOCH_PRESETS.map(ep => (
          <window.TweakButton
            key={ep.id}
            label={ep.name}
            onClick={() => setView(ep.start, ep.end)}
          />
        ))}
      </window.TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
