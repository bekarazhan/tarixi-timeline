/* Tarixi-Timeline - грант «Тәуелсіздік ұрпақтары» презентациясы (10 слайд, қазақша)
   Тёмная тема — палитра приложения (--bg-1 фон, золото+синий акцент, теги для диаграмм). */
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const FA = require("react-icons/fa");

// ---------- палитра приложения (тёмная тема «data») ----------
const C = {
  bg:      "0C0E15",  // --bg-1, фон контент-слайдов
  bgDeep:  "07080C",  // --bg-0, титул и финал
  panel:   "141826",  // полосы/секции
  card:    "181C28",  // --bg-3, карточки
  line:    "2E3447",  // --line-strong
  lineSoft:"232838",  // --line
  text:    "F5F6FA",  // --text-0
  text2:   "C6CAD8",  // --text-1
  muted:   "8B91A4",  // --text-2
  faint:   "5E6478",  // --text-3
  gold:    "E6B94A",  // --c-ruler, основной акцент
  goldDk:  "C9962B",
  blue:    "38BDF8",  // --c-state
  cyan:    "5CD4EC",  // --c-thinker
};
// теги приложения для диаграммы бюджета
const TAGS = ["38BDF8", "5CD4EC", "E6B94A", "F7903A", "B27CFF", "EF5A6A", "5FD49A"];

const FONT_H = "Times New Roman";
const FONT_B = "Calibri";
const GLYPH = "#" + C.bgDeep; // тёмные глифы в золотых кружках

// ---------- иконкалар ----------
async function icon(IconComp, color = GLYPH, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComp, { color, size: String(size) })
  );
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + png.toString("base64");
}

const shadow = () => ({ type: "outer", color: "000000", blur: 10, offset: 3, angle: 135, opacity: 0.4 });

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "Bekassyl Karazhan";
  pres.title = "Tarixi-Timeline - Тәуелсіздік ұрпақтары";
  const W = 13.333, H = 7.5;

  const ic = {
    book:     await icon(FA.FaBookOpen),
    brain:    await icon(FA.FaBrain),
    comments: await icon(FA.FaComments),
    clock:    await icon(FA.FaStream),
    robot:    await icon(FA.FaRobot),
    users:    await icon(FA.FaUsers),
    grad:     await icon(FA.FaGraduationCap),
    flag:     await icon(FA.FaFlag),
    heart:    await icon(FA.FaHeart),
    code:     await icon(FA.FaCode),
    server:   await icon(FA.FaServer),
    rocket:   await icon(FA.FaRocket),
    chart:    await icon(FA.FaChartLine),
    bulb:     await icon(FA.FaLightbulb),
    map:      await icon(FA.FaMapMarkedAlt),
    seedling: await icon(FA.FaSeedling),
    user:     await icon(FA.FaUserTie),
    env:      await icon(FA.FaEnvelope),
    gh:       await icon(FA.FaGithub),
  };

  // ---------- хелперы ----------
  function timelineMotif(slide, x, y, w, dots = 5, color = C.gold) {
    slide.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color, width: 2 } });
    for (let i = 0; i < dots; i++) {
      const cx = x + (w / (dots - 1)) * i;
      slide.addShape(pres.shapes.OVAL, { x: cx - 0.06, y: y - 0.06, w: 0.12, h: 0.12, fill: { color } });
    }
  }
  function kicker(slide, text) {
    slide.addText(text.toUpperCase(), {
      x: 0.7, y: 0.5, w: 11.8, h: 0.35, margin: 0,
      fontFace: FONT_B, fontSize: 12, bold: true, color: C.gold, charSpacing: 2,
    });
  }
  function title(slide, text) {
    slide.addText(text, {
      x: 0.7, y: 0.82, w: 12, h: 0.95, margin: 0,
      fontFace: FONT_H, fontSize: 32, bold: true, color: C.text,
    });
  }
  function pageNum(slide, n) {
    slide.addText(`${n} / 10`, { x: W - 1.6, y: H - 0.55, w: 1.1, h: 0.3, margin: 0, fontFace: FONT_B, fontSize: 10, color: C.faint, align: "right" });
    slide.addText("Tarixi-Timeline", { x: 0.7, y: H - 0.55, w: 4, h: 0.3, margin: 0, fontFace: FONT_B, fontSize: 10, color: C.faint });
  }
  // золотой кружок с тёмной иконкой
  function iconChip(slide, x, y, d, iconData) {
    slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: C.gold } });
    const pad = d * 0.27;
    slide.addImage({ data: iconData, x: x + pad, y: y + pad, w: d - pad * 2, h: d - pad * 2 });
  }
  // тонкая рамка под изображение
  function frame(slide, x, y, w, h) {
    slide.addShape(pres.shapes.RECTANGLE, { x: x - 0.045, y: y - 0.045, w: w + 0.09, h: h + 0.09, fill: { color: C.card }, line: { color: C.line, width: 1 }, shadow: shadow() });
  }

  // ========================================================
  // СЛАЙД 1 - Титул
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.bgDeep };
    s.addShape(pres.shapes.OVAL, { x: W - 3.2, y: -2.2, w: 5.5, h: 5.5, fill: { color: C.blue, transparency: 88 }, line: { type: "none" } });
    s.addShape(pres.shapes.OVAL, { x: W - 1.6, y: H - 2.6, w: 3.2, h: 3.2, fill: { color: C.gold, transparency: 86 }, line: { type: "none" } });

    s.addText("ТӘУЕЛСІЗДІК ҰРПАҚТАРЫ · ГРАНТ", { x: 0.9, y: 1.35, w: 9, h: 0.4, margin: 0, fontFace: FONT_B, fontSize: 14, bold: true, color: C.gold, charSpacing: 4 });
    s.addText("Tarixi-Timeline", { x: 0.85, y: 1.95, w: 11.5, h: 1.3, margin: 0, fontFace: FONT_H, fontSize: 64, bold: true, color: C.text });
    s.addText("Қазақстан тарихы мен әдебиетін зерттеуге арналған интерактивті білім беру платформасы", { x: 0.9, y: 3.35, w: 9.8, h: 0.9, margin: 0, fontFace: FONT_B, fontSize: 20, color: C.text2, lineSpacingMultiple: 1.1 });

    timelineMotif(s, 0.92, 4.7, 6.2, 6);

    s.addText([{ text: "Бағыт:  ", options: { bold: true, color: C.gold } }, { text: "Ақпараттық технологиялар (EdTech)", options: { color: C.text2 } }], { x: 0.9, y: 5.5, w: 11, h: 0.4, margin: 0, fontFace: FONT_B, fontSize: 15 });
    s.addText([{ text: "Грант сомасы:  ", options: { bold: true, color: C.gold } }, { text: "3 000 000 теңге", options: { color: C.text2 } }], { x: 0.9, y: 5.95, w: 11, h: 0.4, margin: 0, fontFace: FONT_B, fontSize: 15 });
    s.addText("Bekassyl Karazhan · ҚР ПІБ МТҚБ Инженерлік орталығының бас бағдарламашысы, техника ғылымдарының магистрі", { x: 0.9, y: 6.5, w: 12, h: 0.4, margin: 0, fontFace: FONT_B, fontSize: 12, italic: true, color: C.muted });
  }

  // ========================================================
  // СЛАЙД 2 - Мәселе
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    kicker(s, "Мәселе");
    title(s, "Тарих жаттауға айналды, түсінуге емес");

    s.addText("Қазіргі мектептегі Қазақстан тарихы мен әдебиетін оқыту негізінен даталар мен фактілерді механикалық жаттауға бағытталған. Бұл пәнді үстірт қабылдауды қалыптастырады және оқушылардың қызығушылығын төмендетеді.", { x: 0.7, y: 1.85, w: 6.05, h: 2.0, margin: 0, fontFace: FONT_B, fontSize: 16, color: C.text2, lineSpacingMultiple: 1.25 });

    s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 4.05, w: 6.05, h: 0.06, fill: { color: C.gold } });
    s.addText([
      { text: "Басты кемшілік — эмпатиялық байланыстың жоқтығы.\n", options: { bold: true, color: C.gold, fontSize: 16 } },
      { text: "Оқушылар тарихи тұлғаларды мінезі мен дәуір контексі бар нақты адамдар ретінде емес, оқулықтағы дерексіз есімдер ретінде қабылдайды.", options: { color: C.text2, fontSize: 15 } },
    ], { x: 0.7, y: 4.25, w: 6.05, h: 1.7, margin: 0, fontFace: FONT_B, lineSpacingMultiple: 1.2 });

    const cards = [
      { icon: ic.book, big: "Жаттау", sub: "белсенді ойлаудың орнына" },
      { icon: ic.heart, big: "Төмен қызығушылық", sub: "ұлттық тарихқа деген" },
      { icon: ic.brain, big: "Фрагментті білім", sub: "жүйелі түсініктің орнына" },
    ];
    let cy = 1.85;
    cards.forEach((c) => {
      s.addShape(pres.shapes.RECTANGLE, { x: 7.05, y: cy, w: 5.55, h: 1.45, fill: { color: C.card }, line: { color: C.line, width: 1 }, shadow: shadow() });
      iconChip(s, 7.35, cy + 0.42, 0.62, c.icon);
      s.addText(c.big, { x: 8.2, y: cy + 0.28, w: 4.2, h: 0.45, margin: 0, fontFace: FONT_H, fontSize: 19, bold: true, color: C.text });
      s.addText(c.sub, { x: 8.2, y: cy + 0.78, w: 4.2, h: 0.4, margin: 0, fontFace: FONT_B, fontSize: 13, color: C.muted });
      cy += 1.63;
    });
    pageNum(s, 2);
  }

  // ========================================================
  // СЛАЙД 3 - Шешім
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    kicker(s, "Шешім");
    title(s, "Оқудан — сұхбатқа");

    s.addText("«Tarixi-Timeline» платформасы екі құралды біріктіреді және оқуды пассивті оқу режимінен белсенді коммуникация режиміне көшіреді.", { x: 0.7, y: 1.8, w: 11.8, h: 0.8, margin: 0, fontFace: FONT_B, fontSize: 17, color: C.text2, lineSpacingMultiple: 1.2 });

    const mods = [
      { icon: ic.clock, t: "Интерактивті хронологиялық таймлайн", d: "Тарихи оқиғаларды, даталар мен әдеби дәуірлерді көрнекі әрі құрылымды түрде ұсынады. Оқушы уақыт осінде еркін шарлап, тұлғалар мен оқиғалардың өзара байланысын көреді." },
      { icon: ic.robot, t: "Тарихи тұлғалармен ИИ-чат", d: "Генеративті тіл модельдері (LLM) негізінде Қазақстанның тарихи тұлғаларының виртуалды бейнелерімен тірі диалог. Әр агент дәуірге сай мінез бен дәйектілікке ие." },
    ];
    let mx = 0.7;
    mods.forEach((m) => {
      s.addShape(pres.shapes.RECTANGLE, { x: mx, y: 2.85, w: 5.9, h: 3.6, fill: { color: C.card }, line: { color: C.line, width: 1 }, shadow: shadow() });
      s.addShape(pres.shapes.RECTANGLE, { x: mx, y: 2.85, w: 5.9, h: 0.12, fill: { color: C.gold } });
      iconChip(s, mx + 0.45, 3.35, 0.95, m.icon);
      s.addText(m.t, { x: mx + 0.45, y: 4.5, w: 5.0, h: 0.85, margin: 0, fontFace: FONT_H, fontSize: 19, bold: true, color: C.text, lineSpacingMultiple: 1.0 });
      s.addText(m.d, { x: mx + 0.45, y: 5.3, w: 5.05, h: 1.05, margin: 0, fontFace: FONT_B, fontSize: 13, color: C.text2, lineSpacingMultiple: 1.15 });
      mx += 6.2;
    });
    pageNum(s, 3);
  }

  // ========================================================
  // СЛАЙД 4 - Қалай жұмыс істейді
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    kicker(s, "Өнім · Қалай жұмыс істейді");
    title(s, "Үш қадамда — тарихпен жанды байланыс");

    const steps = [
      { n: "01", icon: ic.map, t: "Таймлайнды ашу", d: "Оқушы дәуірді немесе оқиғаны таңдайды. Даталар, тұлғалар мен әдеби кезеңдер бір көрнекі осьте." },
      { n: "02", icon: ic.comments, t: "Тұлғамен сөйлесу", d: "Әл-Фараби, Абай немесе хан-билермен ИИ арқылы сұхбаттасады - нақты адаммен сөйлескендей." },
      { n: "03", icon: ic.bulb, t: "Терең түсіну", d: "Эмоциялық тартылыс білімді есте сақтауды арттырады, тарихи ойлауды қалыптастырады." },
    ];
    let sx = 0.7;
    steps.forEach((st) => {
      s.addShape(pres.shapes.RECTANGLE, { x: sx, y: 2.1, w: 3.85, h: 3.7, fill: { color: C.card }, line: { color: C.line, width: 1 }, shadow: shadow() });
      s.addText(st.n, { x: sx + 0.3, y: 2.3, w: 1.6, h: 0.8, margin: 0, fontFace: FONT_H, fontSize: 40, bold: true, color: C.faint });
      iconChip(s, sx + 2.7, 2.45, 0.82, st.icon);
      s.addText(st.t, { x: sx + 0.3, y: 3.35, w: 3.45, h: 0.6, margin: 0, fontFace: FONT_H, fontSize: 16.5, bold: true, color: C.text });
      s.addText(st.d, { x: sx + 0.3, y: 4.0, w: 3.45, h: 1.6, margin: 0, fontFace: FONT_B, fontSize: 12.5, color: C.text2, lineSpacingMultiple: 1.2 });
      sx += 4.07;
    });

    timelineMotif(s, 0.95, 6.5, 11.4, 7);
    pageNum(s, 4);
  }

  // ========================================================
  // СЛАЙД 5 - Интерфейс (Таймлайн)
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    kicker(s, "Интерфейс");
    title(s, "Таймлайн және детальді ақпарат");

    const ovX = 0.7, ovY = 1.95, ovW = 7.4, ovH = ovW * 1800 / 3200;
    frame(s, ovX, ovY, ovW, ovH);
    s.addImage({ path: __dirname + "/screen-overview.png", x: ovX, y: ovY, w: ovW, h: ovH });

    const chips = [
      { fx: 0.05, fy: 0.50, n: "1" },
      { fx: 0.45, fy: 0.17, n: "2" },
      { fx: 0.63, fy: 0.43, n: "3" },
      { fx: 0.50, fy: 0.93, n: "4" },
    ];
    chips.forEach((c) => {
      const cx = ovX + c.fx * ovW, cy = ovY + c.fy * ovH;
      s.addShape(pres.shapes.OVAL, { x: cx - 0.17, y: cy - 0.17, w: 0.34, h: 0.34, fill: { color: C.gold }, line: { color: C.text, width: 1.5 } });
      s.addText(c.n, { x: cx - 0.17, y: cy - 0.17, w: 0.34, h: 0.34, margin: 0, align: "center", valign: "middle", fontFace: FONT_B, fontSize: 13, bold: true, color: C.bgDeep });
    });

    const leg = [["1", "Сүзгілер"], ["2", "Дәуірлер"], ["3", "Тұлғалар"], ["4", "Миникарта"]];
    let lx = 0.72;
    leg.forEach(([n, t]) => {
      s.addShape(pres.shapes.OVAL, { x: lx, y: 6.34, w: 0.26, h: 0.26, fill: { color: C.gold } });
      s.addText(n, { x: lx, y: 6.34, w: 0.26, h: 0.26, margin: 0, align: "center", valign: "middle", fontFace: FONT_B, fontSize: 11, bold: true, color: C.bgDeep });
      s.addText(t, { x: lx + 0.34, y: 6.3, w: 1.55, h: 0.36, margin: 0, fontFace: FONT_B, fontSize: 11.5, color: C.text2, valign: "middle" });
      lx += 1.86;
    });

    s.addText("ДЕТАЛЬДІ ПАНЕЛЬ", { x: 8.5, y: 1.95, w: 4.2, h: 0.35, margin: 0, fontFace: FONT_B, fontSize: 12, bold: true, color: C.gold, charSpacing: 3 });
    const dW = 3.05, dH = dW * 1050 / 850, dX = 8.55, dY = 2.4;
    frame(s, dX, dY, dW, dH);
    s.addImage({ path: __dirname + "/crop-detail.png", x: dX, y: dY, w: dW, h: dH });
    s.addText("Объектіні таңдағанда фото, сипаттама және ИИ-чатты ашатын «Поговорить» батырмасы көрінеді.", { x: 8.5, y: dY + dH + 0.12, w: 4.15, h: 0.7, margin: 0, fontFace: FONT_B, fontSize: 12, color: C.text2, lineSpacingMultiple: 1.15 });
    pageNum(s, 5);
  }

  // ========================================================
  // СЛАЙД 6 - Интерфейс (ИИ-чат)
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    kicker(s, "Интерфейс · Инновация");
    title(s, "Тарихи тұлғалармен ИИ-сұхбат");

    const mH = 4.5, mW = mH * 960 / 1280, mX = 0.7, mY = 1.9;
    frame(s, mX, mY, mW, mH);
    s.addImage({ path: __dirname + "/chat-modal.png", x: mX, y: mY, w: mW, h: mH });
    s.addText("Нақты экран — Әл-Фарабимен қазақша диалог", { x: mX, y: mY + mH + 0.12, w: mW + 1.2, h: 0.35, margin: 0, fontFace: FONT_B, fontSize: 12, italic: true, color: C.muted });

    const rx = mX + mW + 0.7, rw = W - rx - 0.73;
    s.addText("Эмпатиялық терең ену — платформаның басты ерекшелігі. Оқушы тарихи тұлғамен нақты адаммен сөйлескендей сұхбаттасады, бұл білімді есте сақтауды күшейтеді.", { x: rx, y: 2.0, w: rw, h: 1.3, margin: 0, fontFace: FONT_B, fontSize: 16, color: C.text2, lineSpacingMultiple: 1.3 });

    const feats = [
      { icon: ic.robot, t: "Дәуірге дәйекті ИИ-агенттер", d: "Әр тұлғаның мінезі, білімі мен дәуір контексі сақталады." },
      { icon: ic.comments, t: "Қазақ және орыс тілінде", d: "Оқушының тіліне қарай табиғи түрде жауап береді." },
      { icon: ic.brain, t: "Белсенді коммуникация", d: "Пассивті оқуға қарағанда ақпарат әлдеқайда жақсы бекиді." },
    ];
    let fy = 3.55;
    feats.forEach((f) => {
      iconChip(s, rx, fy, 0.7, f.icon);
      s.addText(f.t, { x: rx + 0.95, y: fy - 0.02, w: rw - 0.95, h: 0.4, margin: 0, fontFace: FONT_H, fontSize: 16, bold: true, color: C.text });
      s.addText(f.d, { x: rx + 0.95, y: fy + 0.4, w: rw - 0.95, h: 0.55, margin: 0, fontFace: FONT_B, fontSize: 13, color: C.text2, lineSpacingMultiple: 1.1 });
      fy += 1.05;
    });
    pageNum(s, 6);
  }

  // ========================================================
  // СЛАЙД 7 - Мақсатты аудитория және Маңыздылық
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    kicker(s, "Мақсатты аудитория және Әлеуметтік маңыздылық");
    title(s, "«Тәуелсіздік ұрпақтары» миссиясымен үндес");

    const aud = [
      { icon: ic.grad, big: "Оқушылар мен студенттер", sub: "Тарих пен әдебиетке қызығатын жастар" },
      { icon: ic.book, big: "Қосымша білім", sub: "Тарих және әдебиет бойынша курстар, орталықтар" },
      { icon: ic.users, big: "Мұғалімдер", sub: "Сабақты қызықты өткізудің цифрлық құралы" },
    ];
    let ax = 0.7;
    aud.forEach((a) => {
      s.addShape(pres.shapes.RECTANGLE, { x: ax, y: 1.9, w: 3.85, h: 2.3, fill: { color: C.card }, line: { color: C.line, width: 1 }, shadow: shadow() });
      iconChip(s, ax + 0.35, 2.15, 0.85, a.icon);
      s.addText(a.big, { x: ax + 0.35, y: 3.05, w: 3.45, h: 0.5, margin: 0, fontFace: FONT_H, fontSize: 16, bold: true, color: C.text });
      s.addText(a.sub, { x: ax + 0.35, y: 3.55, w: 3.45, h: 0.6, margin: 0, fontFace: FONT_B, fontSize: 12.5, color: C.muted, lineSpacingMultiple: 1.1 });
      ax += 4.07;
    });

    s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 4.5, w: 11.9, h: 2.2, fill: { color: C.panel }, line: { color: C.lineSoft, width: 1 } });
    const soc = [
      { icon: ic.flag, t: "Азаматтық бірегейлік", d: "Тарихи тұлғалармен эмпатиялық байланыс азаматтық сана-сезімді қалыптастырады." },
      { icon: ic.seedling, t: "Мәдени сабақтастық", d: "Тәуелсіздік ұрпағын ұлттық құндылықтар мен тарихи жадпен жалғастырады." },
    ];
    let yy = 4.7;
    soc.forEach((a) => {
      iconChip(s, 1.0, yy + 0.2, 0.65, a.icon);
      s.addText(a.t, { x: 1.9, y: yy + 0.13, w: 3.05, h: 0.8, margin: 0, fontFace: FONT_H, fontSize: 16.5, bold: true, color: C.text, valign: "middle" });
      s.addShape(pres.shapes.LINE, { x: 4.8, y: yy + 0.22, w: 0, h: 0.6, line: { color: C.line, width: 1 } });
      s.addText(a.d, { x: 5.0, y: yy + 0.13, w: 7.0, h: 0.8, margin: 0, fontFace: FONT_B, fontSize: 14.5, color: C.text2, valign: "middle", lineSpacingMultiple: 1.1 });
      yy += 1.0;
    });
    pageNum(s, 7);
  }

  // ========================================================
  // СЛАЙД 8 - Техникалық іске асыру
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    kicker(s, "Техникалық іске асыру");
    title(s, "Сенімді инженерлік негіз");

    const tech = [
      { icon: ic.code, t: "Заманауи веб-технологиялар", d: "Clean Architecture және SOLID принциптері. MVP үшін домендік бөлінісі бар модульді монолит." },
      { icon: ic.server, t: "Сенімді ДҚБЖ", d: "Тарихи деректермен жұмыстың домендік логикасы реляциялық дерекқормен инкапсуляцияланған." },
      { icon: ic.robot, t: "LLM интеграциясы", d: "OpenAI / Anthropic / Groq API жеке инфрақұрылым қабатында - vendor lock-in минималды, миграция оңай." },
      { icon: ic.rocket, t: "Масштабталу", d: "REST API; жүктеме өскенде микросервистік архитектураға дейін кеңейтуге есептелген." },
    ];
    tech.forEach((a, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const cx = 0.7 + col * 6.1, cy = 1.95 + row * 1.75;
      s.addShape(pres.shapes.RECTANGLE, { x: cx, y: cy, w: 5.8, h: 1.55, fill: { color: C.card }, line: { color: C.line, width: 1 }, shadow: shadow() });
      iconChip(s, cx + 0.3, cy + 0.32, 0.9, a.icon);
      s.addText(a.t, { x: cx + 1.45, y: cy + 0.2, w: 4.3, h: 0.45, margin: 0, fontFace: FONT_H, fontSize: 15.5, bold: true, color: C.text });
      s.addText(a.d, { x: cx + 1.45, y: cy + 0.62, w: 4.3, h: 0.85, margin: 0, fontFace: FONT_B, fontSize: 12, color: C.text2, lineSpacingMultiple: 1.1 });
    });

    s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 5.6, w: 11.9, h: 1.2, fill: { color: C.panel }, line: { color: C.lineSoft, width: 1 } });
    iconChip(s, 1.05, 5.85, 0.7, ic.user);
    s.addText([{ text: "Автор:  ", options: { bold: true, color: C.gold } }, { text: "ҚР ПІБ МТҚБ Инженерлік орталығының бас бағдарламашысы, техника ғылымдарының магистрі. ПО әзірлеудің толық циклін басқару тәжірибесі.", options: { color: C.text2 } }], { x: 1.95, y: 5.7, w: 10.4, h: 1.0, margin: 0, fontFace: FONT_B, fontSize: 12.5, valign: "middle", lineSpacingMultiple: 1.1 });
    pageNum(s, 8);
  }

  // ========================================================
  // СЛАЙД 9 - Бюджет
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    kicker(s, "Шығындар сметасы");
    title(s, "Грант бюджеті — 3 000 000 ₸");

    const budget = [
      ["Бұлттық инфрақұрылым, хостинг, серверлер", 500000],
      ["Жазылымдар, лицензиялар, API-қызметтер", 600000],
      ["ПО әзірлеу қызметтері (мердігерлік)", 700000],
      ["UI/UX интерфейс дизайны", 300000],
      ["Маркетинг, жылжыту, медиаконтент", 400000],
      ["Заңды-ұйымдастырушылық сүйемелдеу", 200000],
      ["Өзге (күтпеген) шығындар - резерв", 300000],
    ];
    const total = 3000000;

    s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 2.05, w: 5.4, h: 4.6, fill: { color: C.card }, line: { color: C.line, width: 1 }, shadow: shadow() });
    s.addText("ЖАЛПЫ БЮДЖЕТ", { x: 1.05, y: 2.45, w: 4.7, h: 0.4, margin: 0, fontFace: FONT_B, fontSize: 13, bold: true, color: C.gold, charSpacing: 3 });
    s.addText("3 000 000 ₸", { x: 1.0, y: 2.85, w: 4.8, h: 1.0, margin: 0, fontFace: FONT_H, fontSize: 44, bold: true, color: C.text });
    s.addText("7 бағыт бойынша бөлінген", { x: 1.05, y: 3.9, w: 4.7, h: 0.4, margin: 0, fontFace: FONT_B, fontSize: 14, color: C.text2 });

    const barX = 1.05, barY = 4.6, barW = 4.7, barH = 0.55;
    let bcx = barX;
    budget.forEach((b, i) => { const segW = (b[1] / total) * barW; s.addShape(pres.shapes.RECTANGLE, { x: bcx, y: barY, w: segW, h: barH, fill: { color: TAGS[i] } }); bcx += segW; });
    s.addShape(pres.shapes.RECTANGLE, { x: barX, y: barY, w: barW, h: barH, fill: { type: "none" }, line: { color: C.line, width: 0.75 } });

    s.addText([
      { text: "23% ", options: { bold: true, color: C.gold } }, { text: "Әзірлеу   ", options: { color: C.text2 } },
      { text: "20% ", options: { bold: true, color: C.gold } }, { text: "API/лиц.   ", options: { color: C.text2 } },
      { text: "17% ", options: { bold: true, color: C.gold } }, { text: "Инфрақұрылым", options: { color: C.text2 } },
    ], { x: 1.05, y: 5.4, w: 4.8, h: 0.8, margin: 0, fontFace: FONT_B, fontSize: 12.5, lineSpacingMultiple: 1.2 });

    let by = 1.95;
    budget.forEach((b, i) => {
      s.addShape(pres.shapes.RECTANGLE, { x: 6.45, y: by, w: 0.18, h: 0.5, fill: { color: TAGS[i] } });
      s.addText(b[0], { x: 6.78, y: by, w: 4.4, h: 0.5, margin: 0, fontFace: FONT_B, fontSize: 13, color: C.text2, valign: "middle" });
      s.addText(b[1].toLocaleString("ru-RU") + " ₸", { x: 11.2, y: by, w: 1.5, h: 0.5, margin: 0, fontFace: FONT_B, fontSize: 13, bold: true, color: C.text, align: "right", valign: "middle" });
      by += 0.62;
    });
    s.addShape(pres.shapes.LINE, { x: 6.45, y: by + 0.02, w: 6.25, h: 0, line: { color: C.gold, width: 1.5 } });
    s.addText("БАРЛЫҒЫ", { x: 6.78, y: by + 0.1, w: 4, h: 0.5, margin: 0, fontFace: FONT_B, fontSize: 14, bold: true, color: C.text, valign: "middle" });
    s.addText("3 000 000 ₸", { x: 11.0, y: by + 0.1, w: 1.7, h: 0.5, margin: 0, fontFace: FONT_H, fontSize: 16, bold: true, color: C.gold, align: "right", valign: "middle" });
    pageNum(s, 9);
  }

  // ========================================================
  // СЛАЙД 10 - Жол картасы және Болашақ
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.bgDeep };
    s.addShape(pres.shapes.OVAL, { x: -2, y: H - 3.5, w: 5.5, h: 5.5, fill: { color: C.blue, transparency: 90 }, line: { type: "none" } });

    s.addText("ЖОЛ КАРТАСЫ ЖӘНЕ БОЛАШАҚ", { x: 0.7, y: 0.5, w: 9, h: 0.4, margin: 0, fontFace: FONT_B, fontSize: 13, bold: true, color: C.gold, charSpacing: 3 });
    s.addText("MVP-ден ұлттық платформаға дейін", { x: 0.7, y: 0.95, w: 12, h: 0.8, margin: 0, fontFace: FONT_H, fontSize: 30, bold: true, color: C.text });

    const phases = [
      { q: "1-кезең", t: "Іргетас", d: "Архитектура, ДҚ,\nтаймлайн ядросы" },
      { q: "2-кезең", t: "ИИ-чат", d: "LLM интеграциясы,\nагенттер контексі" },
      { q: "3-кезең", t: "MVP", d: "UI/UX, мобильді\nбейімдеу, тестілеу" },
      { q: "4-кезең", t: "Іске қосу", d: "Маркетинг,\nалғашқы аудитория" },
    ];
    const tlX = 1.8, tlW = 9.7, segs = phases.length - 1;
    timelineMotif(s, tlX, 2.5, tlW, phases.length, C.gold);
    phases.forEach((p, i) => {
      const cx = tlX + (tlW / segs) * i;
      s.addShape(pres.shapes.OVAL, { x: cx - 0.13, y: 2.37, w: 0.26, h: 0.26, fill: { color: C.gold } });
      s.addText(p.q, { x: cx - 1.2, y: 2.75, w: 2.4, h: 0.35, margin: 0, align: "center", fontFace: FONT_B, fontSize: 12, bold: true, color: C.gold });
      s.addText(p.t, { x: cx - 1.2, y: 3.1, w: 2.4, h: 0.4, margin: 0, align: "center", fontFace: FONT_H, fontSize: 16, bold: true, color: C.text });
      s.addText(p.d, { x: cx - 1.2, y: 3.52, w: 2.4, h: 0.75, margin: 0, align: "center", fontFace: FONT_B, fontSize: 11.5, color: C.text2, lineSpacingMultiple: 1.05 });
    });

    s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 4.6, w: 11.93, h: 1.2, fill: { color: C.card }, line: { color: C.line, width: 1 }, shadow: shadow() });
    iconChip(s, 0.95, 4.85, 0.65, ic.map);
    s.addText("Келесі маңызды қадам: Интерактивті тарихи карта", { x: 1.85, y: 4.75, w: 9.5, h: 0.5, margin: 0, fontFace: FONT_H, fontSize: 16.5, bold: true, color: C.text, valign: "middle" });
    s.addText("Кеңістік пен уақыт синхроны. Таймлайндағы ползунокты жылжыту арқылы картадағы шекаралардың өзгеруін бақылау. Оқиғаны, оның орналасқан жерін және ИИ-тұлғаның пікірін бір жүйеде біріктіру.", { x: 1.85, y: 5.2, w: 9.5, h: 0.6, margin: 0, fontFace: FONT_B, fontSize: 12.5, color: C.text2, valign: "middle", lineSpacingMultiple: 1.1 });

    s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 6.1, w: 11.93, h: 1.0, fill: { color: C.gold } });
    s.addText("Тарихты жаттатпай, сүйдіретін платформа.", { x: 1.05, y: 6.15, w: 7.5, h: 0.5, margin: 0, fontFace: FONT_H, fontSize: 18, bold: true, color: C.bgDeep });
    s.addText("Жаңа ұрпақты тәуелсіздік тарихымен жалғастырамыз.", { x: 1.05, y: 6.6, w: 7.5, h: 0.4, margin: 0, fontFace: FONT_B, fontSize: 14, color: "3A2E12" });
    s.addImage({ data: ic.env, x: 8.7, y: 6.34, w: 0.28, h: 0.28 });
    s.addText("bekasyl.kar@gmail.com", { x: 9.05, y: 6.3, w: 3.3, h: 0.35, margin: 0, fontFace: FONT_B, fontSize: 12, bold: true, color: C.bgDeep, valign: "middle" });
    s.addImage({ data: ic.gh, x: 8.7, y: 6.74, w: 0.28, h: 0.28 });
    s.addText("github.com/bekarazhan/tarixi-timeline", { x: 9.05, y: 6.7, w: 3.5, h: 0.35, margin: 0, fontFace: FONT_B, fontSize: 11, color: C.bgDeep, valign: "middle" });
    pageNum(s, 10);
  }

  await pres.writeFile({ fileName: "/Users/bekas/Developer/tarixi-timeline/grant-presentation/Tarixi-Timeline_Tauelsizdik_urpaqtary.pptx" });
  console.log("DONE");
})().catch((e) => { console.error(e); process.exit(1); });
