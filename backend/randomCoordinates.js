//Calculate Distance Between Coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
    const toRadians = angle => (angle * Math.PI) / 180;
    const R = 6371e3; // metres

    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δφ = toRadians(lat2-lat1);
    const Δλ = toRadians(lon2-lon1);

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
}


// Generates Random Coordinates, Taking Random Numbers as Input (Chainlink VRF)
async function generateRandomCoordinatesLimited(rand1, rand2) {

    //List of Allowed Cities
    const cities = [
        { name: "New York", latitude: 40.7128, longitude: -74.0060 },
        { name: "Paris", latitude: 48.8566, longitude: 2.3522 },
        { name: "London", latitude: 51.5074, longitude: -0.1278 },
        { name: "Tokyo", latitude: 35.6895, longitude: 139.6917 },
        { name: "Sydney", latitude: -33.8688, longitude: 151.2093 },
        { name: "Sao Paulo", latitude: -23.5505, longitude: -46.6333 },
        { name: "Mexico City", latitude: 19.4326, longitude: -99.1332 },
        { name: "Cairo", latitude: 30.0444, longitude: 31.2357 },
        { name: "Istanbul", latitude: 41.0082, longitude: 28.9784 },
        { name: "Rio de Janeiro", latitude: -22.9068, longitude: -43.1729 },
        { name: "Los Angeles", latitude: 34.0522, longitude: -118.2437 }
    ];

    const latitude = rand1 % 180 - 90; // Latitude: -90 to 90
    const longitude = rand2 % 360 - 180; // Longitude: -180 to 180

    let closestCity = cities.reduce((prev, curr) => {
        const distance = calculateDistance(latitude, longitude, curr.latitude, curr.longitude);
        return distance < prev.distance ? { city: curr, distance } : prev;
    }, { city: null, distance: Infinity });

    return {
        randomCoordinates: { latitude, longitude },
        closestCity: closestCity.city.name,
        closestCityCoordinates: { latitude: closestCity.city.latitude, longitude: closestCity.city.longitude },
        distanceToClosestCity: closestCity.distance
    };
}

// (async () => {
//     const result = await generateRandomCoordinatesLimited(1291287412, 12874261872);
//     if (result) {
//         console.log('Generated Coordinates:', result.randomCoordinates);
//         console.log('Closest City:', result.closestCity);
//         console.log('Coordinates of Closest City:', result.closestCityCoordinates);
//     }
// })();

export { generateRandomCoordinatesLimited, calculateDistance };

