// Initialize variables for Google Maps
let map, directionsService, directionsRenderer, userLocation;

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

        console.log("Safe places response from backend:", response);

        if (response.ok) {
            const data = await response.json();
            const place = data.place;

            console.log(`Closest ${query}:`, place);

            // Plot the closest place on the map
            new google.maps.Marker({
                position: { lat: place.lat, lng: place.lng },
                map: map,
                title: `${place.name}\n${place.address}`,
            });

            alert(`Closest ${query} found: ${place.name}, ${place.address}`);
        } else {
            console.error("Error from backend:", response.status, response.statusText);
            alert(`Could not find a ${query} nearby.`);
        }
    } catch (error) {
        console.error("Error during fetch:", error);
        alert(`An error occurred while fetching ${query}.`);
    }
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