from flask import Flask, jsonify

app = Flask(__name__)


@app.route("/")
def home():
    return jsonify({
        "message": "DepthWizard Backend is running!"
    })


@app.route("/projects")
def projects():
    return jsonify({
        "projects": []
    })


@app.route("/processing-status")
def processing_status():
    return jsonify({
        "status": "Not started"
    })


@app.route("/ai-tracking")
def ai_tracking():
    return jsonify({
        "message": "AI Tracking Module ready"
    })


if __name__ == "__main__":
    app.run(debug=True)
