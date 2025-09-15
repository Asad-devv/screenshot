// api/screenshot.js

import express from "express";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

const app = express();
const PORT = process.env.PORT || 3000;

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

    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
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

    // Remove navbar, wallet list, watermark
    await page.evaluate(() => {
      const nav = document.querySelector("header");
      if (nav) nav.remove();

      const walletList = document.querySelector(".side-table, [class*='SideTable']");
      if (walletList) walletList.remove();

      const watermark = document.querySelector(".iframe-watermark");
      if (watermark) watermark.remove();
    });
    logs.push("Removed navbar, wallet list, watermark");

    await page.waitForTimeout(8000); // wait for re-render

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

// Root route
app.get("/", (req, res) => {
  res.send("Server running - use /screenshot?url=https://example.com");
});

// Screenshot route
app.get("/screenshot", async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "Missing url query parameter" });
  }

  const result = await captureScreenshot(url);

  if (result.error) {
    return res.status(500).json(result);
  }

  res.setHeader("Content-Type", "image/png");
  return res.send(result.screenshot);
});

// Local dev only
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });


export default app;
