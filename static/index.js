console.log("JavaScript ist geladen und funktioniert!");

// Initialize variables for Google Maps
let map, directionsService, directionsRenderer, userLocation;
let markers = []; // Liste für alle Marker

// Show safe places nearby
function showSafePlaces() {
    console.log("Safe places button clicked."); // Debug log

    if (userLocation) {
        console.log("Fetching safe places for categories: hospital, police station, fire station"); // Debug log
        fetchClosestSafePlace("hospital");
        fetchClosestSafePlace("police station");
        fetchClosestSafePlace("fire station");
    } else {
        alert("User location not available! Please enable location services.");
    }
}

// Show emergency contacts in a modal
function showEmergencyContacts() {
    console.log("Emergency contacts button clicked."); // Debug log
    const modal = document.getElementById("modal");
    modal.style.display = "flex";
}

// Close the emergency contacts modal
function closeModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "none";
}

// Confirm a call to an emergency contact
function confirmCall(phoneNumber) {
    const confirmAction = confirm(`Do you want to call ${phoneNumber}?`);
    if (confirmAction) {
        window.location.href = `tel:${phoneNumber}`;
    }
}

// Safety Protocol
function showSafetyProtocol() {
    const modal = document.getElementById("safety-protocol-modal");
    if (modal) {
        modal.style.display = "flex"; // Modal anzeigen
        console.log("Safety Protocol modal displayed.");
    } else {
        console.error("Safety Protocol modal not found!");
    }
}

function closeSafetyProtocol() {
    const modal = document.getElementById("safety-protocol-modal");
    if (modal) {
        modal.style.display = "none"; // Modal verstecken
        console.log("Safety Protocol modal hidden.");
    } else {
        console.error("Safety Protocol modal not found!");
    }
}

// Globally expose the functions
window.showSafetyProtocol = showSafetyProtocol;
window.closeSafetyProtocol = closeSafetyProtocol;

// Handle chat form submission
document.getElementById("chat-form").addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent page reload
    const input = document.getElementById("user-input").value.trim();

    console.log("User input:", input); // Debug log

    if (input) {
        const chatLog = document.getElementById("chat-log");

        // Display user message in the chatbox
        const userMessage = document.createElement("div");
        userMessage.className = "chat-message user-message";
        userMessage.textContent = input;
        chatLog.appendChild(userMessage);

        document.getElementById("user-input").value = ""; // Clear input field

        console.log("Sending user input to backend...");

        try {
            // Send the message to the backend
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input }),
            });

            console.log("Response from backend:", response);

            if (response.ok) {
                const data = await response.json();
                console.log("Response data:", data);

                // Display bot response
                const botMessage = document.createElement("div");
                botMessage.className = "chat-message bot-message";
                botMessage.textContent = data.response;
                chatLog.appendChild(botMessage);
            } else {
                console.error("Error from backend:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error during fetch:", error);
        }
    } else {
        console.warn("Empty input submitted.");
    }
});

// Fetch the closest safe place from the backend
async function fetchClosestSafePlace(query) {
    console.log("Fetching closest safe place for query:", query);

    if (!userLocation) {
        console.warn("User location not available!");
        alert("User location not available!");
        return;
    }

    try {
        const response = await fetch("/api/safe-places", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                location: userLocation,
                query: query,
            }),
        });

        if (response.ok) {
            const data = await response.json();

            // Prepare the message for the chatbox
            let placesMessage = `Here are the 3 nearest ${query}s:\n`;
            placesMessage += data.places
                .map(
                    (place, index) =>
                        `${index + 1}. ${place.name} (${place.address})`
                )
                .join("\n");

            // Add bot's response to the chatbox
            const chatLog = document.getElementById("chat-log");

            const botMessage = document.createElement("div");
            botMessage.className = "chat-message bot-message";
            botMessage.textContent = placesMessage;

            chatLog.appendChild(botMessage);

            // Plot markers on the map
            data.places.forEach((place) => {
                createMarker(place);
            });
        } else {
            const error = await response.json();
            const errorMessage = `Error fetching ${query}: ${error.error}`;

            // Display error message in chatbox
            const chatLog = document.getElementById("chat-log");
            const botMessage = document.createElement("div");
            botMessage.className = "chat-message bot-message";
            botMessage.textContent = errorMessage;

            chatLog.appendChild(botMessage);
        }
    } catch (error) {
        console.error("Error during fetch:", error);
        const chatLog = document.getElementById("chat-log");

        const botMessage = document.createElement("div");
        botMessage.className = "chat-message bot-message";
        botMessage.textContent = `An error occurred while fetching ${query}.`;

        chatLog.appendChild(botMessage);
    }
}

// Create a marker and attach click event for info and directions
function createMarker(place) {
    const marker = new google.maps.Marker({
        position: { lat: place.lat, lng: place.lng },
        map: map,
        title: place.name,
    });

    markers.push(marker); // Speichere den Marker

    const infoWindow = new google.maps.InfoWindow();

    marker.addListener("click", () => {
        const content = `
            <div>
                <h3>${place.name}</h3>
                <p>${place.address}</p>
                <label for="travel-mode">Select travel mode:</label>
                <div style="margin: 10px 0;">
                    <button onclick="setTravelModeAndGetDirections(${place.lat}, ${place.lng}, 'DRIVING')">Car</button>
                    <button onclick="setTravelModeAndGetDirections(${place.lat}, ${place.lng}, 'WALKING')">Walking</button>
                    <button onclick="setTravelModeAndGetDirections(${place.lat}, ${place.lng}, 'BICYCLING')">Bicycle</button>
                    <button onclick="setTravelModeAndGetDirections(${place.lat}, ${place.lng}, 'TRANSIT')">Public Transport</button>
                </div>
            </div>
        `;
        infoWindow.setContent(content);
        infoWindow.open(map, marker);

        // Verstecke andere Marker
        hideOtherMarkers(marker);

        // Event-Listener für das Schließen des Info-Fensters
        google.maps.event.addListener(infoWindow, "closeclick", () => {
            directionsRenderer.setDirections({}); // Lösche Route
            showAllMarkers(); // Zeige alle Marker
        });
    });
}

// Funktion zum Verstecken aller Marker außer dem ausgewählten
function hideOtherMarkers(selectedMarker) {
    markers.forEach((marker) => {
        if (marker !== selectedMarker) {
            marker.setMap(null); // Verstecke Marker
        }
    });
}

// Funktion zum Anzeigen aller Marker
function showAllMarkers() {
    markers.forEach((marker) => {
        marker.setMap(map); // Zeige alle Marker wieder an
    });
}

// Handle travel mode selection and get directions
function setTravelModeAndGetDirections(lat, lng, mode) {
    const travelMode = google.maps.TravelMode[mode];

    const directionsRequest = {
        origin: userLocation,
        destination: { lat: parseFloat(lat), lng: parseFloat(lng) },
        travelMode: travelMode,
    };

    directionsService.route(directionsRequest, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
        } else {
            alert(`Could not retrieve directions: ${status}`);
        }
    });
}

// Google Maps Initialization
function initMap() {
    console.log("Initializing Google Maps...");

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();

    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 49.1427, lng: 9.2109 },
        zoom: 13,
    });

    directionsRenderer.setMap(map);

    navigator.geolocation?.getCurrentPosition(
        (position) => {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };
            console.log("User location obtained:", userLocation);
            map.setCenter(userLocation);
            new google.maps.Marker({ position: userLocation, map });
        },
        (error) => {
            console.error("Geolocation error:", error);
        }
    );
}

window.onload = initMap; // Initialize the map when the page loads