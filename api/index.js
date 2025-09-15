const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/screenshot", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: "Missing url query parameter" });
  }

  try {
    const browser = await puppeteer.launch({
      headless: "new", // if older Puppeteer version, use true instead
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    const filename = `screenshot_${Date.now()}.png`;
    const filepath = path.join(__dirname, filename);

    await page.screenshot({ path: filepath, fullPage: true });
    await browser.close();

    res.sendFile(filepath, () => {
      // Clean up the file after sending
      fs.unlink(filepath, (err) => {
        if (err) console.error("Failed to delete file:", err);
      });
    });
  } catch (err) {
    console.error("Screenshot error:", err);
    res.status(500).json({ error: "Failed to capture screenshot" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
