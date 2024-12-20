// Google Maps Functionality
function initMap() {
    let map;
    let userLocation;
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();

    // Initialize the map
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 49.1427, lng: 9.2109 },
        zoom: 13
    });
    directionsRenderer.setMap(map);

    // Geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setCenter(userLocation);
            },
            () => console.log("Geolocation failed.")
        );
    } else {
        console.log("Geolocation is not supported by this browser.");
    }

    // Search Location
    document.getElementById("search-button").addEventListener("click", () => {
        const query = document.getElementById("search-input").value;
        if (!query) return;

        const service = new google.maps.places.PlacesService(map);
        service.findPlaceFromQuery({ query, fields: ["name", "geometry"] }, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results[0]) {
                const place = results[0];
                map.setCenter(place.geometry.location);
                new google.maps.Marker({
                    position: place.geometry.location,
                    map
                });
            } else {
                alert("Place not found!");
            }
        });
    });
}

// Chat Functionality
document.getElementById("chat-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.getElementById("user-input").value.trim();

    if (input) {
        const chatLog = document.getElementById("chat-log");
        const userMessage = document.createElement("div");
        userMessage.className = "chat-message user-message";
        userMessage.textContent = input;
        chatLog.appendChild(userMessage);

        fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: input })
        })
        .then(response => response.json())
        .then(data => {
            const botMessage = document.createElement("div");
            botMessage.className = "chat-message bot-message";
            botMessage.textContent = data.response;
            chatLog.appendChild(botMessage);
        });
    }
});

// Initialize map on page load
initMap();
