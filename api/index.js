const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/screenshot", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: "Missing url query parameter" });
  }

  try {
    const browser = await puppeteer.launch({
      headless: "new", // use true if puppeteer < v20
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // Take screenshot directly into memory
    const screenshot = await page.screenshot({ fullPage: true });

    await browser.close();

    // Send as image buffer instead of saving file
    res.set("Content-Type", "image/png");
    res.send(screenshot);

  } catch (err) {
    console.error("Screenshot error:", err);
    res.status(500).json({ error: "Failed to capture screenshot" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
