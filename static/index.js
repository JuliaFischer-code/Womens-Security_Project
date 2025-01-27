console.log("JavaScript ist geladen und funktioniert!");

// Initialize variables for Google Maps
let map, directionsService, directionsRenderer, userLocation;
let markers = []; // Liste für alle Marker

// Helper function to scroll to the bottom of the chat log
function scrollToBottom() {
    const chatLog = document.getElementById("chat-log");
    chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: "smooth" });
}

// Function to hide the chat placeholder
function hideChatPlaceholder() {
    const placeholder = document.getElementById("chat-placeholder");
    if (placeholder) {
        placeholder.style.display = "none"; // Hide placeholder
    }
}

// Handle chat form submission
document.getElementById("chat-form").addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent page reload
    const input = document.getElementById("user-input").value.trim();

    if (input) {
        const chatLog = document.getElementById("chat-log");

        // Hide the placeholder
        hideChatPlaceholder();

        // Display user message in the chatbox
        const userMessage = document.createElement("div");
        userMessage.className = "chat-message user-message";
        userMessage.textContent = input;
        chatLog.appendChild(userMessage);

        // Scroll to the bottom after adding the user message
        scrollToBottom();

        document.getElementById("user-input").value = ""; // Clear input field

        try {
            // Send the message to the backend
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input }),
            });

            if (response.ok) {
                const data = await response.json();

                // Display bot response
                const botMessage = document.createElement("div");
                botMessage.className = "chat-message bot-message";
                botMessage.textContent = data.response;
                chatLog.appendChild(botMessage);

                // Hide placeholder (in case it reappears accidentally)
                hideChatPlaceholder();

                // Scroll to the bottom after adding the bot response
                scrollToBottom();
            } else {
                console.error("Error from backend:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error during fetch:", error);
        }
    }
});

// Fetch the closest safe place from the backend
async function fetchClosestSafePlace(query) {
    if (!userLocation) {
        alert("User location not available!");
        return;
    }

    // Remove all existing markers before fetching new data
    clearMarkers();

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

            // Hide the chatbot placeholder
            hideChatPlaceholder();

            // Prepare the message for the chatbox
            let placesMessage = `<p>Here are the 3 nearest ${query}s:</p><ul>`;
            placesMessage += data.places
                .map(
                    (place, index) => `<li>${index + 1}. <strong>${place.name}</strong> (${place.address})</li>`
                )
                .join("");
            placesMessage += "</ul>";

            // Add bot's response to the chatbox
            const chatLog = document.getElementById("chat-log");

            const botMessage = document.createElement("div");
            botMessage.className = "chat-message bot-message";
            botMessage.innerHTML = placesMessage; // Use innerHTML for structured content

            chatLog.appendChild(botMessage);

            // Hide placeholder
            hideChatPlaceholder();

            // Scroll to the latest message
            scrollToBottom();

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


// Entferne alle Marker von der Karte
function clearMarkers() {
    markers.forEach((marker) => {
        marker.setMap(null); // Entferne den Marker von der Karte
    });
    markers = []; // Leere die Marker-Liste
}

// Debugging: Anzahl der Marker auf der Karte
function logMarkerCount() {
    console.log(`Number of markers on the map: ${markers.length}`);
}

// Show safe places nearby
function showSafePlaces() {
    console.log("Safe places button clicked.");

    if (userLocation) {
        console.log("Fetching safe places for categories: hospital, police station, fire station");

        // Hide the chatbot placeholder
        hideChatPlaceholder();
        
        // Entferne alle bestehenden Marker vor dem Hinzufügen neuer
        clearMarkers();

        // Alle Kategorien nacheinander abrufen
        const categories = ["hospital", "police station", "fire station"];
        categories.forEach((category) => {
            fetchClosestSafePlace(category);
        });
    } else {
        alert("User location not available! Please enable location services.");
    }
}

// Show shops nearby (example of another button)
function showShopsNearby() {
    console.log("Shops nearby button clicked.");

    if (userLocation) {
        console.log("Fetching shops nearby");

        // Hide the chatbot placeholder
        hideChatPlaceholder();
        
        // Entferne alte Marker
        clearMarkers();

        // Kategorie "shop" abrufen
        fetchClosestSafePlace("shop");
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

        // Scroll to the bottom after adding the user message
        scrollToBottom();

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
                // Scroll to the bottom after adding the bot response
                scrollToBottom();
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

    // Entferne alte Marker, bevor neue hinzugefügt werden
    clearMarkers();

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
            
            // Hide the chatbot placeholder
            hideChatPlaceholder();

            // Scroll to the latest message
            scrollToBottom();

            // Plot markers on the map
            data.places.forEach((place) => {
                createMarker(place);
            });
        } else {
            const error = await response.json();
            const errorMessage = `No open ${query} found around you.`;

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

    // Benutzerdefiniertes Pin-Icon für den Nutzerstandort
    const userLocationIcon = {
        url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png", // Blauer Punkt (Pin-Stil)
        scaledSize: new google.maps.Size(30, 30), // Icon-Größe (kleiner und dezent)
    };

    // Nutzerstandort ermitteln und Marker setzen
    navigator.geolocation?.getCurrentPosition(
        (position) => {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };
            console.log("User location obtained:", userLocation);
            map.setCenter(userLocation);
            // Marker mit benutzerdefiniertem Icon
            new google.maps.Marker({
                position: userLocation,
                map: map,
                icon: userLocationIcon, // Benutzerdefiniertes Pin-Icon
                title: "Your Location",
            });
        },
        (error) => {
            console.error("Geolocation error:", error);
        }
    );
}

// Add Speech-to-Text functionality
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US'; // Set the recognition language (adjust as needed)
    recognition.interimResults = false; // Return only final results
    recognition.continuous = false; // Single result per session

    const micButton = document.getElementById("mic-button");
    const userInput = document.getElementById("user-input");

    micButton.addEventListener("click", () => {
        // Start speech recognition
        recognition.start();
        micButton.disabled = true; // Disable button while listening
        micButton.textContent = "🎙️ Listening..."; // Show "listening" state
    });

    recognition.addEventListener("result", (event) => {
        const transcript = event.results[0][0].transcript; // Capture the speech text
        const userInput = document.getElementById("user-input");
        const chatForm = document.getElementById("chat-form");
    
        userInput.value = transcript; // Insert text into the input field
    
        // Automatically submit the form
        const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
        chatForm.dispatchEvent(submitEvent);
    });
    

    recognition.addEventListener("end", () => {
        // Reset button state when recognition ends
        micButton.disabled = false;
        micButton.textContent = "🎤"; // Reset button text to default
    });

    recognition.addEventListener("error", (event) => {
        console.error("Speech recognition error:", event.error);
        micButton.disabled = false;
        micButton.textContent = "🎤"; // Reset button text in case of errors
    });
} else {
    // Disable the microphone button if the browser doesn't support speech-to-text
    const micButton = document.getElementById("mic-button");
    micButton.disabled = true;
    micButton.title = "Speech-to-text not supported in this browser.";
}

window.onload = initMap; // Initialize the map when the page loads