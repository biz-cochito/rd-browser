import { chromium } from 'playwright';
import { exec } from 'child_process';

const server = exec('npm run preview -- --port 4173');

setTimeout(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[${msg.type()}] ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.log(`[PAGE ERROR] ${error.message}`);
  });

  try {
    await page.goto('http://localhost:4173');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshot.png' });
    console.log("Screenshot taken.");
  } catch (e) {
    console.log("Navigation error:", e);
  }

  await browser.close();
  server.kill();
  process.exit(0);
}, 3000);
