from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enables Cross-Origin Resource Sharing


@app.route("/api/data", methods=["GET"])
def get_data():
    info = {"message": "Hello from Python!", "status": "success"}
    return jsonify(info)  # Converts dictionary to JSON


if __name__ == "__main__":
    app.run(debug=True)
