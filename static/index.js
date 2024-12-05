document.getElementById("sendButton").addEventListener("click", () => {
    const userMessage = document.getElementById("messageInput").value;

    fetch("/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: userMessage })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            document.getElementById("chatBox").innerHTML += `<p><strong>Assistant:</strong> ${data.response}</p>`;
            
            // Play the audio response
            if (data.audio_url) {
                const audio = new Audio(data.audio_url);
                audio.play();
            }
        } else {
            document.getElementById("chatBox").innerHTML += `<p>Error: ${data.error}</p>`;
        }
    })
    .catch(error => console.error("Error:", error));
});

// Voice recording functionality
document.getElementById("recordButton").addEventListener("click", () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";

    recognition.start();

    recognition.onresult = function(event) {
        const speechResult = event.results[0][0].transcript;
        document.getElementById("messageInput").value = speechResult;
    };

    recognition.onerror = function(event) {
        console.error("Error during speech recognition:", event.error);
    };
});