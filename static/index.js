document.getElementById("record-button").addEventListener("click", () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";

    recognition.start();

    recognition.onresult = function(event) {
        const speechResult = event.results[0][0].transcript;
        document.getElementById("user-message").textContent = `You said: "${speechResult}"`;

        // Send the speech text to the server
        fetch("/api/call", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: speechResult }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.response) {
                // Display the LLM response
                document.getElementById("llm-response").textContent = data.response;

                // Set and play the audio response automatically
                const audioElement = document.getElementById("response-audio");
                audioElement.src = data.audio_url;
                audioElement.style.display = "block";
                audioElement.play();
            } else {
                alert("Error: " + (data.error || "Unknown error occurred."));
            }
        })
        .catch(error => console.error("Error:", error));
    };

    recognition.onerror = function(event) {
        console.error("Speech recognition error:", event.error);
    };
});