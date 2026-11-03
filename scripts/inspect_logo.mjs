import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { background: #070709; color: white; padding: 40px; font-family: sans-serif; }
        .box { margin: 20px 0; border: 1px solid #333; padding: 20px; border-radius: 12px; }
      </style>
    </head>
    <body>
      <h2>Logo Files Inspection</h2>
      <div class="box">
        <h3>asivo-logo.png (Raw)</h3>
        <img src="http://127.0.0.1:5173/assets/asivo-logo.png" style="height: 60px; background: #14141A; padding: 8px; border-radius: 8px;" />
      </div>
      <div class="box">
        <h3>asivo-logo-md.png</h3>
        <img src="http://127.0.0.1:5173/assets/asivo-logo-md.png" style="height: 60px; background: #14141A; padding: 8px; border-radius: 8px;" />
      </div>
      <div class="box">
        <h3>asivo-logo-sm.png</h3>
        <img src="http://127.0.0.1:5173/assets/asivo-logo-sm.png" style="height: 40px; background: #14141A; padding: 8px; border-radius: 8px;" />
      </div>
      <div class="box">
        <h3>Current AuthShell Rendering (Notice distortion/tiny size)</h3>
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:40px; height:40px; border-radius:16px; background:#14141A; border:1px solid rgba(197,168,128,0.3); display:flex; align-items:center; justify-content:center;">
            <img src="http://127.0.0.1:5173/assets/asivo-logo-sm.png" style="width:28px; height:28px; object-fit:contain;" />
          </div>
          <div>
            <div style="font-size:20px; font-weight:800;">Asivo</div>
            <div style="font-size:9px; font-weight:700; color:#C5A880; letter-spacing:0.22em;">LEARNING PLATFORM</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'scripts/logo_inspection.png', fullPage: true });
  await browser.close();
  console.log('Saved scripts/logo_inspection.png');
})();

