const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to capture logs
let logs = [];
const captureLog = (msg) => {
  logs.push(msg);
  console.log(msg);
};

app.get("/", (req, res) => res.send("Hello, this is the root endpoint!"));

app.get("/screenshot", async (req, res) => {
  logs = []; // reset logs for this request
  let checkpoint = 0;

  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ 
      error: "Missing url query parameter",
      logs,
      checkpoint
    });
  }

  try {
    checkpoint = 1;
    captureLog(`Checkpoint ${checkpoint}: launching browser`);

    const browser = await puppeteer.launch({
      headless: "new", // use true if puppeteer < v20
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    checkpoint = 2;
    captureLog(`Checkpoint ${checkpoint}: browser launched`);

    const page = await browser.newPage();
    checkpoint = 3;
    captureLog(`Checkpoint ${checkpoint}: new page opened`);

    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    checkpoint = 4;
    captureLog(`Checkpoint ${checkpoint}: navigated to ${url}`);

    const screenshot = await page.screenshot({ fullPage: true });
    checkpoint = 5;
    captureLog(`Checkpoint ${checkpoint}: screenshot taken`);

    await browser.close();
    checkpoint = 6;
    captureLog(`Checkpoint ${checkpoint}: browser closed`);

    res.set("Content-Type", "image/png");
    res.send(screenshot);

  } catch (err) {
    checkpoint = -1;
    captureLog(`Checkpoint ${checkpoint}: error occurred`);
    captureLog(err.stack || err.message || err);

    res.status(500).json({
      error: "Failed to capture screenshot",
      errormsg: err.message,
      stack: err.stack,
      logs,
      checkpoint
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
