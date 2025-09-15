// download-screenshot.js

import fs from "fs"
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";



function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function captureScreenshot(url) {
  let browser = null;
  let logs = [];
  let checkpoint = 0;

  try {
    
    checkpoint = 1;
    logs.push(`Checkpoint ${checkpoint}: launching browser`);

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      ignoreHTTPSErrors: true,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    checkpoint = 2;
    logs.push(`Checkpoint ${checkpoint}: browser launched`);

    const page = await browser.newPage();
    checkpoint = 3;
    logs.push(`Checkpoint ${checkpoint}: new page opened`);
await page.setViewport({
  width: 1920,        // width in pixels
  height: 1080,       // height in pixels
  deviceScaleFactor: 2 // makes screenshot high-res
});
    await page.goto(url, { waitUntil: "networkidle2", timeout: 20000 });
    checkpoint = 4;
    logs.push(`Checkpoint ${checkpoint}: navigated to ${url}`);

    // Close modal if present
    try {
      await page.waitForSelector("button", { timeout: 5000 });
      await page.click("button");
      logs.push("Modal closed");
      await page.waitForTimeout(2000); // sleep 2s
    } catch {
      logs.push("No modal found, continuing...");
    }



   await page.evaluate(() => {
  // Remove header
  document.querySelectorAll("header.mdc-top-app-bar, header").forEach(el => el.remove());

  // Remove wallet lists
  document.querySelectorAll(".side-table, [class*='SideTable']").forEach(el => el.remove());

  // Remove watermark
  document.querySelectorAll(".iframe-watermark").forEach(el => el.remove());

  // Remove zoom buttons
  document.querySelectorAll("div.buttons-row.--bottom").forEach(el => el.remove());

  // Remove any element containing 'bubblemaps.io'
  document.querySelectorAll("*").forEach(el => {
    if (el.textContent && el.textContent.includes("bubblemaps.io")) {
      el.remove();
    }
  });
});

await page.evaluate(() => {
  document.querySelectorAll("*").forEach(el => {
    if (el.textContent && el.textContent.includes("bubblemaps.io")) {
      el.remove();
    }
  });
});

await page.evaluate(() => {
  // Remove the zoom buttons row
  document.querySelectorAll("div.buttons-row.--bottom").forEach(el => el.remove());
});
await page.waitForSelector("header.mdc-top-app-bar", { timeout: 10000 }).catch(() => {});

    // Remove navbar, wallet list, watermark
    await page.evaluate(() => {
      const nav = document.querySelector("header");
      if (nav) nav.remove();
        document.querySelectorAll("header.mdc-top-app-bar").forEach(el => el.remove());
  document.querySelectorAll(".iframe-watermark").forEach(el => el.remove());


      const walletList = document.querySelector(".side-table, [class*='SideTable']");
      if (walletList) walletList.remove();
  const allElements = document.querySelectorAll("*");

  allElements.forEach(el => {
    if (el.textContent && el.textContent.includes("bubblemaps.io")) {
      el.remove();
    }
  });
      const watermark = document.querySelector(".iframe-watermark");
      if (watermark) watermark.remove();
    });
    logs.push("Removed navbar, wallet list, watermark");

    await sleep(8000); // wait for re-render

    const screenshot = await page.screenshot({ fullPage: true });
    checkpoint = 5;
    logs.push(`Checkpoint ${checkpoint}: screenshot taken`);

    return { screenshot, logs, checkpoint };
  } catch (err) {
    return { error: err.message, stack: err.stack, logs, checkpoint };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function downloadScreenshot() {
  const targetUrl = "https://app.bubblemaps.io/sol/token/ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82";

  const { screenshot, logs, error, checkpoint } = await captureScreenshot(targetUrl);

  if (error) {
    console.error("❌ Failed to capture screenshot:", error);
    console.log("Logs:", logs);
    console.log("Last checkpoint:", checkpoint);
    return;
  }

  fs.writeFileSync("screenshot.png", screenshot);
  console.log("✅ Screenshot saved as screenshot.png");
  console.log("Logs:", logs);
}


downloadScreenshot();
