from flask import Flask, jsonify, request

app = Flask(__name__)

projects = []


@app.route("/")
def home():
    return jsonify({
        "message": "DepthWizard Backend is running!"
    })


# PROJECT MANAGEMENT

@app.route("/projects", methods=["GET"])
def get_projects():
    return jsonify(projects)


@app.route("/projects", methods=["POST"])
def create_project():
    data = request.get_json()

    project = {
        "id": len(projects) + 1,
        "name": data.get("name"),
        "description": data.get("description")
    }

    projects.append(project)

    return jsonify({
        "message": "Project created successfully",
        "project": project
    }), 201


if __name__ == "__main__":
    app.run(debug=True)