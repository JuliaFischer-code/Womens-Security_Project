from flask import Flask, render_template, request, jsonify
import requests
import os
import googlemaps  # Add this library (install with pip install -U googlemaps)

app = Flask(__name__)

# OpenAI API setup
OPENAI_API_KEY = "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"
OPENAI_BASE_URL = "https://api.openai.com/v1/chat/completions"

# Google Maps API setup
GOOGLE_MAPS_API_KEY = "AIzaSyA3hP_MBMqhB_EdFo7ZIJMmNxWJYORrYXY"  # Replace with your actual key
gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat")
def chat():
    return render_template("chat.html")

@app.route("/sos")
def sos():
    return render_template("sos.html")

@app.route("/api/chat", methods=["POST"])
def api_chat():
    user_message = request.json.get("message")  # Get the user input
    if not user_message:
        return jsonify({"error": "Message cannot be empty"}), 400

    try:
        # Call the OpenAI API with the user's input
        response = requests.post(
            OPENAI_BASE_URL,
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": "You are a safety chatbot that uses clear, supportive, and calm language to assist users in potentially unsafe situations."},
                    {"role": "user", "content": user_message},
                ],
                "max_tokens": 100, # Lower number of max token for quick & concise response
                "temperature": 0.8, # lowered temperature for more coherent responses
            }
        )

        # Handle API response
        if response.status_code == 200:
            data = response.json()
            chatbot_response = data.get('choices', [])[0].get('message', {}).get('content', "")
            if chatbot_response:
                return jsonify({"response": chatbot_response})  # Return the AI's response
            else:
                return jsonify({"error": "OpenAI API returned an empty response."}), 500
        else:
            return jsonify({"error": f"OpenAI API error: {response.status_code}, {response.text}"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/safe-places", methods=["POST"])
def safe_places():
    data = request.json
    user_location = data.get("location")  # { "lat": float, "lng": float }
    query = data.get("query")  # e.g., "restaurant", "shop", "police station"

    if not user_location or not query:
        return jsonify({"error": "Location and query are required"}), 400

    try:
        # Use Google Maps Places API to search for places nearby
        places_result = gmaps.places_nearby(
            location=(user_location["lat"], user_location["lng"]),
            radius=2000,  # 2 km radius
            keyword=query  # Query for user-specified or combined keywords
        )

        if not places_result.get("results"):
            return jsonify({"error": "No results found for the query."}), 404

        # Extract the 3 closest places based on distance
        safe_places = sorted(
            places_result["results"],
            key=lambda place: (
                abs(user_location["lat"] - place["geometry"]["location"]["lat"]) +
                abs(user_location["lng"] - place["geometry"]["location"]["lng"])
            )
        )[:3]

        # Format the response for each place
        formatted_places = [
            {
                "name": place["name"],
                "lat": place["geometry"]["location"]["lat"],
                "lng": place["geometry"]["location"]["lng"],
                "address": place.get("vicinity", "Address not available"),
            }
            for place in safe_places
        ]

        return jsonify({"places": formatted_places})

    except googlemaps.exceptions.ApiError as api_error:
        return jsonify({"error": f"Google Maps API error: {api_error}"}), 500
    except Exception as e:
        return jsonify({"error": f"Internal server error: {e}"}), 500
