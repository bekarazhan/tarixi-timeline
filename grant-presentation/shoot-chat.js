const puppeteer = require("puppeteer-core");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = "/Users/bekas/Developer/tarixi-timeline/grant-presentation";

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: "new",
    defaultViewport: { width: 1600, height: 900, deviceScaleFactor: 2 },
    args: ["--no-sandbox", "--force-color-profile=srgb"],
  });
  const page = await browser.newPage();
  await page.goto("http://localhost:7788/index.html", { waitUntil: "networkidle0" });
  await page.waitForFunction(() => window.ALL_ITEMS && window.ChatPanel && document.querySelectorAll(".tl-item").length > 0, { timeout: 15000 });
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
    const answers = [
      "Мен — Әбу Насыр әл-Фараби, Отырар қаласында дүниеге келдім. Философия, музыка және ғылымды зерттедім. Аристотельден кейінгі «Екінші ұстаз» атандым.",
      "Бақыт — адам ақыл-парасат пен ізгі істер арқылы жететін ең жоғары мақсат. Ол тек қайырымды қалада, әділ басқару мен білім жарасқанда ғана толық орнайды.",
    ];
    window.__turn = 0;
    const enc = new TextEncoder();
    window.fetch = async () => {
      const a = answers[Math.min(window.__turn++, answers.length - 1)];
      const sse = "data: " + JSON.stringify({ choices: [{ delta: { content: a } }] }) + "\n\ndata: [DONE]\n\n";
      return new Response(new ReadableStream({ start(c) { c.enqueue(enc.encode(sse)); c.close(); } }), { status: 200 });
    };
    localStorage.setItem("tarixi-chat-provider", "groq");
    localStorage.setItem("tarixi-groq-key", "gsk_demo");
    const div = document.createElement("div"); div.id = "__chat"; document.body.appendChild(div);
    window.__root = ReactDOM.createRoot(div);
    const item = window.ALL_ITEMS.find(i => i.id === "al-farabi");
    window.__root.render(React.createElement(window.ChatPanel, { item, onClose() {} }));
  });
  await page.waitForSelector(".chat-input", { timeout: 8000 });

  const ask = async (q) => {
    await page.evaluate((text) => {
      const ta = document.querySelector(".chat-input");
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
      setter.call(ta, text); ta.dispatchEvent(new Event("input", { bubbles: true }));
    }, q);
    await new Promise(r => setTimeout(r, 150));
    await page.click(".chat-send");
    await page.waitForFunction(() => {
      const a = document.querySelectorAll(".chat-msg.assistant");
      return a.length > 0 && a[a.length - 1].textContent.length > 15 && !document.querySelector(".chat-typing");
    }, { timeout: 8000 });
    await new Promise(r => setTimeout(r, 200));
  };

  await ask("Сіз кім боласыз?");
  await ask("Бақыт дегеніміз не?");
  await new Promise(r => setTimeout(r, 500));

  // полноэкранный (модал над таймлайном) — 16:9
  await page.screenshot({ path: OUT + "/screen-chat-full.png" });
  // только модал с диалогом
  const modal = await page.$(".chat-modal");
  await modal.screenshot({ path: OUT + "/chat-modal.png" });
  console.log("chat shots done");
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
