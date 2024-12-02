import os
from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

# XAI API setup
XAI_API_KEY = "xai-GzNVUttSmeDYf1Jo9Q2LJt1795nza5A98uXMeJocBehHTbUa26rbZAdbZSDROTO3EZPnCEsHlKAVIyDY"
XAI_BASE_URL = "https://api.x.ai/v1"  # XAI API base URL

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/call")
def call():
    return render_template("call.html")

@app.route("/chat")
def chat():
    return render_template("chat.html")

@app.route("/sos")
def sos():
    return render_template("sos.html")

# API endpoint to handle chat requests
@app.route("/api/chat", methods=["POST"])
def api_chat():
    user_message = request.json.get("message")  # Get the user's message
    if not user_message:
        return jsonify({"error": "Message cannot be empty"}), 400

    try:
        # Make the API call to XAI
        response = requests.post(
            f"{XAI_BASE_URL}/chat/completions",  # XAI's chat completion endpoint
            headers={
                "Authorization": f"Bearer {XAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "grok-beta",  # Example model, replace with the actual model name if necessary
                "messages": [
                    {"role": "system", "content": "You are Grok, a chatbot inspired by the Hitchhiker's Guide to the Galaxy."},
                    {"role": "user", "content": user_message},
                ],
            }
        )

        # Handle the response from XAI API
        if response.status_code == 200:
            data = response.json()
            chatbot_response = data['choices'][0]['message']['content']
            return jsonify({"response": chatbot_response})
        else:
            return jsonify({"error": f"Error: {response.status_code}, {response.text}"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)