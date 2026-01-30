export async function handler(event) {
  try {
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "API key missing" })
      };
    }

    const { lat, lon } = event.queryStringParameters || {};

    if (!lat || !lon) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "lat and lon required" })
      };
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

    const response = await fetch(url);
    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
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

