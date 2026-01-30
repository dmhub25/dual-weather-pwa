export async function handler(event) {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const { lat, lon, units = "imperial" } =
      event.queryStringParameters || {};

    if (!lat || !lon) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "lat and lon required" })
      };
    }

    const url =
      `https://api.openweathermap.org/data/2.5/forecast` +
      `?lat=${lat}` +
      `&lon=${lon}` +
      `&units=${units}` +
      `&appid=${apiKey}`;

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

