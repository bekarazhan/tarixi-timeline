/* TarixiTimeline — основной таймлайн.
   Координатная система: год -> X.  Y — слои сверху и снизу от центральной оси.
*/

const { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } = React;

// ===== Zoom Handle constants =====
const HANDLE_WIDTH = 16;
const HANDLE_HEIGHT = 28;
const HANDLE_GRAB_WIDTH = 8;

// Треки: 0=события, 1=субъекты (люди/народы/государства/города…), 2=эпохи
const NUM_TRACKS = 3;

function trackOfItem(item) {
  if (item.kind === 'event')   return 0;
  if (item.kind === 'subject') return 1;
  if (item.kind === 'era')     return 2;
  return 1;
}

const GLOBAL_MIN = -42000;
const GLOBAL_MAX = 2500;        // Extended to 2500 for expansive future exploration
const MIN_SPAN = 8;
const MAX_SPAN = GLOBAL_MAX - GLOBAL_MIN;
// Minimap range - used for synchronized zoom handles and minimap window
const MINIMAP_MIN = -2000;
const MINIMAP_MAX = 2500;       // Extended to 2500 for future exploration space
const CURRENT_YEAR = new Date().getFullYear();

// UX: Present year positioning - present should be a reference point, not an edge
// Present is positioned at ~30% from left in default view for natural future exploration
const PRESENT_TARGET_POSITION = 0.30;  // Present at 30% of viewport width
const PRESENT_BUFFER_FIXED = 50;       // Fixed 50 years after present (increased)
const PRESENT_BUFFER_PERCENT = 0.20;   // 20% of viewport as buffer (increased)

// Future visualization thresholds
const FUTURE_NEAR_END = 2050;   // Near future: 2025-2050 (planned projects)
const FUTURE_MID_END = 2100;    // Mid future: 2050-2100 (speculative projections)
// Far future: 2100-2500 (abstract future space)
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
  items, activeTags, activeKinds, selected, onSelect,
  density, scaleMode, viewStart, viewEnd, setView, onCursorYearChange,
  rowHeight, showConnections, enablePresentBuffer = true,
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

  // -- zoom handle drag state --
  const zoomDragRef = useRef(null); // { mode: 'left'|'right'|'center', startX, startViewStart, startViewEnd }

  const ROW = rowHeight;

  // -- фильтрация --
  const filtered = useMemo(() =>
    items.filter(it =>
      window.isItemVisible(it, activeTags) &&
      (!activeKinds || activeKinds.has(it.kind))
    ),
    [items, activeTags, activeKinds]);

  // -- packing lanes per track --
  // зависит от viewport: при широком зуме события нужно разводить по lanes
  // чтобы лейблы не слипались
  const layout = useMemo(() => {
    const tracks = {};
    for (const it of filtered) {
      const t = trackOfItem(it);
      if (t < 0) continue;
      tracks[t] = tracks[t] || [];
      tracks[t].push(it);
    }
    const viewSpan = Math.max(1, viewEnd - viewStart);
    const yearsPerPx = viewSpan / Math.max(200, size.w);
    const trackMaxLanes = {};
    const itemLanes = new Map();
    for (let t = 0; t < NUM_TRACKS; t++) {
      const arr = (tracks[t] || []).slice();
      arr.sort((a, b) => window.itemRange(a)[0] - window.itemRange(b)[0]);
      const lanes = [];
      for (const it of arr) {
        const [s, e] = window.itemRange(it);
        // pixel-aware минимум: события 130px, субъекты 12px, эпохи 4px
        const minPx = it.kind === 'event' ? 130 : (it.kind === 'subject' ? 12 : 4);
        const minYearsByPx = minPx * yearsPerPx;
        const minSpan = it.kind === 'event' ? Math.max(40, minYearsByPx)
                      : it.kind === 'subject' ? Math.max(10, minYearsByPx)
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
      trackMaxLanes[t] = lanes.length || 1;
    }
    return { trackMaxLanes, itemLanes };
  }, [filtered, viewStart, viewEnd, size.w]);

  // -- scale --
  const scale = useMemo(() =>
    makeScale(viewStart, viewEnd, size.w, scaleMode),
    [viewStart, viewEnd, size.w, scaleMode]);

  // -- axisY и Y items --
  const totalLanesAll = useMemo(() => {
    let sum = 0;
    for (let t = 0; t < NUM_TRACKS; t++) sum += (layout.trackMaxLanes[t] || 1);
    return sum;
  }, [layout]);

  const contentPxHeight = totalLanesAll * ROW + (NUM_TRACKS - 1) * TRACK_GAP;
  const totalPxHeight = contentPxHeight + AXIS_BUFFER + 48;

  // Vertical scroll boundaries
  const maxScrollY = Math.max(0, totalPxHeight - size.h + 80);
  const scrollMinLimit = -50;
  const scrollMaxLimit = maxScrollY + 50;
  const clampedScrollY = Math.max(scrollMinLimit, Math.min(scrollMaxLimit, scrollY));

  // Ось внизу контента, центрированного по экрану
  const axisY = totalPxHeight <= size.h
    ? (size.h - contentPxHeight - AXIS_BUFFER - 48) / 2 + contentPxHeight + AXIS_BUFFER
    : size.h - 60;

  const itemY = useCallback((item) => {
    const t = trackOfItem(item); if (t < 0) return 0;
    const lane = layout.itemLanes.get(item.id) || 0;
    let baseOffset = 0;
    for (let i = 0; i < t; i++) baseOffset += (layout.trackMaxLanes[i] || 1);
    const trackGap = t * TRACK_GAP;
    return axisY - AXIS_BUFFER - (baseOffset + lane + 1) * ROW - trackGap;
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
    if (e.target.closest('.tl-item, .tl-controls, .breadcrumb, .tl-zoom-handles')) return;
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

    // keep tooltip following cursor
    setHover(h => h ? { ...h, x: e.clientX, y: e.clientY } : h);

    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const span = dragRef.current.startViewEnd - dragRef.current.startViewStart;
    const dYears = -dx * span / size.w;
    let ns = dragRef.current.startViewStart + dYears;
    let ne = dragRef.current.startViewEnd + dYears;
    
    // clamp to minimap bounds for consistency preserving the span
    if (ns < MINIMAP_MIN) {
      ns = MINIMAP_MIN;
      ne = ns + span;
    }
    if (ne > MINIMAP_MAX) {
      ne = MINIMAP_MAX;
      ns = ne - span;
    }
    setView(ns, ne);
    // Fix: Mouse drag down should scroll down (increase scrollY), drag up should scroll up (decrease scrollY)
    setScrollY(dragRef.current.startScrollY + dy);
  };
  const onPointerUp = (e) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (stageRef.current) stageRef.current.dataset.dragging = 'false';
    // Close detail panel if user clicked empty space (not dragged)
    if (drag) {
      const moved = Math.abs(e.clientX - drag.startX) + Math.abs(e.clientY - drag.startY);
      if (moved < 5) onSelect(null);
    }
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
      
      // clamp to minimap bounds preserving the span
      if (ns < MINIMAP_MIN) {
        ns = MINIMAP_MIN;
        ne = ns + span;
      }
      if (ne > MINIMAP_MAX) {
        ne = MINIMAP_MAX;
        ns = ne - span;
      }
      setView(ns, ne);
      return;
    }
    // vertical scroll - fix direction: wheel down should scroll down (increase scrollY)
    setScrollY(s => {
      const newScrollY = s + e.deltaY;
      // Clamp to boundaries with soft bounce effect
      return Math.max(scrollMinLimit, Math.min(scrollMaxLimit, newScrollY));
    });
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
    
    // clamp to minimap bounds preserving the span
    if (ns < MINIMAP_MIN) {
      ns = MINIMAP_MIN;
      ne = ns + newSpan;
    }
    if (ne > MINIMAP_MAX) {
      ne = MINIMAP_MAX;
      ns = ne - newSpan;
    }
    setView(ns, ne);
  };

  const onLeave = () => {
    setCursorState({ x: null, year: null });
    setHover(null);
  };

  // ============ ZOOM HANDLE INTERACTIONS =================
  const onZoomHandleDown = (e, mode) => {
    e.stopPropagation();
    e.preventDefault();
    zoomDragRef.current = {
      mode,
      startX: e.clientX,
      startViewStart: viewStart,
      startViewEnd: viewEnd,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onZoomHandleMove = (e) => {
    if (!zoomDragRef.current) return;
    const { mode, startX, startViewStart, startViewEnd } = zoomDragRef.current;
    const dx = e.clientX - startX;
    
    // Convert pixel movement to years using minimap scale for consistency
    const activeW = Math.max(100, size.w - 28);
    const dYears = (dx / activeW) * (MINIMAP_MAX - MINIMAP_MIN);
    const symmetric = e.ctrlKey || e.metaKey;

    let ns = startViewStart;
    let ne = startViewEnd;

    if (mode === 'center') {
      // Pan without changing scale
      ns = startViewStart + dYears;
      ne = startViewEnd + dYears;
    } else if (mode === 'left') {
      if (symmetric) {
        // Symmetric zoom from center
        const center = (startViewStart + startViewEnd) / 2;
        const newHalfSpan = Math.max(MIN_SPAN / 2, (startViewEnd - center) - dYears);
        ns = center - newHalfSpan;
        ne = center + newHalfSpan;
      } else {
        // Only move left edge
        ns = startViewStart + dYears;
      }
    } else if (mode === 'right') {
      if (symmetric) {
        // Symmetric zoom from center
        const center = (startViewStart + startViewEnd) / 2;
        const newHalfSpan = Math.max(MIN_SPAN / 2, (center - startViewStart) + dYears);
        ns = center - newHalfSpan;
        ne = center + newHalfSpan;
      } else {
        // Only move right edge
        ne = startViewEnd + dYears;
      }
    }

    // Clamp to minimap bounds (same as minimap window)
    const currentSpan = ne - ns;
    if (ns < MINIMAP_MIN) { ns = MINIMAP_MIN; ne = ns + currentSpan; }
    if (ne > MINIMAP_MAX) { ne = MINIMAP_MAX; ns = ne - currentSpan; }
    if (currentSpan < MIN_SPAN) {
      const center = (ns + ne) / 2;
      ns = center - MIN_SPAN / 2;
      ne = center + MIN_SPAN / 2;
    }
    if (currentSpan > (MINIMAP_MAX - MINIMAP_MIN)) {
      ns = MINIMAP_MIN;
      ne = MINIMAP_MAX;
    }

    setView(ns, ne);
  };

  const onZoomHandleUp = (e) => {
    if (zoomDragRef.current) {
      zoomDragRef.current = null;
    }
  };

  const onZoomHandleDoubleClick = (e, mode) => {
    e.stopPropagation();
    // Reset to minimap full range
    setView(MINIMAP_MIN, MINIMAP_MAX);
  };

  // Handle keyboard release for zoom drag
  useEffect(() => {
    const handleKeyUp = () => {
      if (zoomDragRef.current) {
        zoomDragRef.current = null;
      }
    };
    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, []);

  // Non-passive wheel listener — React registers onWheel as passive since v17,
  // which makes preventDefault() a no-op and lets the browser trigger back/forward
  // navigation on horizontal swipe. We attach directly to the DOM to bypass this.
  const onWheelRef = useRef(onWheel);
  useEffect(() => { onWheelRef.current = onWheel; });
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const handler = (e) => onWheelRef.current(e);
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  // ============== ITEM RENDER ===============
  const renderItem = (item) => {
    const [s, e] = window.itemRange(item);
    const x1 = scale.yearToX(s);
    const x2 = scale.yearToX(e);
    const yBase = itemY(item) + clampedScrollY;
    // Всегда используем цвет области (domain) для заливки
    const domainColor = window.colorForItem(item, activeTags);
    
    const isSelected = selected && selected.id === item.id;
    const isDim = selected && selected.id !== item.id;

    // skip off-screen X
    if (x2 < -200 || x1 > size.w + 200) return null;
    // skip off-screen Y
    if (yBase < -40 || yBase > size.h + 40) return null;

    if (item.kind === 'era') {
      const w = Math.max(2, x2 - x1);
      const stickyOffset = x1 < 0 && x2 > 40 ? Math.max(0, Math.min(-x1, w - 120)) : 0;
      return (
        <div key={item.id}
          className={`tl-item tl-era ${isSelected ? 'selected' : ''}`}
          style={{ left: x1, top: yBase, width: w, '--c': domainColor }}
          data-dim={isDim ? 'true' : 'false'}
          onClick={(ev) => { ev.stopPropagation(); onSelect(item); }}
          onMouseEnter={(ev) => setHover({ item, x: ev.clientX, y: ev.clientY })}
          onMouseLeave={() => setHover(null)}
        >
          <span
            className="tl-era-label"
            style={stickyOffset > 0 ? { transform: `translateX(${stickyOffset}px)`, display: 'inline-block' } : null}
          >
            {window.itemLabel(item)}
          </span>
        </div>
      );
    }

    if (item.kind === 'subject') {
      const w = Math.max(8, x2 - x1);
      const isAlive = item.alive || (item.lifeSpan && item.lifeSpan.includes('н.в.'));
      const stickyOffset = x1 < 0 && x2 > 40 ? Math.max(0, Math.min(-x1, w - 120)) : 0;
      return (
        <div key={item.id}
          className={`tl-item tl-subject ${isSelected ? 'selected' : ''} ${isAlive ? 'alive' : ''}`}
          style={{ left: x1, top: yBase, width: w, height: ROW - 4, '--c': domainColor }}
          data-dim={isDim ? 'true' : 'false'}
          onClick={(ev) => { ev.stopPropagation(); onSelect(item); }}
          onMouseEnter={(ev) => setHover({ item, x: ev.clientX, y: ev.clientY })}
          onMouseLeave={() => setHover(null)}
        >
          <div className="tl-subject-bar"></div>
          <div className="tl-subject-dot start"></div>
          {!isAlive && <div className="tl-subject-dot end"></div>}
          {w > 40 && (
            <div
              className="tl-subject-label"
              style={stickyOffset > 0 ? { transform: `translate(${stickyOffset}px, -130%)` } : null}
            >
              {item.name}
            </div>
          )}
        </div>
      );
    }

    if (item.kind === 'event') {
      return (
        <div key={item.id}
          className={`tl-item tl-event ${isSelected ? 'selected' : ''}`}
          style={{ left: x1, top: yBase, height: ROW, '--c': domainColor }}
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

  // Determine scroll boundary states for visual feedback
  const atTop = clampedScrollY <= scrollMinLimit + 10;
  const atBottom = clampedScrollY >= scrollMaxLimit - 10;

  return (
    <div
      className="tl-stage"
      ref={stageRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onLeave}
      data-scroll-at-top={atTop ? 'true' : 'false'}
      data-scroll-at-bottom={atBottom ? 'true' : 'false'}
    >
      {/* Scroll boundary indicators */}
      <div className="tl-scroll-boundary-top"></div>
      <div className="tl-scroll-boundary-bottom"></div>
      
      <div className="tl-bg" style={{ background: `linear-gradient(to bottom, transparent calc(${axisY}px - 1px), var(--line-strong) calc(${axisY}px - 1px), var(--line-strong) calc(${axisY}px + 1px), transparent calc(${axisY}px + 1px))` }}></div>
      <div className="tl-region-tint" style={{ top: 0, bottom: 0 }}></div>

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

      {/* Future visualization layers - visual distinction for future time periods */}
      {viewEnd > CURRENT_YEAR && (
        <>
          {/* Near Future (2025-2050) - subtle tint */}
          {viewEnd > CURRENT_YEAR && (
            <div
              className="tl-future-zone tl-future-near"
              style={{
                left: scale.yearToX(Math.max(CURRENT_YEAR, viewStart)),
                width: Math.max(0, scale.yearToX(Math.min(FUTURE_NEAR_END, viewEnd)) - scale.yearToX(Math.max(CURRENT_YEAR, viewStart))),
              }}
              title="Ближнее будущее: период планируемых проектов и прогнозов"
            ></div>
          )}
          
          {/* Mid Future (2050-2100) - stronger tint with pattern */}
          {viewEnd > FUTURE_NEAR_END && (
            <div
              className="tl-future-zone tl-future-mid"
              style={{
                left: scale.yearToX(Math.max(FUTURE_NEAR_END, viewStart)),
                width: Math.max(0, scale.yearToX(Math.min(FUTURE_MID_END, viewEnd)) - scale.yearToX(Math.max(FUTURE_NEAR_END, viewStart))),
              }}
              title="Среднее будущее: спекулятивные прогнозы и долгосрочные планы"
            ></div>
          )}
          
          {/* Far Future (2100-2500) - abstract future space */}
          {viewEnd > FUTURE_MID_END && (
            <div
              className="tl-future-zone tl-future-far"
              style={{
                left: scale.yearToX(Math.max(FUTURE_MID_END, viewStart)),
                width: Math.max(0, scale.yearToX(Math.min(FUTURE_MID_END + 400, viewEnd)) - scale.yearToX(Math.max(FUTURE_MID_END, viewStart))),
              }}
              title="Далёкое будущее: пространство для воображения и гипотез"
            ></div>
          )}
        </>
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

      {/* Present Day Marker - visual anchor for current year */}
      {enablePresentBuffer && viewEnd > CURRENT_YEAR - 50 && viewStart < CURRENT_YEAR + 50 && (
        <div
          className="tl-present-marker"
          style={{ left: scale.yearToX(CURRENT_YEAR) }}
          title={`Настоящее время: ${CURRENT_YEAR}`}
        >
          <div className="tl-present-line"></div>
          <div className="tl-present-label">Present</div>
        </div>
      )}

      {/* controls */}
      <div className="tl-controls">
        <button className="tl-zoom-btn" onClick={() => zoomAt(size.w/2, 1/1.4)} title="Увеличить">+</button>
        <button className="tl-zoom-btn" onClick={() => zoomAt(size.w/2, 1.4)} title="Уменьшить">−</button>
        <button className="tl-zoom-btn" onClick={() => setView(-500, 2400)} title="Сбросить вид" style={{ fontSize: 12 }}>⤢</button>
      </div>

      {/* Vertical scroll indicator - shows current vertical position */}
      {totalPxHeight > size.h && (
        <VerticalScrollIndicator
          scrollY={clampedScrollY}
          maxScrollY={maxScrollY}
          totalHeight={totalPxHeight}
          viewportHeight={size.h}
          onScroll={(newScrollY) => setScrollY(newScrollY)}
        />
      )}

      {/* zoom handles */}
      <ZoomHandles
        viewStart={viewStart}
        viewEnd={viewEnd}
        width={Math.max(100, size.w - 28)}
        onHandleDown={onZoomHandleDown}
        onHandleMove={onZoomHandleMove}
        onHandleUp={onZoomHandleUp}
        onHandleDoubleClick={onZoomHandleDoubleClick}
      />

      {/* breadcrumb */}
      {currentEpoch && (
        <div className="breadcrumb" style={{ '--c': currentEpoch.color }}>
          <span style={{ color: 'var(--text-3)' }}>эпоха:</span>
          <span className="breadcrumb-zoom" style={{ color: currentEpoch.color }}>{currentEpoch.name}</span>
          <button onClick={() => setView(-500, 2400)} title="Назад к обзору">×</button>
        </div>
      )}

      {/* подсказка */}
      <div className="tl-hint">
        <span><kbd>⇧</kbd> + scroll — пан</span>
        <span><kbd>⌘</kbd> + scroll — zoom</span>
        <span>drag — двигай</span>
        <span>wheel — ↕ треки</span>
      </div>

      {/* tooltip */}
      {hover && hover.item !== selected && (
        <div
          className="tl-tooltip"
          data-has-photo={!!hover.item.photoUrl}
          style={{
            left: hover.x + (hover.x + 180 > window.innerWidth ? -194 : 14),
            top: hover.y + (hover.y + (hover.item.photoUrl ? 240 : 100) > window.innerHeight ? -(hover.item.photoUrl ? 244 : 104) : 14),
            '--c': window.primaryTagOf(hover.item)?.color || 'var(--text-2)',
          }}
        >
          {hover.item.photoUrl && (
            <div className="tl-tooltip-photo">
              <img src={hover.item.photoUrl} alt={hover.item.name} />
            </div>
          )}
          <div className="tl-tooltip-cat">{window.primaryTagOf(hover.item)?.name || ''}</div>
          <div className="tl-tooltip-title">{window.itemLabel(hover.item)}</div>
          <div className="tl-tooltip-yrs">
            {(() => {
              const [s, e] = window.itemRange(hover.item);
              if (hover.item.kind === 'subject' && hover.item.lifeSpan) return hover.item.lifeSpan;
              if (s === e) return window.formatYear(s);
              return `${window.formatYearShort(s)} — ${window.formatYearShort(e)}`;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Zoom Handles Component =====
// Uses the same minimap coordinate system for synchronized positioning
function ZoomHandles({ viewStart, viewEnd, width, onHandleDown, onHandleMove, onHandleUp, onHandleDoubleClick }) {
  const [hoveredHandle, setHoveredHandle] = useState(null); // 'left' | 'right' | 'center' | null
  const [isDragging, setIsDragging] = useState(false);
  const [symmetricMode, setSymmetricMode] = useState(false);

  // Track Ctrl/Meta key for symmetric zoom indicator
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) setSymmetricMode(true);
    };
    const handleKeyUp = () => setSymmetricMode(false);
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handlePointerDown = (e, mode) => {
    setIsDragging(true);
    onHandleDown(e, mode);
  };

  const handlePointerMove = (e) => {
    if (isDragging) {
      onHandleMove(e);
    }
  };

  const handlePointerUp = (e) => {
    if (isDragging) {
      setIsDragging(false);
      onHandleUp(e);
    }
  };

  const handleMouseEnter = (mode) => {
    if (!isDragging) {
      setHoveredHandle(mode);
    }
  };

  const handleMouseLeave = () => {
    if (!isDragging) {
      setHoveredHandle(null);
    }
  };

  const span = viewEnd - viewStart;
  
  // Use minimap coordinate system for consistent positioning
  // This ensures zoom handles align with minimap window
  const yearToX = (y) => ((y - MINIMAP_MIN) / (MINIMAP_MAX - MINIMAP_MIN)) * width;
  
  // Calculate handle positions using minimap scale - same as minimap window  
  // Clamp to minimap bounds for perfect synchronization with minimap window
  const handleLeft = Math.max(0, Math.min(width, yearToX(Math.max(MINIMAP_MIN, viewStart))));
  const handleRight = Math.max(0, Math.min(width, yearToX(Math.min(MINIMAP_MAX, viewEnd))));
  
  // Center area between handles - this is our visible window (same as minimap window)
  const centerLeft = handleLeft + HANDLE_WIDTH / 2;
  const centerWidth = Math.max(0, handleRight - handleLeft - HANDLE_WIDTH);

  const formatYear = (year) => {
    return window.formatYearShort(Math.round(year));
  };

  const formatSpan = (years) => {
    if (years >= 1000) return `${(years / 1000).toFixed(1)} тыс. лет`;
    if (years >= 100) return `${Math.round(years / 10) * 10} лет`;
    return `${Math.round(years)} лет`;
  };

  return (
    <div className={`tl-zoom-handles ${symmetricMode ? 'symmetric-mode' : ''}`} style={{ width }}>
      {/* Visible range indicator - shows the current view window on the timeline */}
      <div
        className="tl-zoom-range-indicator"
        style={{
          left: handleLeft,
          width: Math.max(0, handleRight - handleLeft)
        }}
      />
      
      {/* Left handle - positioned where view starts on timeline */}
      <div
        className={`tl-zoom-handle tl-zoom-handle-left ${hoveredHandle === 'left' || isDragging ? 'hovered' : ''} ${symmetricMode ? 'symmetric' : ''}`}
        style={{ left: handleLeft - HANDLE_WIDTH / 2 }}
        onPointerDown={(e) => handlePointerDown(e, 'left')}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseEnter={() => handleMouseEnter('left')}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={(e) => onHandleDoubleClick(e, 'left')}
        title="Тяните для изменения начала периода. Ctrl+тяните для симметричного зума. Двойной клик — полный масштаб."
      >
        <div className="tl-zoom-handle-bar"></div>
        <div className="tl-zoom-handle-grip"></div>
        <div className="tl-zoom-handle-label">
          {formatYear(viewStart)}
        </div>
      </div>

      {/* Right handle */}
      <div
        className={`tl-zoom-handle tl-zoom-handle-right ${hoveredHandle === 'right' || isDragging ? 'hovered' : ''} ${symmetricMode ? 'symmetric' : ''}`}
        style={{ left: handleRight - HANDLE_WIDTH / 2 }}
        onPointerDown={(e) => handlePointerDown(e, 'right')}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseEnter={() => handleMouseEnter('right')}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={(e) => onHandleDoubleClick(e, 'right')}
        title="Тяните для изменения конца периода. Ctrl+тяните для симметричного зума. Двойной клик — полный масштаб."
      >
        <div className="tl-zoom-handle-bar"></div>
        <div className="tl-zoom-handle-grip"></div>
        <div className="tl-zoom-handle-label tl-zoom-handle-label-right">
          {formatYear(viewEnd)}
        </div>
      </div>

      {/* Center pan area */}
      <div
        className={`tl-zoom-handle-center ${hoveredHandle === 'center' || isDragging ? 'hovered' : ''}`}
        style={{ left: centerLeft, width: centerWidth }}
        onPointerDown={(e) => handlePointerDown(e, 'center')}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseEnter={() => handleMouseEnter('center')}
        onMouseLeave={handleMouseLeave}
        title="Тяните для перемещения по временной шкале"
      >
        {centerWidth > 60 && (
          <div className="tl-zoom-handle-center-info">
            {formatSpan(span)}
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Vertical Scroll Indicator =====
function VerticalScrollIndicator({ scrollY, maxScrollY, totalHeight, viewportHeight, onScroll }) {
  const trackRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartScrollY, setDragStartScrollY] = useState(0);

  const scrollableHeight = Math.max(0, totalHeight - viewportHeight);
  const thumbHeight = Math.max(20, (viewportHeight / totalHeight) * viewportHeight);
  const trackHeight = viewportHeight - 40;
  const thumbMaxPosition = trackHeight - thumbHeight;
  const scrollProgress = scrollableHeight > 0 ? scrollY / scrollableHeight : 0;
  const thumbTop = 20 + scrollProgress * thumbMaxPosition;

  const handlePointerDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    setDragStartY(e.clientY);
    setDragStartScrollY(scrollY);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !trackRef.current) return;
    const deltaY = e.clientY - dragStartY;
    const deltaScroll = (deltaY / trackHeight) * scrollableHeight;
    onScroll(Math.max(0, Math.min(maxScrollY, dragStartScrollY + deltaScroll)));
  };

  const handlePointerUp = () => setIsDragging(false);

  const handleClick = (e) => {
    if (e.target.closest('.tl-vscroll-thumb')) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickProgress = Math.max(0, Math.min(1, (e.clientY - rect.top - 20) / trackHeight));
    onScroll(Math.max(0, Math.min(maxScrollY, clickProgress * scrollableHeight)));
  };

  return (
    <div className="tl-vscroll-container">
      <div className="tl-vscroll-track" ref={trackRef} onClick={handleClick}>
        <div
          className="tl-vscroll-thumb"
          style={{ top: thumbTop, height: thumbHeight }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          title="Перетащите для прокрутки"
        />
      </div>
    </div>
  );
}

// ===== Minimap =====
// Uses MINIMAP_MIN/MINIMAP_MAX constants defined at top of file

function Minimap({ items, viewStart, viewEnd, setView, activeKinds, enablePresentBuffer = true }) {
  const wrapRef = useRef();
  const [w, setW] = useState(800);

  useLayoutEffect(() => {
    if (!wrapRef.current) return;
    const update = () => setW(wrapRef.current.clientWidth);
    update();
    const ro = new ResizeObserver(update); ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const axisW = Math.max(100, w - 28);
  const y2x = (y) => ((y - MINIMAP_MIN) / (MINIMAP_MAX - MINIMAP_MIN)) * axisW;
  const x2y = (x) => MINIMAP_MIN + (x / axisW) * (MINIMAP_MAX - MINIMAP_MIN);

  const eras = window.EPOCH_PRESETS.filter(ep => ep.start >= MINIMAP_MIN || ep.end >= MINIMAP_MIN);

  const visibleItems = items.filter(it => (!activeKinds || activeKinds.has(it.kind)));

  // pan window via drag
  const dragRef = useRef(null);
  const onMouseDown = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 14;
    const year = x2y(x);
    const span = viewEnd - viewStart;
    // jump center
    let ns = year - span/2, ne = year + span/2;
    if (ns < MINIMAP_MIN) { ne += MINIMAP_MIN - ns; ns = MINIMAP_MIN; }
    if (ne > MINIMAP_MAX) { ns -= ne - MINIMAP_MAX; ne = MINIMAP_MAX; }
    setView(ns, ne);
    dragRef.current = { lastX: e.clientX };
    e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMouseMove = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.lastX;
    dragRef.current.lastX = e.clientX;
    const dYears = (dx / axisW) * (MINIMAP_MAX - MINIMAP_MIN);
    let ns = viewStart + dYears, ne = viewEnd + dYears;
    if (ns < MINIMAP_MIN) { ne += MINIMAP_MIN - ns; ns = MINIMAP_MIN; }
    if (ne > MINIMAP_MAX) { ns -= ne - MINIMAP_MAX; ne = MINIMAP_MAX; }
    setView(ns, ne);
  };
  const onMouseUp = () => { dragRef.current = null; };

  // Calculate minimap window position clamped to minimap range
  const windowLeft = y2x(Math.max(MINIMAP_MIN, viewStart));
  const windowRight = y2x(Math.min(MINIMAP_MAX, viewEnd));
  const windowWidth = Math.max(0, windowRight - windowLeft);

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
              left: y2x(Math.max(MINIMAP_MIN, ep.start)),
              width: y2x(Math.min(MINIMAP_MAX, ep.end)) - y2x(Math.max(MINIMAP_MIN, ep.start)),
              background: ep.color,
            }}
          />
        ))}
        {/* Future zones on minimap - visual structure for future exploration */}
        {enablePresentBuffer && (
          <>
            {/* Near Future */}
            <div
              className="tl-minimap-future-near"
              style={{
                left: y2x(CURRENT_YEAR),
                width: Math.max(0, y2x(FUTURE_NEAR_END) - y2x(CURRENT_YEAR)),
              }}
              title="Ближнее будущее: 2025-2050"
            ></div>
            {/* Mid Future */}
            <div
              className="tl-minimap-future-mid"
              style={{
                left: y2x(FUTURE_NEAR_END),
                width: Math.max(0, y2x(FUTURE_MID_END) - y2x(FUTURE_NEAR_END)),
              }}
              title="Среднее будущее: 2050-2100"
            ></div>
            {/* Far Future */}
            <div
              className="tl-minimap-future-far"
              style={{
                left: y2x(FUTURE_MID_END),
                width: Math.max(0, y2x(GLOBAL_MAX) - y2x(FUTURE_MID_END)),
              }}
              title="Далёкое будущее: 2100-2500"
            ></div>
          </>
        )}
        {/* Present year buffer zone indicator (overlay on near future) */}
        {enablePresentBuffer && (
          <div
            className="tl-minimap-present-zone"
            style={{
              left: y2x(CURRENT_YEAR),
              width: Math.max(0, y2x(CURRENT_YEAR + PRESENT_BUFFER_FIXED) - y2x(CURRENT_YEAR)),
            }}
            title={`Буферная зона настоящего времени: ${CURRENT_YEAR} — ${CURRENT_YEAR + PRESENT_BUFFER_FIXED}`}
          ></div>
        )}
        <div className="tl-minimap-track"></div>
        {visibleItems.map(it => {
          const [s, e] = window.itemRange(it);
          if (e < MINIMAP_MIN) return null;
          const x = y2x(Math.max(MINIMAP_MIN, s));
          const width = Math.max(2, y2x(e) - x);
          return (
            <div key={it.id}
              className={`tl-minimap-item ${window.itemRegion(it)}`}
              style={{ left: x, width, background: window.colorForItem(it) }}
            />
          );
        })}
        <div className="tl-minimap-window"
          style={{
            left: windowLeft,
            width: windowWidth,
          }}
        ></div>
      </div>
      <div className="tl-minimap-label start">{window.formatYearShort(MINIMAP_MIN)}</div>
      <div className="tl-minimap-label end">{window.formatYearShort(MINIMAP_MAX)}</div>
    </div>
  );
}

Object.assign(window, { Timeline, Minimap });
