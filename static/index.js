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
        } else {
            document.getElementById("chatBox").innerHTML += `<p>Error: ${data.error}</p>`;
        }
    })
    .catch(error => console.error("Error:", error));
});