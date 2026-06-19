/* TarixiTimeline — App (точка входа) */

const { useState, useEffect, useMemo, useCallback, useRef } = React;

// Палитра для пользовательских тегов
const CUSTOM_COLORS = [
  '#ff6b6b','#ffa94d','#ffd43b','#69db7c',
  '#4dabf7','#da77f2','#f783ac','#63e6be',
];

// ── #-инпут с автокомплитом для тегов ──────────────────────────
function TagInput({ selected, onChange, onAdd, allTags }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef();

  const suggestions = (allTags || []).filter(t => {
    if (!q) return true;
    return t.name.toLowerCase().includes(q.toLowerCase()) || t.id.includes(q.toLowerCase());
  }).slice(0, 8);

  const canCreate = q.trim() && !suggestions.some(t => t.name.toLowerCase() === q.trim().toLowerCase());

  const toggle = (id) => {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
    setQ('');
    inputRef.current?.focus();
  };

  const create = (name) => {
    const tag = { id: 'custom-' + Date.now(), name: name.trim(), facet: 'domain', color: '#818cf8' };
    onAdd(tag);
    onChange([...selected, tag.id]);
    setQ('');
    inputRef.current?.focus();
  };

  const onKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) toggle(suggestions[0].id);
      else if (canCreate) create(q.trim());
    }
    if (e.key === 'Backspace' && !q && selected.length > 0) onChange(selected.slice(0, -1));
    if (e.key === 'Escape') { setOpen(false); setQ(''); }
  };

  return (
    <div className="tag-input">
      <div className="tag-input-row" onClick={() => inputRef.current?.focus()}>
        {selected.map((id, idx) => {
          const tag = (allTags || []).find(t => t.id === id) || window.TAG_MAP?.[id];
          if (!tag) return null;
          return (
            <span key={id} className="tag-chip" data-primary={idx === 0} style={{ '--tc': tag.color }}>
              {tag.name}
              <button className="tag-chip-x" onMouseDown={e => { e.preventDefault(); toggle(id); }}>×</button>
            </span>
          );
        })}
        <input
          ref={inputRef}
          className="tag-input-field"
          value={q}
          placeholder={selected.length ? '' : '#тег…'}
          onChange={e => { setQ(e.target.value.replace(/^#/, '')); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKey}
        />
      </div>
      {open && (suggestions.length > 0 || canCreate) && (
        <div className="tag-input-drop">
          {suggestions.map(tag => (
            <div key={tag.id} className={`tag-input-opt${selected.includes(tag.id) ? ' on' : ''}`}
              onMouseDown={e => { e.preventDefault(); toggle(tag.id); }}>
              <span className="tag-opt-dot" style={{ background: tag.color }} />
              <span>{tag.name}</span>
              {selected.includes(tag.id) && <span className="tag-opt-check">✓</span>}
            </div>
          ))}
          {canCreate && (
            <div className="tag-input-opt create"
              onMouseDown={e => { e.preventDefault(); create(q.trim()); }}>
              <span className="tag-opt-dot" style={{ background: '#818cf8' }} />
              <span>Создать «{q}»</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Форма создания / редактирования объекта ────────────────────
function CreateModal({ onClose, onSave, onUpdate, initialItem, allTags, onAddTag }) {
  const isEdit = !!initialItem;
  const [kind,    setKind]    = useState(initialItem?.kind    || 'event');
  const [name,    setName]    = useState(initialItem?.name    || '');
  const [start,   setStart]   = useState(initialItem?.start != null ? String(initialItem.start) : '');
  const [end,     setEnd]     = useState(
    initialItem && initialItem.kind !== 'event' && initialItem.end !== initialItem.start
      ? String(initialItem.end) : ''
  );
  const [selTags, setSelTags] = useState(initialItem?.tags   || []);
  const [desc,    setDesc]    = useState(initialItem?.desc    || '');

  const isPerson = kind === 'subject' && selTags.includes('person');
  const valid = name.trim() && start;

  const handleSave = () => {
    if (!valid) return;
    const s = parseInt(start);
    const e = kind === 'event' ? s : parseInt(end || start);
    if (isEdit) {
      onUpdate({ ...initialItem, kind, name: name.trim(), tags: selTags, start: s, end: e,
        lifeSpan: kind === 'subject' ? `${start} — ${end || start}` : undefined,
        desc: desc.trim() });
    } else {
      onSave({ id: 'user-' + Date.now(), kind, name: name.trim(), tags: selTags, start: s, end: e,
        lifeSpan: kind === 'subject' ? `${start} — ${end || start}` : undefined,
        desc: desc.trim() });
    }
    onClose();
  };

  const handleAddTag = (tag) => {
    onAddTag(tag);
    setSelTags(prev => [...prev, tag.id]);
  };

  return (
    <div className="cm-overlay" onClick={onClose}>
      <div className="cm" onClick={e => e.stopPropagation()}>
        <div className="cm-head">
          <span>{isEdit ? 'Редактировать' : 'Новый объект'}</span>
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
              {[['event','Событие'],['subject','Участник'],['era','Период']].map(([v,l]) => (
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
              <label className="cm-label">{isPerson ? 'Год рождения' : 'Начало'}</label>
              <input className="cm-input" type="number" value={start} onChange={e => setStart(e.target.value)} placeholder="-500"/>
            </div>
            {kind !== 'event' && (
              <div className="cm-field">
                <label className="cm-label">{isPerson ? 'Год смерти' : 'Конец'}</label>
                <input className="cm-input" type="number" value={end} onChange={e => setEnd(e.target.value)} placeholder="500"/>
              </div>
            )}
          </div>

          <div className="cm-field">
            <label className="cm-label">Теги</label>
            <TagInput selected={selTags} onChange={setSelTags} onAdd={handleAddTag} allTags={allTags} />
          </div>

          <div className="cm-field">
            <label className="cm-label">Описание <span className="cm-hint">— необязательно</span></label>
            <textarea className="cm-textarea" value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Краткое описание события…"/>
          </div>
        </div>

        <div className="cm-foot">
          <button className="cm-btn ghost" onClick={onClose}>Отмена</button>
          <button className="cm-btn primary" onClick={handleSave} disabled={!valid}>{isEdit ? 'Сохранить' : 'Добавить'}</button>
        </div>
      </div>
    </div>
  );
}

function UniverseSelector({ activeUniverses, onToggle, items, universes, onCreateUniverse, onEditUniverse, onDeleteUniverse }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const btnRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          btnRef.current && !btnRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const safeUniverses = universes || [];
  const activeList = safeUniverses.filter(u => activeUniverses && activeUniverses.has(u.id));
  const btnIcons = activeList.slice(0, 3).map(u => u.icon).join(' ');
  const btnLabel = activeList.length === 1
    ? activeList[0].name
    : activeList.length > 1
      ? `${activeList.length} коллекции`
      : 'История';

  return (
    <div className="universe-selector">
      <button
        ref={btnRef}
        className="universe-btn"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        title={`Активные коллекции: ${activeList.map(u => u.name).join(', ')}`}
      >
        <span className="universe-btn-icon">{btnIcons || '🌐'}</span>
        <span className="universe-btn-name">{btnLabel}</span>
        <svg className="universe-btn-arrow" width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div ref={dropdownRef} className="universe-dropdown" data-open={open}>
        {window.UniverseManagerPanel ? (
          <window.UniverseManagerPanel
            activeUniverses={activeUniverses || new Set()}
            universes={safeUniverses}
            items={items}
            onCreate={onCreateUniverse}
            onEdit={onEditUniverse}
            onDelete={onDeleteUniverse}
            onToggle={onToggle}
          />
        ) : (
          // Fallback
          <>
            <div className="universe-dropdown-header">Коллекции</div>
            {safeUniverses.map(u => (
              <button
                key={u.id}
                className="universe-option"
                data-active={activeUniverses && activeUniverses.has(u.id)}
                onClick={() => onToggle(u.id)}
              >
                <span className="universe-option-icon">{u.icon}</span>
                <div className="universe-option-body">
                  <div className="universe-option-name">{u.name}</div>
                  <div className="universe-option-desc">{u.description}</div>
                </div>
              </button>
            ))}
          </>
        )}
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
                    {pt?.name}
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
  // UX: Default view positions present year (~2026) at ~30% from left
  // This creates an expansive feel with room to explore the future
  // View span: -500 to 2400 = 2900 years, present at (2026-(-500))/2900 ≈ 30%
  const [view, setViewState] = useState({ start: -500, end: 2400 });
  const [legendHidden, setLegendHidden] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem,   setEditItem]   = useState(null);
  const [items, setItems] = useState(() => window.ALL_ITEMS);
  const [customTags, setCustomTags] = useState([]);
  const [activeKinds, setActiveKinds] = useState(() => new Set(['subject', 'event', 'era']));
  const [activeUniverses, setActiveUniverses] = useState(() => new Set([window.DEFAULT_UNIVERSE?.id || 'main']));
  const [universes, setUniverses] = useState(() => [...(window.UNIVERSE_META || [window.DEFAULT_UNIVERSE])]);

  const allTags = useMemo(() => [...window.TAG_CATALOG, ...customTags], [customTags]);

  // Union-фильтрация по нескольким активным коллекциям
  const filteredItems = useMemo(() => {
    return window.filterByUniverses(items, activeUniverses);
  }, [items, activeUniverses]);

  // Тоггл: добавить/убрать вселенную из активных (нельзя убрать последнюю)
  const handleToggleUniverse = useCallback((universeId) => {
    setActiveUniverses(prev => {
      const next = new Set(prev);
      if (next.has(universeId)) {
        next.delete(universeId);
      } else {
        next.add(universeId);
      }
      return next;
    });
  }, []);

  const handleCreateUniverse = useCallback((universeData) => {
    window.createUniverse(universeData);
    setUniverses([...window.UNIVERSE_META]);
  }, []);

  const handleEditUniverse = useCallback((universeId, updates) => {
    window.updateUniverse(universeId, updates);
    setUniverses([...window.UNIVERSE_META]);
  }, []);

  const handleDeleteUniverse = useCallback((universeId) => {
    const result = window.deleteUniverseFromMeta(universeId);
    if (result.success) {
      setUniverses([...window.UNIVERSE_META]);
      setItems(prev => prev.filter(item => item.universe !== universeId));
      setActiveUniverses(prev => {
        const next = new Set(prev);
        next.delete(universeId);
        if (next.size === 0) next.add(window.DEFAULT_UNIVERSE?.id || 'main');
        return next;
      });
    }
  }, []);

  const setView = useCallback((start, end) => {
    setViewState({ start, end });
  }, []);

  const handleCreate = useCallback((item) => {
    const itemWithUniverse = window.setUniverseId(item, window.DEFAULT_UNIVERSE?.id || 'main');
    setItems(prev => [...prev, itemWithUniverse]);
  }, []);

  const handleUpdate = useCallback((updated) => {
    setItems(prev => prev.map(it => it.id === updated.id ? updated : it));
    setSelected(updated);
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
      const ne = Math.min(2500, mid + span / 2);  // Updated to match new GLOBAL_MAX
      setView(ns, ne);
    }
  }, [view, setView]);

  const handleSelectAndZoom = useCallback((item) => {
    if (item.kind === 'era') {
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

  const handleToggleKind = (kind) => {
    setActiveKinds(prev => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind); else next.add(kind);
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

        <UniverseSelector
          activeUniverses={activeUniverses}
          onToggle={handleToggleUniverse}
          items={items}
          universes={universes}
          onCreateUniverse={handleCreateUniverse}
          onEditUniverse={handleEditUniverse}
          onDeleteUniverse={handleDeleteUniverse}
        />

        <div className="header-spacer"></div>

        <HeaderSearch items={filteredItems} onSelect={handleSelect} />

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
      {editItem && (
        <CreateModal
          onClose={() => setEditItem(null)}
          onUpdate={handleUpdate}
          initialItem={editItem}
          allTags={allTags}
          onAddTag={handleAddTag}
        />
      )}

      <div className="main" data-legend-hidden={legendHidden}>
        {!legendHidden && (
          <window.Legend
            activeTags={activeTags}
            onToggleTag={handleToggleTag}
            activeKinds={activeKinds}
            onToggleKind={handleToggleKind}
            items={filteredItems}
            allTags={allTags}
            onAddTag={handleAddTag}
          />
        )}

        <div className="tl-container">
          <window.Timeline
            items={filteredItems}
            activeTags={activeTags}
            activeKinds={activeKinds}
            selected={selected}
            onSelect={handleSelectAndZoom}
            density={t.density}
            scaleMode={t.timeMode || 'real'}
            viewStart={view.start}
            viewEnd={view.end}
            setView={setView}
            rowHeight={rowHeight}
            showConnections={t.showConnections}
            enablePresentBuffer={t.presentBuffer !== false}
          />
          {t.showMinimap && (
            <window.Minimap
              items={filteredItems}
              viewStart={view.start}
              viewEnd={view.end}
              setView={setView}
              activeKinds={activeKinds}
            />
          )}
        </div>

        <window.DetailPanel
          item={selected}
          onClose={() => setSelected(null)}
          onSelect={handleSelect}
          onEdit={setEditItem}
          allItems={items}
        />
      </div>

      <window.TweaksPanel>
        <window.TweakSection label="Vibe — настроение интерфейса" />
        <window.TweakRadio
          label="Визуальный язык"
          value={t.vibe || 'data'}
          options={[
            { value: 'data',          label: 'Данные' },
            { value: 'archive',       label: 'Архив' },
            { value: 'constellation', label: 'Космос' },
          ]}
          onChange={(v) => setTweak('vibe', v)}
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
        <window.TweakToggle
          label="Маркер настоящего"
          value={t.presentBuffer !== false}
          onChange={(v) => setTweak('presentBuffer', v)}
        />

        <window.TweakSection label="Быстрая навигация по периодам" />
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

// Ждем загрузки всех данных перед рендерингом
function waitForData(maxAttempts = 100) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      attempts++;
      if (window.ALL_ITEMS && window.FACETS && window.TAG_CATALOG) {
        console.log('[App] Data loaded successfully:', {
          ALL_ITEMS: window.ALL_ITEMS.length,
          FACETS: Object.keys(window.FACETS).length,
          TAG_CATALOG: window.TAG_CATALOG.length
        });
        resolve();
      } else if (attempts >= maxAttempts) {
        reject(new Error('Timeout waiting for data to load'));
      } else {
        console.log(`[App] Waiting for data... attempt ${attempts}/${maxAttempts}`);
        setTimeout(check, 100);
      }
    };
    check();
  });
}

waitForData()
  .then(() => {
    console.log('[App] Starting render...');
    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  })
  .catch((err) => {
    console.error('[App] Failed to initialize:', err);
    document.getElementById('root').innerHTML = `
      <div style="padding: 40px; background: #181c28; color: #ef5a6a; border-radius: 8px; margin: 20px;">
        <h2 style="margin: 0 0 10px;">Ошибка загрузки</h2>
        <p style="margin: 0; font-family: monospace;">${err.message}</p>
        <p style="margin: 20px 0 0; font-size: 12px; color: #8b91a4;">
          Проверьте консоль браузера (F12) для получения дополнительной информации.
        </p>
      </div>
    `;
  });
