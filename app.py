from flask import Flask, render_template, request, jsonify
import openai

app = Flask(__name__)

# OpenAI API setup
openai.api_key = "test_PxwJS4GEn74VXi7wJ5Oi0vvQxnE0eU52thQwviL0"

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
        # Make the API call to OpenAI
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # Specify the model
            messages=[
                {"role": "system", "content": "You are a helpful and friendly chatbot."},
                {"role": "user", "content": user_message},
            ],
        )
        # Extract the chatbot's response
        chatbot_response = response['choices'][0]['message']['content']
        return jsonify({"response": chatbot_response})
    except Exception as e:
        # Handle errors gracefully
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)