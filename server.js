import http from "http";
import https from "https";
import fs from "fs";
import path from "path";
import url from "url";

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("❌ ERROR: Missing API_KEY environment variable.");
  process.exit(1);
}

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

function proxyJson(res, targetUrl) {
  https.get(targetUrl, (apiRes) => {
    let data = "";

    apiRes.on("data", chunk => data += chunk);
    apiRes.on("end", () => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(data);
    });
  }).on("error", (err) => {
    console.error("OpenWeather error:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to fetch weather data" }));
  });
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);

  // ======== OPENWEATHER PROXY: CURRENT WEATHER ========
  if (parsed.pathname === "/api/weather/current") {
    const { lat, lon, q, units } = parsed.query;

    let target;

    if (lat && lon) {
      target = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units || "imperial"}&appid=${API_KEY}`;
    } else if (q) {
      target = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(q)}&units=${units || "imperial"}&appid=${API_KEY}`;
    } else {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Missing lat/lon or q" }));
    }

    return proxyJson(res, target);
  }

  // ======== OPENWEATHER PROXY: 5-DAY / 3-HOUR FORECAST ========
  if (parsed.pathname === "/api/weather/forecast") {
    const { lat, lon, units } = parsed.query;

    if (!lat || !lon) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Missing lat/lon" }));
    }

    const target =
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units || "imperial"}&appid=${API_KEY}`;

    return proxyJson(res, target);
  }

  // ======== STATIC FILES (index.html, manifest.json, icons, etc.) ========
  let filePath = parsed.pathname === "/"
    ? path.join(__dirname, "index.html")
    : path.join(__dirname, parsed.pathname);

  const ext = path.extname(filePath);

  const mimeTypes = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".webmanifest": "application/manifest+json",
    ".ico": "image/x-icon"
  };

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Not found");
    }

    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "text/plain" });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
