const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { marked } = require('marked');

// Paths
const cssPath = require.resolve('github-markdown-css/github-markdown.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

const files = [
  {
    input: path.join(__dirname, '../Приложение_2_Описание.md'),
    output: path.join(__dirname, '../Приложение_2_Описание.pdf'),
    title: 'Описание проекта'
  },
  {
    input: path.join(__dirname, '../Смета_расходов.md'),
    output: path.join(__dirname, '../Смета_расходов.pdf'),
    title: 'Смета расходов'
  },
  {
    input: path.join(__dirname, '../Қосымша_2_Сипаттама.md'),
    output: path.join(__dirname, '../Қосымша_2_Сипаттама.pdf'),
    title: 'Жобаның сипаттамасы'
  },
  {
    input: path.join(__dirname, '../Шығындар_сметасы.md'),
    output: path.join(__dirname, '../Шығындар_сметасы.pdf'),
    title: 'Шығындар сметасы'
  }
];

const generateHTML = (markdownContent, title) => `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    ${cssContent}
    body {
      box-sizing: border-box;
      min-width: 200px;
      max-width: 980px;
      margin: 0 auto;
      padding: 45px;
    }
    .markdown-body {
      font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji";
      font-size: 14px;
    }
    @media print {
      body {
        padding: 0;
      }
      .markdown-body {
        font-size: 12pt;
      }
    }
  </style>
</head>
<body class="markdown-body">
  ${marked.parse(markdownContent)}
</body>
</html>
`;

(async () => {
  // Try to find local Chrome, if not, download/use bundled. 
  // We used puppeteer-core in shoot.js, but wait, did we use puppeteer or puppeteer-core? 
  // In shoot.js we used require('puppeteer-core') and launched Chrome from a specific path.
  // Let's copy the launch logic from shoot.js
  
  const macPaths = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
  ];
  let execPath = macPaths.find(fs.existsSync);

  if (!execPath) {
    console.error("No Chrome found!");
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    executablePath: execPath,
    headless: "new"
  });

  for (const file of files) {
    const md = fs.readFileSync(file.input, 'utf8');
    const html = generateHTML(md, file.title);
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    await page.pdf({
      path: file.output,
      format: 'A4',
      margin: { top: '2cm', right: '2cm', bottom: '2cm', left: '2cm' },
      printBackground: true
    });
    console.log(`Generated ${file.output}`);
  }

  await browser.close();
})();
