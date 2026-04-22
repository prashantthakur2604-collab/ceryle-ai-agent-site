// Updated script.js

async function getWeatherData(location) {
    try {
        // Call to your backend API instead of OpenWeatherMap API directly
        const response = await fetch(`https://your-backend-api.com/weather?location=${location}`);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        // Process and return the data as needed
        return data;
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

// Other functions can remain unchanged, but replace API calls accordingly.
