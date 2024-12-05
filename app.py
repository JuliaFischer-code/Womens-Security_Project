from flask import Flask, render_template, request, jsonify, send_from_directory
import requests
import os
from gtts import gTTS

app = Flask(__name__)

# XAI API setup
XAI_API_KEY = "xai-GzNVUttSmeDYf1Jo9Q2LJt1795nza5A98uXMeJocBehHTbUa26rbZAdbZSDROTO3EZPnCEsHlKAVIyDY"
XAI_BASE_URL = "https://api.x.ai/v1"

# Create a directory to store audio files if it doesn't exist
AUDIO_FOLDER = "static/audio"
os.makedirs(AUDIO_FOLDER, exist_ok=True)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/call")
def call():
    return render_template("call.html")

@app.route("/api/call", methods=["POST"])
def api_call():
    user_message = request.json.get("message")
    if not user_message:
        return jsonify({"error": "Message cannot be empty"}), 400

    try:
        # Make the API call to XAI
        response = requests.post(
            f"{XAI_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {XAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "grok-beta",
                "messages": [
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": user_message},
                ],
            }
        )

        if response.status_code == 200:
            data = response.json()
            chatbot_response = data['choices'][0]['message']['content']

            # Convert chatbot response to speech
            tts = gTTS(text=chatbot_response, lang="en")
            audio_file_path = os.path.join(AUDIO_FOLDER, "response.mp3")
            tts.save(audio_file_path)

            return jsonify({
                "response": chatbot_response,
                "audio_url": f"/{audio_file_path}"
            })
        else:
            return jsonify({"error": f"Error: {response.status_code}, {response.text}"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)