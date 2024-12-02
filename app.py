from flask import Flask, render_template

app = Flask(__name__)

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

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001)