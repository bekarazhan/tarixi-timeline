const puppeteer = require("puppeteer-core");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = "/Users/bekas/Developer/tarixi-timeline/grant-presentation";

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    defaultViewport: { width: 1600, height: 900, deviceScaleFactor: 2 },
    args: ["--no-sandbox", "--force-color-profile=srgb"],
  });
  const page = await browser.newPage();
  
  // Set mock API key to bypass key prompt
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('groq_key', 'mock_key');
    localStorage.setItem('llm_provider', 'groq');
  });

  await page.goto("http://localhost:7788/index.html", { waitUntil: "networkidle0" });
  await page.waitForFunction(() => window.ALL_ITEMS && document.querySelectorAll(".tl-item").length > 0, { timeout: 15000 });
  await new Promise((r) => setTimeout(r, 1200));

  // 1) Жалпы шолу
  await page.screenshot({ path: OUT + "/screen-overview.png" });
  console.log("overview saved");

  // 2) Детальді панель ашу
  await page.evaluate(() => {
    const want = (window.ALL_ITEMS || []).find((i) => i.photoUrl);
    const els = Array.from(document.querySelectorAll(".tl-item"));
    let target = els[0];
    for (const el of els) {
      const fk = Object.keys(el).find((k) => k.startsWith("__reactFiber"));
      const p = el[fk] && el[fk].memoizedProps;
      if (p && p.onClick) { target = el; break; }
    }
    const fk = Object.keys(target).find((k) => k.startsWith("__reactFiber"));
    const onClick = target[fk] && target[fk].memoizedProps && target[fk].memoizedProps.onClick;
    if (onClick) onClick({ target, currentTarget: target, clientX: 0, clientY: 0, stopPropagation() {}, preventDefault() {} });
  });

  // фотоның жүктелуін күтеміз
  await page.waitForFunction(() => {
    const img = document.querySelector(".detail-photo img");
    return img && img.complete && img.naturalWidth > 0;
  }, { timeout: 10000 }).catch(() => console.log("photo not loaded"));
  await new Promise((r) => setTimeout(r, 1200));

  // Capture just the detail panel
  const detailPanel = await page.$('.detail');
  if (detailPanel) {
    await detailPanel.screenshot({ path: OUT + "/crop-detail.png" });
    console.log("crop-detail saved");
  } else {
    await page.screenshot({ path: OUT + "/screen-detail.png" });
    console.log("detail saved");
  }

  // 3) Чат ашу
  await page.evaluate(() => {
    const btn = document.querySelector('.detail-cta');
    if (btn) btn.click();
  });
  
  await page.waitForSelector('.chat-modal', { timeout: 5000 }).catch(() => console.log("chat modal not found"));
  await new Promise((r) => setTimeout(r, 1000));
  
  const chatModal = await page.$('.chat-modal');
  if (chatModal) {
    await chatModal.screenshot({ path: OUT + "/chat-modal.png" });
    console.log("chat-modal saved");
  }
  
  await page.screenshot({ path: OUT + "/screen-chat-full.png" });
  console.log("screen-chat-full saved");

  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
