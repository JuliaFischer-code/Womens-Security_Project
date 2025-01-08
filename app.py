from flask import Flask, render_template, request, jsonify
import requests
import os

app = Flask(__name__)

# OpenAI API setup
OPENAI_API_KEY = "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"  # Replace with your actual OpenAI API key
OPENAI_BASE_URL = "https://api.openai.com/v1/chat/completions"

# Create a directory to store audio files if it doesn't exist
AUDIO_FOLDER = "static/audio"
os.makedirs(AUDIO_FOLDER, exist_ok=True)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat")
def chat():
    return render_template("chat.html")

@app.route("/sos")
def sos():
    return render_template("sos.html")

@app.route("/call")
def call():
    return render_template("call.html")

@app.route("/api/chat", methods=["POST"])
def api_chat():
    user_message = request.json.get("message")
    if not user_message:
        return jsonify({"error": "Message cannot be empty"}), 400

    try:
        # Make the API call to OpenAI
        response = requests.post(
            OPENAI_BASE_URL,
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "gpt-3.5-turbo",  # Use the desired OpenAI model
                "messages": [
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": user_message},
                ],
                "max_tokens": 150,
                "temperature": 0.7,
            }
        )

        if response.status_code == 200:
            data = response.json()
            chatbot_response = data['choices'][0]['message']['content']

            return jsonify({
                "response": chatbot_response
            })
        else:
            return jsonify({"error": f"Error: {response.status_code}, {response.text}"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/call", methods=["POST"])
def api_call():
    user_message = request.json.get("message")
    if not user_message:
        return jsonify({"error": "Message cannot be empty"}), 400

    try:
        # Make the API call to OpenAI
        response = requests.post(
            OPENAI_BASE_URL,
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "gpt-3.5-turbo",  # Use the desired OpenAI model
                "messages": [
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": user_message},
                ],
                "max_tokens": 150,
                "temperature": 0.7,
            }
        )

        if response.status_code == 200:
            data = response.json()
            chatbot_response = data['choices'][0]['message']['content']

            return jsonify({
                "response": chatbot_response
            })
        else:
            return jsonify({"error": f"Error: {response.status_code}, {response.text}"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "_main_":
    app.run(host="0.0.0.0", port=5001)