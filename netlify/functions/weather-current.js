export async function handler(event) {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const { lat, lon, units = "imperial", q } =
      event.queryStringParameters || {};

    let url;

    if (q) {
      url = `https://api.openweathermap.org/data/2.5/weather` +
            `?q=${encodeURIComponent(q)}` +
            `&units=${units}` +
            `&appid=${apiKey}`;
    } else if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather` +
            `?lat=${lat}` +
            `&lon=${lon}` +
            `&units=${units}` +
            `&appid=${apiKey}`;
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "lat/lon or q required" })
      };
    }

    const res = await fetch(url);
    const data = await res.json();

    return {
      statusCode: res.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}

