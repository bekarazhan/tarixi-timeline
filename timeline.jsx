/* TarixiTimeline — основной таймлайн.
   Координатная система: год -> X.  Y — слои сверху и снизу от центральной оси.
*/

const { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } = React;

// Треки: 0=события, 1=субъекты (люди/народы/государства/города…), 2=эпохи
const NUM_TRACKS = 3;

function trackOfItem(item) {
  if (item.kind === 'event')   return 0;
  if (item.kind === 'subject') return 1;
  if (item.kind === 'era')     return 2;
  return 1;
}

const GLOBAL_MIN = -42000;
const GLOBAL_MAX = 2030;
const MIN_SPAN = 8;
const MAX_SPAN = GLOBAL_MAX - GLOBAL_MIN;
const AXIS_BUFFER = 12;     // зазор между осью и первым треком
const TRACK_GAP = 6;        // зазор между треками
const REGION_GAP = 12;      // зазор от оси до начала региональной части

// шаг тиков
function tickStep(span) {
  if (span > 30000) return 5000;
  if (span > 12000) return 2000;
  if (span > 5000)  return 1000;
  if (span > 2000)  return 500;
  if (span > 700)   return 100;
  if (span > 250)   return 50;
  if (span > 80)    return 20;
  if (span > 25)    return 10;
  if (span > 8)     return 5;
  return 1;
}

// шкалирование (linear / recent — больше места к недавним годам / equal — равные эпохи)
function makeScale(viewStart, viewEnd, width, mode) {
  if (mode === 'recent') {
    // sqrt-сжатие старины
    const t = (y) => {
      const d = (GLOBAL_MAX + 5) - y;
      return -Math.sqrt(Math.max(0.1, d));
    };
    const tStart = t(viewStart);
    const tEnd = t(viewEnd);
    return {
      yearToX: (y) => ((t(y) - tStart) / (tEnd - tStart)) * width,
      xToYear: (x) => {
        const tv = tStart + (x / width) * (tEnd - tStart);
        const d = tv * tv;
        return (GLOBAL_MAX + 5) - d;
      }
    };
  }
  if (mode === 'equal') {
    // каждая эпоха = равная ширина
    const epochs = window.EPOCH_PRESETS;
    const total = epochs.length;
    function yearToT(y) {
      if (y < epochs[0].start) {
        // линейная экстраполяция до первой эпохи
        return -((epochs[0].start - y) / Math.max(1, epochs[0].end - epochs[0].start));
      }
      if (y > epochs[total - 1].end) {
        return total + ((y - epochs[total - 1].end) / Math.max(1, epochs[total - 1].end - epochs[total - 1].start));
      }
      for (let i = 0; i < total; i++) {
        const ep = epochs[i];
        if (y <= ep.end) {
          const f = Math.max(0, (y - ep.start) / (ep.end - ep.start));
          return i + f;
        }
      }
      return total;
    }
    function tToYear(t) {
      if (t <= 0) {
        return epochs[0].start + t * (epochs[0].end - epochs[0].start);
      }
      if (t >= total) {
        const last = epochs[total - 1];
        return last.end + (t - total) * (last.end - last.start);
      }
      const i = Math.floor(t);
      const f = t - i;
      const ep = epochs[i];
      return ep.start + f * (ep.end - ep.start);
    }
    const tStart = yearToT(viewStart);
    const tEnd = yearToT(viewEnd);
    return {
      yearToX: (y) => ((yearToT(y) - tStart) / (tEnd - tStart)) * width,
      xToYear: (x) => tToYear(tStart + (x / width) * (tEnd - tStart)),
    };
  }
  // real (linear)
  return {
    yearToX: (y) => ((y - viewStart) / (viewEnd - viewStart)) * width,
    xToYear: (x) => viewStart + (x / width) * (viewEnd - viewStart),
  };
}

// ===== главный компонент =====
function Timeline({
  items, activeTags, activeKinds, activeSubkinds, showWorld, selected, onSelect,
  density, scaleMode, viewStart, viewEnd, setView, onCursorYearChange,
  rowHeight, showConnections, colorLogic,
}) {
  const stageRef = useRef();
  const [size, setSize] = useState({ w: 1200, h: 700 });
  const [scrollY, setScrollY] = useState(0);
  const [hover, setHover] = useState(null); // {item, x, y}
  const [cursorState, setCursorState] = useState({ x: null, year: null });

  // -- measure --
  useLayoutEffect(() => {
    const el = stageRef.current; if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update); ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ROW = rowHeight;

  // -- фильтрация --
  const filtered = useMemo(() =>
    items.filter(it =>
      window.isItemVisible(it, activeTags) &&
      (showWorld || window.itemRegion(it) === 'kz') &&
      (!activeKinds || activeKinds.has(it.kind)) &&
      (it.kind !== 'subject' || !activeSubkinds || activeSubkinds.has(it.subkind || 'person'))
    ),
    [items, activeTags, activeKinds, activeSubkinds, showWorld]);

  // -- packing lanes per region/track  --
  // зависит от viewport: при широком зуме события нужно разводить по lanes
  // чтобы лейблы не слипались
  const layout = useMemo(() => {
    const regions = { kz: {}, world: {} };
    for (const it of filtered) {
      const t = trackOfItem(it);
      if (t < 0) continue;
      const reg = window.itemRegion(it);
      regions[reg][t] = regions[reg][t] || [];
      regions[reg][t].push(it);
    }
    const viewSpan = Math.max(1, viewEnd - viewStart);
    const yearsPerPx = viewSpan / Math.max(200, size.w);
    const trackMaxLanes = { kz: {}, world: {} };
    const itemLanes = new Map();
    for (const region of ['kz', 'world']) {
      for (let t = 0; t < NUM_TRACKS; t++) {
        const arr = (regions[region][t] || []).slice();
        arr.sort((a, b) => window.itemRange(a)[0] - window.itemRange(b)[0]);
        const lanes = [];
        for (const it of arr) {
          const [s, e] = window.itemRange(it);
          // pixel-aware минимум: события 130px, личности 8px, периоды 4px
          const minPx = it.kind === 'event' ? 130 : (it.kind === 'person' ? 12 : 4);
          const minYearsByPx = minPx * yearsPerPx;
          const minSpan = it.kind === 'event' ? Math.max(40, minYearsByPx)
                        : it.kind === 'person' ? Math.max(10, minYearsByPx)
                        : Math.max(4, minYearsByPx);
          const visualSpan = Math.max(e, s + minSpan) - s;
          const eVisual = s + visualSpan;
          let placed = false;
          for (let i = 0; i < lanes.length; i++) {
            if (lanes[i] + (yearsPerPx * 4) <= s) {
              itemLanes.set(it.id, i);
              lanes[i] = eVisual;
              placed = true;
              break;
            }
          }
          if (!placed) {
            itemLanes.set(it.id, lanes.length);
            lanes.push(eVisual);
          }
        }
        trackMaxLanes[region][t] = lanes.length;
      }
    }
    return { trackMaxLanes, itemLanes };
  }, [filtered, viewStart, viewEnd, size.w]);

  // -- scale --
  const scale = useMemo(() =>
    makeScale(viewStart, viewEnd, size.w, scaleMode),
    [viewStart, viewEnd, size.w, scaleMode]);

  // -- axisY и Y items --
  // вычисляем суммарную высоту regionов
  const kzLanesTotal = useMemo(() => {
    let sum = 0;
    for (let t = 0; t < NUM_TRACKS; t++) sum += (layout.trackMaxLanes.kz[t] || 0);
    return sum;
  }, [layout]);
  const worldLanesTotal = useMemo(() => {
    let sum = 0;
    for (let t = 0; t < NUM_TRACKS; t++) sum += (layout.trackMaxLanes.world[t] || 0);
    return sum;
  }, [layout]);

  const kzPxHeight = kzLanesTotal * ROW + (NUM_TRACKS - 1) * TRACK_GAP;
  const worldPxHeight = worldLanesTotal * ROW + (NUM_TRACKS - 1) * TRACK_GAP;
  const totalPxHeight = kzPxHeight + worldPxHeight + 2 * REGION_GAP + 24;

  let axisY;
  if (totalPxHeight <= size.h) {
    axisY = (size.h - totalPxHeight) / 2 + kzPxHeight + REGION_GAP;
  } else {
    // если контент не влезает — ось по центру, излишки уходят за edges (скроллятся)
    axisY = size.h / 2;
  }

  const itemY = useCallback((item) => {
    const t = trackOfItem(item); if (t < 0) return 0;
    const lane = layout.itemLanes.get(item.id) || 0;
    const reg = window.itemRegion(item);
    let baseOffset = 0;
    for (let i = 0; i < t; i++) baseOffset += (layout.trackMaxLanes[reg][i] || 0);
    const trackGap = t * TRACK_GAP;
    if (reg === 'kz') {
      return axisY - REGION_GAP - (baseOffset + lane + 1) * ROW - trackGap;
    } else {
      return axisY + REGION_GAP + (baseOffset + lane) * ROW + trackGap;
    }
  }, [layout, axisY, ROW]);

  // -- ticks --
  const ticks = useMemo(() => {
    const span = viewEnd - viewStart;
    const step = tickStep(span);
    const majorStep = step * 5;
    const startTick = Math.ceil(viewStart / step) * step;
    const arr = [];
    for (let y = startTick; y <= viewEnd; y += step) {
      const isMajor = y % majorStep === 0;
      const isCentury = step < 100 && y % 100 === 0;
      arr.push({ year: y, major: isMajor, century: isCentury });
    }
    return arr;
  }, [viewStart, viewEnd]);

  // ============ INTERACTIONS =================
  // pan via mouse drag
  const dragRef = useRef(null);
  const onPointerDown = (e) => {
    if (e.target.closest('.tl-item, .tl-controls, .breadcrumb')) return;
    dragRef.current = {
      startX: e.clientX, startY: e.clientY,
      startViewStart: viewStart, startViewEnd: viewEnd,
      startScrollY: scrollY,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    stageRef.current.dataset.dragging = 'true';
  };
  const onPointerMove = (e) => {
    // cursor year (всегда)
    const rect = stageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const year = scale.xToYear(x);
    setCursorState({ x, year });
    onCursorYearChange && onCursorYearChange(year);

    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const span = dragRef.current.startViewEnd - dragRef.current.startViewStart;
    const dYears = -dx * span / size.w;
    let ns = dragRef.current.startViewStart + dYears;
    let ne = dragRef.current.startViewEnd + dYears;
    // clamp
    if (ns < GLOBAL_MIN) { ne += (GLOBAL_MIN - ns); ns = GLOBAL_MIN; }
    if (ne > GLOBAL_MAX) { ns -= (ne - GLOBAL_MAX); ne = GLOBAL_MAX; }
    setView(ns, ne);
    setScrollY(dragRef.current.startScrollY - dy);
  };
  const onPointerUp = (e) => {
    dragRef.current = null;
    if (stageRef.current) stageRef.current.dataset.dragging = 'false';
  };

  // wheel: cmd/ctrl = zoom; shift = horizontal pan; else vertical scroll
  const onWheel = (e) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const rect = stageRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      zoomAt(x, e.deltaY > 0 ? 1.18 : 1/1.18);
      return;
    }
    if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      // horizontal pan
      const deltaX = e.shiftKey ? e.deltaY : e.deltaX;
      const span = viewEnd - viewStart;
      const dYears = (deltaX / size.w) * span;
      let ns = viewStart + dYears, ne = viewEnd + dYears;
      if (ns < GLOBAL_MIN) { ne += (GLOBAL_MIN - ns); ns = GLOBAL_MIN; }
      if (ne > GLOBAL_MAX) { ns -= (ne - GLOBAL_MAX); ne = GLOBAL_MAX; }
      setView(ns, ne);
      return;
    }
    // vertical scroll
    setScrollY(s => s - e.deltaY);
  };

  // zoom around stage X
  const zoomAt = (x, factor) => {
    const span = viewEnd - viewStart;
    const newSpan = Math.max(MIN_SPAN, Math.min(MAX_SPAN, span * factor));
    if (newSpan === span) return;
    const ratio = x / size.w;
    const yearAt = scale.xToYear(x);
    let ns = yearAt - newSpan * ratio;
    let ne = yearAt + newSpan * (1 - ratio);
    if (ns < GLOBAL_MIN) { ne += (GLOBAL_MIN - ns); ns = GLOBAL_MIN; }
    if (ne > GLOBAL_MAX) { ns -= (ne - GLOBAL_MAX); ne = GLOBAL_MAX; }
    setView(ns, ne);
  };

  const onLeave = () => {
    setCursorState({ x: null, year: null });
    setHover(null);
  };

  // ============== ITEM RENDER ===============
  const renderItem = (item) => {
    const [s, e] = window.itemRange(item);
    const x1 = scale.yearToX(s);
    const x2 = scale.yearToX(e);
    const yBase = itemY(item) + scrollY;
    // Два цвета: область (заливка) + место (вторичный элемент)
    const domainColor = window.colorForItem(item, 'primary');
    const placeColor  = window.colorForItem(item, 'place');
    const isSelected = selected && selected.id === item.id;
    const isDim = selected && selected.id !== item.id;

    // skip off-screen X
    if (x2 < -200 || x1 > size.w + 200) return null;
    // skip off-screen Y
    if (yBase < -40 || yBase > size.h + 40) return null;

    if (item.kind === 'era') {
      const w = Math.max(2, x2 - x1);
      return (
        <div key={item.id}
          className={`tl-item tl-era ${isSelected ? 'selected' : ''}`}
          style={{ left: x1, top: yBase, width: w, '--c': domainColor, '--pc': placeColor }}
          data-dim={isDim ? 'true' : 'false'}
          onClick={(ev) => { ev.stopPropagation(); onSelect(item); }}
          onMouseEnter={(ev) => setHover({ item, x: ev.clientX, y: ev.clientY })}
          onMouseLeave={() => setHover(null)}
        >
          <span className="tl-era-label">{window.itemLabel(item)}</span>
        </div>
      );
    }

    if (item.kind === 'subject') {
      const w = Math.max(8, x2 - x1);
      return (
        <div key={item.id}
          className={`tl-item tl-subject ${isSelected ? 'selected' : ''}`}
          style={{ left: x1, top: yBase, width: w, height: ROW - 4, '--c': domainColor, '--pc': placeColor }}
          data-dim={isDim ? 'true' : 'false'}
          onClick={(ev) => { ev.stopPropagation(); onSelect(item); }}
          onMouseEnter={(ev) => setHover({ item, x: ev.clientX, y: ev.clientY })}
          onMouseLeave={() => setHover(null)}
        >
          <div className="tl-subject-bar"></div>
          <div className="tl-subject-dot start"></div>
          <div className="tl-subject-dot end"></div>
          {w > 40 && <div className="tl-subject-label">{item.name}</div>}
        </div>
      );
    }

    if (item.kind === 'event') {
      return (
        <div key={item.id}
          className={`tl-item tl-event ${isSelected ? 'selected' : ''}`}
          style={{ left: x1, top: yBase, height: ROW, '--c': domainColor, '--pc': placeColor }}
          data-dim={isDim ? 'true' : 'false'}
          onClick={(ev) => { ev.stopPropagation(); onSelect(item); }}
          onMouseEnter={(ev) => setHover({ item, x: ev.clientX, y: ev.clientY })}
          onMouseLeave={() => setHover(null)}
        >
          <div className="tl-event-dot"></div>
          <div className="tl-event-label">{item.name}</div>
        </div>
      );
    }
    return null;
  };

  // breadcrumb если внутри эпохи
  const currentEpoch = useMemo(() => {
    return window.EPOCH_PRESETS.find(ep =>
      viewStart >= ep.start - 50 && viewEnd <= ep.end + 50);
  }, [viewStart, viewEnd]);

  return (
    <div
      className="tl-stage"
      ref={stageRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onLeave}
      onWheel={onWheel}
    >
      <div className="tl-bg" style={{ background: `linear-gradient(to bottom, transparent calc(${axisY}px - 1px), var(--line-strong) calc(${axisY}px - 1px), var(--line-strong) calc(${axisY}px + 1px), transparent calc(${axisY}px + 1px))` }}></div>
      <div className="tl-region-tint kz" style={{ top: 0, height: axisY }}></div>
      <div className="tl-region-tint world" style={{ top: axisY, bottom: 0, height: 'auto', display: showWorld ? '' : 'none' }}></div>

      {/* ось */}
      <div className="tl-axis" style={{ top: axisY }}>
        <div className="tl-axis-line"></div>
        {ticks.filter(t => t.major).map(t => {
          const x = scale.yearToX(t.year);
          if (x < -60 || x > size.w + 60) return null;
          return (
            <div key={t.year} className="tl-axis-label major" style={{ left: x }}>
              {window.formatYearShort(t.year)}
            </div>
          );
        })}
        {ticks.filter(t => !t.major).map(t => {
          const x = scale.yearToX(t.year);
          if (x < -60 || x > size.w + 60) return null;
          const span = viewEnd - viewStart;
          if (span > 4000 && !t.major) return null;
          return (
            <div key={t.year} className="tl-axis-label" style={{ left: x, opacity: 0.6, padding: '1px 4px', fontSize: 9.5 }}>
              {window.formatYearShort(t.year)}
            </div>
          );
        })}
      </div>

      {/* grid сетка */}
      <div className="tl-grid">
        {ticks.map(t => {
          const x = scale.yearToX(t.year);
          if (x < -2 || x > size.w + 2) return null;
          const cls = `tl-grid-tick ${t.major ? 'major' : ''} ${t.century && !t.major ? 'century' : ''}`;
          return <div key={t.year} className={cls} style={{ left: x }}></div>;
        })}
      </div>

      {/* регионы — лейблы */}
      <div className="tl-region-label-wrap kz">
        <span className="tl-region-label">
          <span className="dot" style={{ background: 'var(--c-state)' }}></span>
          КАЗАХСТАН
        </span>
      </div>
      {showWorld && (
        <div className="tl-region-label-wrap world">
          <span className="tl-region-label">
            <span className="dot" style={{ background: 'var(--c-era)' }}></span>
            ВСЕМИРНАЯ ИСТОРИЯ
          </span>
        </div>
      )}

      {/* items */}
      {filtered.map(renderItem)}

      {/* cursor */}
      <div
        className="tl-cursor"
        data-on={cursorState.x !== null}
        style={{ left: cursorState.x || 0 }}
      >
        {cursorState.year !== null && (
          <div className="tl-cursor-label">{window.formatYear(Math.round(cursorState.year))}</div>
        )}
      </div>

      {/* controls */}
      <div className="tl-controls">
        <button className="tl-zoom-btn" onClick={() => zoomAt(size.w/2, 1/1.4)} title="Увеличить">+</button>
        <button className="tl-zoom-btn" onClick={() => zoomAt(size.w/2, 1.4)} title="Уменьшить">−</button>
        <button className="tl-zoom-btn" onClick={() => setView(-1000, 2030)} title="Сбросить вид" style={{ fontSize: 12 }}>⤢</button>
      </div>

      {/* breadcrumb */}
      {currentEpoch && (
        <div className="breadcrumb" style={{ '--c': currentEpoch.color }}>
          <span style={{ color: 'var(--text-3)' }}>эпоха:</span>
          <span className="breadcrumb-zoom" style={{ color: currentEpoch.color }}>{currentEpoch.name}</span>
          <button onClick={() => setView(-1000, 2030)} title="Назад к обзору">×</button>
        </div>
      )}

      {/* подсказка */}
      <div className="tl-hint">
        <span><kbd>⇧</kbd> + scroll — пан</span>
        <span><kbd>⌘</kbd> + scroll — zoom</span>
        <span>drag — двигай</span>
      </div>

      {/* tooltip */}
      {hover && hover.item !== selected && (
        <div
          className="tl-tooltip"
          style={{
            left: hover.x + 14,
            top: hover.y + 14,
            '--c': window.primaryTagOf(hover.item)?.color || 'var(--text-2)',
          }}
        >
          <div className="tl-tooltip-cat">{window.primaryTagOf(hover.item)?.name || ''}</div>
          <div className="tl-tooltip-title">{window.itemLabel(hover.item)}</div>
          <div className="tl-tooltip-yrs">
            {(() => {
              const [s, e] = window.itemRange(hover.item);
              if (hover.item.kind === 'person') return hover.item.lifeSpan;
              if (s === e) return window.formatYear(s);
              return `${window.formatYearShort(s)} — ${window.formatYearShort(e)}`;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Minimap =====
function Minimap({ items, viewStart, viewEnd, setView, showWorld, activeKinds, activeSubkinds }) {
  const wrapRef = useRef();
  const [w, setW] = useState(800);

  useLayoutEffect(() => {
    if (!wrapRef.current) return;
    const update = () => setW(wrapRef.current.clientWidth);
    update();
    const ro = new ResizeObserver(update); ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const MIN_Y = -2000;
  const MAX_Y = 2030;
  const y2x = (y) => ((y - MIN_Y) / (MAX_Y - MIN_Y)) * w;
  const x2y = (x) => MIN_Y + (x / w) * (MAX_Y - MIN_Y);

  const eras = window.EPOCH_PRESETS.filter(ep => ep.start >= MIN_Y || ep.end >= MIN_Y);

  const visibleItems = items.filter(it =>
    (showWorld || window.itemRegion(it) === 'kz') &&
    (!activeKinds || activeKinds.has(it.kind)) &&
    (it.kind !== 'subject' || !activeSubkinds || activeSubkinds.has(it.subkind || 'person'))
  );

  // pan window via drag
  const dragRef = useRef(null);
  const onMouseDown = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const year = x2y(x);
    const span = viewEnd - viewStart;
    // jump center
    let ns = year - span/2, ne = year + span/2;
    if (ns < MIN_Y) { ne += MIN_Y - ns; ns = MIN_Y; }
    if (ne > MAX_Y) { ns -= ne - MAX_Y; ne = MAX_Y; }
    setView(ns, ne);
    dragRef.current = { lastX: e.clientX };
    e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMouseMove = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.lastX;
    dragRef.current.lastX = e.clientX;
    const dYears = (dx / w) * (MAX_Y - MIN_Y);
    let ns = viewStart + dYears, ne = viewEnd + dYears;
    if (ns < MIN_Y) { ne += MIN_Y - ns; ns = MIN_Y; }
    if (ne > MAX_Y) { ns -= ne - MAX_Y; ne = MAX_Y; }
    setView(ns, ne);
  };
  const onMouseUp = () => { dragRef.current = null; };

  return (
    <div className="tl-minimap" ref={wrapRef}>
      <div
        className="tl-minimap-axis"
        onPointerDown={onMouseDown}
        onPointerMove={onMouseMove}
        onPointerUp={onMouseUp}
        onPointerCancel={onMouseUp}
      >
        {eras.map(ep => (
          <div key={ep.id} className="tl-minimap-era"
            style={{
              left: y2x(Math.max(MIN_Y, ep.start)),
              width: y2x(Math.min(MAX_Y, ep.end)) - y2x(Math.max(MIN_Y, ep.start)),
              background: ep.color,
            }}
          />
        ))}
        <div className="tl-minimap-track"></div>
        {visibleItems.map(it => {
          const [s, e] = window.itemRange(it);
          if (e < MIN_Y) return null;
          const x = y2x(Math.max(MIN_Y, s));
          const width = Math.max(2, y2x(e) - x);
          return (
            <div key={it.id}
              className={`tl-minimap-item ${window.itemRegion(it)}`}
              style={{ left: x, width, background: window.colorForItem(it, 'primary') }}
            />
          );
        })}
        <div className="tl-minimap-window"
          style={{
            left: y2x(Math.max(MIN_Y, viewStart)),
            width: y2x(Math.min(MAX_Y, viewEnd)) - y2x(Math.max(MIN_Y, viewStart)),
          }}
        ></div>
      </div>
      <div className="tl-minimap-label start">{window.formatYearShort(MIN_Y)}</div>
      <div className="tl-minimap-label end">{window.formatYearShort(MAX_Y)}</div>
    </div>
  );
}

Object.assign(window, { Timeline, Minimap });
