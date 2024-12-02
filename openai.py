import os
from flask import Flask, render_template, request, jsonify
from openai import OpenAI

# Flask App initialisieren
app = Flask(__name__)

# OpenAI API Key und Client konfigurieren
XAI_API_KEY = "xai-lYnEIiyP5dEMqDwlau3ipLccx0EcEdg7x6HOIKavcJrorS0vho7GANTlPJdES1VdRGbPurepqzCVJPId"

client = OpenAI(
    api_key=XAI_API_KEY,
    base_url="https://api.x.ai/v1",
)

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

@app.route("/api/chat", methods=["POST"])
def chat_api():
    """
    Diese Route empfängt Benutzereingaben, sendet sie an die KI-API und gibt die Antwort zurück.
    """
    user_input = request.json.get("message")  # Eingabe vom Frontend
    if not user_input:
        return jsonify({"error": "Message is required"}), 400

    try:
        # API-Aufruf für Chat Completion
        completion = client.chat.completions.create(
            model="grok-beta",
            messages=[
                {"role": "system", "content": "You are a helpful assistant who supports women in finding safe places and providing useful advice."},
                {"role": "user", "content": user_input},
            ],
        )
        response_message = completion.choices[0].message["content"]
        return jsonify({"message": response_message}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5001)