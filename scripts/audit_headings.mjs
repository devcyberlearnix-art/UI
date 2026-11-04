import { chromium } from 'playwright';

async function auditAllTitlesAndSubtitles() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const report = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, [class*="title"], [class*="subtitle"], [class*="heading"]'));
    return headings.map(el => {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const text = el.innerText?.trim();
      const isVisible = rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) > 0;
      return {
        tag: el.tagName,
        className: el.className?.slice(0, 80),
        text: text?.slice(0, 60),
        color: style.color,
        bgColor: style.backgroundColor,
        fontSize: style.fontSize,
        opacity: style.opacity,
        display: style.display,
        isVisible,
        hasText: Boolean(text && text.length > 0)
      };
    });
  });

  const invisibleOrEmpty = report.filter(r => !r.isVisible || !r.hasText);
  console.log('Total headings/titles found:', report.length);
  console.log('Headings with issues (invisible or empty):', JSON.stringify(invisibleOrEmpty, null, 2));

  // Also check all p elements that might be subtitles
  const pSubtitles = await page.evaluate(() => {
    const ps = Array.from(document.querySelectorAll('main p'));
    return ps.map(p => {
      const style = window.getComputedStyle(p);
      const rect = p.getBoundingClientRect();
      const text = p.innerText?.trim();
      const isVisible = rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) > 0;
      return {
        text: text?.slice(0, 60),
        color: style.color,
        opacity: style.opacity,
        isVisible,
        hasText: Boolean(text && text.length > 0)
      };
    }).filter(p => !p.isVisible || !p.hasText);
  });

  console.log('P tags with issues (empty or hidden):', JSON.stringify(pSubtitles, null, 2));

  await browser.close();
}

auditAllTitlesAndSubtitles().catch(console.error);

