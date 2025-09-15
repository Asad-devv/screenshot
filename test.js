// download-screenshot.js

const axios = require("axios");
const fs = require("fs");

async function downloadScreenshot() {
  try {
    const url =
      "https://screenshot-sable-pi.vercel.app/screenshot?url=https://app.bubblemaps.io/sol/token/ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82";

    const response = await axios.get(url, {
      responseType: "arraybuffer", // important: get binary data
    });
    

    fs.writeFileSync("screenshot.png", response.data);
    console.log("✅ Screenshot saved as screenshot.png");
  } catch (error) {
    console.error("❌ Failed to download screenshot:", error.message);
  }
}

downloadScreenshot();
