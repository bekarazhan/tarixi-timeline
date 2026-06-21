/* Tarixi-Timeline - грант «Тәуелсіздік ұрпақтары» презентациясы (10 слайд, қазақша) */
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const FA = require("react-icons/fa");

// ---------- палитра ----------
const C = {
  navy:   "0B3D54",  // основной тёмный (көк аспан тереңдетілген)
  steppe: "1C7CA5",  // дала көгі
  gold:   "E5B23C",  // алтын акцент
  goldDk: "C9962B",
  cream:  "F6F2E9",  // ашық фон
  ink:    "1A2A33",  // негізгі мәтін
  muted:  "5E6B72",  // көмекші мәтін
  white:  "FFFFFF",
  line:   "D9D0BE",  // ашық сызық
};

const FONT_H = "Georgia";
const FONT_B = "Calibri";

// ---------- иконкалар ----------
async function icon(IconComp, color = "#FFFFFF", size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComp, { color, size: String(size) })
  );
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + png.toString("base64");
}

const shadow = () => ({ type: "outer", color: "000000", blur: 8, offset: 3, angle: 135, opacity: 0.18 });

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
  pres.author = "Bekassyl Karazhan";
  pres.title = "Tarixi-Timeline - Тәуелсіздік ұрпақтары";
  const W = 13.333, H = 7.5;

  const ic = {
    book:     await icon(FA.FaBookOpen, "#" + C.gold),
    brain:    await icon(FA.FaBrain, "#" + C.gold),
    comments: await icon(FA.FaComments, "#" + C.gold),
    clock:    await icon(FA.FaStream, "#" + C.gold),
    robot:    await icon(FA.FaRobot, "#" + C.gold),
    users:    await icon(FA.FaUsers, "#" + C.gold),
    grad:     await icon(FA.FaGraduationCap, "#" + C.gold),
    flag:     await icon(FA.FaFlag, "#" + C.gold),
    heart:    await icon(FA.FaHeart, "#" + C.gold),
    code:     await icon(FA.FaCode, "#" + C.gold),
    server:   await icon(FA.FaServer, "#" + C.gold),
    rocket:   await icon(FA.FaRocket, "#" + C.gold),
    chart:    await icon(FA.FaChartLine, "#" + C.gold),
    bulb:     await icon(FA.FaLightbulb, "#" + C.gold),
    map:      await icon(FA.FaMapMarkedAlt, "#" + C.gold),
    seedling: await icon(FA.FaSeedling, "#" + C.gold),
    user:     await icon(FA.FaUserTie, "#" + C.gold),
    env:      await icon(FA.FaEnvelope, "#" + C.navy),
    gh:       await icon(FA.FaGithub, "#" + C.navy),
  };

  function timelineMotif(slide, x, y, w, dots = 5, color = C.gold) {
    slide.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color, width: 2 } });
    for (let i = 0; i < dots; i++) {
      const cx = x + (w / (dots - 1)) * i;
      slide.addShape(pres.shapes.OVAL, { x: cx - 0.06, y: y - 0.06, w: 0.12, h: 0.12, fill: { color } });
    }
  }

  function kicker(slide, text, color = C.gold) {
    slide.addText(text.toUpperCase(), {
      x: 0.7, y: 0.5, w: 8, h: 0.35, margin: 0,
      fontFace: FONT_B, fontSize: 12, bold: true, color, charSpacing: 3,
    });
  }

  function title(slide, text, color = C.navy) {
    slide.addText(text, {
      x: 0.7, y: 0.82, w: 12, h: 0.95, margin: 0,
      fontFace: FONT_H, fontSize: 32, bold: true, color,
    });
  }

  function pageNum(slide, n, dark = false) {
    slide.addText(`${n} / 10`, {
      x: W - 1.6, y: H - 0.55, w: 1.1, h: 0.3, margin: 0,
      fontFace: FONT_B, fontSize: 10, color: dark ? C.cream : C.muted, align: "right",
    });
    slide.addText("Tarixi-Timeline", {
      x: 0.7, y: H - 0.55, w: 4, h: 0.3, margin: 0,
      fontFace: FONT_B, fontSize: 10, color: dark ? C.cream : C.muted,
    });
  }

  // ========================================================
  // СЛАЙД 1 - Титул
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.navy };
    s.addShape(pres.shapes.OVAL, { x: W - 3.2, y: -2.2, w: 5.5, h: 5.5, fill: { color: C.steppe, transparency: 60 }, line: { type: "none" } });
    s.addShape(pres.shapes.OVAL, { x: W - 1.6, y: H - 2.6, w: 3.2, h: 3.2, fill: { color: C.gold, transparency: 75 }, line: { type: "none" } });

    s.addText("ТӘУЕЛСІЗДІК ҰРПАҚТАРЫ · ГРАНТ", {
      x: 0.9, y: 1.35, w: 9, h: 0.4, margin: 0,
      fontFace: FONT_B, fontSize: 14, bold: true, color: C.gold, charSpacing: 4,
    });
    s.addText("Tarixi-Timeline", {
      x: 0.85, y: 1.95, w: 11.5, h: 1.3, margin: 0,
      fontFace: FONT_H, fontSize: 64, bold: true, color: C.white,
    });
    s.addText("Қазақстан тарихы мен әдебиетін зерттеуге арналған интерактивті білім беру платформасы", {
      x: 0.9, y: 3.35, w: 9.8, h: 0.9, margin: 0,
      fontFace: FONT_B, fontSize: 20, color: C.cream, lineSpacingMultiple: 1.1,
    });

    timelineMotif(s, 0.92, 4.7, 6.2, 6);

    s.addText([
      { text: "Бағыт:  ", options: { bold: true, color: C.gold } },
      { text: "Ақпараттық технологиялар (EdTech)", options: { color: C.cream } },
    ], { x: 0.9, y: 5.5, w: 11, h: 0.4, margin: 0, fontFace: FONT_B, fontSize: 15 });
    s.addText([
      { text: "Грант сомасы:  ", options: { bold: true, color: C.gold } },
      { text: "3 000 000 теңге", options: { color: C.cream } },
    ], { x: 0.9, y: 5.95, w: 11, h: 0.4, margin: 0, fontFace: FONT_B, fontSize: 15 });
    s.addText("Bekassyl Karazhan · ҚР ПІБ МТҚБ Инженерлік орталығының бас бағдарламашысы, техника ғылымдарының магистрі", {
      x: 0.9, y: 6.5, w: 11, h: 0.4, margin: 0, fontFace: FONT_B, fontSize: 13, italic: true, color: "AFC3CE",
    });
  }

  // ========================================================
  // СЛАЙД 2 - Мәселе
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.cream };
    kicker(s, "Мәселе");
    title(s, "Тарих жаттауға айналды, түсінуге емес");

    s.addText("Қазіргі мектептегі Қазақстан тарихы мен әдебиетін оқыту негізінен даталар мен фактілерді механикалық жаттауға бағытталған. Бұл пәнді үстірт қабылдауды қалыптастырады және оқушылардың қызығушылығын төмендетеді.", {
      x: 0.7, y: 1.85, w: 6.05, h: 2.0, margin: 0,
      fontFace: FONT_B, fontSize: 16, color: C.ink, lineSpacingMultiple: 1.25,
    });

    s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 4.05, w: 6.05, h: 0.06, fill: { color: C.gold } });
    s.addText([
      { text: "Басты кемшілік - эмпатиялық байланыстың жоқтығы.\n", options: { bold: true, color: C.navy, fontSize: 16 } },
      { text: "Оқушылар тарихи тұлғаларды мінезі мен дәуір контексі бар нақты адамдар ретінде емес, оқулықтағы дерексіз есімдер ретінде қабылдайды.", options: { color: C.ink, fontSize: 15 } },
    ], { x: 0.7, y: 4.25, w: 6.05, h: 1.7, margin: 0, fontFace: FONT_B, lineSpacingMultiple: 1.2 });

    const cards = [
      { icon: ic.book, big: "Жаттау", sub: "белсенді ойлаудың орнына" },
      { icon: ic.heart, big: "Төмен қызығушылық", sub: "ұлттық тарихқа деген" },
      { icon: ic.brain, big: "Фрагментті білім", sub: "жүйелі түсініктің орнына" },
    ];
    let cy = 1.85;
    cards.forEach((c) => {
      s.addShape(pres.shapes.RECTANGLE, { x: 7.05, y: cy, w: 5.55, h: 1.45, fill: { color: C.white }, line: { color: C.line, width: 1 }, shadow: shadow() });
      s.addShape(pres.shapes.OVAL, { x: 7.35, y: cy + 0.42, w: 0.62, h: 0.62, fill: { color: C.navy } });
      s.addImage({ data: c.icon, x: 7.47, y: cy + 0.54, w: 0.38, h: 0.38 });
      s.addText(c.big, { x: 8.2, y: cy + 0.28, w: 4.2, h: 0.45, margin: 0, fontFace: FONT_H, fontSize: 19, bold: true, color: C.navy });
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
    s.background = { color: C.navy };
    kicker(s, "Шешім", C.gold);
    s.addText("Оқудан - сұхбатқа", { x: 0.7, y: 0.82, w: 12, h: 0.95, margin: 0, fontFace: FONT_H, fontSize: 32, bold: true, color: C.white });

    s.addText("«Tarixi-Timeline» платформасы екі құралды біріктіреді және оқуды пассивті оқу режимінен белсенді коммуникация режиміне көшіреді.", {
      x: 0.7, y: 1.8, w: 11.8, h: 0.8, margin: 0, fontFace: FONT_B, fontSize: 17, color: C.cream, lineSpacingMultiple: 1.2,
    });

    const mods = [
      { icon: ic.clock, t: "Интерактивті хронологиялық таймлайн", d: "Тарихи оқиғаларды, даталар мен әдеби дәуірлерді көрнекі әрі құрылымды түрде ұсынады. Оқушы уақыт осінде еркін шарлап, тұлғалар мен оқиғалардың өзара байланысын көреді." },
      { icon: ic.robot, t: "Тарихи тұлғалармен ИИ-чат", d: "Генеративті тіл модельдері (LLM) негізінде Қазақстанның тарихи тұлғаларының виртуалды бейнелерімен тірі диалог. Әр агент дәуірге сай мінез бен дәйектілікке ие." },
    ];
    let mx = 0.7;
    mods.forEach((m) => {
      s.addShape(pres.shapes.RECTANGLE, { x: mx, y: 2.85, w: 5.9, h: 3.6, fill: { color: C.white }, shadow: shadow() });
      s.addShape(pres.shapes.RECTANGLE, { x: mx, y: 2.85, w: 5.9, h: 0.12, fill: { color: C.gold } });
      s.addShape(pres.shapes.OVAL, { x: mx + 0.45, y: 3.35, w: 0.95, h: 0.95, fill: { color: C.navy } });
      s.addImage({ data: m.icon, x: mx + 0.68, y: 3.58, w: 0.5, h: 0.5 });
      s.addText(m.t, { x: mx + 0.45, y: 4.5, w: 5.0, h: 0.85, margin: 0, fontFace: FONT_H, fontSize: 19, bold: true, color: C.navy, lineSpacingMultiple: 1.0 });
      s.addText(m.d, { x: mx + 0.45, y: 5.3, w: 5.05, h: 1.05, margin: 0, fontFace: FONT_B, fontSize: 13, color: C.ink, lineSpacingMultiple: 1.15 });
      mx += 6.2;
    });
    pageNum(s, 3, true);
  }

  // ========================================================
  // СЛАЙД 4 - Қалай жұмыс істейді
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.cream };
    kicker(s, "Өнім · Қалай жұмыс істейді");
    title(s, "Үш қадамда - тарихпен жанды байланыс");

    const steps = [
      { n: "01", icon: ic.map, t: "Таймлайнды ашу", d: "Оқушы дәуірді немесе оқиғаны таңдайды. Даталар, тұлғалар мен әдеби кезеңдер бір көрнекі осьте." },
      { n: "02", icon: ic.comments, t: "Тұлғамен сөйлесу", d: "Әл-Фараби, Абай немесе хан-билермен ИИ арқылы сұхбаттасады - нақты адаммен сөйлескендей." },
      { n: "03", icon: ic.bulb, t: "Терең түсіну", d: "Эмоциялық тартылыс білімді есте сақтауды арттырады, тарихи ойлауды қалыптастырады." },
    ];
    let sx = 0.7;
    steps.forEach((st, i) => {
      s.addShape(pres.shapes.RECTANGLE, { x: sx, y: 2.1, w: 3.85, h: 3.7, fill: { color: C.white }, line: { color: C.line, width: 1 }, shadow: shadow() });
      s.addText(st.n, { x: sx + 0.3, y: 2.3, w: 1.6, h: 0.8, margin: 0, fontFace: FONT_H, fontSize: 40, bold: true, color: "D6BE8C" });
      s.addShape(pres.shapes.OVAL, { x: sx + 2.7, y: 2.45, w: 0.82, h: 0.82, fill: { color: C.navy } });
      s.addImage({ data: st.icon, x: sx + 2.89, y: 2.64, w: 0.44, h: 0.44 });
      s.addText(st.t, { x: sx + 0.3, y: 3.35, w: 3.3, h: 0.6, margin: 0, fontFace: FONT_H, fontSize: 18, bold: true, color: C.navy });
      s.addText(st.d, { x: sx + 0.3, y: 4.0, w: 3.3, h: 1.6, margin: 0, fontFace: FONT_B, fontSize: 13, color: C.ink, lineSpacingMultiple: 1.2 });
      sx += 4.07;
    });

    timelineMotif(s, 0.95, 6.5, 11.4, 7, C.goldDk);
    pageNum(s, 4);
  }

  // ========================================================
  // СЛАЙД 5 - Интерфейс (Таймлайн)
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.cream };
    kicker(s, "Интерфейс");
    title(s, "Таймлайн және детальді ақпарат");

    const ovX = 0.7, ovY = 1.95, ovW = 7.4, ovH = ovW * 1800 / 3200;
    s.addShape(pres.shapes.RECTANGLE, { x: ovX - 0.04, y: ovY - 0.04, w: ovW + 0.08, h: ovH + 0.08, fill: { color: C.navy }, shadow: shadow() });
    s.addImage({ path: __dirname + "/screen-overview.png", x: ovX, y: ovY, w: ovW, h: ovH });

    const chips = [
      { fx: 0.05, fy: 0.50, n: "1" }, 
      { fx: 0.45, fy: 0.17, n: "2" }, 
      { fx: 0.63, fy: 0.43, n: "3" }, 
      { fx: 0.50, fy: 0.93, n: "4" }, 
    ];
    chips.forEach((c) => {
      const cx = ovX + c.fx * ovW, cy = ovY + c.fy * ovH;
      s.addShape(pres.shapes.OVAL, { x: cx - 0.17, y: cy - 0.17, w: 0.34, h: 0.34, fill: { color: C.gold }, line: { color: C.white, width: 1.5 } });
      s.addText(c.n, { x: cx - 0.17, y: cy - 0.17, w: 0.34, h: 0.34, margin: 0, align: "center", valign: "middle", fontFace: FONT_B, fontSize: 13, bold: true, color: C.navy });
    });

    const leg = [
      ["1", "Сүзгілер"],
      ["2", "Дәуірлер"],
      ["3", "Тұлғалар"],
      ["4", "Миникарта"],
    ];
    let lx = 0.72;
    leg.forEach(([n, t]) => {
      s.addShape(pres.shapes.OVAL, { x: lx, y: 6.34, w: 0.26, h: 0.26, fill: { color: C.navy } });
      s.addText(n, { x: lx, y: 6.34, w: 0.26, h: 0.26, margin: 0, align: "center", valign: "middle", fontFace: FONT_B, fontSize: 11, bold: true, color: C.gold });
      s.addText(t, { x: lx + 0.34, y: 6.3, w: 1.55, h: 0.36, margin: 0, fontFace: FONT_B, fontSize: 11.5, color: C.ink, valign: "middle" });
      lx += 1.86;
    });

    s.addText("ДЕТАЛЬДІ ПАНЕЛЬ", { x: 8.5, y: 1.95, w: 4.2, h: 0.35, margin: 0, fontFace: FONT_B, fontSize: 12, bold: true, color: C.gold, charSpacing: 3 });
    const dW = 3.05, dH = dW * 1.5, dX = 8.55, dY = 2.4; 
    s.addShape(pres.shapes.RECTANGLE, { x: dX - 0.04, y: dY - 0.04, w: dW + 0.08, h: dH + 0.08, fill: { color: C.navy }, shadow: shadow() });
    s.addImage({ path: __dirname + "/crop-detail.png", x: dX, y: dY, w: dW, h: dH });
    s.addText("Детальді ақпаратта ИИ-чатты ашатын арнайы батырма орналасқан.", {
      x: 8.55, y: dY + dH + 0.15, w: 4.05, h: 0.7, margin: 0, fontFace: FONT_B, fontSize: 13, color: C.ink, lineSpacingMultiple: 1.15,
    });
    pageNum(s, 5);
  }

  // ========================================================
  // СЛАЙД 6 - Интерфейс (ИИ-чат)
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.cream };
    kicker(s, "Интерфейс · Инновация");
    title(s, "Тарихи тұлғалармен ИИ-сұхбат");

    const cvX = 0.7, cvY = 1.95, cvW = 6.8, cvH = cvW * 1800 / 3200;
    s.addShape(pres.shapes.RECTANGLE, { x: cvX - 0.04, y: cvY - 0.04, w: cvW + 0.08, h: cvH + 0.08, fill: { color: C.navy }, shadow: shadow() });
    s.addImage({ path: __dirname + "/screen-chat-full.png", x: cvX, y: cvY, w: cvW, h: cvH });

    s.addText("Толық экран режиміндегі чат интерфейсі", {
      x: cvX, y: cvY + cvH + 0.1, w: cvW, h: 0.4, margin: 0, fontFace: FONT_B, fontSize: 13, color: C.muted, italic: true,
    });

    const cx = 8.0, cy = 1.95, cw = 4.5, ch = cw * 1.0; 
    s.addShape(pres.shapes.RECTANGLE, { x: cx - 0.04, y: cy - 0.04, w: cw + 0.08, h: ch + 0.08, fill: { color: C.navy }, shadow: shadow() });
    s.addImage({ path: __dirname + "/chat-modal.png", x: cx, y: cy, w: cw, h: ch });

    s.addText("Эмпатиялық терең ену - платформаның басты ерекшелігі. Оқушылар тұлғамен нақты адаммен сөйлескендей әңгімелеседі.", {
      x: cx, y: cy + ch + 0.3, w: cw, h: 1.2, margin: 0, fontFace: FONT_B, fontSize: 15, color: C.ink, lineSpacingMultiple: 1.15,
    });

    pageNum(s, 6);
  }

  // ========================================================
  // СЛАЙД 7 - Мақсатты аудитория және Маңыздылық
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.navy };
    kicker(s, "Мақсатты аудитория және Әлеуметтік маңыздылық", C.gold);
    title(s, "«Тәуелсіздік ұрпақтары» миссиясымен үндес", C.white);

    const aud = [
      { icon: ic.grad, big: "Оқушылар мен студенттер", sub: "Тарих пен әдебиетке қызығатын жастар" },
      { icon: ic.book, big: "Қосымша білім", sub: "Тарих және әдебиет бойынша курстар, орталықтар" },
      { icon: ic.users, big: "Мұғалімдер", sub: "Сабақты қызықты өткізудің цифрлық құралы" },
    ];
    let ax = 0.7;
    aud.forEach((a) => {
      s.addShape(pres.shapes.RECTANGLE, { x: ax, y: 1.9, w: 3.85, h: 2.3, fill: { color: C.white }, shadow: shadow() });
      s.addShape(pres.shapes.OVAL, { x: ax + 0.35, y: 2.15, w: 0.85, h: 0.85, fill: { color: C.navy } });
      s.addImage({ data: a.icon, x: ax + 0.55, y: 2.35, w: 0.45, h: 0.45 });
      s.addText(a.big, { x: ax + 0.35, y: 3.05, w: 3.2, h: 0.5, margin: 0, fontFace: FONT_H, fontSize: 18, bold: true, color: C.navy });
      s.addText(a.sub, { x: ax + 0.35, y: 3.45, w: 3.25, h: 0.6, margin: 0, fontFace: FONT_B, fontSize: 13, color: C.muted, lineSpacingMultiple: 1.1 });
      ax += 4.07;
    });

    s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 4.5, w: 11.9, h: 2.2, fill: { color: C.steppe, transparency: 30 } });
    
    const soc = [
      { icon: ic.flag, t: "Азаматтық бірегейлік", d: "Тарихи тұлғалармен эмпатиялық байланыс азаматтық сана-сезімді қалыптастырады." },
      { icon: ic.seedling, t: "Мәдени сабақтастық", d: "Тәуелсіздік ұрпағын ұлттық құндылықтар мен тарихи жадпен жалғастырады." },
    ];
    let yy = 4.7;
    soc.forEach((a) => {
      s.addShape(pres.shapes.OVAL, { x: 1.0, y: yy + 0.2, w: 0.65, h: 0.65, fill: { color: C.navy } });
      s.addImage({ data: a.icon, x: 1.14, y: yy + 0.34, w: 0.37, h: 0.37 });
      s.addText(a.t, { x: 1.9, y: yy + 0.13, w: 3.05, h: 0.8, margin: 0, fontFace: FONT_H, fontSize: 16.5, bold: true, color: C.white, valign: "middle" });
      s.addShape(pres.shapes.LINE, { x: 4.8, y: yy + 0.22, w: 0, h: 0.6, line: { color: C.line, width: 1 } });
      s.addText(a.d, { x: 5.0, y: yy + 0.13, w: 7.0, h: 0.8, margin: 0, fontFace: FONT_B, fontSize: 14.5, color: C.cream, valign: "middle", lineSpacingMultiple: 1.1 });
      yy += 1.0;
    });

    pageNum(s, 7, true);
  }

  // ========================================================
  // СЛАЙД 8 - Техникалық іске асыру
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.cream };
    kicker(s, "Техникалық іске асыру");
    title(s, "Сенімді инженерлік негіз");

    const tech = [
      { icon: ic.code, t: "Заманауи веб-технологиялар", d: "Clean Architecture және SOLID принциптері. MVP үшін домендік бөлінісі бар модульді монолит." },
      { icon: ic.server, t: "Сенімді ДҚБЖ", d: "Тарихи деректермен жұмыстың домендік логикасы реляциялық дерекқормен инкапсуляцияланған." },
      { icon: ic.robot, t: "LLM интеграциясы", d: "OpenAI / Anthropic / Groq API жеке инфрақұрылым қабатында - vendor lock-in минималды, миграция оңай." },
      { icon: ic.rocket, t: "Масштабталу", d: "REST API; жүктеме өскенде микросервистік архитектураға дейін кеңейтуге есептелген." },
    ];
    let tx = 0.7, ty = 1.95;
    tech.forEach((a, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const cx = 0.7 + col * 6.1, cy = 1.95 + row * 1.75;
      s.addShape(pres.shapes.RECTANGLE, { x: cx, y: cy, w: 5.8, h: 1.55, fill: { color: C.white }, line: { color: C.line, width: 1 }, shadow: shadow() });
      s.addShape(pres.shapes.OVAL, { x: cx + 0.3, y: cy + 0.32, w: 0.9, h: 0.9, fill: { color: C.navy } });
      s.addImage({ data: a.icon, x: cx + 0.51, y: cy + 0.53, w: 0.48, h: 0.48 });
      s.addText(a.t, { x: cx + 1.45, y: cy + 0.2, w: 4.2, h: 0.45, margin: 0, fontFace: FONT_H, fontSize: 17, bold: true, color: C.navy });
      s.addText(a.d, { x: cx + 1.45, y: cy + 0.62, w: 4.2, h: 0.85, margin: 0, fontFace: FONT_B, fontSize: 12.5, color: C.ink, lineSpacingMultiple: 1.1 });
    });

    s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 5.6, w: 11.9, h: 1.2, fill: { color: C.navy } });
    s.addShape(pres.shapes.OVAL, { x: 1.05, y: 5.85, w: 0.7, h: 0.7, fill: { color: C.gold } });
    s.addImage({ data: await icon(FA.FaUserTie, "#" + C.navy), x: 1.21, y: 6.01, w: 0.38, h: 0.38 });
    s.addText([
      { text: "Автор:  ", options: { bold: true, color: C.gold } },
      { text: "ҚР ПІБ МТҚБ Инженерлік орталығының бас бағдарламашысы, техника ғылымдарының магистрі. ПО әзірлеудің толық циклін басқару тәжірибесі.", options: { color: C.cream } },
    ], { x: 1.95, y: 5.7, w: 10.4, h: 1.0, margin: 0, fontFace: FONT_B, fontSize: 13.5, valign: "middle", lineSpacingMultiple: 1.1 });
    pageNum(s, 8);
  }

  // ========================================================
  // СЛАЙД 9 - Бюджет
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.cream };
    kicker(s, "Шығындар сметасы");
    title(s, "Грант бюджеті - 3 000 000 ₸");

    const budget = [
      ["Бұлттық инфрақұрылым, хостинг, серверлер", 500000],
      ["Жазылымдар, лицензиялар, API-қызметтер", 600000],
      ["ПО әзірлеу қызметтері (мердігерлік)", 700000],
      ["UI/UX интерфейс дизайны", 300000],
      ["Маркетинг, жылжыту, медиаконтент", 400000],
      ["Заңды-ұйымдастырушылық сүйемелдеу", 200000],
      ["Өзге (күтпеген) шығындар - резерв", 300000],
    ];

    const palette = ["0B3D54", "1C7CA5", "E5B23C", "C9962B", "5E8CA0", "8FB3C4", "A8742E"];
    const total = 3000000;

    s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 2.05, w: 5.4, h: 4.6, fill: { color: C.navy }, shadow: shadow() });
    s.addText("ЖАЛПЫ БЮДЖЕТ", { x: 1.05, y: 2.45, w: 4.7, h: 0.4, margin: 0, fontFace: FONT_B, fontSize: 13, bold: true, color: C.gold, charSpacing: 3 });
    s.addText("3 000 000 ₸", { x: 1.0, y: 2.85, w: 4.8, h: 1.0, margin: 0, fontFace: FONT_H, fontSize: 44, bold: true, color: C.white });
    s.addText("7 бағыт бойынша бөлінген", { x: 1.05, y: 3.9, w: 4.7, h: 0.4, margin: 0, fontFace: FONT_B, fontSize: 14, color: C.cream });

    const barX = 1.05, barY = 4.6, barW = 4.7, barH = 0.55;
    let cx = barX;
    budget.forEach((b, i) => {
      const segW = (b[1] / total) * barW;
      s.addShape(pres.shapes.RECTANGLE, { x: cx, y: barY, w: segW, h: barH, fill: { color: palette[i] } });
      cx += segW;
    });
    s.addShape(pres.shapes.RECTANGLE, { x: barX, y: barY, w: barW, h: barH, fill: { type: "none" }, line: { color: C.white, width: 0.75 } });
    
    s.addText([
      { text: "23% ", options: { bold: true, color: C.gold } },
      { text: "Әзірлеу   ", options: { color: C.cream } },
      { text: "20% ", options: { bold: true, color: C.gold } },
      { text: "API/лиц.   ", options: { color: C.cream } },
      { text: "17% ", options: { bold: true, color: C.gold } },
      { text: "Инфрақұрылым", options: { color: C.cream } },
    ], { x: 1.05, y: 5.4, w: 4.8, h: 0.8, margin: 0, fontFace: FONT_B, fontSize: 12.5, lineSpacingMultiple: 1.2 });

    let by = 1.95;
    budget.forEach((b, i) => {
      const colors = ["0B3D54", "1C7CA5", "E5B23C", "C9962B", "5E8CA0", "8FB3C4", "A8742E"];
      s.addShape(pres.shapes.RECTANGLE, { x: 6.45, y: by, w: 0.18, h: 0.5, fill: { color: colors[i] } });
      s.addText(b[0], { x: 6.78, y: by, w: 4.4, h: 0.5, margin: 0, fontFace: FONT_B, fontSize: 13, color: C.ink, valign: "middle" });
      s.addText(b[1].toLocaleString("ru-RU") + " ₸", { x: 11.2, y: by, w: 1.5, h: 0.5, margin: 0, fontFace: FONT_B, fontSize: 13, bold: true, color: C.navy, align: "right", valign: "middle" });
      by += 0.62;
    });
    s.addShape(pres.shapes.LINE, { x: 6.45, y: by + 0.02, w: 6.25, h: 0, line: { color: C.gold, width: 1.5 } });
    s.addText("БАРЛЫҒЫ", { x: 6.78, y: by + 0.1, w: 4, h: 0.5, margin: 0, fontFace: FONT_B, fontSize: 14, bold: true, color: C.navy, valign: "middle" });
    s.addText("3 000 000 ₸", { x: 11.0, y: by + 0.1, w: 1.7, h: 0.5, margin: 0, fontFace: FONT_H, fontSize: 16, bold: true, color: C.goldDk, align: "right", valign: "middle" });
    pageNum(s, 9);
  }

  // ========================================================
  // СЛАЙД 10 - Жол картасы және Болашақ
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.navy };
    s.addShape(pres.shapes.OVAL, { x: -2, y: H - 3.5, w: 5.5, h: 5.5, fill: { color: C.steppe, transparency: 65 }, line: { type: "none" } });

    s.addText("ЖОЛ КАРТАСЫ ЖӘНЕ БОЛАШАҚ", { x: 0.7, y: 0.5, w: 9, h: 0.4, margin: 0, fontFace: FONT_B, fontSize: 13, bold: true, color: C.gold, charSpacing: 3 });
    s.addText("MVP-ден ұлттық платформаға дейін", { x: 0.7, y: 0.95, w: 12, h: 0.8, margin: 0, fontFace: FONT_H, fontSize: 30, bold: true, color: C.white });

    // 4 кезең timeline
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
      s.addText(p.t, { x: cx - 1.2, y: 3.1, w: 2.4, h: 0.4, margin: 0, align: "center", fontFace: FONT_H, fontSize: 16, bold: true, color: C.white });
      s.addText(p.d, { x: cx - 1.2, y: 3.52, w: 2.4, h: 0.75, margin: 0, align: "center", fontFace: FONT_B, fontSize: 11.5, color: C.cream, lineSpacingMultiple: 1.05 });
    });

    s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 4.6, w: 11.93, h: 1.2, fill: { color: C.white }, shadow: shadow() });
    s.addShape(pres.shapes.OVAL, { x: 0.95, y: 4.85, w: 0.65, h: 0.65, fill: { color: C.navy } });
    s.addImage({ data: ic.map, x: 1.09, y: 4.99, w: 0.37, h: 0.37 });
    s.addText("Келесі маңызды қадам: Интерактивті тарихи карта", { x: 1.85, y: 4.75, w: 6.0, h: 0.5, margin: 0, fontFace: FONT_H, fontSize: 16.5, bold: true, color: C.navy, valign: "middle" });
    s.addText("Кеңістік пен уақыт синхроны. Таймлайндағы ползунокты жылжыту арқылы картадағы шекаралардың өзгеруін бақылау. Оқиғаны, оның орналасқан жерін және ИИ-тұлғаның пікірін бір жүйеде біріктіру.", { x: 1.85, y: 5.2, w: 9.5, h: 0.6, margin: 0, fontFace: FONT_B, fontSize: 12.5, color: C.ink, valign: "middle", lineSpacingMultiple: 1.1 });

    s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 6.1, w: 11.93, h: 1.0, fill: { color: C.gold } });
    s.addText("Тарихты жаттатпай, сүйдіретін платформа.", { x: 1.05, y: 6.15, w: 7.5, h: 0.5, margin: 0, fontFace: FONT_H, fontSize: 18, bold: true, color: C.navy });
    s.addText("Жаңа ұрпақты тәуелсіздік тарихымен жалғастырамыз.", { x: 1.05, y: 6.6, w: 7.5, h: 0.4, margin: 0, fontFace: FONT_B, fontSize: 14, color: "3A2E12" });
    
    s.addImage({ data: ic.env, x: 8.7, y: 6.34, w: 0.28, h: 0.28 });
    s.addText("bekasyl.kar@gmail.com", { x: 9.05, y: 6.3, w: 3.3, h: 0.35, margin: 0, fontFace: FONT_B, fontSize: 12, bold: true, color: C.navy, valign: "middle" });
    s.addImage({ data: ic.gh, x: 8.7, y: 6.74, w: 0.28, h: 0.28 });
    s.addText("github.com/bekarazhan/tarixi-timeline", { x: 9.05, y: 6.7, w: 3.5, h: 0.35, margin: 0, fontFace: FONT_B, fontSize: 11, color: C.navy, valign: "middle" });
  }

  await pres.writeFile({ fileName: "/Users/bekas/Developer/tarixi-timeline/grant-presentation/Tarixi-Timeline_Tauelsizdik_urpaqtary.pptx" });
  console.log("DONE");
})().catch((e) => { console.error(e); process.exit(1); });
