/* TarixiTimeline — концепт: все категории как теги.
   Один холст с несколькими артбордами для сравнения.
*/

const { useState, useMemo, useCallback, useRef, useEffect } = React;

// ============================================================
// модель тегов
// ============================================================

const FACETS = {
  role:  { id: 'role',  name: 'роль',   hint: 'кем является' },
  type:  { id: 'type',  name: 'тип',    hint: 'что это за событие' },
  place: { id: 'place', name: 'место',  hint: 'где происходит' },
  theme: { id: 'theme', name: 'тема',   hint: 'к какой теме относится' },
};

const TAG_CATALOG = [
  // role
  { id: 'person',    name: 'Личность',          facet: 'role',  color: '#cbd1e1', system: true },
  { id: 'ruler',     name: 'Правитель',         facet: 'role',  color: '#e6b94a', system: true },
  { id: 'thinker',   name: 'Учёный',            facet: 'role',  color: '#5cd4ec', system: true },
  { id: 'art',       name: 'Деятель искусств',  facet: 'role',  color: '#b27cff', system: true },
  { id: 'warrior',   name: 'Военачальник',      facet: 'role',  color: '#ef5a6a', system: true },
  // type
  { id: 'event',     name: 'Событие',           facet: 'type',  color: '#5fd49a', system: true },
  { id: 'battle',    name: 'Война / битва',     facet: 'type',  color: '#ef5a6a', system: true },
  { id: 'era',       name: 'Эпоха',             facet: 'type',  color: '#f7903a', system: true },
  { id: 'state',     name: 'Государство',       facet: 'type',  color: '#38bdf8', system: true },
  { id: 'invention', name: 'Изобретение',       facet: 'type',  color: '#9fe07b', system: true },
  // place
  { id: 'kz',        name: 'Казахстан',         facet: 'place', color: '#38bdf8', system: true },
  { id: 'world',     name: 'Мир',               facet: 'place', color: '#f7903a', system: true },
  { id: 'asia',      name: 'Азия',              facet: 'place', color: '#ffb86b', system: true },
  // theme (раньше — user categories)
  { id: 'lit',       name: 'Литература',        facet: 'theme', color: '#ff8fb0', system: false },
  { id: 'science',   name: 'Наука',             facet: 'theme', color: '#7be0c4', system: false },
  { id: 'music',     name: 'Музыка',            facet: 'theme', color: '#c8a4ff', system: false },
  { id: 'sport',     name: 'Спорт',             facet: 'theme', color: '#ffd166', system: false },
  { id: 'mine',      name: 'Моё',               facet: 'theme', color: '#f0e9d8', system: false },
];

const TAG_MAP = Object.fromEntries(TAG_CATALOG.map(t => [t.id, t]));

// быстрые пресеты — просто прокидывают список тегов
const PRESETS = [
  { id: 'person-kz',  label: 'Личность · Казахстан', tags: ['person', 'kz'] },
  { id: 'war',        label: 'Война',                tags: ['battle'] },
  { id: 'era',        label: 'Эпоха',                tags: ['era'] },
  { id: 'state',      label: 'Государство',          tags: ['state'] },
  { id: 'event-w',    label: 'Событие · Мир',        tags: ['event', 'world'] },
];

// ============================================================
// атомарный компонент: тег
// ============================================================

function Tag({ id, primary, removable, onRemove, faceted, dragHandle }) {
  const t = TAG_MAP[id];
  if (!t) return null;
  const style = { '--c': t.color };
  if (faceted) {
    return (
      <span className="tag-faceted" style={style}>
        <span className="facet">{FACETS[t.facet].name}</span>
        <span className="name">
          <span className="dot"></span>
          {t.name}
        </span>
      </span>
    );
  }
  return (
    <span className={`tag${primary ? ' primary' : ''}`} style={style}>
      {dragHandle && <span style={{ opacity: 0.4, fontSize: 9, cursor: 'grab', userSelect: 'none' }}>⋮⋮</span>}
      <span className="dot"></span>
      <span>{t.name}</span>
      {primary && <span className="pin" title="Главный тег — задаёт цвет"></span>}
      {removable && <span className="x" onClick={onRemove}>×</span>}
    </span>
  );
}

// ============================================================
// артборд 1: текущая форма (для сравнения)
// ============================================================

function OldForm() {
  return (
    <div className="art" style={{ padding: '22px 22px 18px' }}>
      <div className="eyebrow">сейчас · форма добавления</div>
      <h3 className="h-disp" style={{ fontSize: 26, margin: '6px 0 18px' }}>Поставить точку на таймлайне</h3>

      <Field label="Тип">
        <Seg options={['Личность', 'Событие', 'Период']} value={0} />
      </Field>
      <Field label="Название">
        <FakeInput value="Аль-Фараби" />
      </Field>
      <Field label="Годы">
        <div style={{ display: 'flex', gap: 8 }}>
          <FakeInput value="870" mono />
          <FakeInput value="950" mono />
        </div>
      </Field>
      <Field label="Предмет">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {[
            ['Литература', '#ff8fb0'],
            ['Музыка', '#c8a4ff'],
            ['Наука', '#7be0c4', true],
            ['Спорт', '#ffd166'],
            ['Моё', '#f0e9d8'],
          ].map(([name, c, on]) => (
            <div key={name} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '7px 9px',
              background: on ? `color-mix(in oklab, ${c} 14%, var(--bg-2))` : 'var(--bg-2)',
              border: `1px solid ${on ? c : 'var(--line)'}`,
              borderRadius: 7,
              color: on ? 'var(--text-0)' : 'var(--text-1)',
              fontSize: 12,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: c }}></span>
              {name}
            </div>
          ))}
        </div>
      </Field>
      <Field label="Регион">
        <Seg options={['Казахстан', 'Мир']} value={0} />
      </Field>

      <div style={{
        marginTop: 16, padding: '12px 14px',
        border: '1px dashed var(--c-battle)',
        borderRadius: 8,
        background: 'color-mix(in oklab, var(--c-battle) 7%, transparent)',
        color: 'var(--text-1)',
        fontSize: 12, lineHeight: 1.5,
      }}>
        <div className="label" style={{ color: 'var(--c-battle)', marginBottom: 4 }}>
          трение
        </div>
        Пользователь выбирает <b>три</b> оси: тип, предмет, регион.
        А «учёный» и «литература» лежат в разных уровнях системы — одно зашито в код, другое настраивается.
      </div>
    </div>
  );
}

// ============================================================
// артборд 2: новая форма — теги
// ============================================================

function NewForm() {
  const [tags, setTags] = useState(['thinker', 'kz', 'science']);
  const [name, setName] = useState('Аль-Фараби');
  const [year1, setYear1] = useState('870');
  const [year2, setYear2] = useState('950');
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [query, setQuery] = useState('');

  const available = TAG_CATALOG.filter(t =>
    !tags.includes(t.id) && (!query || t.name.toLowerCase().includes(query.toLowerCase()))
  );

  const primaryColor = tags.length > 0 ? TAG_MAP[tags[0]].color : 'var(--text-2)';

  const addTag = (id) => {
    if (!tags.includes(id)) setTags([...tags, id]);
    setQuery(''); setSuggestOpen(false);
  };
  const removeTag = (id) => setTags(tags.filter(t => t !== id));
  const promote = (id) => setTags([id, ...tags.filter(t => t !== id)]);

  return (
    <div className="art" style={{ padding: '22px 22px 18px' }}>
      <div className="eyebrow">концепт · форма добавления</div>
      <h3 className="h-disp" style={{ fontSize: 26, margin: '6px 0 4px' }}>Новая сущность</h3>
      <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 18 }}>
        Опиши тегами — что это, когда и где.
      </div>

      {/* пресеты — быстрые входы */}
      <div style={{ marginBottom: 16 }}>
        <div className="label" style={{ marginBottom: 8 }}>Быстрый ввод</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => setTags(p.tags)}
              style={{
                background: 'var(--bg-2)',
                border: '1px solid var(--line)',
                borderRadius: 999,
                padding: '5px 11px',
                color: 'var(--text-1)',
                fontSize: 11.5,
                fontFamily: 'inherit',
                cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}
            >
              <span style={{ color: 'var(--text-3)', fontSize: 10 }}>＋</span>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <Field label="Название">
        <FakeInput value={name} onChange={setName} />
      </Field>

      <Field label="Когда" hint="Одна дата → точка. Две → отрезок.">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <FakeInput value={year1} onChange={setYear1} mono placeholder="С" />
          <span style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>—</span>
          <FakeInput value={year2} onChange={setYear2} mono placeholder="По (опц.)" />
        </div>
      </Field>

      <Field label="Теги" hint="Первый тег — главный, задаёт цвет на таймлайне.">
        <div style={{
          minHeight: 44,
          padding: 8,
          background: 'var(--bg-2)',
          border: `1px solid color-mix(in oklab, ${primaryColor} 25%, var(--line))`,
          borderRadius: 10,
          display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
        }}>
          {tags.map((id, i) => (
            <Tag
              key={id}
              id={id}
              primary={i === 0}
              removable
              dragHandle
              onRemove={() => removeTag(id)}
            />
          ))}
          <div style={{ position: 'relative', flex: 1, minWidth: 100 }}>
            <input
              type="text"
              placeholder={tags.length ? '+ ещё тег' : 'начни писать…'}
              value={query}
              onChange={e => { setQuery(e.target.value); setSuggestOpen(true); }}
              onFocus={() => setSuggestOpen(true)}
              onBlur={() => setTimeout(() => setSuggestOpen(false), 150)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-0)',
                fontFamily: 'inherit', fontSize: 12.5,
                padding: '4px 6px',
                outline: 'none',
              }}
            />
            {suggestOpen && available.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0,
                marginTop: 6,
                background: 'var(--bg-3)',
                border: '1px solid var(--line-strong)',
                borderRadius: 10,
                padding: 4,
                maxHeight: 220,
                overflowY: 'auto',
                zIndex: 5,
                boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
              }}>
                {Object.values(FACETS).map(facet => {
                  const facetTags = available.filter(t => t.facet === facet.id);
                  if (facetTags.length === 0) return null;
                  return (
                    <div key={facet.id}>
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
                        color: 'var(--text-3)',
                        padding: '8px 10px 4px',
                      }}>{facet.name}</div>
                      {facetTags.map(t => (
                        <div
                          key={t.id}
                          onMouseDown={e => { e.preventDefault(); addTag(t.id); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '6px 10px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: 12,
                            color: 'var(--text-1)',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-4)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.color }}></span>
                          {t.name}
                          {!t.system && (
                            <span style={{
                              marginLeft: 'auto',
                              fontSize: 9, color: 'var(--text-3)',
                              fontFamily: 'var(--font-mono)', letterSpacing: '0.15em', textTransform: 'uppercase',
                            }}>мой</span>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
                <div
                  onMouseDown={e => e.preventDefault()}
                  style={{
                    margin: '4px 0 0',
                    padding: '8px 10px',
                    borderTop: '1px solid var(--line)',
                    color: 'var(--text-2)',
                    fontSize: 11.5, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 7,
                  }}
                >
                  <span style={{ color: 'var(--text-3)' }}>＋</span>
                  Создать тег «<b style={{ color: 'var(--text-0)' }}>{query || '…'}</b>»
                </div>
              </div>
            )}
          </div>
        </div>
      </Field>

      <Field label="Заметка (опц.)">
        <FakeInput value="Уроженец Отрара. «Второй учитель» после Аристотеля." multiline />
      </Field>

      {/* превью */}
      <div style={{
        marginTop: 14, padding: '11px 14px',
        background: `color-mix(in oklab, ${primaryColor} 8%, var(--bg-2))`,
        border: `1px solid color-mix(in oklab, ${primaryColor} 30%, var(--line))`,
        borderRadius: 10,
      }}>
        <div className="label" style={{ marginBottom: 6 }}>как ляжет на таймлайн</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            flex: 1, height: 22,
            background: `color-mix(in oklab, ${primaryColor} 20%, var(--bg-1))`,
            border: `1px solid color-mix(in oklab, ${primaryColor} 55%, transparent)`,
            borderRadius: 5,
            position: 'relative',
            display: 'flex', alignItems: 'center', padding: '0 8px',
            fontSize: 11, color: 'var(--text-0)', fontWeight: 600,
          }}>
            <span style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
              background: primaryColor,
              boxShadow: `0 0 8px ${primaryColor}`,
            }}></span>
            {name || '…'}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-3)' }}>
            {year1}{year2 && year2 !== year1 ? `—${year2}` : ''}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// артборд 3: каталог тегов
// ============================================================

function TagCatalog() {
  return (
    <div className="art art-pad">
      <div className="eyebrow">каталог тегов</div>
      <h3 className="h-disp" style={{ fontSize: 26, margin: '6px 0 4px' }}>Все теги — в одном списке</h3>
      <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 20, maxWidth: 520 }}>
        Предсозданные и пользовательские лежат рядом. Любой можно переименовать, перекрасить, скрыть.
        Системные тегам нельзя удалить — только «вернуть к исходному».
      </div>

      {Object.values(FACETS).map(facet => {
        const tags = TAG_CATALOG.filter(t => t.facet === facet.id);
        return (
          <div key={facet.id} style={{ marginBottom: 18 }}>
            <div style={{
              display: 'flex', alignItems: 'baseline', gap: 10,
              marginBottom: 10,
              paddingBottom: 6,
              borderBottom: '1px solid var(--line)',
            }}>
              <span className="label" style={{ color: 'var(--text-1)' }}>{facet.name}</span>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{facet.hint}</span>
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-3)' }}>
                {tags.length}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {tags.map(t => (
                <CatalogTagRow key={t.id} tag={t} />
              ))}
              <CatalogAdd />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CatalogTagRow({ tag }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 11px',
      background: 'var(--bg-2)',
      border: '1px solid var(--line)',
      borderRadius: 9,
    }}>
      <span style={{
        width: 14, height: 14, borderRadius: 4,
        background: tag.color,
        boxShadow: `0 0 8px color-mix(in oklab, ${tag.color} 50%, transparent)`,
        flexShrink: 0,
      }}></span>
      <span style={{ fontSize: 12.5, color: 'var(--text-0)', flex: 1, minWidth: 0,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {tag.name}
      </span>
      {tag.system ? (
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 8.5, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'var(--text-3)',
        }}>системн.</span>
      ) : (
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 8.5, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: '#ff8fb0', opacity: 0.7,
        }}>мой</span>
      )}
    </div>
  );
}

function CatalogAdd() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: '9px 11px',
      background: 'transparent',
      border: '1px dashed var(--line-strong)',
      borderRadius: 9,
      color: 'var(--text-3)',
      fontSize: 12,
      cursor: 'pointer',
    }}>
      <span>＋</span>
      <span>Новый тег</span>
    </div>
  );
}

// ============================================================
// артборд 4: на таймлайне (цветовая логика)
// ============================================================

function TimelineDemo() {
  const [mode, setMode] = useState('primary'); // primary | stripes | facet

  // три демо-сущности
  const items = [
    { name: 'Аль-Фараби',       y1: 870,  y2: 950,  tags: ['thinker', 'kz', 'science'] },
    { name: 'Леонардо да Винчи',y1: 1452, y2: 1519, tags: ['art', 'world', 'science'] },
    { name: 'Таласская битва',  y1: 751,  y2: 751,  tags: ['battle', 'asia'] },
    { name: 'Абай Кунанбаев',   y1: 1845, y2: 1904, tags: ['art', 'kz', 'lit'] },
  ];

  return (
    <div className="art art-pad">
      <div className="eyebrow">визуализация · цветовая логика</div>
      <h3 className="h-disp" style={{ fontSize: 26, margin: '6px 0 4px' }}>Один объект — несколько тегов</h3>
      <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16, maxWidth: 560 }}>
        Аль-Фараби — это и «учёный», и «Казахстан», и «наука» одновременно. Раньше пришлось бы выбирать одну категорию.
        Теперь — несколько, а цвет берётся по выбранной логике.
      </div>

      {/* mode picker */}
      <div style={{
        display: 'inline-flex',
        background: 'var(--bg-2)', border: '1px solid var(--line)',
        borderRadius: 999, padding: 3, marginBottom: 18,
      }}>
        {[
          { id: 'primary', l: 'По главному тегу' },
          { id: 'stripes', l: 'Все теги полосами' },
          { id: 'facet',   l: 'По выбранному фасету' },
        ].map(o => (
          <button
            key={o.id}
            onClick={() => setMode(o.id)}
            style={{
              background: mode === o.id ? 'var(--bg-3)' : 'transparent',
              boxShadow: mode === o.id ? 'inset 0 0 0 1px var(--line-strong)' : 'none',
              border: 'none',
              color: mode === o.id ? 'var(--text-0)' : 'var(--text-2)',
              padding: '6px 12px',
              borderRadius: 999,
              fontSize: 11.5,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >{o.l}</button>
        ))}
      </div>

      {mode === 'facet' && (
        <div style={{ marginBottom: 14, fontSize: 11, color: 'var(--text-2)' }}>
          Сейчас «фасет = роль» — цвет от роли. Можно переключить в легенде.
        </div>
      )}

      <div style={{
        background: 'var(--bg-1)',
        border: '1px solid var(--line)',
        borderRadius: 10,
        padding: '14px 18px',
        position: 'relative',
      }}>
        {/* год-сетка */}
        <div style={{
          position: 'absolute', inset: '14px 18px',
          background: 'repeating-linear-gradient(90deg, transparent 0 calc(100% / 8 - 1px), var(--line) calc(100% / 8 - 1px) calc(100% / 8))',
          pointerEvents: 'none', opacity: 0.5,
        }}></div>

        {items.map((it, idx) => (
          <TimelineItem key={idx} item={it} mode={mode} />
        ))}

        {/* ось */}
        <div style={{
          marginTop: 8, paddingTop: 8,
          borderTop: '1px solid var(--line-strong)',
          display: 'flex', justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)',
        }}>
          <span>500</span><span>900</span><span>1300</span><span>1700</span><span>2000</span>
        </div>
      </div>

      <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 12, lineHeight: 1.6 }}>
        <b style={{ color: 'var(--text-1)' }}>Главный тег</b> — самый понятный (как сейчас).
        &nbsp;<b style={{ color: 'var(--text-1)' }}>Полосы</b> — кричит о множественной природе, но рябит.
        &nbsp;<b style={{ color: 'var(--text-1)' }}>По фасету</b> — пользователь сам решает, по какой оси красить (как в Tableau).
      </div>
    </div>
  );
}

function TimelineItem({ item, mode }) {
  // нормируем 500..2000 в проценты
  const norm = (y) => Math.max(0, Math.min(100, ((y - 500) / (2000 - 500)) * 100));
  const left = norm(item.y1);
  const right = norm(item.y2);
  const width = Math.max(2, right - left);

  const tagsArr = item.tags.map(id => TAG_MAP[id]);
  const primary = tagsArr[0];
  // для фасета — берём по facet=role, иначе primary
  const facetPick = tagsArr.find(t => t.facet === 'role') || primary;

  let background, borderColor, accentColor;
  if (mode === 'stripes') {
    const slices = tagsArr.map((t, i) => {
      const a = (i / tagsArr.length) * 100;
      const b = ((i + 1) / tagsArr.length) * 100;
      return `${t.color} ${a}%, ${t.color} ${b}%`;
    }).join(', ');
    background = `linear-gradient(90deg, ${slices})`;
    borderColor = `color-mix(in oklab, ${primary.color} 55%, transparent)`;
    accentColor = primary.color;
  } else {
    const c = mode === 'facet' ? facetPick.color : primary.color;
    background = `color-mix(in oklab, ${c} 22%, var(--bg-1))`;
    borderColor = `color-mix(in oklab, ${c} 55%, transparent)`;
    accentColor = c;
  }

  return (
    <div style={{
      position: 'relative',
      height: 28, marginBottom: 8,
    }}>
      <div style={{
        position: 'absolute',
        left: `${left}%`, width: `${width}%`,
        top: 0, bottom: 0,
        background,
        border: `1px solid ${borderColor}`,
        borderRadius: 5,
        display: 'flex', alignItems: 'center',
        padding: '0 8px',
        overflow: 'hidden',
      }}>
        {mode !== 'stripes' && (
          <span style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
            background: accentColor,
            boxShadow: `0 0 8px ${accentColor}`,
          }}></span>
        )}
        <span style={{
          fontSize: 11, fontWeight: 600,
          color: mode === 'stripes' ? '#0a0c14' : 'var(--text-0)',
          textShadow: mode === 'stripes' ? '0 0 4px rgba(255,255,255,0.5)' : 'none',
          whiteSpace: 'nowrap',
          overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {item.name}
        </span>
        {/* теги «плашкой» при наведении: показываем всегда мелко справа */}
      </div>
      <div style={{
        position: 'absolute',
        left: `calc(${right}% + 10px)`,
        top: 0, bottom: 0,
        display: 'flex', alignItems: 'center', gap: 4,
        fontFamily: 'var(--font-mono)', fontSize: 9.5,
        color: 'var(--text-3)',
        whiteSpace: 'nowrap',
      }}>
        {tagsArr.map(t => (
          <span key={t.id} style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: t.color }}></span>
            {t.name.toLowerCase()}
          </span>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// артборд 5: новая легенда / фильтр
// ============================================================

function FilterPanel() {
  const [active, setActive] = useState(new Set(['thinker', 'kz', 'science', 'ruler', 'state', 'era']));
  const [colorBy, setColorBy] = useState('role');

  const toggle = (id) => {
    const next = new Set(active);
    if (next.has(id)) next.delete(id); else next.add(id);
    setActive(next);
  };

  return (
    <div className="art" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div className="eyebrow">панель фильтров</div>
        <h3 className="h-disp" style={{ fontSize: 22, margin: '4px 0 8px' }}>Теги · фильтры</h3>
      </div>

      {/* color-by селектор */}
      <div>
        <div className="label" style={{ marginBottom: 8 }}>Цвет на таймлайне</div>
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 4,
          background: 'var(--bg-2)', border: '1px solid var(--line)',
          borderRadius: 8, padding: 4,
        }}>
          {[
            { id: 'role',  l: 'по роли' },
            { id: 'type',  l: 'по типу' },
            { id: 'place', l: 'по месту' },
            { id: 'theme', l: 'по теме' },
          ].map(o => (
            <button
              key={o.id}
              onClick={() => setColorBy(o.id)}
              style={{
                background: colorBy === o.id ? 'var(--bg-3)' : 'transparent',
                border: 'none',
                color: colorBy === o.id ? 'var(--text-0)' : 'var(--text-2)',
                padding: '6px 10px', borderRadius: 6,
                fontFamily: 'inherit', fontSize: 12,
                cursor: 'pointer', textAlign: 'left',
              }}
            >{o.l}</button>
          ))}
        </div>
      </div>

      {/* теги по фасетам, разворачиваемые */}
      {Object.values(FACETS).map(facet => {
        const tags = TAG_CATALOG.filter(t => t.facet === facet.id);
        return (
          <div key={facet.id}>
            <div className="label" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{facet.name}</span>
              <span style={{ flex: 1 }}></span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)' }}>
                {tags.filter(t => active.has(t.id)).length}/{tags.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {tags.map(t => {
                const on = active.has(t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => toggle(t.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 9,
                      padding: '5px 8px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      opacity: on ? 1 : 0.35,
                      transition: 'opacity 0.12s ease',
                    }}
                  >
                    <span style={{
                      width: 10, height: 10, borderRadius: 3,
                      background: t.color,
                      flexShrink: 0,
                    }}></span>
                    <span style={{ fontSize: 12, color: 'var(--text-1)', flex: 1,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// общие штуки формы
// ============================================================

function Field({ label, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span className="label">{label}</span>
        {hint && <span style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function FakeInput({ value, onChange, placeholder, mono, multiline }) {
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <Tag
      type="text"
      value={value || ''}
      onChange={e => onChange && onChange(e.target.value)}
      placeholder={placeholder || ''}
      rows={multiline ? 2 : undefined}
      style={{
        width: '100%',
        background: 'var(--bg-2)',
        border: '1px solid var(--line)',
        borderRadius: 8,
        padding: '9px 12px',
        color: 'var(--text-0)',
        fontFamily: mono ? 'var(--font-mono)' : 'inherit',
        fontSize: mono ? 13 : 13.5,
        outline: 'none',
        resize: multiline ? 'vertical' : 'none',
      }}
    />
  );
}

function Seg({ options, value }) {
  return (
    <div style={{
      display: 'flex',
      background: 'var(--bg-2)',
      border: '1px solid var(--line)',
      borderRadius: 8,
      padding: 2,
    }}>
      {options.map((o, i) => (
        <button
          key={i}
          style={{
            flex: 1, border: 'none',
            background: i === value ? 'var(--bg-3)' : 'transparent',
            boxShadow: i === value ? 'inset 0 0 0 1px var(--line-strong)' : 'none',
            color: i === value ? 'var(--text-0)' : 'var(--text-2)',
            padding: '7px 10px', borderRadius: 6,
            cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 500,
          }}
        >{o}</button>
      ))}
    </div>
  );
}

// ============================================================
// корневой холст
// ============================================================

function App() {
  return (
    <DesignCanvas>
      <DCSection
        id="form"
        title="Создание сущности"
        subtitle="Главная поверхность, где разница чувствуется сразу"
      >
        <DCArtboard id="old" label="Сейчас — три оси выбора" width={460} height={780}>
          <OldForm />
        </DCArtboard>
        <DCArtboard id="new" label="Концепт — теги + умное время" width={500} height={780}>
          <NewForm />
        </DCArtboard>
        <DCPostIt>
          В старой форме пользователь думает «какой это <i>тип</i>», потом «какой <i>предмет</i>», потом «какой <i>регион</i>».
          В новой — просто <b>описывает тегами</b>. Одна сущность может быть и личностью, и казахом, и учёным одновременно.
        </DCPostIt>
      </DCSection>

      <DCSection
        id="catalog"
        title="Каталог тегов"
        subtitle="Системные и пользовательские — в одной таксономии"
      >
        <DCArtboard id="cat" label="Все теги в одном месте" width={820} height={580}>
          <TagCatalog />
        </DCArtboard>
        <DCPostIt>
          Раньше «учёный» жил в коде, «литература» — в localStorage юзера.
          Теперь это <b>одна сущность «тег»</b>, просто у системных нельзя редактировать `id` и нельзя их удалить.
          Это закрывает вашу формулировку: «технически возможно было бы воссоздать их вручную».
        </DCPostIt>
      </DCSection>

      <DCSection
        id="timeline"
        title="На таймлайне"
        subtitle="Как один объект с несколькими тегами получает цвет"
      >
        <DCArtboard id="tl" label="Три варианта цветовой логики" width={820} height={460}>
          <TimelineDemo />
        </DCArtboard>
        <DCPostIt>
          Я бы по умолчанию оставил <b>«по главному тегу»</b> — это самая стабильная и читаемая логика, как сейчас.
          «По фасету» — для продвинутых пользователей в легенде, как в Tableau.
          «Полосы» — выглядит круто на скриншоте, но в плотных строках начнёт мельтешить.
        </DCPostIt>
      </DCSection>

      <DCSection
        id="filter"
        title="Фильтр-панель"
        subtitle="Один механизм для категорий, регионов и тем"
      >
        <DCArtboard id="filt" label="Новая левая колонка" width={260} height={760}>
          <FilterPanel />
        </DCArtboard>
        <DCPostIt>
          Сейчас в `legend.jsx` три отдельные секции: «Категории», «Регионы», «Мои отметки».
          В концепте — <b>один список</b>, сгруппированный по фасету.
          Бонусом: переключатель «красить таймлайн по…» прямо в фильтре.
        </DCPostIt>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
