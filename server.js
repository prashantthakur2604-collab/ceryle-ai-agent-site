const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

if (!OPENWEATHER_API_KEY) {
    console.error('ERROR: OPENWEATHER_API_KEY is not set in environment variables');
    process.exit(1);
}

app.use(cors());
app.use(express.static('public'));

app.get('/api/weather', async (req, res) => {
    try {
        const { city, lat, lon } = req.query;
        if (!city && (!lat || !lon)) {
            return res.status(400).json({ error: 'Provide either city name or coordinates' });
        }

        let geoUrl;
        if (city) {
            geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${OPENWEATHER_API_KEY}`;
        }

        let latitude, longitude, locationData;
        if (city) {
            const geoResponse = await axios.get(geoUrl);
            if (geoResponse.data.length === 0) {
                return res.status(404).json({ error: 'City not found' });
            }
            locationData = geoResponse.data[0];
            latitude = locationData.lat;
            longitude = locationData.lon;
        } else {
            latitude = parseFloat(lat);
            longitude = parseFloat(lon);
            const reverseUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${OPENWEATHER_API_KEY}`;
            const reverseResponse = await axios.get(reverseUrl);
            locationData = reverseResponse.data[0] || { name: 'Unknown', country: 'Unknown' };
        }

        const weatherUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&units=metric&appid=${OPENWEATHER_API_KEY}`;
        const weatherResponse = await axios.get(weatherUrl);
        const weatherData = weatherResponse.data;

        const response = {
            location: {
                name: locationData.name || 'Unknown',
                country: locationData.country || 'Unknown',
                latitude,
                longitude
            },
            current: {
                temp: weatherData.current.temp,
                feels_like: weatherData.current.feels_like,
                humidity: weatherData.current.humidity,
                wind_speed: weatherData.current.wind_speed,
                pressure: weatherData.current.pressure,
                visibility: weatherData.current.visibility,
                uvi: weatherData.current.uvi,
                description: weatherData.current.weather[0].description,
                icon: weatherData.current.weather[0].icon
            },
            forecast: weatherData.daily.slice(1, 6).map(day => ({
                dt: day.dt,
                temp_max: day.temp.max,
                temp_min: day.temp.min,
                description: day.weather[0].description,
                icon: day.weather[0].icon
            }))
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

app.listen(PORT, () => {
    console.log(`Weather Dashboard API Server running on http://localhost:${PORT}`);
});
